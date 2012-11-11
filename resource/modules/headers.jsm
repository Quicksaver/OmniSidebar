moduleAid.VERSION = '1.0.3';

this.toggleToolbar = function(twin) {
	if(!twin) {
		prefAid.toolbar = !prefAid.toolbar;
	} else {
		prefAid.toolbarTwin = !prefAid.toolbarTwin;
	}
};

this.toggleToolbars = function(noHeaders) {
	hideIt(mainSidebar.toolbar, prefAid.toolbar && toolbarHasButtons(mainSidebar.toolbar));
	hideIt(twinSidebar.toolbar, prefAid.toolbarTwin && toolbarHasButtons(twinSidebar.toolbar));
	
	toggleAttribute(mainSidebar.toolbarBroadcaster, 'checked', prefAid.toolbar);
	toggleAttribute(twinSidebar.toolbarBroadcaster, 'checked', prefAid.toolbarTwin);
	
	if(!noHeaders) {
		toggleHeaders();
	}
};

this.toggleTitles = function(noHeaders) {
	toggleAttribute(mainSidebar.box, 'notitle', !UNLOADED && prefAid.hideheadertitle);
	toggleAttribute(twinSidebar.box, 'notitle', !UNLOADED && prefAid.hideheadertitleTwin);
	
	if(!noHeaders) {
		toggleHeaders();
	}
};

this.toggleCloses = function(noHeaders) {
	toggleAttribute(mainSidebar.box, 'noclose', !UNLOADED && prefAid.hideheaderclose);
	toggleAttribute(twinSidebar.box, 'noclose', !UNLOADED && prefAid.hideheadercloseTwin);
	
	if(!noHeaders) {
		toggleHeaders();
	}
};

this.toggleButtonStyle = function() {
	toggleAttribute(mainSidebar.toolbar, 'alternatebtns', !UNLOADED && prefAid.alternatebtns);
	toggleAttribute(twinSidebar.toolbar, 'alternatebtns', !UNLOADED && prefAid.alternatebtnsTwin);
	
	styleAid.loadIf('alternatebtns', 'Ff5', false, prefAid.alternatebtns || (prefAid.twinSidebar && prefAid.alternatebtnsTwin));
};

this.toggleIconsColor = function() {
	if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
		if(prefAid.coloricons != 'default') {
			prefAid.coloricons = 'default';
		}
		if(prefAid.coloriconsTwin != 'default') {
			prefAid.coloriconsTwin = 'default';
		}
	}
	
	setAttribute(mainSidebar.toolbar, 'coloricons', prefAid.coloricons);
	setAttribute(twinSidebar.toolbar, 'coloricons', prefAid.coloriconsTwin);
};

this.hideMainHeader = {
	get toolbar () { return !prefAid.toolbar || !toolbarHasButtons(mainSidebar.toolbar); },
	get title () { return prefAid.hideheadertitle; },
	get close () { return prefAid.hideheaderclose; }
};
this.hideTwinHeader = {
	get toolbar () { return !prefAid.toolbarTwin || !toolbarHasButtons(twinSidebar.toolbar); },
	get title () { return prefAid.hideheadertitleTwin; },
	get close () { return prefAid.hideheadercloseTwin; }
};

// Handles the headers visibility
// Basically this hides the sidebar header if all its items are empty or if only the toolbar is visible and it has no visible buttons			
this.toggleHeaders = function() {
	var mainHeader = true;
	for(var x in hideMainHeader) {
		if(!hideMainHeader[x]) {
			mainHeader = false;
			break;
		}
	}
	var twinHeader = true;
	for(var x in hideTwinHeader) {
		if(!hideTwinHeader[x]) {
			twinHeader = false;
			break;
		}
	}
	
	toggleAttribute(mainSidebar.header, 'hidden', mainHeader);
	toggleAttribute(twinSidebar.header, 'hidden', twinHeader);
};

this.toolbarHasButtons = function(toolbar) {
	if(toolbar) {
		for(var i=0; i<toolbar.childNodes.length; i++) {
			if(!toolbar.childNodes[i].hasAttribute('collapsed') && !toolbar.childNodes[i].hasAttribute('hidden')) {
				return true;
			}
		}
	}
	return false;
};

