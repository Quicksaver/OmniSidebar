moduleAid.VERSION = '1.0.3';

this.whichConsole = '1';
this.consoleBackups = {};

this.__defineGetter__('HUDService', function() {
	var devtools = Cu.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
	return devtools.require("devtools/webconsole/hudservice");
});

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
		if(mainSidebar.loaded && _sidebarCommand == 'viewConsoleSidebar') { loadMainSidebar(); }
		if(twinSidebar.loaded && _sidebarCommandTwin == 'viewConsoleSidebar') { loadTwinSidebar(); }
		
		return;
	}
	
	delete holdBroadcasters.console1;
	delete holdBroadcasters.console2;
	if(mainSidebar.loaded && (_sidebarCommand == 'viewConsole1Sidebar' || _sidebarCommand == 'viewConsole2Sidebar')) { loadMainSidebar(); }
	if(twinSidebar.loaded && (_sidebarCommandTwin == 'viewConsole1Sidebar' || _sidebarCommandTwin == 'viewConsole2Sidebar')) { loadTwinSidebar(); }
};

this.loadConsole = function() {
	doConsoleCommand();
	
	if(Australis) {
		var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewConsoleSidebar';
		var twin = false;
		if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewConsoleSidebar') {
			checked = true;
			twin = true;
		}
		toggleAttribute($('viewConsoleSidebar'), 'checked', checked);
		toggleAttribute($('viewConsoleSidebar'), 'twinSidebar', twin);
		
		return;
	}
	
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
	
	// The browser console was introduced way before Australis, but I don't feel like figuring out exactly on which version it was implemented
	if(Australis) {
		holdBroadcasters.console = 'viewConsoleSidebar';
		
		styleAid.load('consoleFix', 'browserConsole');
		overlayAid.overlayWindow(window, 'browserConsole', null, loadConsole);
		
		observerAid.add(function(aSubject, aTopic, aData) { doLog(aTopic); }, 'web-console-destroyed');
		
		return;
	}
	
	holdBroadcasters.console1 = 'viewConsole1Sidebar';
	holdBroadcasters.console2 = 'viewConsole2Sidebar';
	
	styleAid.load('consoleFix', 'console');
	
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
		styleAid.unload('consoleFix');
	}
};
