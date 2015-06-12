// VERSION = '1.3';

objName = 'omnisidebar';
objPathString = 'omnisidebar';
addonUUID = '8f7da5c0-61c7-11e4-9803-0800200c9a66';

addonUris = {
	homepage: 'https://addons.mozilla.org/firefox/addon/omnisidebar/',
	support: 'https://github.com/Quicksaver/OmniSidebar/issues',
	fullchangelog: 'https://github.com/Quicksaver/OmniSidebar/commits/master',
	email: 'mailto:quicksaver@gmail.com',
	profile: 'https://addons.mozilla.org/firefox/user/quicksaver/',
	api: 'http://fasezero.com/addons/api/omnisidebar',
	development: 'http://fasezero.com/addons/'
};

prefList = {
	NoSync_firstEnabled: true,
	NoSync_lastStateMain: true,
	NoSync_lastStateTwin: true,
	
	minSidebarWidth: 30, // pixels
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
	showheadertitle: true,
	showheaderdock: true,
	showheaderclose: true,
	coloricons: 'default',
	titleButton: true,
	goButton: false,
	
	renderaboveTwin: false,
	useSwitchTwin: true,
	autoCloseTwin: false,
	autoHideTwin: true,
	toolbarTwin: true,
	showheadertitleTwin: true,
	showheaderdockTwin: true,
	showheadercloseTwin: true,
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

paneList = [
	[ 'paneMain' ],
	[ 'paneTwin' ],
	[ 'paneGlobal' ]
];

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
	if(chromeHidden && chromeHidden.contains('extrachrome')) { return; }
	
	prepareObject(window);
	
	// We use SessionStore pretty much everywhere, which might not be yet initialized in this window.
	waitForSessionStore(window, true);
}

function stopAddon(window) {
	// Make sure we are ready to disable the add-on
	dispatch(window, { type: objName+'-disabled', cancelable: false });
	
	removeObject(window);
}

function toggleMoveSidebars() {
	Modules.loadIf('moveSidebars', Prefs.moveSidebars);
}

function toggleGlass() {
	Modules.loadIf('glassStyle', Prefs.glassStyle);
}

function onStartup() {
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
	Styles.load('global', 'global');
	
	// Apply the add-on to every window opened and to be opened
	Windows.callOnAll(startAddon, 'navigator:browser');
	Windows.register(startAddon, 'domwindowopened', 'navigator:browser');
}

function onShutdown() {
	// remove the add-on from all windows
	Windows.callOnAll(stopAddon, null, null, true);
	Browsers.callOnAll(stopAddon, null, true);
	
	Modules.unload('glassStyle');
	Modules.unload('moveSidebars');
	
	// Unregister stylesheets
	Styles.unload('global');
	
	Prefs.unlisten('moveSidebars', toggleMoveSidebars);
	Prefs.unlisten('glassStyle', toggleGlass);
	
	Modules.unload('sandbox');
	Modules.unload('keysets');
	Modules.unload('compatibilityFix/sandboxFixes');
	
	Styles.unload('startupFix');
}
