Modules.VERSION = '1.1.2';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/disconnect');
};
