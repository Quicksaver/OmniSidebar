Modules.VERSION = '1.1.7';

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("{dc0fa13c-3dae-73eb-e852-912722c852f9}", function(addon) {
		Modules.loadIf('compatibilityFix/milewideback', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("edgewise@software.donnapaul.net", function(addon) {
		Modules.loadIf('compatibilityFix/edgewise', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("isreaditlater@ideashower.com", function(addon) {
		Modules.loadIf('compatibilityFix/pocket', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("autopager@mozilla.org", function(addon) {
		Modules.loadIf('compatibilityFix/autoPager', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("treestyletab@piro.sakura.ne.jp", function(addon) {
		Modules.loadIf('compatibilityFix/treestyletab', (addon && addon.isActive));
	});
	
	Modules.load('compatibilityFix/console');
	Modules.load('compatibilityFix/dmt');
	Modules.load('compatibilityFix/addonMgr');
	Modules.load('compatibilityFix/domi');
	Modules.load('compatibilityFix/scratchpad');
	Modules.load('compatibilityFix/pageInfo');
	Modules.load('compatibilityFix/downloadsIndicator');
	Modules.load('compatibilityFix/bookmarkedItem');
	Modules.load('compatibilityFix/puzzleToolbars');
	Modules.load('compatibilityFix/findbartweak');
	
	Modules.loadIf('compatibilityFix/RTL', RTL);
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/milewideback');
	Modules.unload('compatibilityFix/edgewise');
	Modules.unload('compatibilityFix/pocket');
	Modules.unload('compatibilityFix/autoPager');
	Modules.unload('compatibilityFix/treestyletab');
	Modules.unload('compatibilityFix/console');
	Modules.unload('compatibilityFix/dmt');
	Modules.unload('compatibilityFix/addonMgr');
	Modules.unload('compatibilityFix/domi');
	Modules.unload('compatibilityFix/scratchpad');
	Modules.unload('compatibilityFix/pageInfo');
	Modules.unload('compatibilityFix/downloadsIndicator');
	Modules.unload('compatibilityFix/bookmarkedItem');
	Modules.unload('compatibilityFix/puzzleToolbars');
	Modules.unload('compatibilityFix/findbartweak');
	
	if(UNLOADED) {
		Modules.unload('compatibilityFix/RTL');
	}
};
