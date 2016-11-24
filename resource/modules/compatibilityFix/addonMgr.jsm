/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.5

this.addonMgr = {
	broadcasterId: objName+'-viewAddonSidebar',
	get broadcaster () { return $(this.broadcasterId); },

	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocusedSync':
				if(e.target
				&& e.target.document
				&& e.target.document.baseURI == 'about:addons') {
					let doc = e.target.document;

					// move the header back to the top of the sidebar
					let navHeader = doc.getElementById('nav-header');
					let header = doc.getElementById('header');
					setAttribute(header, 'flex', '1');
					navHeader.appendChild(header);

					// "Install Add-on From File" routine expects to be passed the current tab's browser,
					// it won't work if this method passes the sidebar browser
					Piggyback.add('addonMgr', doc.defaultView, 'getBrowserElement', function() {
						return window.gBrowser.mCurrentBrowser;
					});
				}
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'alwaysAddons':
				this.toggleAlways(Prefs.alwaysAddons);
				break;
		}
	},

	toggleAlways: function(enable) {
		if(enable) {
			if(Services.vc.compare(Services.appinfo.version, "48.0a1") < 0) {
				toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
					['var newLoad = !switchToTabHavingURI("about:addons", true);',
						 'var newLoad = !window.switchToTabHavingURI("about:addons", false);'
						+'if(newLoad) {'
						+"	SidebarUI.toggle('omnisidebar-viewAddonSidebar');"
						+'}'
					]
				]);
			} else {
				toCode.modify(window, 'window.BrowserOpenAddonsMgr', [
					['switchToTabHavingURI("about:addons", true);',
						 'let newLoad = !window.switchToTabHavingURI("about:addons", false);'
						+'if(newLoad) {'
						+"	SidebarUI.toggle('omnisidebar-viewAddonSidebar');"
						+'}'
					]
				]);
			}
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

	Listeners.add(window, 'SidebarFocusedSync', addonMgr);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'SidebarFocusedSync', addonMgr);

	Prefs.unlisten('alwaysAddons', addonMgr);
	addonMgr.toggleAlways(false);

	if(UNLOADED) {
		if(UNLOADED != APP_SHUTDOWN) {
			if(mainSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(mainSidebar); }
			if(twinSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(twinSidebar); }
		}
		Styles.unload('addonMgrSidebar');
		Styles.unload('addonMgrSidebarDiscover');
	}

	Overlays.removeOverlayWindow(window, 'addonMgr');
};
