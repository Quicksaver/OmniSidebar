moduleAid.VERSION = '1.1.1';

XPCOMUtils.defineLazyModuleGetter(this, "DebuggerServer", "resource://gre/modules/devtools/dbg-server.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "DebuggerClient", "resource://gre/modules/devtools/dbg-client.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "devtools", "resource://gre/modules/devtools/Loader.jsm");

this.__defineGetter__('HUDService', function() { return devtools.require("devtools/webconsole/hudservice"); });

this.whichConsole = '1';
this.consoleBackups = {};

// A lot of this comes from HUDService.toggleBrowserConsole()
this.registerSidebarConsole = function(e) {
	if(e.detail.bar.box.getAttribute('sidebarcommand') != 'viewConsoleSidebar') { return; }
	
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
	if(trueAttribute($('viewConsoleSidebar'), 'checked')) {
		toggleSidebar('viewConsoleSidebar');
	}
};

this.toggleAlwaysConsole = function(unloaded) {
	if(Australis) {
		if(!UNLOADED && !unloaded && prefAid.alwaysConsole) {
			if(!consoleBackups.browserConsole) {
				consoleBackups.browserConsole = $("Tools:BrowserConsole").getAttribute('oncommand');
			}
			setAttribute($("Tools:BrowserConsole"), 'oncommand', 'toggleSidebar("viewConsoleSidebar");');
		} else {
			if(consoleBackups.browserConsole) {
				setAttribute($("Tools:BrowserConsole"), 'oncommand', consoleBackups.browserConsole);
				delete consoleBackups.browserConsole;
			}
		}
		
		return;
	}
			
	if(!UNLOADED && !unloaded && prefAid.alwaysConsole) {
		if(!consoleBackups._toJavaScriptConsole) {
			consoleBackups._toJavaScriptConsole = window.toJavaScriptConsole;
		}
		window.toJavaScriptConsole = function() { toggleSidebar($("viewConsole"+whichConsole+"Sidebar")); };
		
		if(typeof(window.toErrorConsole) != 'undefined') {
			if(!consoleBackups._toErrorConsole) {
				consoleBackups._toErrorConsole = window.toErrorConsole;
			}
			window.toErrorConsole = function() { toggleSidebar($("viewConsole"+whichConsole+"Sidebar")); };
		}
	} else {
		if(consoleBackups._toJavaScriptConsole) {
			window.toJavaScriptConsole = consoleBackups._toJavaScriptConsole;
			delete consoleBackups._toJavaScriptConsole;
		}
		if(consoleBackups._toErrorConsole) {
			window.toErrorConsole = consoleBackups._toErrorConsole;
			delete consoleBackups._toErrorConsole;
		}
	}
};

this.doConsoleCommand = function() {
	if(Australis) {
		delete holdBroadcasters.console;
		
		// We don't want it to start with the console open
		if(_sidebarCommand == 'viewConsoleSidebar') {
			_sidebarCommand = null;
			loadMainSidebar();
		}
		if(_sidebarCommandTwin == 'viewConsoleSidebar') {
			_sidebarCommandTwin = null;
			loadTwinSidebar();
		}
		
		return;
	}
	
	delete holdBroadcasters.console1;
	delete holdBroadcasters.console2;
	if(mainSidebar.loaded && (_sidebarCommand == 'viewConsole1Sidebar' || _sidebarCommand == 'viewConsole2Sidebar')) { loadMainSidebar(); }
	if(twinSidebar.loaded && (_sidebarCommandTwin == 'viewConsole1Sidebar' || _sidebarCommandTwin == 'viewConsole2Sidebar')) { loadTwinSidebar(); }
};

this.loadConsole = function() {
	doConsoleCommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewConsole1Sidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewConsole1Sidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($('viewConsole1Sidebar'), 'checked', checked);
	toggleAttribute($('viewConsole1Sidebar'), 'twinSidebar', twin);
	loadConsoleButton();
};

this.loadConsoleButton = function() {
	aSync(function() { setAttribute($(objName+'-console_sidebar_button'), 'observes', 'viewConsole'+whichConsole+'Sidebar'); });
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('alwaysConsole', toggleAlwaysConsole);
	
	toggleAlwaysConsole();
	
	// Users can still open the console in the sidebar if they have Console2 installed
	styleAid.load('consoleFix', 'console');
	
	// The browser console was introduced way before Australis, but I don't feel like figuring out exactly on which version it was implemented
	if(Australis) {
		holdBroadcasters.console = 'viewConsoleSidebar';
		
		styleAid.load('browserConsole', 'browserConsole');
		overlayAid.overlayWindow(window, 'browserConsole', null, doConsoleCommand);
		
		observerAid.add(closeConsoleSidebarOnDestroy, 'web-console-destroyed');
		
		listenerAid.add(window, 'SidebarFocused', registerSidebarConsole);
		return;
	}
	
	holdBroadcasters.console1 = 'viewConsole1Sidebar';
	holdBroadcasters.console2 = 'viewConsole2Sidebar';
	
	overlayAid.overlayWindow(window, 'consoleButton', null, loadConsoleButton);
	AddonManager.getAddonByID("{1280606b-2510-4fe0-97ef-9b5a22eafe80}", function(addon) {
		if(UNLOADED) { return; }
		
		if(addon && addon.isActive) {
			whichConsole = '2';
			if(_sidebarCommand == 'viewConsole1Sidebar') { _sidebarCommand = 'viewConsole2Sidebar'; }
			if(_sidebarCommandTwin == 'viewConsole1Sidebar') { _sidebarCommandTwin = 'viewConsole2Sidebar'; }
			doConsoleCommand();
		} else {
			overlayAid.overlayWindow(window, 'consoleSidebar', null, loadConsole);
			if(_sidebarCommand == 'viewConsole2Sidebar') { _sidebarCommand = 'viewConsole1Sidebar'; }
			if(_sidebarCommandTwin == 'viewConsole2Sidebar') { _sidebarCommandTwin = 'viewConsole1Sidebar'; }
		}
	});
};

moduleAid.UNLOADMODULE = function() {
	if(Australis) {
		listenerAid.remove(window, 'SidebarFocused', registerSidebarConsole);
		
		observerAid.remove(closeConsoleSidebarOnDestroy, 'web-console-destroyed');
		
		overlayAid.removeOverlayWindow(window, 'browserConsole');
	} else {
		overlayAid.removeOverlayWindow(window, 'consoleSidebar');
		overlayAid.removeOverlayWindow(window, 'consoleButton');
	}
	
	toggleAlwaysConsole(true);
	
	prefAid.unlisten('alwaysConsole', toggleAlwaysConsole);
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == ((Australis) ? 'viewConsoleSidebar' : 'viewConsole1Sidebar')) { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == ((Australis) ? 'viewConsoleSidebar' : 'viewConsole1Sidebar')) { closeSidebar(twinSidebar); }
		styleAid.unload('browserConsole');
		styleAid.unload('consoleFix');
	}
};
