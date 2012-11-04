moduleAid.VERSION = '1.0.1';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		moduleAid.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{3d2ee42e-a6d9-4888-bd17-2148dc7928d7}", function(addon) {
		moduleAid.loadIf('compatibilityFix/mx3', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/treestyletab');
	moduleAid.unload('compatibilityFix/mx3');
};
