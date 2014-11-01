Modules.VERSION = '1.3.1';

XPCOMUtils.defineLazyModuleGetter(this, "DebuggerServer", "resource://gre/modules/devtools/dbg-server.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "DebuggerClient", "resource://gre/modules/devtools/dbg-client.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "devtools", "resource://gre/modules/devtools/Loader.jsm");

this.__defineGetter__('HUDService', function() { return devtools.require("devtools/webconsole/hudservice"); });

// A lot of this comes from HUDService.toggleBrowserConsole()
this.registerSidebarConsole = function(e) {
	if(e.detail.bar.box.getAttribute('sidebarcommand') != objName+'-viewConsoleSidebar') { return; }
	
	if(!DebuggerServer.initialized) {
		DebuggerServer.init();
		DebuggerServer.addBrowserActors();
	}
	
	var client = new DebuggerClient(DebuggerServer.connectPipe());
	client.connect(function() {
		client.listTabs(function(aResponse) {
			// Add Global Process debugging...
			var form = JSON.parse(JSON.stringify(aResponse));
			delete form.tabs;
			delete form.selected;
			// ...only if there are appropriate actors (a 'from' property will always be there).
			if(Object.keys(form).length > 1) {
				devtools.TargetFactory.forRemoteTab({ form: form, client: client, chrome: true }).then(function(target) {
					HUDService.openBrowserConsole(target, e.target, e.target);
				});
			}
		});
	});
};

this.closeConsoleSidebarOnDestroy = function() {
	if(trueAttribute($(objName+'-viewConsoleSidebar'), 'checked')) {
		toggleSidebar(objName+'-viewConsoleSidebar');
	}
};

this.toggleAlwaysConsole = function(loaded) {
	if(loaded && Prefs.alwaysConsole) {
		if(!$("Tools:BrowserConsole").getAttribute(objName+'_backup_oncommand')) {
			setAttribute($("Tools:BrowserConsole"), objName+'_backup_oncommand', $("Tools:BrowserConsole").getAttribute('oncommand'));
		}
		setAttribute($("Tools:BrowserConsole"), 'oncommand', 'toggleSidebar("'+objName+'-viewConsoleSidebar");');
	} else {
		if($("Tools:BrowserConsole").getAttribute(objName+'_backup_oncommand')) {
			setAttribute($("Tools:BrowserConsole"), 'oncommand', $("Tools:BrowserConsole").getAttribute(objName+'_backup_oncommand'));
			removeAttribute($("Tools:BrowserConsole"), objName+'_backup_oncommand');
		}
	}
	
	browserConsoleAcceltext();
};

this.browserConsoleAcceltext = function() {
	if($(objName+'-viewConsoleSidebar')) {
		var str = $(objName+'-viewConsoleSidebar').getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext');
		var parts = str.split('+');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		str = parts.join('+');
		toggleAttribute($(objName+'-viewConsoleSidebar'), 'acceltext', Prefs.alwaysConsole, str);
	}
};

this.doConsoleCommand = function() {
	delete holdBroadcasters.console;
	
	// We don't want the browser to start with the console open
	if(mainSidebar.state.command == objName+'-viewConsoleSidebar' && !mainSidebar.state.closed) {
		mainSidebar.stateForceClosed(true);
		loadMainSidebar();
	}
	if(twinSidebar.state.command == objName+'-viewConsoleSidebar' && !twinSidebar.state.closed) {
		twinSidebar.stateForceClosed(true);
		loadTwinSidebar();
	}
	
	browserConsoleAcceltext();
};

Modules.LOADMODULE = function() {
	Prefs.listen('alwaysConsole', toggleAlwaysConsole);
	toggleAlwaysConsole(true);
	
	Styles.load('browserConsole', 'browserConsole');
	
	holdBroadcasters.console = objName+'-viewConsoleSidebar';
	
	Overlays.overlayWindow(window, 'browserConsole', null, doConsoleCommand);
	
	Observers.add(closeConsoleSidebarOnDestroy, 'web-console-destroyed');
	
	Listeners.add(window, 'SidebarFocused', registerSidebarConsole);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'SidebarFocused', registerSidebarConsole);
	
	Observers.remove(closeConsoleSidebarOnDestroy, 'web-console-destroyed');
	
	Overlays.removeOverlayWindow(window, 'browserConsole');
	
	Prefs.unlisten('alwaysConsole', toggleAlwaysConsole);
	toggleAlwaysConsole();
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewConsoleSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewConsoleSidebar') { closeSidebar(twinSidebar); }
		Styles.unload('browserConsole');
	}
};
