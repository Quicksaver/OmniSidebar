moduleAid.VERSION = '1.0.3';

this.doDOMICommand = function() {
	delete holdBroadcasters.domi;
	if(mainSidebar.loaded && _sidebarCommand == objName+'-viewDOMInspectorSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && _sidebarCommandTwin == objName+'-viewDOMInspectorSidebar') { loadTwinSidebar(); }
};

this.loadDOMI = function() {
	doDOMICommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($(objName+'-viewDOMInspectorSidebar'), 'checked', checked);
	toggleAttribute($(objName+'-viewDOMInspectorSidebar'), 'twinSidebar', twin);
	aSync(function() { setAttribute($(objName+'-dominspector_sidebar_button'), 'observes', objName+'-viewDOMInspectorSidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.domi = objName+'-viewDOMInspectorSidebar';
	
	AddonManager.getAddonByID("inspector@mozilla.org", function(addon) {
		if(UNLOADED) { return; }
		
		if(addon && addon.isActive) {
			overlayAid.overlayWindow(window, 'domi', null, loadDOMI);
		} else {
			AddonManager.getAddonByID("inspector-dp@mozilla.org", function(addon) {
				if(addon && addon.isActive) {
					overlayAid.overlayWindow(window, 'domi', null, loadDOMI);
				} else {
					doDOMICommand();
				}
			});
		}
	});
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') { closeSidebar(twinSidebar); }
	}
	
	overlayAid.removeOverlayWindow(window, 'domi');
};
