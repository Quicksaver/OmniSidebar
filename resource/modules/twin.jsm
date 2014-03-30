moduleAid.VERSION = '1.1.2';

this.reUnloadTwin = function() {
	if(twinSidebar.box.collapsed) {
		closeSidebar(twinSidebar);
	}
};

this.unsetBroadcastersTwin = function() {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i = 0; i < broadcasters.length; ++i) {
		if(trueAttribute(broadcasters[i], 'twinSidebar')) {
			broadcasters[i].removeAttribute('checked');
			broadcasters[i].removeAttribute('twinSidebar');
		}
	}
};

this.fixWidths = function() {
	var browser = $('browser');
	var mainWidth = mainSidebar.width;
	var twinWidth = twinSidebar.width;
	
	var main = true;
	while(mainWidth + twinWidth > browser.clientWidth - prefAid.minSpaceBetweenSidebars) {
		main = !main;
		if(main) {
			mainWidth = mainWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + prefAid.minSpaceBetweenSidebars);
		} else {
			twinWidth = twinWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + prefAid.minSpaceBetweenSidebars);
		}
	}
	
	if(mainWidth != mainSidebar.width) { mainSidebar.box.setAttribute('width', mainWidth); }
	if(twinWidth != twinSidebar.width) { twinSidebar.box.setAttribute('width', twinWidth); }
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
	twinSidebar.sidebar.style.minWidth = prefAid.minSidebarWidth+'px';
	twinSidebar.sidebar.style.width = '';
	
	fixWidths();
	
	objectWatcher.addAttributeWatcher(twinSidebar.box, 'width', watchWidth, true);
	
	// Apply initial preferences
	listenerAid.add(twinSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	loadTwinSidebar();
};

this.unloadedTwin = function() {
	twinSidebar.loaded = false;
	
	delete scrollNodes.twinSwitcher;
	
	for(var x in dontSaveBroadcasters) {
		if(twinSidebar.box.getAttribute('sidebarcommand') == dontSaveBroadcasters[x]) {
			closeSidebar(twinSidebar);
		}
	}
	
	unsetBroadcastersTwin();
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, "twin", null,
		function(window) {
			window[objName].loadedTwin();
		},
		function(window) {
			window[objName].unloadedTwin();
		}
	);
	
	prefAid.listen('useSwitchTwin', enableTwinSwitcher);
	prefAid.listen('keepLoaded', reUnloadTwin);
	
	twinTriggers.__defineGetter__('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	twinTriggers.__defineGetter__('twinSwitcher', function() { return twinSidebar.switcher; });
	blankTriggers.__defineGetter__('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	blankTriggers.__defineGetter__('twinSwitcher', function() { return twinSidebar.switcher; });
};

moduleAid.UNLOADMODULE = function() {
	delete twinTriggers.twinCommand;
	delete twinTriggers.twinSwitcher;
	delete blankTriggers.twinCommand;
	delete blankTriggers.twinSwitcher;
	
	prefAid.unlisten('useSwitchTwin', enableTwinSwitcher);
	prefAid.unlisten('keepLoaded', reUnloadTwin);
	
	reUnloadTwin();
	
	listenerAid.remove(twinSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	objectWatcher.removeAttributeWatcher(twinSidebar.box, 'width', watchWidth, true);
	
	if(SocialSidebar && isAncestor(SocialBrowser, twinSidebar.box)) {
		restoreSocialSidebar();
	}
	
	overlayAid.removeOverlayWindow(window, "twin");
};
