Modules.VERSION = '1.0.0';

this.__defineGetter__('SocialSidebar', function() { return window.SocialSidebar; });

this.Social = {
	viewId: objName+'-viewSocialSidebar',
	
	get broadcaster () { return $(this.viewId); },
	get box () { return $('social-sidebar-box'); },
	get browser () { return $('social-sidebar-browser'); },
	get header () { return $('social-sidebar-header'); },
	get button () { return $('social-sidebar-button'); },
	
	_lastCommand: null,
	get lastCommand () {
		if(!this._lastCommand) {
			this._lastCommand = SessionStore.getWindowValue(window, objName+'.lastSocialCommand');
			// if this window doesn't have it's own state, use the state from the opener
			if(!this._lastCommand && window.opener && !window.opener.closed) {
				this._lastCommand = SessionStore.getWindowValue(window.opener, objName+'.lastSocialCommand');
			}
		}
		return this._lastCommand;
	},
	set lastCommand (v) {
		this._lastCommand = v;
		return SessionStore.setWindowValue(window, objName+'.lastSocialCommand', v);
	},
	
	_swapTwinFlag: null,
	_backupStyle: null,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'UnloadingTwinSidebar':
				if(isAncestor(this.browser, twinSidebar.box)) {
					this.restoreSidebar();
				}
				break;
		}
	},
	
	forceTwin: function(commandID) {
		return commandID == this.broadcaster && trueAttribute(this.broadcaster, 'twinSidebar');
	},
	
	tryClose: function(broadcaster, bar) {
		return broadcaster != this.broadcaster || this.broadcaster.getAttribute('origin') == bar.box.getAttribute('origin');
	},
	
	tryOpen: function(broadcaster, bar, otherBar) {
		// make sure we actually can show the social sidebar
		if(broadcaster != this.broadcaster) { return true; }
		
		var canSocial = SocialSidebar.canShow;
		if(canSocial) {
			var origin = this.broadcaster.getAttribute('origin');
			if(!origin) {
				origin = (SocialSidebar.provider) ? SocialSidebar.provider.origin : this.lastCommand;
				setAttribute(this.broadcaster, 'origin', origin);
			}
			
			if(!SocialSidebar.opened || !SocialSidebar.provider || SocialSidebar.provider.origin != origin) {
				this.unsetOpenListener();
				SocialSidebar.show(origin);
				this.setOpenListener();
			}
			
			if(!SocialSidebar.provider) {
				// we may have an invalid last social command, so let's reset it
				if(origin == this.lastCommand) {
					this.lastCommand = '';
				}
				canSocial = false;
			}
		}
		
		// in case we can't, let's reset the command so we don't (or shouldn't) trigger this again
		if(!canSocial) {
			if(bar.state.command == this.broadcaster.id) {
				bar.stateReset();
			}
		}
		else {
			// this doesn't happen above if we're switching sidebars, because placeSocialSidebar() overrides the twinSidebar attr
			if(otherBar.command == this.broadcaster.id) {
				SidebarUI.close(otherBar);
			}
		}
					
		return canSocial;
	},
	
	tryHandle: function(broadcaster, bar) {
		// if we're toggling a social sidebar
		if(broadcaster != this.broadcaster) { return false; }
		
		this.placeSidebar(null, bar);
		SidebarUI.unloadBrowser(bar.sidebar);
		bar.sidebar.hidden = true;
		this.browser.hidden = false;
		this.button.hidden = false;
		
		bar.command = broadcaster.id;
		setAttribute(bar.box, 'origin', broadcaster.getAttribute('origin'));
		
		var title = SocialSidebar.provider.name;
		bar.title = title;
		setAttribute(broadcaster, 'sidebartitle', title);
		
		if(this._swapTwinFlag && this._swapTwinFlag != 'about:blank') {
			if(this._swapTwinFlag != this.browser.getAttribute('src')) {
				setAttribute(this.browser, "src", "about:blank");
				Messenger.messageBrowser(this.browser, 'unloadSocialBrowser');
			}
			
			// when switching between the main and twin sidebar, somehow the social sidebar is closed (for some reason)
			this.unsetOpenListener();
			$('socialSidebarBroadcaster').hidden = false;
			SocialSidebar.update();
			this.setOpenListener();
		}
		this._swapTwinFlag = null;
		
		return true;
	},
	
	tryUnload: function(bar) {
		if(bar.box.getAttribute('origin') || isAncestor(this.browser, bar.box)) {
			removeAttribute(bar.box, 'origin');
			
			this.unsetOpenListener();
			SocialSidebar.hide();
			this.setOpenListener();
			
			this.browser.hidden = true;
			this.button.hidden = true;
		}
	},
	
	onClose: function(broadcaster) {
		if(broadcaster == this.broadcaster) {
			this.unsetOpenListener();
			SocialSidebar.hide();
			this.setOpenListener();
		}
	},
	
	setOpenListener: function(enable) {
		Piggyback.add(objName, SocialSidebar, 'update', () => {
			if(!SocialSidebar.canShow || !SocialSidebar.opened || !SocialSidebar.provider) {
				if(this.broadcaster // the overlay might not have loaded yet?
				&& (mainSidebar.command == this.broadcaster.id || twinSidebar.command == this.broadcaster.id)) {
					SidebarUI.toggle(this.broadcaster);
				}
				return;
			}
			
			var bar = (trueAttribute(this.broadcaster, 'twinSidebar')) ? twinSidebar : mainSidebar;
			if(bar.box.getAttribute('origin') == SocialSidebar.provider.origin) { return; }
			
			setAttribute(this.broadcaster, 'sidebartitle', SocialSidebar.provider.name);
			setAttribute(this.broadcaster, 'origin', SocialSidebar.provider.origin);
			this.lastCommand = SocialSidebar.provider.origin;
			
			SidebarUI.toggle(this.broadcaster, false, bar.twin);
		}, Piggyback.MODE_AFTER);
	},
	
	unsetOpenListener: function() {
		Piggyback.revert(objName, SocialSidebar, 'update');
	},
	
	// for compatibility with the Social API sidebars:
	// we move its browser element into our sidebars, then it proceeds from there
	placeSidebar: function(el, bar = mainSidebar) {
		var browser = this.browser;
		
		if(!bar.twin && Prefs.twinSidebar && el) {
			for(let trigger of SidebarUI.triggers.twin.values()) {
				if(isAncestor(el, (typeof(trigger) == 'function') ? trigger() : trigger)) {
					bar = twinSidebar;
					break;
				}
			}
		}
		
		if(!this._backupStyle) {
			this._backupStyle = {
				minWidth: browser.style.minWidth,
				width: browser.style.width,
				maxWidth: browser.style.maxWidth
			};
			
			browser.style.minWidth = '';
			browser.style.width = '';
			browser.style.maxWidth = '';
		}
		
		if(!isAncestor(browser, bar.box)) {
			this._swapTwinFlag = browser.getAttribute('src');
			if(el && browser.getAttribute('origin') != el.getAttribute('origin')) {
				setAttribute(browser, "src", "about:blank");
				Messenger.messageBrowser(browser, 'unloadSocialBrowser');
				browser.hidden = true; // prevent showing the last panel when switching sidebars
			}
			
			bar.box.hidden = false;
			
			var tempSocial = Overlays.swapBrowsers(window, browser);
			bar.sidebar.parentNode.appendChild(browser);
			Overlays.swapBrowsers(window, browser, tempSocial);
			bar.titleNode.parentNode.insertBefore(this.button, bar.titleNode.nextSibling);
			
			if(bar.twin) {
				SidebarUI.triggers.twin.set('SocialButton', () => { return this.button; });
			} else {
				SidebarUI.triggers.twin.delete('SocialButton');
			}
			
			// we need to make sure that un/docking the sidebar won't leave the SocialBrowser in limbo
			var aboveURI = (bar.twin) ? 'renderAboveTwin' : 'renderAbove';
			var otherURI = (bar.twin) ? 'renderAbove' : 'renderAboveTwin';
			for(var overlay of window[Overlays._obj]) {
				if(!overlay.loaded) { continue; }
				
				// if this is the sheet of this sidebar, make sure it has the social sidebar traceback
				if(overlay.uri == 'chrome://'+objPathString+'/content/'+aboveURI+'.xul') {
					for(var t=0; t<overlay.traceBack.length; t++) {
						if(overlay.traceBack[t].action == 'appendChild' && overlay.traceBack[t].node == bar.sidebar) {
							if(!overlay.traceBack[t+1] || overlay.traceBack[t+1].action != 'appendChild' || overlay.traceBack[t+1].node == browser) {
								overlay.traceBack.splice(t+1, 0, {
									action: 'appendChild',
									node: browser,
									original: { parent: bar.box, pos: 1 }
								});
							}
							break;
						}
					}
				}
				
				// if this is the sheet of the other sidebar, make sure the traceback doesn't have the social sidebar
				else if(overlay.uri == 'chrome://'+objPathString+'/content/'+otherURI+'.xul') {
					for(var t=0; t<overlay.traceBack.length; t++) {
						if(overlay.traceBack[t].action == 'appendChild' && overlay.traceBack[t].node == browser) {
							overlay.traceBack.splice(t, 1);
						}
					}
				}
			}
		}
		
		toggleAttribute(this.broadcaster, 'twinSidebar', bar.twin);
	},
	
	restoreSidebar: function() {
		var browser = this.browser;
		
		SidebarUI.triggers.twin.delete('SocialButton');
		
		var tempSocial = Overlays.swapBrowsers(window, browser);
		this.box.appendChild(browser);
		Overlays.swapBrowsers(window, browser, tempSocial);
		
		this.header.appendChild(this.button);
		
		browser.hidden = false;
		this.button.hidden = false;
	},
	
	ensureSwitchBeforeHide: function(el) {
		for(let trigger of SidebarUI.triggers.barSwitch.values()) {
			if(isAncestor(el, (typeof(trigger) == 'function') ? trigger() : trigger)) {
				var twin = false;
				for(let trigger of SidebarUI.triggers.twin.values()) {
					if(isAncestor(el, (typeof(trigger) == 'function') ? trigger() : trigger)) {
						twin = true;
						break;
					}
				}
				
				if((twin && isAncestor(this.browser, mainSidebar.box)) || (!twin && isAncestor(this.browser, twinSidebar.box))) {
					this.placeSidebar(el);
					SocialSidebar.show(el.getAttribute('origin'));
					return;
				}
				
				break;
			}
		}
		
		SocialSidebar.hide();
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'UnloadingTwinSidebar', Social);
	SidebarUI.triggers.barSwitch.set('socialSidebar', function() { return Social.broadcaster; });
	Messenger.loadInBrowser(Social.browser, 'SocialSidebar');
	
	SidebarUI.addListener(Social);
	
	// if we start with the social sidebar opened, but neither the main or the twin sidebars had last been opened with it and can't open it now, we close the social sidebar
	if(!PrivateBrowsing.inPrivateBrowsing && SocialSidebar.opened) {
		// close the social sidebar when it...
		if(	
			// can't go to the mainSidebar when it is already open or when it's supposed to open something else after this
			((!mainSidebar.closed && mainSidebar.command)
			|| (mainSidebar.state.command != Social.viewId && !mainSidebar.state.closed))
		&&
			// can't go to the twinSidebar when it's supposed to open something else after this
			(!Prefs.twinSidebar || (twinSidebar.state.command != Social.viewId && !twinSidebar.state.closed))
		) {
			SocialSidebar.hide();
		}
		
		// open the sidebar in the main sidebar if it's not supposed to open in the twin
		else if(!Prefs.twinSidebar || (twinSidebar.state.command != Social.viewId && !twinSidebar.state.closed)) {
			mainSidebar.stateForceCommand(Social.viewId);
			mainSidebar.stateForceClosed(false);
		}
		
		// open in the twin
		else {
			twinSidebar.stateForceCommand(Social.viewId);
			twinSidebar.stateForceClosed(false);
		}
	}
	
	Social.setOpenListener();
};

Modules.UNLOADMODULE = function() {
	Social.unsetOpenListener();
	
	Messenger.unloadFromBrowser(Social.browser, 'SocialSidebar');
	SidebarUI.triggers.barSwitch.delete('socialSidebar');
	Listeners.remove(window, 'UnloadingTwinSidebar', Social);
	
	SidebarUI.removeListener(Social);
	
	if(Social._backupStyle) {
		SocialBrowser.style.minWidth = Social._backupStyle.minWidth;
		SocialBrowser.style.width = Social._backupStyle.width;
		SocialBrowser.style.maxWidth = Social._backupStyle.maxWidth;
		Social._backupStyle = null;
	}
	
	if(!isAncestor(Social.browser, Social.box)) {
		Social.restoreSidebar();
		
		// Let's make sure this is visible...
		mainSidebar.sidebar.hidden = false;
	}
	
	// to prevent the sidebar from staying open with an empty panel, since the social browser is moved back to its place
	if(mainSidebar.command == Social.viewId) { SidebarUI.close(mainSidebar); }
};
