// VERSION 1.1.4

Modules.LOADMODULE = function() {
	Modules.load('compatibilityFix/AddonManager');

	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});

	Modules.load('compatibilityFix/prefsMonitor');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/disconnect');
	Modules.unload('compatibilityFix/prefsMonitor');
	Modules.unload('compatibilityFix/AddonManager');
};
