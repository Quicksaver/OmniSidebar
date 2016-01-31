// VERSION 2.0.3

this.__defineGetter__('Scratchpad', function() { return window.Scratchpad; });
this.__defineGetter__('ScratchpadManager', function() { return Scratchpad.ScratchpadManager; });

this.scratchpad = {
	uri: 'chrome://devtools/content/scratchpad/scratchpad.xul',
	broadcasterId: objName+'-viewScratchpadSidebar',
	get broadcaster () { return $(this.broadcasterId); },

	state: null,

	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocusedSync':
				if(e.target
				&& e.target.document
				&& e.target.document.baseURI == this.uri) {
					var params = Cc["@mozilla.org/embedcomp/dialogparam;1"].createInstance(Ci.nsIDialogParamBlock);
					params.SetNumberStrings(2);
					params.SetString(0, JSON.stringify(ScratchpadManager._nextUid++));

					if(this.state) {
						params.SetString(1, JSON.stringify(this.state));
						this.state = null;
					}

					if(!e.target.arguments) { e.target.arguments = new e.target.Array(); } // Doing it this way to prevent a ZC.
					e.target.arguments.unshift(params);
				}
				break;

			case 'beginToggleSidebar':
				// confirm that the sidebar can be closed or if it needs to save the pad contents before
				if(e.detail.bar.isOpen
				&& e.detail.bar.state.command == this.broadcasterId
				&& (e.detail.commandID != this.broadcasterId || e.detail.forceReload || !e.detail.forceOpen)) {
					var inScratchpad = e.detail.bar.sidebar.contentWindow.Scratchpad;
					if(inScratchpad && inScratchpad.dirty) {
						// We found a sidebar with Scratchpad open that has been changed.
						// We stop here, we'll continue after the confirm save dialog has closed.
						e.preventDefault();
						e.stopPropagation();

						inScratchpad.promptSave(function(toClose) {
							if(toClose) {
								inScratchpad.dirty = false;
								SidebarUI.toggle(
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
				break;

			case 'willCloseSidebar':
				try {
					if(e.detail.bar.state.command == this.broadcasterId
					&& e.detail.bar.sidebar.contentDocument
					&& e.detail.focusedNode.ownerDocument == e.detail.bar.sidebar.contentDocument.getElementById('scratchpad-editor').firstChild.contentDocument) {
						e.preventDefault();
						e.stopPropagation();
						return false;
					}
				}
				// the above should always follow through, I'm just preventing anything going wrong with the DOM queries, in case anything changes in scratchpad
				catch(ex) { Cu.reportError(ex); }
				break;

			case 'close':
				this.canClose(e, mainSidebar);
				this.canClose(e, twinSidebar);
				break;

			case objName+'-disabled':
				this.canDisable(mainSidebar);
				this.canDisable(twinSidebar);
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'nsPref:changed':
				switch(aSubject) {
					case 'alwaysScratchpad':
						this.toggleAlways(Prefs.alwaysScratchpad);
						break;
				}
				break;

			case 'quit-application-requested':
				this.canQuit(aSubject, aData, mainSidebar);
				this.canQuit(aSubject, aData, twinSidebar);
				break;
		}
	},

	toggleAlways: function(enable) {
		if(enable) {
			Piggyback.add('scratchpad', ScratchpadManager, 'openScratchpad', (aState) => {
				if(aState) {
					if(typeof(aState) != 'object') { return; } // Just doing the same exclusion process as the original
					this.state = aState;
				}
				SidebarUI.toggle(this.broadcaster);
			});
		} else {
			Piggyback.revert('scratchpad', ScratchpadManager, 'openScratchpad');
		}

		this.acceltext();
	},

	acceltext: function() {
		if(this.broadcaster) {
			var str = this.broadcaster.getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext').replace('VK_', '');
			toggleAttribute(this.broadcaster, 'acceltext', Prefs.alwaysScratchpad, str);
		}
	},

	// When closing the window, the prompt for the sidebar doesn't appear, so we make our own prompt to make sure we save any changes that need saving
	canClose: function(e, bar) {
		if(e.defaultPrevented) { return; }

		if(bar && bar.isOpen && bar.state.command == this.broadcasterId) {
			var inScratchpad = bar.sidebar.contentWindow.Scratchpad;
			if(inScratchpad.dirty) {
				// We found a sidebar with Scratchpad open that has been changed.
				// We stop here, we'll continue after the confirm save dialog has closed.
				e.preventDefault();
				e.stopPropagation();

				inScratchpad.promptSave(function(toClose) {
					if(toClose) {
						SidebarUI.close(bar);
						window.closeWindow(true);
					}
				});

				// Don't close the sidebar just yet
				return;
			}

			SidebarUI.close(bar);
		}
	},

	// Ditto for shutdown application
	canQuit: function(aSubject, aData, bar) {
		if(!(aSubject instanceof Ci.nsISupportsPRBool) || aSubject.data) { return; }

		if(bar && bar.isOpen && bar.state.command == this.broadcasterId) {
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
									if(Prefs.disable_fastload) Services.appinfo.invalidateCachesOnRestart();

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

			SidebarUI.close(bar);
		}
	},

	// Ditto for disabling the add-on and a few other operations that will trigger a sidebar close/reload.
	// Problem is, I can't halt the disable operation (I could use the sync show() method of opening the save dialog by doing it myself, but that is deprecated, so I shouldn't
	// count on it existing forever). Also, I can't even detect most other times the sidebar is reloaded.
	// For now at least, I'm adding a method that popups up a notification, when there are changes to be saved and it won't use the save file dialog (already previously saved).
	canDisable: function(bar) {
		if(bar && bar.isOpen && bar.state.command == this.broadcasterId) {
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

			SidebarUI.close(bar);
		}
	},

	onLoad: function() {
		this.acceltext();
	}
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ disable_fastload: false }, 'restartless-restart');

	Overlays.overlayWindow(window, 'scratchpad', scratchpad);
	Styles.load('scratchpadSidebar', 'scratchpad');

	Prefs.listen('alwaysScratchpad', scratchpad);
	scratchpad.toggleAlways(Prefs.alwaysScratchpad);

	Listeners.add(window, 'beginToggleSidebar', scratchpad, true);
	Listeners.add(window, 'willCloseSidebar', scratchpad, true);
	Listeners.add(window, 'SidebarFocusedSync', scratchpad);
	Listeners.add(window, 'close', scratchpad, true);
	Listeners.add(window, objName+'-disabled', scratchpad);
	Observers.add(scratchpad, 'quit-application-requested');
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'beginToggleSidebar', scratchpad, true);
	Listeners.remove(window, 'willCloseSidebar', scratchpad, true);
	Listeners.remove(window, 'SidebarFocusedSync', scratchpad);
	Listeners.remove(window, 'close', scratchpad, true);
	Listeners.remove(window, objName+'-disabled', scratchpad);
	Observers.remove(scratchpad, 'quit-application-requested');

	Prefs.unlisten('alwaysScratchpad', scratchpad);
	scratchpad.toggleAlways(false);

	if(UNLOADED) {
		Styles.unload('scratchpadSidebar');
	}

	Overlays.removeOverlayWindow(window, 'scratchpad');
};
