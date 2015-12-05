// VERSION 2.0.2

this.headers = {
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'showheadertitle':
			case 'showheadertitleTwin':
				this.toggleTitles();
				this.toggleHeaders();
				break;

			case 'showheaderclose':
			case 'showheadercloseTwin':
				this.toggleCloses();
				this.toggleHeaders();
				break;

			case 'coloricons':
			case 'coloriconsTwin':
				this.toggleIconsColor();
				break;

			case 'toolbar':
			case 'toolbarTwin':
				this.toggleHeaders();
				break;
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'beforecustomization':
				this.customize(true);
				break;

			case 'aftercustomization':
				this.customize(false);
				break;
		}
	},

	onWidgetAdded: function(aWidget, aArea) { this.areaCustomized(aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.areaCustomized(aArea); },
	onAreaNodeRegistered: function(aArea) { this.areaCustomized(aArea); },
	onAreaNodeUnregistered: function(aArea) { this.areaCustomized(aArea); },

	areaCustomized: function(aArea) {
		if(customizing) { return; }

		if((mainSidebar.toolbar && mainSidebar.toolbar.id == aArea) || (twinSidebar.toolbar && twinSidebar.toolbar.id == aArea)) {
			this.toggleHeaders();
		}
	},

	toggleToolbar: function(twin) {
		if(!twin) {
			Prefs.toolbar = mainSidebar.toolbar.collapsed;
		} else {
			Prefs.toolbarTwin = twinSidebar.toolbar.collapsed;
		}
	},

	toggleTitles: function() {
		toggleAttribute(mainSidebar.box, 'notitle', !UNLOADED && !Prefs.showheadertitle && !trueAttribute(mainSidebar.titleNode, 'active'));
		toggleAttribute(twinSidebar.box, 'notitle', !UNLOADED && !Prefs.showheadertitleTwin && !trueAttribute(twinSidebar.titleNode, 'active'));
	},

	toggleCloses: function() {
		toggleAttribute(mainSidebar.box, 'noclose', !UNLOADED && !Prefs.showheaderclose);
		toggleAttribute(twinSidebar.box, 'noclose', !UNLOADED && !Prefs.showheadercloseTwin);
	},

	toggleIconsColor: function() {
		setAttribute(mainSidebar.toolbar, 'coloricons', Prefs.coloricons);
		setAttribute(twinSidebar.toolbar, 'coloricons', Prefs.coloriconsTwin);
	},

	hideMainHeader: new Map(),
	hideTwinHeader: new Map(),

	// Handles the headers visibility
	// Basically this hides the sidebar header if all its items are empty or if only the toolbar is visible and it has no visible buttons
	toggleHeaders: function() {
		// first we make sure the pref value reflects the toolbar state
		if(mainSidebar.toolbar && Prefs.toolbar == mainSidebar.toolbar.collapsed) {
			CustomizableUI.setToolbarVisibility(mainSidebar.toolbar.id, Prefs.toolbar);
		}
		if(twinSidebar.toolbar && Prefs.toolbarTwin == twinSidebar.toolbar.collapsed) {
			CustomizableUI.setToolbarVisibility(twinSidebar.toolbar.id, Prefs.toolbarTwin);
		}

		var mainHeader = false;
		for(let x of this.hideMainHeader.values()) {
			if(!x()) {
				mainHeader = true;
				break;
			}
		}
		var twinHeader = false;
		for(let x of this.hideTwinHeader.values()) {
			if(!x()) {
				twinHeader = true;
				break;
			}
		}

		toggleAttribute(mainSidebar.box, 'noHeader', !mainHeader);
		toggleAttribute(twinSidebar.box, 'noHeader', !twinHeader);

		let wrapper = $(objName+'-toolbarCustomizeWrapper');
		if(wrapper) {
			wrapper.collapsed = !(Prefs.toolbar || (Prefs.twinSidebar && Prefs.toolbarTwin));
		}
	},

	toolbarHasButtons: function(toolbar) {
		if(toolbar) {
			for(let child of toolbar.childNodes) {
				if(!child.collapsed && !child.hidden) { return true; }
			}
		}
		return false;
	},

	customize: function(inCustomize = customizing) {
		if(inCustomize) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
			Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');
		}
		else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');

			// our CUI listener doesn't run while in customize mode, we only need to do this after exiting anyway
			this.toggleHeaders();
		}
	},

	init: function() {
		this.hideMainHeader.set('toolbar', () => { return !Prefs.toolbar || !this.toolbarHasButtons(mainSidebar.toolbar); });
		this.hideMainHeader.set('title', function() { return !Prefs.showheadertitle && !trueAttribute(mainSidebar.titleNode, 'active'); });
		this.hideMainHeader.set('close', function() { return !Prefs.showheaderclose; });

		this.hideTwinHeader.set('toolbar', () => { return !Prefs.toolbarTwin || !this.toolbarHasButtons(twinSidebar.toolbar); });
		this.hideTwinHeader.set('title', function() { return !Prefs.showheadertitleTwin && !trueAttribute(twinSidebar.titleNode, 'active'); });
		this.hideTwinHeader.set('close', function() { return !Prefs.showheadercloseTwin; });

		Listeners.add(window, 'beforecustomization', this);
		Listeners.add(window, 'aftercustomization', this);
		this.customize();

		CustomizableUI.addListener(this);

		this.toggleTitles();
		this.toggleCloses();
		this.toggleIconsColor();
		this.toggleHeaders();

		dispatch(window, { type: 'loadedSidebarHeader', cancelable: false });
	},

	onLoad: function(aWindow) {
		if(aWindow[objName] && aWindow[objName].headers) {
			aWindow[objName].headers.init();
		}
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers', headers);
	Overlays.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin', headers);

	Prefs.listen('toolbar', headers);
	Prefs.listen('showheadertitle', headers);
	Prefs.listen('showheaderclose', headers);
	Prefs.listen('coloricons', headers);
	Prefs.listen('toolbarTwin', headers);
	Prefs.listen('showheadertitleTwin', headers);
	Prefs.listen('showheadercloseTwin', headers);
	Prefs.listen('coloriconsTwin', headers);

	SidebarUI.triggers.twin.set('twinToolbar', function() { return twinSidebar.toolbar; });

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

	SidebarUI.triggers.twin.delete('twinToolbar');

	if(customizing) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'customizeMain');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'customizeTwin');
	}
	CustomizableUI.removeListener(headers);

	Prefs.unlisten('toolbar', headers);
	Prefs.unlisten('showheadertitle', headers);
	Prefs.unlisten('showheaderclose', headers);
	Prefs.unlisten('coloricons', headers);
	Prefs.unlisten('toolbarTwin', headers);
	Prefs.unlisten('showheadertitleTwin', headers);
	Prefs.unlisten('showheadercloseTwin', headers);
	Prefs.unlisten('coloriconsTwin', headers);

	Listeners.remove(window, 'beforecustomization', headers);
	Listeners.remove(window, 'aftercustomization', headers);

	removeAttribute(mainSidebar.toolbar, 'coloricons');
	removeAttribute(twinSidebar.toolbar, 'coloricons');

	headers.toggleTitles();
	headers.toggleCloses();
	removeAttribute(mainSidebar.box, 'noHeader');
	removeAttribute(twinSidebar.box, 'noHeader');

	if(UNLOADED) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'headers');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'headersTwin');
	}
};
