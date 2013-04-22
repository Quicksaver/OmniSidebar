moduleAid.VERSION = '1.0.1';

this.toggleForceOpenToolbars = function() {
	if(prefAid.forceOpenToolbars) {
		forceOpenTriggers.__defineGetter__('mainToolbar', function() { return mainSidebar.toolbar; });
		forceOpenTriggers.__defineGetter__('twinToolbar', function() { return twinSidebar.toolbar; });
	} else {
		delete forceOpenTriggers.mainToolbar;
		delete forceOpenTriggers.twinToolbar;
	}
};

this.toggleForceOpenMenus = function() {
	if(prefAid.forceOpenMenus) {
		forceOpenTriggers.__defineGetter__('viewMainSidebarMenu', function() { return $('viewSidebarMenu'); });
		forceOpenTriggers.__defineGetter__('viewTwinSidebarMenu', function() { return $(objName+'-viewTwinSidebarMenu'); });
		forceOpenTriggers.__defineGetter__('openMainSidebarMenu', function() { return $(objName+'-openSidebarMenu'); });
		forceOpenTriggers.__defineGetter__('openTwinSidebarMenu', function() { return $(objName+'-openTwinSidebarMenu'); });
	} else {
		delete forceOpenTriggers.viewMainSidebarMenu;
		delete forceOpenTriggers.viewTwinSidebarMenu;
		delete forceOpenTriggers.openMainSidebarMenu;
		delete forceOpenTriggers.openTwinSidebarMenu;
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('forceOpenToolbars', toggleForceOpenToolbars);
	prefAid.listen('forceOpenMenus', toggleForceOpenMenus);
	
	toggleForceOpenToolbars();
	toggleForceOpenMenus();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('forceOpenToolbars', toggleForceOpenToolbars);
	prefAid.unlisten('forceOpenMenus', toggleForceOpenMenus);
};
