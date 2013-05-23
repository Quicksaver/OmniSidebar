moduleAid.VERSION = '1.0.5';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("{dc0fa13c-3dae-73eb-e852-912722c852f9}", function(addon) {
		moduleAid.loadIf('compatibilityFix/milewideback', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{2fa4ed95-0317-4c6a-a74c-5f3e3912c1f9}", function(addon) {
		moduleAid.loadIf('compatibilityFix/delicious', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("totaltoolbar@mozdev.org", function(addon) {
		moduleAid.loadIf('compatibilityFix/totalToolbar', (addon && addon.isActive));
	});
	moduleAid.load('compatibilityFix/lessChrome');
	moduleAid.load('compatibilityFix/console');
	moduleAid.load('compatibilityFix/dmt');
	moduleAid.load('compatibilityFix/addonMgr');
	moduleAid.load('compatibilityFix/domi');
	moduleAid.load('compatibilityFix/pageInfo');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/milewideback');
	moduleAid.unload('compatibilityFix/delicious');
	moduleAid.unload('compatibilityFix/totalToolbar');
	moduleAid.unload('compatibilityFix/lessChrome');
	moduleAid.unload('compatibilityFix/console');
	moduleAid.unload('compatibilityFix/dmt');
	moduleAid.unload('compatibilityFix/addonMgr');
	moduleAid.unload('compatibilityFix/domi');
	moduleAid.unload('compatibilityFix/pageInfo');
};
