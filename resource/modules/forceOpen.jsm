Modules.VERSION = '1.1.1';

this.toggleForceOpenToolbars = function() {
	if(Prefs.forceOpenToolbars) {
		SidebarUI.triggers.forceOpen.set('mainToolbar', function() { return mainSidebar.toolbar; });
		SidebarUI.triggers.forceOpen.set('twinToolbar', function() { return twinSidebar.toolbar; });
	} else {
		SidebarUI.triggers.forceOpen.delete('mainToolbar');
		SidebarUI.triggers.forceOpen.delete('twinToolbar');
	}
};

this.toggleForceOpenMenus = function() {
	if(Prefs.forceOpenMenus) {
		SidebarUI.triggers.forceOpen.set('viewMainSidebarMenu', function() { return $('viewSidebarMenu'); });
		SidebarUI.triggers.forceOpen.set('viewTwinSidebarMenu', function() { return $(objName+'-viewTwinSidebarMenu'); });
		SidebarUI.triggers.forceOpen.set('openMainSidebarMenu', function() { return $(objName+'-openSidebarMenu'); });
		SidebarUI.triggers.forceOpen.set('openTwinSidebarMenu', function() { return $(objName+'-openTwinSidebarMenu'); });
	} else {
		SidebarUI.triggers.forceOpen.delete('viewMainSidebarMenu');
		SidebarUI.triggers.forceOpen.delete('viewTwinSidebarMenu');
		SidebarUI.triggers.forceOpen.delete('openMainSidebarMenu');
		SidebarUI.triggers.forceOpen.delete('openTwinSidebarMenu');
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
