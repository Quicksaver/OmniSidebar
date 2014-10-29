Modules.VERSION = '1.1.0';

this.toggleForceOpenToolbars = function() {
	if(Prefs.forceOpenToolbars) {
		forceOpenTriggers.__defineGetter__('mainToolbar', function() { return mainSidebar.toolbar; });
		forceOpenTriggers.__defineGetter__('twinToolbar', function() { return twinSidebar.toolbar; });
	} else {
		delete forceOpenTriggers.mainToolbar;
		delete forceOpenTriggers.twinToolbar;
	}
};

this.toggleForceOpenMenus = function() {
	if(Prefs.forceOpenMenus) {
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

Modules.LOADMODULE = function() {
	Prefs.listen('forceOpenToolbars', toggleForceOpenToolbars);
	Prefs.listen('forceOpenMenus', toggleForceOpenMenus);
	
	toggleForceOpenToolbars();
	toggleForceOpenMenus();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('forceOpenToolbars', toggleForceOpenToolbars);
	Prefs.unlisten('forceOpenMenus', toggleForceOpenMenus);
};
