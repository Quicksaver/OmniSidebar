moduleAid.VERSION = '1.1.1';

this.notifyMovedSidebars = function(window) {
	dispatch(window, { type: 'SidebarsMoved', cancelable: false });
};

this.setMovedMainResizerDirection = function(window) {
	if(window[objName] && window[objName].setResizerDirection) { window[objName].setResizerDirection(window[objName].mainSidebar.resizer); }
};

this.setMovedTwinResizerDirection = function(window) {
	if(window[objName] && window[objName].setResizerDirection) { window[objName].setResizerDirection(window[objName].twinSidebar.resizer); }
};

// I could overlay jsut one URI conditionally with every element in its overlay, but I found this way to be faster loading
this.moveSidebars = function() {
	if(!UNLOADED && prefAid.moveSidebars) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain', null, notifyMovedSidebars);
		overlayAid.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin', null, notifyMovedSidebars);
		overlayAid.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove', null, setMovedMainResizerDirection);
		overlayAid.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove', null, setMovedTwinResizerDirection);
	}
	else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain');
	}
};

moduleAid.LOADMODULE = function() {
	moveSidebars();
};

moduleAid.UNLOADMODULE = function() {
	moveSidebars();
};
