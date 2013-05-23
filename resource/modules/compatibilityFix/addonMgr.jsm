moduleAid.VERSION = '1.0.6';

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
};

this.doAddonCommand = function() {
	delete holdBroadcasters.addon;
	if(mainSidebar.loaded && _sidebarCommand == objName+'-viewAddonSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && _sidebarCommandTwin == objName+'-viewAddonSidebar') { loadTwinSidebar(); }
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
	aSync(function() { setAttribute($(objName+'-addons_sidebar_button'), 'observes', objName+'-viewAddonSidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.addon = objName+'-viewAddonSidebar';
	
	styleAid.load('addonMgrSidebar', 'addons');
	
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
	}
	
	overlayAid.removeOverlayWindow(window, 'addonMgr');
};
