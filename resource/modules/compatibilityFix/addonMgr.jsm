/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.1.0

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

			case 'endToggleSidebar': {
				if(Services.vc.compare(Services.appinfo.version, "48.0a1") < 0) { break; }

				let bar = e.detail.bar;
				if(!bar || !bar.isOpen || bar.command != this.broadcasterId) { break; }

				// With the add-ons sidebar open, keep listening for when the discovery view could be accessed, so that we can fix it when it is.
				// We need to listen at a point where the document exists, but none of its scripts have run yet.
				// (Can't use SidebarFocusedSync event for this, as that relies on the sidebar's 'load' event, which only fires after the discovery pane is also loaded if that is the active pane.)
				Observers.add(this, 'document-element-inserted');

				break;
			}
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'nsPref:changed':
				switch(aSubject) {
					case 'alwaysAddons':
						this.toggleAlways(Prefs.alwaysAddons);
						break;
				}
				break;

			case 'document-element-inserted': {
				let isAddons = false;

				for(let bar of sidebars) {
					try {
						if(bar.isOpen && bar.command == this.broadcasterId) {
							isAddons = true;

							let win = bar.sidebar.contentWindow;
							let view = win && win.gDiscoverView;
							let browser = view && view._browser;
							if(browser && browser.contentDocument == aSubject) {
								let unwrap = XPCNativeWrapper.unwrap(browser.contentWindow);
								let history = unwrap.history;
								if(history._replaceState) { return; }

								// Setting the history state in the new discovery page fails in the sidebar, but it is (or seems to be) inconsequential there.
								history._replaceState = history.replaceState;
								history.replaceState = function() {
									try {
										return this._replaceState.apply(this, arguments);
									}
									catch(exx) {
										// Don't block initialization of the discovery page if this fails in the sidebar.
										return this.state || {};
									}
								};
							}
						}
					}
					catch(ex) {
						Cu.reportError(ex);
					}
				}

				// Rather than listen to every possible case where the addons sidebar could be unloaded/switched/closed,
				// remove this observer the next time it runs when there is no addons sidebar open.
				if(!isAddons) {
					Observers.remove(this, 'document-element-inserted');
				}
				break;
			}
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
	if(Services.vc.compare(Services.appinfo.version, "48.0a1") < 0) {
		Styles.load('addonMgrSidebarDiscover', 'addonsDiscover');
	}

	Overlays.overlayWindow(window, 'addonMgr', addonMgr);

	Prefs.listen('alwaysAddons', addonMgr);
	addonMgr.toggleAlways(Prefs.alwaysAddons);

	Listeners.add(window, 'SidebarFocusedSync', addonMgr);
	Listeners.add(window, 'endToggleSidebar', addonMgr);
};

Modules.UNLOADMODULE = function() {
	if(Services.vc.compare(Services.appinfo.version, "48.0a1") >= 0) {
		Observers.remove(addonMgr, 'document-element-inserted');
	}

	Listeners.remove(window, 'SidebarFocusedSync', addonMgr);
	Listeners.remove(window, 'endToggleSidebar', addonMgr);

	Prefs.unlisten('alwaysAddons', addonMgr);
	addonMgr.toggleAlways(false);

	if(UNLOADED) {
		if(UNLOADED != APP_SHUTDOWN) {
			if(mainSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(mainSidebar); }
			if(twinSidebar.command == addonMgr.broadcasterId) { SidebarUI.close(twinSidebar); }
		}
		Styles.unload('addonMgrSidebar');
		if(Services.vc.compare(Services.appinfo.version, "48.0a1") < 0) {
			Styles.unload('addonMgrSidebarDiscover', 'addonsDiscover');
		}
	}

	Overlays.removeOverlayWindow(window, 'addonMgr');
};
