Modules.VERSION = '2.0.0';

this.addonMgr = {
	broadcasterId: objName+'-viewAddonSidebar',
	get broadcaster () { return $(this.broadcasterId); },
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'alwaysAddons':
				this.toggleAlways(Prefs.alwaysAddons);
				break;
		}
	},
	
	toggleAlways: function(enable) {
		if(enable) {
			toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
				['var newLoad = !switchToTabHavingURI("about:addons", true);',
					 'var newLoad = !window.switchToTabHavingURI("about:addons", false);'
					+'if(newLoad) {'
					+"	SidebarUI.toggle('omnisidebar-viewAddonSidebar');"
					+'}'
				]
			]);
		} else {
			toCode.revert(window, 'window.BrowserOpenAddonsMgr');
		}
		
		this.acceltext();
	},
	
	acceltext: function() {
		if(this.broadcaster) {
			toggleAttribute(this.broadcaster, 'acceltext', Prefs.alwaysAddons, this.broadcaster.getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext'));
		}
	},
	
	onLoad: function() {
		SidebarUI.holdBroadcasters.delete(this.broadcasterId);
		if(mainSidebar.loaded && mainSidebar.state.command == this.broadcasterId) { self.onLoad(); }
		if(twinSidebar.loaded && twinSidebar.state.command == this.broadcasterId) { twin.load(); }
		
		var checked = mainSidebar.command == this.broadcasterId;
		var twin = false;
		if(!checked && twinSidebar.command == this.broadcasterId) {
			checked = true;
			twin = true;
		}
		toggleAttribute(this.broadcaster, 'checked', checked);
		toggleAttribute(this.broadcaster, 'twinSidebar', twin);
		this.acceltext();
		aSync(() => { setAttribute($(objName+'-addons_sidebar_button'), 'observes', this.broadcasterId); });
	}
};

Modules.LOADMODULE = function() {
	SidebarUI.holdBroadcasters.add(addonMgr.broadcasterId);
	
	Styles.load('addonMgrSidebar', 'addons');
	Styles.load('addonMgrSidebarDiscover', 'addonsDiscover');
	
	Overlays.overlayWindow(window, 'addonMgr', addonMgr);
	
	Prefs.listen('alwaysAddons', addonMgr);
	addonMgr.toggleAlways(Prefs.alwaysAddons);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('alwaysAddons', addonMgr);
	addonMgr.toggleAlways(false);
	
	if(UNLOADED) {
		if(mainSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(mainSidebar); }
		if(twinSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(twinSidebar); }
		Styles.unload('addonMgrSidebar');
		Styles.unload('addonMgrSidebarDiscover');
	}
	
	Overlays.removeOverlayWindow(window, 'addonMgr');
};
