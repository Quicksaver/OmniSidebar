moduleAid.VERSION = '1.0.0';

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
		forceOpenTriggers.__defineGetter__('viewTwinSidebarMenu', function() { return $('viewTwinSidebarMenu'); });
		forceOpenTriggers.__defineGetter__('openMainSidebarMenu', function() { return $('openSidebarMenu'); });
		forceOpenTriggers.__defineGetter__('openTwinSidebarMenu', function() { return $('openTwinSidebarMenu'); });
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
