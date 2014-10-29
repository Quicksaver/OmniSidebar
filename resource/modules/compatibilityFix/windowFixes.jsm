Modules.VERSION = '1.1.0';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("FirefoxAddon@similarWeb.com", function(addon) {
		// SimilarWeb 2.0 no longer has the sidebar so our fixes are unnecessary. I may completely remove them in the future.
		Modules.loadIf('compatibilityFix/similarWeb', (addon && addon.isActive && Services.vc.compare(addon.version, "2.0") < 0));
	});
	AddonManager.getAddonByID("{dc0fa13c-3dae-73eb-e852-912722c852f9}", function(addon) {
		Modules.loadIf('compatibilityFix/milewideback', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("{2fa4ed95-0317-4c6a-a74c-5f3e3912c1f9}", function(addon) {
		Modules.loadIf('compatibilityFix/delicious', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("totaltoolbar@mozdev.org", function(addon) {
		Modules.loadIf('compatibilityFix/totalToolbar', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("isreaditlater@ideashower.com", function(addon) {
		Modules.loadIf('compatibilityFix/pocket', (addon && addon.isActive));
	});
	AddonManager.getAddonByID("autopager@mozilla.org", function(addon) {
		Modules.loadIf('compatibilityFix/autoPager', (addon && addon.isActive));
	});
	Modules.load('compatibilityFix/lessChrome');
	Modules.load('compatibilityFix/console');
	Modules.load('compatibilityFix/dmt');
	Modules.load('compatibilityFix/addonMgr');
	Modules.load('compatibilityFix/domi');
	Modules.load('compatibilityFix/scratchpad');
	Modules.load('compatibilityFix/pageInfo');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/similarWeb');
	Modules.unload('compatibilityFix/milewideback');
	Modules.unload('compatibilityFix/delicious');
	Modules.unload('compatibilityFix/totalToolbar');
	Modules.unload('compatibilityFix/pocket');
	Modules.unload('compatibilityFix/autoPager');
	Modules.unload('compatibilityFix/lessChrome');
	Modules.unload('compatibilityFix/console');
	Modules.unload('compatibilityFix/dmt');
	Modules.unload('compatibilityFix/addonMgr');
	Modules.unload('compatibilityFix/domi');
	Modules.unload('compatibilityFix/scratchpad');
	Modules.unload('compatibilityFix/pageInfo');
};
