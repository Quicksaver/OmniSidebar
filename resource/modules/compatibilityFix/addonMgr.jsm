moduleAid.VERSION = '1.0.4';

this.toggleAlwaysAddons = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.alwaysAddons) {
		toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
			['var newLoad = !switchToTabHavingURI("about:addons", true);',
			
			'	var newLoad = !window.switchToTabHavingURI("about:addons", false);'
			+'	if(newLoad) {'
			+"		toggleSidebar('viewAddonSidebar');"
			+'	}'
			]
		]);
	} else {
		toCode.revert(window, 'window.BrowserOpenAddonsMgr');
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
	
	// The binding was changed in FF20, clicking links works properly from within the sidebar so there's no need to replace the binding any more
	if(Services.vc.compare(Services.appinfo.platformVersion, "20.0") < 0) {
		styleAid.load('addonMgrSidebarLinks', 'addonsLinks');
	}
	
	overlayAid.overlayWindow(window, 'addonMgr', null, loadAddonMgr);
	
	prefAid.listen('alwaysAddons', toggleAlwaysAddons);
	
	toggleAlwaysAddons();
};

moduleAid.UNLOADMODULE = function() {
	toggleAlwaysAddons(true);
	
	prefAid.unlisten('alwaysAddons', toggleAlwaysAddons);
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewAddonSidebar') { closeSidebar(twinSidebar); }
		styleAid.unload('addonMgrSidebar');
		styleAid.unload('addonMgrSidebarLinks');
	}
	
	overlayAid.removeOverlayWindow(window, 'addonMgr');
};
