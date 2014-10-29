Modules.VERSION = '1.1.0';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		Modules.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{3d2ee42e-a6d9-4888-bd17-2148dc7928d7}", function(addon) {
		Modules.loadIf('compatibilityFix/mx3', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/treestyletab');
	Modules.unload('compatibilityFix/mx3');
	Modules.unload('compatibilityFix/disconnect');
};
