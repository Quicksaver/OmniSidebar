moduleAid.VERSION = '1.0.1';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		moduleAid.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{3d2ee42e-a6d9-4888-bd17-2148dc7928d7}", function(addon) {
		moduleAid.loadIf('compatibilityFix/mx3', (addon && addon.isActive));
	});
	if(Services.vc.compare(Services.appinfo.platformVersion, "13.0.1") <= 0) {
		moduleAid.load('compatibilityFix/Ff13sandbox');
	}
	if(Services.vc.compare(Services.appinfo.platformVersion, "16.0.2") <= 0) {
		moduleAid.load('compatibilityFix/Ff16sandbox');
	}
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/treestyletab');
	moduleAid.unload('compatibilityFix/mx3');
	moduleAid.unload('compatibilityFix/Ff13sandbox');
	moduleAid.unload('compatibilityFix/Ff16sandbox');
};
