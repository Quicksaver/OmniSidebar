moduleAid.VERSION = '1.1.2';

this.__defineGetter__('DMPanelLink', function() { return $('downloadsHistory'); });
this.__defineGetter__('BrowserDownloadsUI', function() { return window.BrowserDownloadsUI; });
this.__defineSetter__('BrowserDownloadsUI', function(v) { return window.BrowserDownloadsUI = v; });

this.DMTbackups = {};
this.dmtLoaded = false;

this.setDMButton = function(unset) {
	var dmButton = $('downloads-button');
	if(!dmButton) { return; }
		
	if(!unset) {
		if(!DMTbackups.button) {
			DMTbackups.button = {
				command: dmButton.getAttribute('oncommand'),
				label: dmButton.getAttribute('label'),
				tooltip: dmButton.getAttribute('tooltip')
			};
		}
		setAttribute(dmButton, 'observes', 'viewDmSidebar');
	}
	else {
		removeAttribute(dmButton, 'observes');
		removeAttribute(dmButton, 'checked');
		removeAttribute(dmButton, 'twinSidebar');
		removeAttribute(dmButton, 'autoCheck');
		removeAttribute(dmButton, 'type');
		removeAttribute(dmButton, 'group');
		removeAttribute(dmButton, 'sidebartitle');
		removeAttribute(dmButton, 'sidebarurl');
		if(DMTbackups.button) {
			setAttribute(dmButton, 'oncommand', DMTbackups.button.command);
			setAttribute(dmButton, 'label', DMTbackups.button.label);
			setAttribute(dmButton, 'tooltip', DMTbackups.button.tooltip);
			delete DMTbackups.button;
		}
	}
};

this.customizeDMButton = function(e) {
	setDMButton(e.type == 'beforecustomization');
};

this.setDMPanel = function(e) {
	if((!e && !DMPanelLink) || e.target.id != 'downloadsPanel') { return; }
	
	// No need to keep listening to this
	listenerAid.remove(window, 'popupshown', setDMPanel);
	
	if(!DMTbackups.panelCommand) {
		DMTbackups.panelCommand = DMPanelLink.getAttribute('oncommand');
	}
	setAttribute(DMPanelLink, 'oncommand', 'toggleSidebar("viewDmSidebar");');
};

this.toggleAlwaysDMT = function(unloaded) {
	if(Services.vc.compare(Services.appinfo.platformVersion, "26.0a1") >= 0) {
		if(!UNLOADED && !unloaded && prefAid.alwaysDMT) {
			if(!DMTbackups.BrowserDownloadsUI) {
				DMTbackups.BrowserDownloadsUI = BrowserDownloadsUI;
			}
			BrowserDownloadsUI = function() { toggleSidebar($('viewDmgrPlacesSidebar')); };
		} else {
			if(DMTbackups.BrowserDownloadsUI) {
				BrowserDownloadsUI = DMTbackups.BrowserDownloadsUI;
				delete DMTbackups.BrowserDownloadsUI;
			}
		}
		
		return;
	}
	
	if(!UNLOADED && !unloaded && prefAid.alwaysDMT) {
		if(!DMTbackups.command) {
			DMTbackups.command = $('Tools:Downloads').getAttribute('oncommand');
		}
		setAttribute($('Tools:Downloads'), 'oncommand', 'toggleSidebar("viewDmSidebar");');
		
		// "Show all downloads" link in the new download panel
		if(Services.vc.compare(Services.appinfo.platformVersion, "20.0") >= 0) {
			// The panel doesn't exist until it is actually called, so we have to wait for that
			listenerAid.add(window, 'popupshown', setDMPanel);
			setDMPanel();
		}
		
		listenerAid.add(window, 'beforecustomization', customizeDMButton, false);
		listenerAid.add(window, 'aftercustomization', customizeDMButton, false);
		setDMButton();
	} else {
		listenerAid.remove(window, 'beforecustomization', customizeDMButton, false);
		listenerAid.remove(window, 'aftercustomization', customizeDMButton, false);
		setDMButton(true);
		
		if(Services.vc.compare(Services.appinfo.platformVersion, "20.0") >= 0) {
			listenerAid.remove(window, 'popupshown', setDMPanel);
			if(DMPanelLink && DMTbackups.panelCommand) {
				setAttribute(DMPanelLink, 'oncommand', DMTbackups.panelCommand);
				delete DMTbackups.panelCommand;
			}
		}
		
		if(DMTbackups.command) {
			setAttribute($('Tools:Downloads'), 'oncommand', DMTbackups.command);
			delete DMTbackups.command;
		}
	}
};

this.loadDMT = function() {
	doDMTCommand();
	
	prefAid.listen('alwaysDMT', toggleAlwaysDMT);
	toggleAlwaysDMT();
	
	var broadcaster = (Services.vc.compare(Services.appinfo.platformVersion, "26.0a1") >= 0) ? 'viewDmgrPlacesSidebar' : 'viewDmSidebar';
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == broadcaster;
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == broadcaster) {
		checked = true;
		twin = true;
	}
	toggleAttribute($(broadcaster), 'checked', checked);
	toggleAttribute($(broadcaster), 'twinSidebar', twin);
};

this.unloadDMT = function() {
	prefAid.unlisten('alwaysDMT', toggleAlwaysDMT);
	toggleAlwaysDMT(true);
};

