moduleAid.VERSION = '1.0.2';

this.pageInfoBackup = null;
this.pageInfoArgs = null;

this.loadPageInfoFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://browser/content/pageinfo/pageInfo.xul') {
		if(!e.target.opener) {
			e.target.opener = window;
		}
		if(pageInfoArgs) {
			if(!e.target.arguments) { e.target.arguments = new Array(); }
			e.target.arguments.unshift(pageInfoArgs);
			pageInfoArgs = null;
		}
	}
};

this.openPageInfoInSidebar = function(doc, initialTab, imageElement) {
	pageInfoArgs = {doc: doc, initialTab: initialTab, imageElement: imageElement};
	toggleSidebar($(objName+'-viewPageInfoSidebar'));
};

this.toggleAlwaysPageInfo = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.alwaysPageInfo) {
		if(!pageInfoBackup) {
			pageInfoBackup = window.BrowserPageInfo;
		}
		window.BrowserPageInfo = openPageInfoInSidebar;
	} else if(pageInfoBackup) {
		window.BrowserPageInfo = pageInfoBackup;
		pageInfoBackup = null;
	}
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'pageInfo');
	
	forceOpenTriggers.__defineGetter__('viewPageInfoSidebar', function() { return $(objName+'-viewPageInfoSidebar'); });
	forceReloadTriggers.__defineGetter__('viewPageInfoSidebar', function() { return $(objName+'-viewPageInfoSidebar'); });
	dontSaveBroadcasters.pageInfo = objName+'-viewPageInfoSidebar';
	
	prefAid.listen('alwaysPageInfo', toggleAlwaysPageInfo);
	toggleAlwaysPageInfo();
	
	listenerAid.add(window, 'SidebarFocusedSync', loadPageInfoFix);
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewPageInfoSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewPageInfoSidebar') { closeSidebar(twinSidebar); }
	}
	
	listenerAid.remove(window, 'SidebarFocusedSync', loadPageInfoFix);
	
	toggleAlwaysPageInfo(true);
	prefAid.unlisten('alwaysPageInfo', toggleAlwaysPageInfo);
	
	delete forceOpenTriggers.viewPageInfoSidebar;
	delete forceReloadTriggers.viewPageInfoSidebar;
	delete dontSaveBroadcasters.pageInfo;
	
	overlayAid.removeOverlayWindow(window, 'pageInfo');
};
