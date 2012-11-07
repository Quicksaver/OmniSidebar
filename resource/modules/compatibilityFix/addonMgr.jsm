moduleAid.VERSION = '1.0.1';

this.addonMgrBackups = null;

this.toggleAlwaysAddons = function() {
	if(!UNLOADED && prefAid.alwaysAddons) {
		if(!addonMgrBackups) {
			addonMgrBackups = window.BrowserOpenAddonsMgr;
		}
		window.BrowserOpenAddonsMgr = modifyFunction(window.BrowserOpenAddonsMgr, [
			['var newLoad = !switchToTabHavingURI("about:addons", true);',
			<![CDATA[
				var newLoad = !window.switchToTabHavingURI("about:addons", false);
				if(newLoad) {
					toggleSidebar('viewAddonSidebar');
				}
			]]>
			]
		]);
	} else {
		if(addonMgrBackups) {
			window.BrowserOpenAddonsMgr = addonMgrBackups;
			addonMgrBackups = null;
		}
	}
};

this.doAddonCommand = function() {
	delete holdBroadcasters.addon;
	if(mainSidebar.loaded && _sidebarCommand == 'viewAddonSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && _sidebarCommandTwin == 'viewAddonSidebar') { loadTwinSidebar(); }
};

this.loadAddonMgr = function() {
	doAddonCommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($('viewAddonSidebar'), 'checked', checked);
	toggleAttribute($('viewAddonSidebar'), 'twinSidebar', twin);
	aSync(function() { setAttribute($('addons_sidebar_button'), 'observes', 'viewAddonSidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.addon = 'viewAddonSidebar';
	
	styleAid.load('addonMgrSidebar', 'addons');
	overlayAid.overlayWindow(window, 'addonMgr', null, loadAddonMgr);
	
	prefAid.listen('alwaysAddons', toggleAlwaysAddons);
	
	toggleAlwaysAddons();
};

moduleAid.UNLOADMODULE = function() {
	toggleAlwaysAddons();
	
	prefAid.unlisten('alwaysAddons', toggleAlwaysAddons);
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar') { closeSidebar(twinSidebar); }
		styleAid.unload('addonMgrSidebar');
	}
	
	overlayAid.removeOverlayWindow(window, 'addonMgr');
};
