moduleAid.VERSION = '1.1.0';

this.toggleAlwaysAddons = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.alwaysAddons) {
		toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
			['var newLoad = !switchToTabHavingURI("about:addons", true);',
			
			'	var newLoad = !window.switchToTabHavingURI("about:addons", false);'
			+'	if(newLoad) {'
			+"		toggleSidebar('"+objName+"-viewAddonSidebar');"
			+'	}'
			]
		]);
	} else {
		toCode.revert(window, 'window.BrowserOpenAddonsMgr');
	}
	
	addonMgrAcceltext();
};

this.addonMgrAcceltext = function() {
	if($(objName+'-viewAddonSidebar')) {
		toggleAttribute($(objName+'-viewAddonSidebar'), 'acceltext', prefAid.alwaysAddons,
			$(objName+'-viewAddonSidebar').getAttribute((Services.appinfo.OS == 'Darwin') ? 'MacAcceltext' : 'WinLinAcceltext'));
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

moduleAid.LOADMODULE = function() {
	holdBroadcasters.addon = objName+'-viewAddonSidebar';
	
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
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewAddonSidebar') { closeSidebar(twinSidebar); }
		styleAid.unload('addonMgrSidebar');
		styleAid.unload('addonMgrSidebarLinks');
	}
	
	overlayAid.removeOverlayWindow(window, 'addonMgr');
};
