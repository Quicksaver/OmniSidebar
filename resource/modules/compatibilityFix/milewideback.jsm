Modules.VERSION = '1.1.0';

// keep the sidebar visible when hovering the strip if it's opened and auto-hiding
this.mwbHover = function() {
	var bar = leftSidebar;
	if(bar.box && !bar.closed && bar.above && bar.autoHide) {
		setHover(bar, true);
	}
};

this.mwbOut = function() {
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
	window.MileWideBack.onClick(e.detail.clickEvent);
};

Modules.LOADMODULE = function() {
	Styles.load('milewideback', 'milewideback');
	
	Listeners.add($('back-strip'), 'mouseover', mwbHover);
	Listeners.add($('back-strip'), 'mouseout', mwbOut);
	Listeners.add(window, 'clickedSwitcher', mwbClick, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('back-strip'), 'mouseover', mwbHover);
	Listeners.remove($('back-strip'), 'mouseout', mwbOut);
	Listeners.remove(window, 'clickedSwitcher', mwbClick, true);
	
	if(UNLOADED) {
		Styles.unload('milewideback');
	}
};
