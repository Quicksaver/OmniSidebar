moduleAid.VERSION = '1.0.3';

// keep the sidebar visible when hovering the strip if it's opened and auto-hiding
this.mwbHover = function() {
	var bar = leftSidebar;
	if(bar.box && !bar.box.hidden && bar.above && bar.autoHide) {
		setHover(bar, true);
	}
};

this.mwbOut = function() {
	var bar = leftSidebar;
	if(bar.box && !bar.box.hidden && bar.above && bar.autoHide) {
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

moduleAid.LOADMODULE = function() {
	styleAid.load('milewideback', 'milewideback');
	listenerAid.add($('back-strip'), 'mouseover', mwbHover);
	listenerAid.add($('back-strip'), 'mouseout', mwbOut);
	
	listenerAid.add(window, 'clickedSwitcher', mwbClick, true);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove($('back-strip'), 'mouseover', mwbHover);
	listenerAid.remove($('back-strip'), 'mouseout', mwbOut);
	
	listenerAid.remove(window, 'clickedSwitcher', mwbClick, true);
	
	if(UNLOADED) {
		styleAid.unload('milewideback');
	}
};
