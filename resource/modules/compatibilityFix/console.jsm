// VERSION 2.0.5

XPCOMUtils.defineLazyModuleGetter(this, "devtools", "resource://devtools/shared/Loader.jsm");
this.__defineGetter__('DebuggerServer', function() { return devtools.require("devtools/server/main").DebuggerServer; });
this.__defineGetter__('DebuggerClient', function() { return devtools.require("devtools/shared/client/main").DebuggerClient; });
this.__defineGetter__('HUDService', function() { return devtools.require("devtools/client/webconsole/hudservice"); });

this.sidebarConsole = {
	broadcasterId: objName+'-viewConsoleSidebar',
	get broadcaster () { return $(this.broadcasterId); },

	// A lot of this comes from HUDService.toggleBrowserConsole()
	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocused':
				// this is probably the event from the native SidebarUI that can be fired during startup, it doesn't really matter to us
				if(!e.detail) { return; }

				if(e.detail.bar.command != this.broadcasterId) { return; }

				if(!DebuggerServer.initialized) {
					DebuggerServer.init();
					DebuggerServer.addBrowserActors();
				}
				DebuggerServer.allowChromeProcess = true;

				let client = new DebuggerClient(DebuggerServer.connectPipe());
				client.connect(function() {
					client.getProcess().then(function(aResponse) {
						// Set chrome:false in order to attach to the target
						// (i.e. send an `attach` request to the chrome actor)
						devtools.TargetFactory.forRemoteTab({ form: aResponse.form, client: client, chrome: false }).then(function(target) {
							HUDService.openBrowserConsole(target, e.target, e.target);
						});
					});
				});
				break;

			case 'ShouldCollapseSidebar':
				if(e.target.getAttribute('sidebarcommand') == this.broadcasterId) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'web-console-destroyed':
				if(trueAttribute(this.broadcaster, 'checked')) {
					SidebarUI.toggle(this.broadcasterId);
				}
				break;

			case 'nsPref:changed':
				switch(aSubject) {
					case 'alwaysConsole':
						this.toggleAlways(Prefs.alwaysConsole);
						break;
				}
				break;
		}
	},

	toggleAlways: function(enable) {
		// Firefox 48 creates devtools menu items dynamically, rather than hardcode them into the XUL.
		if(Services.vc.compare(Services.appinfo.version, "48.0a1") >= 0) {
			Timers.cancel('delayedToggleAlways');

			let menuItem = $('menu_browserConsole');
			if(!menuItem) {
				// It may not have been created yet. We usually only have to wait a second or two.
				Timers.init('delayedToggleAlways', () => { this.toggleAlways(enable); }, 1000);
				return;
			}
			let keyItem = $(menuItem.getAttribute('key'));

			let { menuitems } = devtools.require("devtools/client/menus.js");
			let consoleItem;
			for(let item of menuitems) {
				if(item.id == 'menu_browserConsole') {
					consoleItem = item;
					break;
				}
			}

			if(enable && !menuItem._alwaysOpenInSidebar) {
				menuItem.removeEventListener("command", consoleItem.oncommand);
				keyItem.removeEventListener("command", consoleItem.oncommand);
				menuItem._alwaysOpenInSidebar = () => {
					SidebarUI.toggle(this.broadcasterId);
				};
				menuItem.addEventListener("command", menuItem._alwaysOpenInSidebar);
				keyItem.addEventListener("command", menuItem._alwaysOpenInSidebar);
			}
			else if(!enable && menuItem._alwaysOpenInSidebar) {
				menuItem.removeEventListener("command", menuItem._alwaysOpenInSidebar);
				keyItem.removeEventListener("command", menuItem._alwaysOpenInSidebar);
				delete menuItem._alwaysOpenInSidebar;
				menuItem.addEventListener("command", consoleItem.oncommand);
				keyItem.addEventListener("command", consoleItem.oncommand);
			}
			return;
		}

		let command = $("Tools:BrowserConsole");
		if(enable) {
			if(!command.getAttribute(objName+'_backup_oncommand')) {
				setAttribute(command, objName+'_backup_oncommand', command.getAttribute('oncommand'));
			}
			setAttribute(command, 'oncommand', 'SidebarUI.toggle("'+this.broadcasterId+'");');
		} else {
			if(command.getAttribute(objName+'_backup_oncommand')) {
				setAttribute(command, 'oncommand', command.getAttribute(objName+'_backup_oncommand'));
				removeAttribute(command, objName+'_backup_oncommand');
			}
		}

		this.acceltext();
	},

	acceltext: function() {
		if(!this.broadcaster) { return; }

		if(!Prefs.alwaysConsole) {
			removeAttribute(this.broadcaster, 'acceltext');
			return;
		}

		let str = this.broadcaster.getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext');
		if(Services.vc.compare(Services.appinfo.version, "48.0a1") >= 0) {
			let MenuStrings = Services.strings.createBundle("chrome://devtools/locale/menus.properties");
			str += MenuStrings.GetStringFromName('browserConsoleCmd.key');
		}
		let parts = str.split('+');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		str = parts.join('+');
		setAttribute(this.broadcaster, 'acceltext', str);
	},

	onLoad: function() {
		SidebarUI.holdBroadcasters.delete(this.broadcasterId);

		// We don't want the browser to start with the console open
		if(mainSidebar.state.command == this.broadcasterId && !mainSidebar.state.closed) {
			mainSidebar.stateForceClosed(true);
			self.onLoad();
		}
		if(twinSidebar.state.command == this.broadcasterId && !twinSidebar.state.closed) {
			twinSidebar.stateForceClosed(true);
			twin.load();
		}

		this.acceltext();
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('alwaysConsole', sidebarConsole);
	sidebarConsole.toggleAlways(Prefs.alwaysConsole);

	Styles.load('browserConsole', 'browserConsole');

	SidebarUI.holdBroadcasters.add(sidebarConsole.broadcasterId);

	if(Services.vc.compare(Services.appinfo.version, "48.0a1") >= 0) {
		Overlays.overlayWindow(window, 'browserConsole', sidebarConsole);
	} else {
		Overlays.overlayWindow(window, 'browserConsolePre48', sidebarConsole);
	}

	Observers.add(sidebarConsole, 'web-console-destroyed');

	Listeners.add(window, 'SidebarFocused', sidebarConsole);
	Listeners.add(window, 'ShouldCollapseSidebar', sidebarConsole);
};

Modules.UNLOADMODULE = function() {
	Timers.cancel('delayedToggleAlways');

	Listeners.remove(window, 'SidebarFocused', sidebarConsole);
	Listeners.remove(window, 'ShouldCollapseSidebar', sidebarConsole);

	Observers.remove(sidebarConsole, 'web-console-destroyed');

	Overlays.removeOverlayWindow(window, 'browserConsole');
	Overlays.removeOverlayWindow(window, 'browserConsolePre48');

	Prefs.unlisten('alwaysConsole', sidebarConsole);
	sidebarConsole.toggleAlways(false);

	if(UNLOADED) {
		if(UNLOADED != APP_SHUTDOWN) {
			if(mainSidebar.command == sidebarConsole.broadcasterId) { SidebarUI.close(mainSidebar); }
			if(twinSidebar.command == sidebarConsole.broadcasterId) { SidebarUI.close(twinSidebar); }
		}
		Styles.unload('browserConsole');
	}
};
