moduleAid.VERSION = '1.0.7';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("FirefoxAddon@similarWeb.com", function(addon) {
		// SimilarWeb 2.0 no longer has the sidebar so our fixes are unnecessary. I may completely remove them in the future.
		moduleAid.loadIf('compatibilityFix/similarWeb', (addon && addon.isActive && Services.vc.compare(addon.version, "2.0") < 0));
	});
	AddonManager.getAddonByID("{dc0fa13c-3dae-73eb-e852-912722c852f9}", function(addon) {
		moduleAid.loadIf('compatibilityFix/milewideback', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{2fa4ed95-0317-4c6a-a74c-5f3e3912c1f9}", function(addon) {
		moduleAid.loadIf('compatibilityFix/delicious', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("totaltoolbar@mozdev.org", function(addon) {
		moduleAid.loadIf('compatibilityFix/totalToolbar', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("isreaditlater@ideashower.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/pocket', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("support@lastpass.com", function(addon) {
		moduleAid.loadIf('compatibilityFix/lastPass', (addon && addon.isActive));
	});
	moduleAid.load('compatibilityFix/lessChrome');
	moduleAid.load('compatibilityFix/console');
	moduleAid.load('compatibilityFix/dmt');
	moduleAid.load('compatibilityFix/addonMgr');
	moduleAid.load('compatibilityFix/domi');
	moduleAid.load('compatibilityFix/scratchpad');
	
	// This was implemented and later apparently changed in FF20 to remove its "sidebar"
	moduleAid.loadIf('compatibilityFix/devTools', (Services.vc.compare(Services.appinfo.platformVersion, "10.0") >= 0 && Services.vc.compare(Services.appinfo.platformVersion, "20.0") < 0));
	
	moduleAid.load('compatibilityFix/pageInfo');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/similarWeb');
	moduleAid.unload('compatibilityFix/milewideback');
	moduleAid.unload('compatibilityFix/delicious');
	moduleAid.unload('compatibilityFix/totalToolbar');
	moduleAid.unload('compatibilityFix/pocket');
	moduleAid.unload('compatibilityFix/lastPass');
	moduleAid.unload('compatibilityFix/lessChrome');
	moduleAid.unload('compatibilityFix/console');
	moduleAid.unload('compatibilityFix/dmt');
	moduleAid.unload('compatibilityFix/addonMgr');
	moduleAid.unload('compatibilityFix/domi');
	moduleAid.unload('compatibilityFix/scratchpad');
	moduleAid.unload('compatibilityFix/devTools');
	moduleAid.unload('compatibilityFix/pageInfo');
};
