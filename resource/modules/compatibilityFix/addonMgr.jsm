Modules.VERSION = '1.2.0';

this.toggleAlwaysAddons = function(loaded) {
	if(loaded && Prefs.alwaysAddons) {
		toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
			['var newLoad = !switchToTabHavingURI("about:addons", true);',
				 'var newLoad = !window.switchToTabHavingURI("about:addons", false);'
				+'if(newLoad) {'
				+"	toggleSidebar('omnisidebar-viewAddonSidebar');"
				+'}'
			]
		]);
	} else {
		toCode.revert(window, 'window.BrowserOpenAddonsMgr');
	}
	
	addonMgrAcceltext();
};

this.addonMgrAcceltext = function() {
	if($(objName+'-viewAddonSidebar')) {
		toggleAttribute($(objName+'-viewAddonSidebar'), 'acceltext', Prefs.alwaysAddons,
			$(objName+'-viewAddonSidebar').getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext'));
	}
};

this.doAddonCommand = function() {
	delete holdBroadcasters.addon;
	if(mainSidebar.loaded && mainSidebar.state.command == objName+'-viewAddonSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && twinSidebar.state.command == objName+'-viewAddonSidebar') { loadTwinSidebar(); }
};

this.loadAddonMgr = function() {
	doAddonCommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($(objName+'-viewAddonSidebar'), 'checked', checked);
	toggleAttribute($(objName+'-viewAddonSidebar'), 'twinSidebar', twin);
	addonMgrAcceltext();
	aSync(function() { setAttribute($(objName+'-addons_sidebar_button'), 'observes', objName+'-viewAddonSidebar'); });
};

Modules.LOADMODULE = function() {
	holdBroadcasters.addon = objName+'-viewAddonSidebar';
	
	Styles.load('addonMgrSidebar', 'addons');
	
	Overlays.overlayWindow(window, 'addonMgr', null, loadAddonMgr);
	
	Prefs.listen('alwaysAddons', toggleAlwaysAddons);
	toggleAlwaysAddons(true);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('alwaysAddons', toggleAlwaysAddons);
	toggleAlwaysAddons();
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar') { closeSidebar(twinSidebar); }
		Styles.unload('addonMgrSidebar');
	}
	
	Overlays.removeOverlayWindow(window, 'addonMgr');
};