this.doDMTCommand = function() {
	delete holdBroadcasters.dm;
	delete holdBroadcasters.dmt;
	delete holdBroadcasters.dmp;
	
	if(mainSidebar.loaded
	&& (mainSidebar.state.command == 'viewDmSidebar' || mainSidebar.state.command == 'viewDmtSidebar' || mainSidebar.state.command == 'viewDmgrPlacesSidebar')) {
		loadMainSidebar();
	}
	
	if(twinSidebar.loaded
	&& (twinSidebar.state.command == 'viewDmSidebar' || twinSidebar.state.command == 'viewDmtSidebar' || twinSidebar.state.command == 'viewDmgrPlacesSidebar')) {
		loadTwinSidebar();
	}
};

this.loadDmgrFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://mozapps/content/downloads/downloads.xul') {
		if(!e.target.arguments) {
			e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
		}
		e.target.arguments.push(null);
		e.target.arguments.push(Ci.nsIDownloadManagerUI.REASON_USER_INTERACTED);
		
		// for example when using Ctrl+J to toggle the downloads sidebar, we wouldn't be able to close it the same way without clicking the actual browser window.
		var jKey = e.target.document.getElementById('key_close2');
		setAttribute(jKey, 'disabled', 'true');
	}
};

this.isDmgrPlacesSidebar = function(bar) {
	return (bar && bar.box && bar.box.getAttribute('sidebarcommand') == 'viewDmgrPlacesSidebar');
};

this.loadDmgrPlacesFix = function(e) {
	if(e.target
	&& e.target.document
	&& e.target.document.baseURI == 'chrome://browser/content/places/places.xul'
	&& e.detail
	&& isDmgrPlacesSidebar(e.detail.bar)) {
		if(!e.target.arguments) {
			e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
		}
		e.target.arguments.push("Downloads");
	}
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.dm = 'viewDmSidebar';
	holdBroadcasters.dmt = 'viewDmtSidebar';
	holdBroadcasters.dmp = 'viewDmgrPlacesSidebar';
	
	AddonManager.getAddonByID("{F8A55C97-3DB6-4961-A81D-0DE0080E53CB}", function(addon) {
		if(!addon || !addon.isActive) {
			if(Services.vc.compare(Services.appinfo.platformVersion, "26.0a1") >= 0) {
				if(mainSidebar.state.command == 'viewDmtSidebar' || mainSidebar.state.command == 'viewDmSidebar') { mainSidebar.stateForceCommand('viewDmgrPlacesSidebar'); }
				if(twinSidebar.state.command == 'viewDmtSidebar' || twinSidebar.state.command == 'viewDmSidebar') { twinSidebar.stateForceCommand('viewDmgrPlacesSidebar'); }
				
				styleAid.load('dmgrPlaces', 'dmgrPlaces');
				overlayAid.overlayWindow(window, 'dmgrPlacesSidebar', null, loadDMT, unloadDMT);
				
				listenerAid.add(window, 'SidebarFocusedSync', loadDmgrPlacesFix);
				return;
			}
			
			listenerAid.add(window, 'SidebarFocusedSync', loadDmgrFix);
			
			if(mainSidebar.state.command == 'viewDmtSidebar' || mainSidebar.state.command == 'viewDmgrPlacesSidebar') { mainSidebar.stateForceCommand('viewDmSidebar'); }
			if(twinSidebar.state.command == 'viewDmtSidebar' || twinSidebar.state.command == 'viewDmgrPlacesSidebar') { twinSidebar.stateForceCommand('viewDmSidebar'); }
			
			overlayAid.overlayWindow(window, 'dmtSidebar', null, loadDMT, unloadDMT);
		} else {
			dmtLoaded = true;
			if(mainSidebar.state.command == 'viewDmSidebar' || mainSidebar.state.command == 'viewDmgrPlacesSidebar') { mainSidebar.stateForceCommand('viewDmtSidebar'); }
			if(twinSidebar.state.command == 'viewDmSidebar' || twinSidebar.state.command == 'viewDmgrPlacesSidebar') { twinSidebar.stateForceCommand('viewDmtSidebar'); }
			doDMTCommand();
		}
	});
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box) {
			if(mainSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar' || isDmgrPlacesSidebar(mainSidebar)) {
				closeSidebar(mainSidebar);
			}
			else if(mainSidebar.sidebar
			&& mainSidebar.sidebar.contentDocument
			&& mainSidebar.sidebar.contentDocument.baseURI == 'chrome://mozapps/content/downloads/downloads.xul') {
				var jKey = mainSidebar.sidebar.contentDocument.getElementById('key_close2');
				removeAttribute(jKey, 'disabled');
			}
		}
		if(twinSidebar.box) {
			if(twinSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar' || isDmgrPlacesSidebar(twinSidebar)) {
				closeSidebar(twinSidebar);
			}
			else if(twinSidebar.sidebar
			&& twinSidebar.sidebar.contentDocument
			&& twinSidebar.sidebar.contentDocument.baseURI == 'chrome://mozapps/content/downloads/downloads.xul') {
				var jKey = twinSidebar.sidebar.contentDocument.getElementById('key_close2');
				removeAttribute(jKey, 'disabled');
			}
		}
	}
	
	if(dmtLoaded) { return; }
	
	if(Services.vc.compare(Services.appinfo.platformVersion, "26.0a1") >= 0) {
		listenerAid.remove(window, 'SidebarFocusedSync', loadDmgrPlacesFix);
		
		if(UNLOADED) {
			styleAid.unload('dmgrPlaces');
		}
		
		overlayAid.removeOverlayWindow(window, 'dmgrPlacesSidebar');
	}
	else {
		listenerAid.remove(window, 'SidebarFocusedSync', loadDmgrFix);
		overlayAid.removeOverlayWindow(window, 'dmtSidebar');
	}
};
