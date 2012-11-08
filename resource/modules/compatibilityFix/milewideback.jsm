moduleAid.VERSION = '1.0.1';

// keep the sidebar visible when hovering the strip if it's opened and auto-hiding
this.mwbHover = function() {
	var bar = prefAid.moveSidebars ? twinSidebar : mainSidebar;
	
	if(bar.box && !bar.box.hidden && bar.above && bar.autoHide) {
		setHover(bar, true);
	}
};

this.mwbOut = function() {
	var bar = prefAid.moveSidebars ? twinSidebar : mainSidebar;
	
	if(bar.box && !bar.box.hidden && bar.above && bar.autoHide) {
		setHover(bar, false);
	}
};

moduleAid.LOADMODULE = function() {
	styleAid.load('milewideback', 'milewideback');
	listenerAid.add($('back-strip'), 'mouseover', mwbHover);
	listenerAid.add($('back-strip'), 'mouseout', mwbOut);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove($('back-strip'), 'mouseover', mwbHover);
	listenerAid.remove($('back-strip'), 'mouseout', mwbOut);
	
	if(UNLOADED) {
		styleAid.unload('milewideback');
	}
};
