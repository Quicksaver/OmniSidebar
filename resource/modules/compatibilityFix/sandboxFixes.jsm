Modules.VERSION = '1.1.1';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		Modules.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/treestyletab');
	Modules.unload('compatibilityFix/disconnect');
};
