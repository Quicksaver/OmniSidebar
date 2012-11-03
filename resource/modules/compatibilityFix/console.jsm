moduleAid.VERSION = '1.0.0';

this.whichConsole = '1';
this.consoleBackups = {};

this.toggleAlwaysConsole = function(unloaded) {
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
	aSync(function() { setAttribute($('console_sidebar_button'), 'observes', 'viewConsole'+whichConsole+'Sidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.console1 = 'viewConsole1Sidebar';
	holdBroadcasters.console2 = 'viewConsole2Sidebar';
	
	styleAid.load('consoleFix', 'console');
	
	overlayAid.overlayWindow(window, 'consoleButton', null, loadConsoleButton);
	AddonManager.getAddonByID("{1280606b-2510-4fe0-97ef-9b5a22eafe80}", function(addon) {
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
	
	prefAid.listen('alwaysConsole', toggleAlwaysConsole);
	
	toggleAlwaysConsole();
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'consoleSidebar');
	overlayAid.removeOverlayWindow(window, 'consoleButton');
	
	toggleAlwaysConsole(true);
	
	prefAid.unlisten('alwaysConsole', toggleAlwaysConsole);
	
	if(UNLOADED) {
		if(UNLOADED != APP_SHUTDOWN) {
			if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewConsole1Sidebar') { closeSidebar(mainSidebar); }
			if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewConsole1Sidebar') { closeSidebar(twinSidebar); }
		}
		styleAid.unload('consoleFix');
	}
};
