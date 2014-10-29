Modules.VERSION = '1.1.0';

this.pageInfoArgs = null;

this.loadPageInfoFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://browser/content/pageinfo/pageInfo.xul') {
		if(!e.target.opener) {
			e.target.opener = window;
		}
		if(pageInfoArgs) {
			if(!e.target.arguments) { e.target.arguments = new e.target.Array(); } // Doing it this way to prevent a ZC.
			e.target.arguments.unshift(pageInfoArgs);
			pageInfoArgs = null;
		}
	}
};

this.openPageInfoInSidebar = function(doc, initialTab, imageElement) {
	pageInfoArgs = {doc: doc, initialTab: initialTab, imageElement: imageElement};
	toggleSidebar($(objName+'-viewPageInfoSidebar'));
};

this.toggleAlwaysPageInfo = function(loaded) {
	if(loaded && Prefs.alwaysPageInfo) {
		Piggyback.add('pageInfo', window, 'BrowserPageInfo', openPageInfoInSidebar);
	} else {
		Piggyback.revert('pageInfo', window, 'BrowserPageInfo');
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayWindow(window, 'pageInfo');
	
	forceOpenTriggers.__defineGetter__('viewPageInfoSidebar', function() { return $(objName+'-viewPageInfoSidebar'); });
	forceReloadTriggers.__defineGetter__('viewPageInfoSidebar', function() { return $(objName+'-viewPageInfoSidebar'); });
	dontSaveBroadcasters.pageInfo = objName+'-viewPageInfoSidebar';
	
	Prefs.listen('alwaysPageInfo', toggleAlwaysPageInfo);
	toggleAlwaysPageInfo(true);
	
	Listeners.add(window, 'SidebarFocusedSync', loadPageInfoFix);
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewPageInfoSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewPageInfoSidebar') { closeSidebar(twinSidebar); }
	}
	
	Listeners.remove(window, 'SidebarFocusedSync', loadPageInfoFix);
	
	toggleAlwaysPageInfo();
	Prefs.unlisten('alwaysPageInfo', toggleAlwaysPageInfo);
	
	delete forceOpenTriggers.viewPageInfoSidebar;
	delete forceReloadTriggers.viewPageInfoSidebar;
	delete dontSaveBroadcasters.pageInfo;
	
	Overlays.removeOverlayWindow(window, 'pageInfo');
};
