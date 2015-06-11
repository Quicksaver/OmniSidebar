Modules.VERSION = '1.0.0';

Modules.LOADMODULE = function() {
	Overlays.overlayURI('chrome://'+objPathString+'/content/paneMain.xul', 'paneMainRTL');
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/paneMain.xul', 'paneMainRTL');
};
