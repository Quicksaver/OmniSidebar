Modules.VERSION = '1.2.0';

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
	if(!UNLOADED && Prefs.moveSidebars) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain', null, notifyMovedSidebars);
		Overlays.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin', null, notifyMovedSidebars);
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove', null, setMovedMainResizerDirection);
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove', null, setMovedTwinResizerDirection);
	}
	else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain');
	}
};

Modules.LOADMODULE = function() {
	moveSidebars();
};

Modules.UNLOADMODULE = function() {
	moveSidebars();
};
