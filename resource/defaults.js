var defaultsVersion = '1.1.1';
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
	alternatebtns: true,
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
	alternatebtnsTwin: true,
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
		window[objName].moduleAid.load(objName, delayed);
		return;
	}
	
	// Since promises don't exist yet (at least not in their current form) in earlier versions of firefox,
	// I'm sticking with aSync checks for now to ensure compatibility, but ideally this should be changed to promises in the future.
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

function startCustomize(window) {
	prepareObject(window);
	window[objName].moduleAid.load('customize');
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].moduleAid.load('options');
}

function startConditions(aReason) {
	return true;
}

function toggleMoveSidebars() {
	moduleAid.loadIf('moveSidebars', !UNLOADED && prefAid.moveSidebars);
}

function toggleGlass() {
	moduleAid.loadIf('glassStyle', !UNLOADED && prefAid.glassStyle);
}

function onStartup(aReason) {
	// try not to show the sidebar when starting up, so the browser doesn't jump around
	if(STARTED == APP_STARTUP) {
		styleAid.load('startupFix', 'startupFix');
	}
	
	moduleAid.load('compatibilityFix/sandboxFixes');
	moduleAid.load('keysets');
	moduleAid.load('sandbox');
	
	prefAid.listen('moveSidebars', toggleMoveSidebars);
	prefAid.listen('glassStyle', toggleGlass);
	
	toggleMoveSidebars();
	toggleGlass();
	
	// Register the global css stylesheets
	styleAid.load('global', 'overlay');
	
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	if(!Australis) {
		// Apply the add-on to every customize window opened and to be opened
		windowMediator.callOnAll(startCustomize, null, "chrome://global/content/customizeToolbar.xul");
		windowMediator.register(startCustomize, 'domwindowopened', null, "chrome://global/content/customizeToolbar.xul");
		browserMediator.callOnAll(startCustomize, "chrome://global/content/customizeToolbar.xul");
		browserMediator.register(startCustomize, 'pageshow', "chrome://global/content/customizeToolbar.xul");
	}
	
	// Apply the add-on to every preferences window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// Placing these here prevents an error which I couldn't figure out why the closeCustomize() in overlayAid weren't already preventing.
	closeCustomize();
	
	// remove the add-on from all windows
	windowMediator.callOnAll(stopAddon, null, null, true);
	browserMediator.callOnAll(stopAddon, null, true);
	
	toggleGlass();
	toggleMoveSidebars();
	
	// Unregister stylesheets
	styleAid.unload('global');
	
	prefAid.unlisten('moveSidebars', toggleMoveSidebars);
	prefAid.unlisten('glassStyle', toggleGlass);
	
	moduleAid.unload('sandbox');
	moduleAid.unload('keysets');
	moduleAid.unload('compatibilityFix/sandboxFixes');
	
	styleAid.unload('startupFix');
}
