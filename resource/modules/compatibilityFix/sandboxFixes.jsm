// VERSION 1.1.3

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});
	
	Modules.load('compatibilityFix/prefsMonitor');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/disconnect');
	Modules.unload('compatibilityFix/prefsMonitor');
};
