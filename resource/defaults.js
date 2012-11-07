var defaultsVersion = '1.0.2';
var objName = 'omnisidebar';
var objPathString = 'omnisidebar';
var prefList = {
	minSidebarWidth: 8, // pixels
	minSpaceBetweenSidebars: 18, // pixels
	
	lastcommand: "viewBlankSidebar",
	lastcommandTwin: "viewBlankSidebar-twin",
	
	moveSidebars: false,
	twinSidebar: false,
	
	renderabove: false,
	undockMode: 'noauto',
	autoClose: false,
	hideheadertoolbar: false,
	hideheadertitle: false,
	hideheaderdock: false,
	hideheaderclose: false,
	alternatebtns: false,
	coloricons: 'default',
	titleButton: true,
	goButton: false,
	
	renderaboveTwin: false,
	undockModeTwin: 'noauto',
	autoCloseTwin: false,
	hideheadertoolbarTwin: false,
	hideheadertitleTwin: false,
	hideheaderdockTwin: false,
	hideheadercloseTwin: false,
	alternatebtnsTwin: false,
	coloriconsTwin: 'default',
	titleButtonTwin: true,
	goButtonTwin: false,
	
	glassStyle: false,
	fx: true,
	forceOpenToolbars: false,
	forceOpenMenus: false,
	showDelay: 250,
	hideDelay: 250,
	keepPrivate: false,
	
	alwaysAddons: false,
	alwaysConsole: false,
	alwaysDMT: false,
	
	mainKeysetKeycode: 'VK_F8',
	mainKeysetAccel: false,
	mainKeysetShift: false,
	mainKeysetAlt: false,
	twinKeysetKeycode: 'VK_F8',
	twinKeysetAccel: false,
	twinKeysetShift: true,
	twinKeysetAlt: false
};

function startAddon(window) {
	prepareObject(window);
	window[objName]._sidebarCommand = window.document.getElementById('sidebar-box').getAttribute('sidebarcommand');
	window[objName]._sidebarCommandTwin = null;
	window[objName].moduleAid.load(objName, true);
	
	// Hide the sidebar until the add-on is initialized
	if(STARTED == APP_STARTUP) {
		hideIt(window.document.getElementById('sidebar-box'));
	}
}

function stopAddon(window) {
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

function closePreferences() {
	windowMediator.callOnAll(function(aWindow) { try { aWindow.close(); } catch(ex) {} }, null, "chrome://"+objPathString+"/content/options.xul");
};

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
	moduleAid.load('compatibilityFix/sandboxFixes');
	moduleAid.load('keysets');
	
	prefAid.listen('moveSidebars', toggleMoveSidebars);
	prefAid.listen('glassStyle', toggleGlass);
	
	toggleMoveSidebars();
	toggleGlass();
	
	// Register the global css stylesheets
	styleAid.load('global', 'overlay');
	
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	// Apply the add-on to every customize window opened and to be opened
	windowMediator.callOnAll(startCustomize, null, "chrome://global/content/customizeToolbar.xul");
	windowMediator.register(startCustomize, 'domwindowopened', null, "chrome://global/content/customizeToolbar.xul");
	browserMediator.callOnAll(startCustomize, "chrome://global/content/customizeToolbar.xul");
	browserMediator.register(startCustomize, 'pageshow', "chrome://global/content/customizeToolbar.xul");
	
	// Apply the add-on to every customize window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// Placing these here prevents an error which I couldn't figure out why the closeCustomize() in overlayAid weren't already preventing.
	closeCustomize();
	closePreferences();
	
	// remove the add-on from all windows
	windowMediator.callOnAll(stopAddon, null, null, true);
	browserMediator.callOnAll(stopAddon, null, true);
	
	toggleGlass();
	toggleMoveSidebars();
	
	// Unregister stylesheets
	styleAid.unload('global');
	
	prefAid.unlisten('moveSidebars', toggleMoveSidebars);
	prefAid.unlisten('glassStyle', toggleGlass);
	
	moduleAid.unload('keysets');
	moduleAid.unload('compatibilityFix/sandboxFixes');
}
