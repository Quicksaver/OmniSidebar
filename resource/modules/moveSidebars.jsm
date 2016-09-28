/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.0

this.notifyMovedSidebars = {
	onLoad: function(window) {
		dispatch(window, { type: 'SidebarsMoved', cancelable: false });
	}
};

this.setMovedMainResizerDirection = {
	onLoad: function(window) {
		if(window[objName] && window[objName].renderAbove) { window[objName].renderAbove.setResizerDirection(window[objName].mainSidebar.resizer); }
	}
};

this.setMovedTwinResizerDirection = {
	onLoad: function(window) {
		if(window[objName] && window[objName].renderAbove) { window[objName].renderAbove.setResizerDirection(window[objName].twinSidebar.resizer); }
	}
};

Modules.LOADMODULE = function() {
	// I could overlay just one URI conditionally with every element in its overlay, but I found this way to be faster loading
	Overlays.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain', notifyMovedSidebars);
	Overlays.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin', notifyMovedSidebars);
	Overlays.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove', setMovedMainResizerDirection);
	Overlays.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove', setMovedTwinResizerDirection);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'moveSidebarTwinAbove');
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'moveSidebarMainAbove');
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'moveSidebarTwin');
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'moveSidebarMain');
};
