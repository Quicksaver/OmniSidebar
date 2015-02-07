Modules.VERSION = '1.2.0';

this.__defineGetter__('MileWideBack', function() { return window.MileWideBack; });

// keep the sidebar visible when hovering the strip if it's opened and auto-hiding
this.mwbHover = function() {
	var bar = leftSidebar;
	if(bar.box && !bar.closed && bar.above && bar.autoHide) {
		Timers.init('mwbHover', function() {
			setHover(bar, true);
		}, Prefs.showDelay);
	}
};

this.mwbOut = function() {
	Timers.cancel('mwbHover');
	
	var bar = leftSidebar;
	if(bar.box && !bar.closed && bar.above && bar.autoHide) {
		setHover(bar, false);
	}
};

this.mwbClick = function(e) {
	if(e.detail.bar != leftSidebar) { return; }
	if(e.detail.clickEvent.shiftKey) { return; }
	e.preventDefault();
	e.stopPropagation();
	MileWideBack.onClick(e.detail.clickEvent);
};

this.mwbWheel = function(e) {
	if(e.detail.bar != leftSidebar) { return; }
	e.preventDefault();
	e.stopPropagation();
	MileWideBack.onScroll({ detail: e.detail.scrollEvent.deltaY });
};

// we need to make sure the margin switch is visible for this, otherwise the sidebar occludes EW's clicker
this.mwbSwitch = function() {
	leftSidebar.needSwitch.MWB = true;
	delete rightSidebar.needSwitch.MWB;
	
	leftSidebar.toggleSwitcher();
	rightSidebar.toggleSwitcher();
};

Modules.LOADMODULE = function() {
	Styles.load('milewideback', 'milewideback');
	
	Listeners.add($('back-strip'), 'mouseover', mwbHover);
	Listeners.add($('back-strip'), 'mouseout', mwbOut);
	Listeners.add(window, 'clickedSwitcher', mwbClick, true);
	Listeners.add(window, 'scrolledSwitcher', mwbWheel, true);
	Prefs.listen('moveSidebars', mwbSwitch);
	
	mwbSwitch();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('back-strip'), 'mouseover', mwbHover);
	Listeners.remove($('back-strip'), 'mouseout', mwbOut);
	Listeners.remove(window, 'clickedSwitcher', mwbClick, true);
	Listeners.remove(window, 'scrolledSwitcher', mwbWheel, true);
	Prefs.unlisten('moveSidebars', mwbSwitch);
	
	delete leftSidebar.needSwitch.MWB;
	delete rightSidebar.needSwitch.MWB;
	
	if(UNLOADED) {
		Styles.unload('milewideback');
	}
};
