var defaultsVersion = '1.2.1';
var objName = 'omnisidebar';
var objPathString = 'omnisidebar';
var prefList = {
	NoSync_firstEnabled: true,
	NoSync_lastStateMain: true,
	NoSync_lastStateTwin: true,
	
	minSidebarWidth: 8, // pixels
	minSpaceBetweenSidebars: 18, // pixels
	
	lastStateMain: '',
	lastStateTwin: '',
	
	moveSidebars: false,
	twinSidebar: false,
	
	renderabove: false,
	useSwitch: true,
	autoClose: false,
	autoHide: true,
	toolbar: true,
	hideheadertitle: false,
	hideheaderdock: false,
	hideheaderclose: false,
	coloricons: 'default',
	titleButton: true,
	goButton: false,
	
	renderaboveTwin: false,
	useSwitchTwin: true,
	autoCloseTwin: false,
	autoHideTwin: true,
	toolbarTwin: true,
	hideheadertitleTwin: false,
	hideheaderdockTwin: false,
	hideheadercloseTwin: false,
	coloriconsTwin: 'default',
	titleButtonTwin: true,
	goButtonTwin: false,
	
	glassStyle: false,
	transparency: 250,
	fx: true,
	forceOpenToolbars: false,
	forceOpenMenus: true,
	showDelay: 250,
	hideDelay: 250,
	switcherAdjust: 0,
	keepPrivate: false,
	keepLoaded: false,
	
	alwaysAddons: true,
	alwaysConsole: false,
	alwaysDMT: false,
	alwaysPageInfo: false,
	alwaysScratchpad: false,
	
	mainKeysetKeycode: 'VK_F8',
	mainKeysetAccel: false,
	mainKeysetShift: false,
	mainKeysetAlt: false,
	mainKeysetPanel: false,
	twinKeysetKeycode: 'VK_F8',
	twinKeysetAccel: false,
	twinKeysetShift: true,
	twinKeysetAlt: false,
	twinKeysetPanel: false,
	
	noInitialShow: false,
	aboveSquared: false,
	firstEnabled: true
};

function waitForSessionStore(window, delayed) {
	if(window.__SSi) {
		window[objName].Modules.load(objName, delayed);
		return;
	}
	
	aSync(function() {
		waitForSessionStore(window, false);
	}, 100);
}

function startAddon(window) {
	// don't load in popup windows set to hide extra chrome
	var chromeHidden = window.document.documentElement.getAttribute('chromehidden');
	if(chromeHidden && chromeHidden.indexOf('extrachrome') > -1) { return; }
	
	prepareObject(window);
	
	// We use SessionStore pretty much everywhere, which might not be yet initialized in this window.
	waitForSessionStore(window, true);
}

function stopAddon(window) {
	// Make sure we are ready to disable the add-on
	dispatch(window, { type: objName+'-disabled', cancelable: false });
	
	removeObject(window);
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].Modules.load('options');
}

function toggleMoveSidebars() {
	Modules.loadIf('moveSidebars', !UNLOADED && Prefs.moveSidebars);
}

function toggleGlass() {
	Modules.loadIf('glassStyle', !UNLOADED && Prefs.glassStyle);
}

function onStartup(aReason) {
	// try not to show the sidebar when starting up, so the browser doesn't jump around
	if(STARTED == APP_STARTUP) {
		Styles.load('startupFix', 'startupFix');
	}
	
	Modules.load('compatibilityFix/sandboxFixes');
	Modules.load('keysets');
	Modules.load('sandbox');
	
	Prefs.listen('moveSidebars', toggleMoveSidebars);
	Prefs.listen('glassStyle', toggleGlass);
	
	toggleMoveSidebars();
	toggleGlass();
	
	// Register the global css stylesheets
	Styles.load('global', 'overlay');
	
	// Apply the add-on to every window opened and to be opened
	Windows.callOnAll(startAddon, 'navigator:browser');
	Windows.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	// Apply the add-on to every preferences window opened and to be opened
	Windows.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	Windows.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	Browsers.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	Browsers.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// remove the add-on from all windows
	Windows.callOnAll(stopAddon, null, null, true);
	Browsers.callOnAll(stopAddon, null, true);
	
	toggleGlass();
	toggleMoveSidebars();
	
	// Unregister stylesheets
	Styles.unload('global');
	
	Prefs.unlisten('moveSidebars', toggleMoveSidebars);
	Prefs.unlisten('glassStyle', toggleGlass);
	
	Modules.unload('sandbox');
	Modules.unload('keysets');
	Modules.unload('compatibilityFix/sandboxFixes');
	
	Styles.unload('startupFix');
}
