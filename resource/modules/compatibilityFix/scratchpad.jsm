moduleAid.VERSION = '1.1.0';

this.__defineGetter__('Scratchpad', function() { return window.Scratchpad; });
this.__defineGetter__('ScratchpadManager', function() { return Scratchpad.ScratchpadManager; });

this.scratchpadState = null;

this.loadScratchpadFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://browser/content/devtools/scratchpad.xul') {
		var params = Cc["@mozilla.org/embedcomp/dialogparam;1"].createInstance(Ci.nsIDialogParamBlock);
		params.SetNumberStrings(2);
		params.SetString(0, JSON.stringify(ScratchpadManager._nextUid++));
		
		if(scratchpadState) {
			params.SetString(1, JSON.stringify(scratchpadState));
			scratchpadState = null;
		}
		
		if(!e.target.arguments) { e.target.arguments = new Array(); }
		e.target.arguments.unshift(params);
	}
};

this.toggleAlwaysScratchpad = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.alwaysScratchpad) {
		ScratchpadManager._openScratchpad = ScratchpadManager.openScratchpad;
		ScratchpadManager.openScratchpad = function(aState) {
			if(aState) {
				if(typeof(aState) != 'object') { return; } // Just doing the same exclusion process as the original
				scratchpadState = aState;
			}
			toggleSidebar($(objName+'-viewScratchpadSidebar'));
		};
	} else {
		if(ScratchpadManager._openScratchpad) {
			ScratchpadManager.openScratchpad = ScratchpadManager._openScratchpad;
			delete ScratchpadManager._openScratchpad;
		}
	}
	
	scratchpadAcceltext();
};

this.scratchpadAcceltext = function() {
	if($(objName+'-viewScratchpadSidebar')) {
		var str = $(objName+'-viewScratchpadSidebar').getAttribute('allAcceltext').replace('VK_', '');
		toggleAttribute($(objName+'-viewScratchpadSidebar'), 'acceltext', prefAid.alwaysScratchpad, str);
	}
};

this.confirmCloseScratchpad = function(e) {
	if(e.detail.bar.isOpen
	&& e.detail.bar.state.command == objName+'-viewScratchpadSidebar'
	&& (e.detail.commandID != objName+'-viewScratchpadSidebar' || e.detail.forceReload || !e.detail.forceOpen)) {
		var inScratchpad = e.detail.bar.sidebar.contentWindow.Scratchpad;
		if(inScratchpad && inScratchpad.dirty) {
			// We found a sidebar with Scratchpad open that has been changed.
			// We stop here, we'll continue after the confirm save dialog has closed.
			e.preventDefault();
			e.stopPropagation();
			
			inScratchpad.promptSave(function(toClose) {
				if(toClose) {
					inScratchpad.dirty = false;
					toggleSidebar(
						e.detail.commandID,
						e.detail.forceOpen,
						e.detail.bar.twin,
						e.detail.forceUnload,
						e.detail.forceBlank,
						e.detail.forceBarSwitch,
						e.detail.forceReload
					);
				}
			});
		}
	}
};

// When closing the window, the prompt for the sidebar doesn't appear, so we make our own prompt to make sure we save any changes that need saving
this.willCloseScratchpadBar = function(e, bar) {
	if(e.defaultPrevented) { return; }
	
	if(bar && bar.isOpen && bar.state.command == objName+'-viewScratchpadSidebar') {
		var inScratchpad = bar.sidebar.contentWindow.Scratchpad;
		if(inScratchpad.dirty) {
			// We found a sidebar with Scratchpad open that has been changed.
			// We stop here, we'll continue after the confirm save dialog has closed.
			e.preventDefault();
			e.stopPropagation();
			
			inScratchpad.promptSave(function(toClose) {
				if(toClose) {
					closeSidebar(bar);
					window.closeWindow(true);
				}
			});
			
			// Don't close the sidebar just yet
			return;
		}
		
		closeSidebar(bar);
	}
};

this.willCloseScratchpad = function(e) {
	willCloseScratchpadBar(e, mainSidebar);
	willCloseScratchpadBar(e, twinSidebar);
};

