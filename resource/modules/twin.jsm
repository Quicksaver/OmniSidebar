Modules.VERSION = '1.2.0';

this.reUnloadTwin = function() {
	if(twinSidebar.box.collapsed) {
		closeSidebar(twinSidebar);
	}
};

this.unsetBroadcastersTwin = function() {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var broadcaster of broadcasters) {
		if(trueAttribute(broadcaster, 'twinSidebar')) {
			removeAttribute(broadcaster, 'checked');
			removeAttribute(broadcaster, 'twinSidebar');
		}
	}
};

this.fixWidths = function() {
	var browser = $('browser');
	var mainWidth = mainSidebar.width;
	var twinWidth = twinSidebar.width;
	
	var main = true;
	while(mainWidth + twinWidth > browser.clientWidth - Prefs.minSpaceBetweenSidebars) {
		main = !main;
		if(main) {
			mainWidth = mainWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + Prefs.minSpaceBetweenSidebars);
		} else {
			twinWidth = twinWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + Prefs.minSpaceBetweenSidebars);
		}
	}
	
	if(mainWidth != mainSidebar.width) { setAttribute(mainSidebar.box, 'width', mainWidth); }
	if(twinWidth != twinSidebar.width) { setAttribute(twinSidebar.box, 'width', twinWidth); }
};

this.enableTwinSwitcher = function() {
	enableSwitcher(twinSidebar);
	scrollNodes.twinSwitcher = twinSidebar.switcher;
};

this.loadTwinSidebar = function() {
	twinSidebar.loaded = true;
	enableTwinSwitcher();
	openLast(twinSidebar);
	setclass(twinSidebar);
};

this.loadedTwin = function() {
	// I guess some add-ons can set these, they override the css set ones so we have to erase them
	twinSidebar.sidebar.style.maxWidth = '';
	twinSidebar.sidebar.style.minWidth = Prefs.minSidebarWidth+'px';
	twinSidebar.sidebar.style.width = '';
	
	fixWidths();
	
	Watchers.addAttributeWatcher(twinSidebar.box, 'width', watchWidth, true);
	
	// Apply initial preferences
	Listeners.add(twinSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	// there are no events dispatched when the overlay loads, so I have to do this here
	if(typeof(toggleMenuButtonTwin) != 'undefined') {
		toggleMenuButtonTwin();
	}
	
	loadTwinSidebar();
};

this.unloadedTwin = function() {
	twinSidebar.loaded = false;
	
	delete scrollNodes.twinSwitcher;
	
	for(var x in dontSaveBroadcasters) {
		if(twinSidebar.box.getAttribute('sidebarcommand') == dontSaveBroadcasters[x]) {
			closeSidebar(twinSidebar);
			break;
		}
	}
	
	unsetBroadcastersTwin();
};

Modules.LOADMODULE = function() {
	Overlays.overlayWindow(window, "twin", null,
		function(window) {
			window[objName].loadedTwin();
		},
		function(window) {
			window[objName].unloadedTwin();
		}
	);
	
	Prefs.listen('useSwitchTwin', enableTwinSwitcher);
	Prefs.listen('keepLoaded', reUnloadTwin);
	
	twinTriggers.__defineGetter__('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	twinTriggers.__defineGetter__('twinSwitcher', function() { return twinSidebar.switcher; });
	blankTriggers.__defineGetter__('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	blankTriggers.__defineGetter__('twinSwitcher', function() { return twinSidebar.switcher; });
};

Modules.UNLOADMODULE = function() {
	delete twinTriggers.twinCommand;
	delete twinTriggers.twinSwitcher;
	delete blankTriggers.twinCommand;
	delete blankTriggers.twinSwitcher;
	
	Prefs.unlisten('useSwitchTwin', enableTwinSwitcher);
	Prefs.unlisten('keepLoaded', reUnloadTwin);
	
	reUnloadTwin();
	
	Listeners.remove(twinSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	Watchers.removeAttributeWatcher(twinSidebar.box, 'width', watchWidth, true);
	
	if(isAncestor(SocialBrowser, twinSidebar.box)) {
		restoreSocialSidebar();
	}
	
	Overlays.removeOverlayWindow(window, "twin");
};
