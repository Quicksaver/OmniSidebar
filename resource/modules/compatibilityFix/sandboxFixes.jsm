moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		moduleAid.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/treestyletab');
};
