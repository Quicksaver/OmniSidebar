moduleAid.VERSION = '1.0.2';

this.doDOMICommand = function() {
	delete holdBroadcasters.domi;
	if(mainSidebar.loaded && _sidebarCommand == 'viewDOMInspectorSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && _sidebarCommandTwin == 'viewDOMInspectorSidebar') { loadTwinSidebar(); }
};

this.loadDOMI = function() {
	doDOMICommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewDOMInspectorSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewDOMInspectorSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($('viewDOMInspectorSidebar'), 'checked', checked);
	toggleAttribute($('viewDOMInspectorSidebar'), 'twinSidebar', twin);
	aSync(function() { setAttribute($('dominspector_sidebar_button'), 'observes', 'viewDOMInspectorSidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.domi = 'viewDOMInspectorSidebar';
	
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
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewDOMInspectorSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewDOMInspectorSidebar') { closeSidebar(twinSidebar); }
	}
	
	overlayAid.removeOverlayWindow(window, 'domi');
};