this.headersCustomize = function(e) {
	hideIt($('sidebar-customizingLabel'), e.type == 'beforecustomization');
	hideIt($('sidebar-customizingLabel-twin'), e.type == 'beforecustomization');
	
	toggleAttribute(mainSidebar.box, 'customizing', e.type == 'beforecustomization');
	toggleAttribute(mainSidebar.toolbar, 'flex', e.type == 'beforecustomization', '1');
	toggleAttribute(mainSidebar.stack, 'flex', e.type == 'beforecustomization', '1');
	
	toggleAttribute(twinSidebar.box, 'customizing', e.type == 'beforecustomization');
	toggleAttribute(twinSidebar.toolbar, 'flex', e.type == 'beforecustomization', '1');
	toggleAttribute(twinSidebar.stack, 'flex', e.type == 'beforecustomization', '1');
	
	toggleToolbars();
	
	if(e.type == 'aftercustomization') {
		if(mainSidebar.toolbar) {
			mainSidebar.toolbar.setAttribute('currentset', mainSidebar.toolbar.currentSet);
			document.persist(mainSidebar.toolbar.id, 'currentset');
		}
		if(twinSidebar.toolbar) {
			twinSidebar.toolbar.setAttribute('currentset', twinSidebar.toolbar.currentSet);
			document.persist(twinSidebar.toolbar.id, 'currentset');
		}
	}
};

this.setCustomizeWidth = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('customizeWidthURI');
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	if(mainSidebar.width) {
		sscode += '	#sidebar-box[customizing]  { width: ' + mainSidebar.width + 'px; }\n';
	}
	if(twinSidebar.width) {
		sscode += '	#sidebar-box-twin[customizing]  { width: ' + twinSidebar.width + 'px; }\n';
	}
	sscode += '}';
	
	styleAid.load('customizeWidthURI', sscode, true);
};

this.toggleHeadersOnLoad = function() {
	listenerAid.add(window, 'sidebarWidthChanged', setCustomizeWidth, false);
	
	listenerAid.add(window, 'beforecustomization', headersCustomize, false);
	listenerAid.add(window, 'aftercustomization', headersCustomize, false);
	
	toggleToolbars(true);
	toggleTitles(true);
	toggleCloses(true);
	toggleButtonStyle();
	toggleIconsColor();
	toggleHeaders();
	
	setCustomizeWidth();
	
	dispatch(window, { type: 'loadedSidebarHeader', cancelable: false });
};

this.toggleHeadersOverlay = function(window) {
	// I actually don't remember why I did this aSync... but I'm leaving it
	if(!window[objName].toggleHeadersOnLoad) {
		aSync(function() { window[objName].toggleHeadersOnLoad(); }, 100);
		return;
	}
	window[objName].toggleHeadersOnLoad();
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers', null, toggleHeadersOverlay);
	overlayAid.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin', null, toggleHeadersOverlay);
	styleAid.load('headers', 'headers');
	
	prefAid.listen('toolbar', toggleToolbars);
	prefAid.listen('hideheadertitle', toggleTitles);
	prefAid.listen('hideheaderclose', toggleCloses);
	prefAid.listen('alternatebtns', toggleButtonStyle);
	prefAid.listen('coloricons', toggleIconsColor);
	prefAid.listen('toolbarTwin', toggleToolbars);
	prefAid.listen('hideheadertitleTwin', toggleTitles);
	prefAid.listen('hideheadercloseTwin', toggleCloses);
	prefAid.listen('alternatebtnsTwin', toggleButtonStyle);
	prefAid.listen('coloriconsTwin', toggleIconsColor);
	
	twinTriggers.__defineGetter__('twinToolbar', function() { return twinSidebar.toolbar; });
	moduleAid.load('menus');
	moduleAid.load('renderAbove');
	moduleAid.load('goURI');
	moduleAid.load('autoclose');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('autoclose');
	moduleAid.unload('goURI');
	moduleAid.unload('renderAbove');
	moduleAid.unload('menus');
	delete twinTriggers.twinToolbar;
	
	prefAid.unlisten('toolbar', toggleToolbars);
	prefAid.unlisten('hideheadertitle', toggleTitles);
	prefAid.unlisten('hideheaderclose', toggleCloses);
	prefAid.unlisten('alternatebtns', toggleButtonStyle);
	prefAid.unlisten('coloricons', toggleIconsColor);
	prefAid.unlisten('toolbarTwin', toggleToolbars);
	prefAid.unlisten('hideheadertitleTwin', toggleTitles);
	prefAid.unlisten('hideheadercloseTwin', toggleCloses);
	prefAid.unlisten('alternatebtnsTwin', toggleButtonStyle);
	prefAid.unlisten('coloriconsTwin', toggleIconsColor);
	
	listenerAid.remove(window, 'beforecustomization', headersCustomize, false);
	listenerAid.remove(window, 'aftercustomization', headersCustomize, false);
	
	listenerAid.remove(window, 'sidebarWidthChanged', setCustomizeWidth, false);
	
	removeAttribute(mainSidebar.toolbar, 'coloricons');
	removeAttribute(twinSidebar.toolbar, 'coloricons');
	
	toggleTitles(true);
	toggleCloses(true);
	toggleButtonStyle();
	removeAttribute(mainSidebar.header, 'hidden');
	removeAttribute(twinSidebar.header, 'hidden'); 
	
	if(UNLOADED) {
		styleAid.unload('headers');
		styleAid.unload('alternatebtns');
		styleAid.unload('customizeWidthURI');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin');
	}
};
