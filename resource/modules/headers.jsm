Modules.VERSION = '1.1.1';

this.toggleToolbar = function(twin) {
	if(!twin) {
		Prefs.toolbar = mainSidebar.toolbar.collapsed;
	} else {
		Prefs.toolbarTwin = twinSidebar.toolbar.collapsed;
	}
};

this.toggleTitles = function(headers) {
	toggleAttribute(mainSidebar.box, 'notitle', !UNLOADED && Prefs.hideheadertitle && !trueAttribute(mainSidebar.title, 'active'));
	toggleAttribute(twinSidebar.box, 'notitle', !UNLOADED && Prefs.hideheadertitleTwin && !trueAttribute(twinSidebar.title, 'active'));
	
	if(headers) {
		toggleHeaders();
	}
};

this.toggleCloses = function(headers) {
	toggleAttribute(mainSidebar.box, 'noclose', !UNLOADED && Prefs.hideheaderclose);
	toggleAttribute(twinSidebar.box, 'noclose', !UNLOADED && Prefs.hideheadercloseTwin);
	
	if(headers) {
		toggleHeaders();
	}
};

this.toggleIconsColor = function() {
	setAttribute(mainSidebar.toolbar, 'coloricons', Prefs.coloricons);
	setAttribute(twinSidebar.toolbar, 'coloricons', Prefs.coloriconsTwin);
};

this.hideMainHeader = {
	get toolbar () { return !Prefs.toolbar || !toolbarHasButtons(mainSidebar.toolbar); },
	get title () { return Prefs.hideheadertitle && !trueAttribute(mainSidebar.title, 'active'); },
	get close () { return Prefs.hideheaderclose; }
};
this.hideTwinHeader = {
	get toolbar () { return !Prefs.toolbarTwin || !toolbarHasButtons(twinSidebar.toolbar); },
	get title () { return Prefs.hideheadertitleTwin && !trueAttribute(twinSidebar.title, 'active'); },
	get close () { return Prefs.hideheadercloseTwin; }
};

// Handles the headers visibility
// Basically this hides the sidebar header if all its items are empty or if only the toolbar is visible and it has no visible buttons
this.toggleHeaders = function() {
	// first we make sure the pref value reflects the toolbar state
	if(mainSidebar.toolbar && Prefs.toolbar == mainSidebar.toolbar.collapsed) {
		CustomizableUI.setToolbarVisibility(mainSidebar.toolbar.id, Prefs.toolbar);
	}
	if(twinSidebar.toolbar && Prefs.toolbarTwin == twinSidebar.toolbar.collapsed) {
		CustomizableUI.setToolbarVisibility(twinSidebar.toolbar.id, Prefs.toolbarTwin);
	}
	
	var mainHeader = false;
	for(var x in hideMainHeader) {
		if(!hideMainHeader[x]) {
			mainHeader = true;
			break;
		}
	}
	var twinHeader = false;
	for(var x in hideTwinHeader) {
		if(!hideTwinHeader[x]) {
			twinHeader = true;
			break;
		}
	}
	
	hideIt(mainSidebar.header, mainHeader);
	hideIt(twinSidebar.header, twinHeader);
	
	hideIt($(objName+'-toolbarCustomizeWrapper'), Prefs.toolbar || (Prefs.twinSidebar && Prefs.toolbarTwin));
};

this.toolbarHasButtons = function(toolbar) {
	if(toolbar) {
		for(var child of toolbar.childNodes) {
			if(!child.collapsed && !child.hidden) { return true; }
		}
	}
	return false;
};

this.headersCustomize = function(e) {
	if((e && e.type == 'beforecustomization') || (!e && customizing)) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
		Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');
	}
	else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');
		
		// our CUI listener doesn't run while in customize mode, we only need to do this after exiting anyway
		toggleHeaders();
	}
};

this.toolbarsCustomized = {
	onWidgetAdded: function(aWidget, aArea) { this.listener(aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.listener(aArea); },
	onAreaNodeRegistered: function(aArea) { this.listener(aArea); },
	onAreaNodeUnregistered: function(aArea) { this.listener(aArea); },
	
	listener: function(aArea) {
		if(customizing) { return; }
		
		if((mainSidebar.toolbar && mainSidebar.toolbar.id == aArea) || (twinSidebar.toolbar && twinSidebar.toolbar.id == aArea)) {
			toggleHeaders();
		}
	}
};

this.toggleHeadersOnLoad = function() {
	Listeners.add(window, 'beforecustomization', headersCustomize);
	Listeners.add(window, 'aftercustomization', headersCustomize);
	headersCustomize();
	
	CustomizableUI.addListener(toolbarsCustomized);
	
	toggleTitles();
	toggleCloses();
	toggleIconsColor();
	toggleHeaders();
	
	dispatch(window, { type: 'loadedSidebarHeader', cancelable: false });
};

Modules.LOADMODULE = function() {
	Overlays.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers', null, toggleHeadersOnLoad);
	Overlays.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin', null, toggleHeadersOnLoad);
	Styles.load('buttonsStyle', 'buttonsStyle');
	
	Prefs.listen('toolbar', toggleHeaders);
	Prefs.listen('hideheadertitle', toggleTitles);
	Prefs.listen('hideheaderclose', toggleCloses);
	Prefs.listen('coloricons', toggleIconsColor);
	Prefs.listen('toolbarTwin', toggleHeaders);
	Prefs.listen('hideheadertitleTwin', toggleTitles);
	Prefs.listen('hideheadercloseTwin', toggleCloses);
	Prefs.listen('coloriconsTwin', toggleIconsColor);
	
	twinTriggers.__defineGetter__('twinToolbar', function() { return twinSidebar.toolbar; });
	
	Modules.load('menus');
	Modules.load('renderAbove');
	Modules.load('goURI');
	Modules.load('autoclose');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('autoclose');
	Modules.unload('goURI');
	Modules.unload('renderAbove');
	Modules.unload('menus');
	
	delete twinTriggers.twinToolbar;
	
	if(customizing) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');
	}
	CustomizableUI.removeListener(toolbarsCustomized);
	
	Prefs.unlisten('toolbar', toggleHeaders);
	Prefs.unlisten('hideheadertitle', toggleTitles);
	Prefs.unlisten('hideheaderclose', toggleCloses);
	Prefs.unlisten('coloricons', toggleIconsColor);
	Prefs.unlisten('toolbarTwin', toggleHeaders);
	Prefs.unlisten('hideheadertitleTwin', toggleTitles);
	Prefs.unlisten('hideheadercloseTwin', toggleCloses);
	Prefs.unlisten('coloriconsTwin', toggleIconsColor);
	
	Listeners.remove(window, 'beforecustomization', headersCustomize);
	Listeners.remove(window, 'aftercustomization', headersCustomize);
	
	removeAttribute(mainSidebar.toolbar, 'coloricons');
	removeAttribute(twinSidebar.toolbar, 'coloricons');
	
	toggleTitles();
	toggleCloses();
	toggleButtonStyle();
	removeAttribute(mainSidebar.header, 'hidden');
	removeAttribute(twinSidebar.header, 'hidden');
	
	if(UNLOADED) {
		Styles.unload('buttonsStyle');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin');
	}
};