// Ditto for shutdown application
this.willQuitScratchpadBar = function(aSubject, aData, bar) {
	if(!(aSubject instanceof Ci.nsISupportsPRBool) || aSubject.data) { return; }
	
	if(bar && bar.isOpen && bar.state.command == objName+'-viewScratchpadSidebar') {
		var inScratchpad = bar.sidebar.contentWindow.Scratchpad;
		if(inScratchpad.dirty) {
			var ps = Services.prompt;
			var flags = 	ps.BUTTON_POS_0 * ps.BUTTON_TITLE_SAVE +
					ps.BUTTON_POS_1 * ps.BUTTON_TITLE_CANCEL + 
					ps.BUTTON_POS_2 * ps.BUTTON_TITLE_DONT_SAVE;
			
			var button = ps.confirmEx(window,
				inScratchpad.strings.GetStringFromName("confirmClose.title"),
				inScratchpad.strings.GetStringFromName("confirmClose"),
				flags, null, null, null, null, {});
			
			if(button == bar.sidebar.contentWindow.BUTTON_POSITION_CANCEL) {
				aSubject.data = true;
				return;
			}
			
			if(button == bar.sidebar.contentWindow.BUTTON_POSITION_SAVE) {
				if(!inScratchpad.filename) {
					// We need to halt everything to give time for the dialog to popup.
					// We'll resume afterwards.
					aSubject.data = true;
					inScratchpad.saveFileAs(function(aStatus) {
						if(Components.isSuccessCode(aStatus)) {
							// Taken directly from restartless-restart code
							if(aData == 'restart') {
								var canceled = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
								Services.obs.notifyObservers(canceled, "quit-application-requested", "restart");
								if(canceled.data) return false; // somebody canceled our quit request
								
								// disable fastload cache?
								if(prefAid.disable_fastload) Services.appinfo.invalidateCachesOnRestart();
								
								// restart
								var appStartup = Cc['@mozilla.org/toolkit/app-startup;1'].getService(Ci.nsIAppStartup);
								appStartup.quit(Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart);
							}
							else if(aData == 'lastwindow') {
								window.closeWindow(true);
							}
							else {
								window.goQuitApplication();
							}
						}
					});
					
					return;
				}
				
				inScratchpad.saveFile(function(aStatus) {
					aSubject.data = Components.isSuccessCode(aStatus);
				});
				
				if(aSubject.data) {
					return;
				}
			}
		}
		
		closeSidebar(bar);
	}
};

this.willQuitScratchpad = function(aSubject, aTopic, aData) {
	willQuitScratchpadBar(aSubject, aData, mainSidebar);
	willQuitScratchpadBar(aSubject, aData, twinSidebar);
};

// Ditto for disabling the add-on and a few other operations that will trigger a sidebar close/reload.
// Problem is, I can't halt the disable operation (I could use the sync show() method of opening the save dialog by doing it myself, but that is deprecated, so I shouldn't
// count on it existing forever). Also, I can't even detect most other times the sidebar is reloaded.
// For now at least, I'm adding a method that popups up a notification, when there are changes to be saved and it won't use the save file dialog (already previously saved).
this.willDisableAddonScratchpadBar = function(bar) {
	if(bar && bar.isOpen && bar.state.command == objName+'-viewScratchpadSidebar') {
		var inScratchpad = bar.sidebar.contentWindow.Scratchpad;
		if(inScratchpad.dirty && inScratchpad.filename) {
			var ps = Services.prompt;
			var flags = 	ps.BUTTON_POS_0 * ps.BUTTON_TITLE_SAVE +
					ps.BUTTON_POS_1 * ps.BUTTON_TITLE_DONT_SAVE;
			
			var button = ps.confirmEx(window,
				inScratchpad.strings.GetStringFromName("confirmClose.title"),
				inScratchpad.strings.GetStringFromName("confirmClose"),
				flags, null, null, null, null, {});
			
			if(button == bar.sidebar.contentWindow.BUTTON_POSITION_SAVE) {
				inScratchpad.saveFile();
			}
		}
		
		closeSidebar(bar);
	}
};

this.willDisableAddonScratchpad = function() {
	willDisableAddonScratchpadBar(mainSidebar);
	willDisableAddonScratchpadBar(twinSidebar);
};

moduleAid.LOADMODULE = function() {
	prefAid.setDefaults({ disable_fastload: false }, 'restartless-restart');
	
	overlayAid.overlayWindow(window, 'scratchpad', null, scratchpadAcceltext);
	styleAid.load('scratchpadSidebar', 'scratchpad');
	
	prefAid.listen('alwaysScratchpad', toggleAlwaysScratchpad);
	
	toggleAlwaysScratchpad();
	
	listenerAid.add(window, 'beginToggleSidebar', confirmCloseScratchpad, true);
	listenerAid.add(window, 'SidebarFocusedSync', loadScratchpadFix);
	listenerAid.add(window, 'close', willCloseScratchpad, true);
	listenerAid.add(window, objName+'-disabled', willDisableAddonScratchpad);
	observerAid.add(willQuitScratchpad, 'quit-application-requested');
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'beginToggleSidebar', confirmCloseScratchpad, true);
	listenerAid.remove(window, 'SidebarFocusedSync', loadScratchpadFix);
	listenerAid.remove(window, 'close', willCloseScratchpad, true);
	listenerAid.remove(window, objName+'-disabled', willDisableAddonScratchpad);
	observerAid.remove(willQuitScratchpad, 'quit-application-requested');
	
	toggleAlwaysScratchpad(true);
	
	prefAid.unlisten('alwaysScratchpad', toggleAlwaysScratchpad);
	
	if(UNLOADED) {
		styleAid.unload('scratchpadSidebar');
	}
	
	overlayAid.removeOverlayWindow(window, 'scratchpad');
};
