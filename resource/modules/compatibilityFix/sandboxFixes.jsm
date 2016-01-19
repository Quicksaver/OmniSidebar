// VERSION 1.1.6

Modules.LOADMODULE = function() {
	if(Services.vc.compare(Services.appinfo.version, "44.0a1") >= 0) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/browserConsole.xul', 'browserConsole44');
		Overlays.overlayURI('chrome://'+objPathString+'/content/scratchpad.xul', 'scratchpad44');
	}

	Modules.load('compatibilityFix/AddonManager');

	AddonManager.getAddonByID("2.0@disconnect.me", function(addon) {
		Modules.loadIf('compatibilityFix/disconnect', (addon && addon.isActive));
	});

	AddonManager.getAddonByID('{77d2ed30-4cd2-11e0-b8af-0800200c9a66}', function(addon) {
		Modules.loadIf('compatibilityFix/FTDeepDark', (addon && addon.isActive));
	});

	Modules.load('compatibilityFix/prefsMonitor');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/disconnect');
	Modules.unload('compatibilityFix/FTDeepDark');
	Modules.unload('compatibilityFix/prefsMonitor');
	Modules.unload('compatibilityFix/AddonManager');

	if(Services.vc.compare(Services.appinfo.version, "44.0a1") >= 0) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/browserConsole.xul', 'browserConsole44');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/scratchpad.xul', 'scratchpad44');
	}
};
