Modules.VERSION = '1.3.0';

this.DMTbackups = {};
this.dmtLoaded = false;

this.toggleAlwaysDMT = function(loaded) {
	if(loaded && Prefs.alwaysDMT) {
		Piggyback.add('dmt', window, 'BrowserDownloadsUI', function() { toggleSidebar($(objName+'-viewDmgrPlacesSidebar')); });
	} else {
		Piggyback.revert('dmt', window, 'BrowserDownloadsUI');
	}
	
	dmgrPlacesAcceltext();
};

this.dmgrPlacesAcceltext = function() {
	if($(objName+'-viewDmgrPlacesSidebar')) {
		var str = $(objName+'-viewDmgrPlacesSidebar').getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext');
		var parts = str.split('+');
		parts[parts.length-1] = parts[parts.length-1].toUpperCase();
		str = parts.join('+');
		toggleAttribute($(objName+'-viewDmgrPlacesSidebar'), 'acceltext', Prefs.alwaysDMT, str);
	}
};

this.loadDMT = function() {
	doDMTCommand();
	
	Prefs.listen('alwaysDMT', toggleAlwaysDMT);
	toggleAlwaysDMT(true);
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDmgrPlacesSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDmgrPlacesSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($(objName+'-viewDmgrPlacesSidebar'), 'checked', checked);
	toggleAttribute($(objName+'-viewDmgrPlacesSidebar'), 'twinSidebar', twin);	
	dmgrPlacesAcceltext();
};

this.unloadDMT = function() {
	Prefs.unlisten('alwaysDMT', toggleAlwaysDMT);
	toggleAlwaysDMT();
};

this.doDMTCommand = function() {
	delete holdBroadcasters.dmt;
	delete holdBroadcasters.dmp;
	
	if(mainSidebar.loaded
	&& (mainSidebar.state.command == 'viewDmtSidebar' || mainSidebar.state.command == objName+'-viewDmgrPlacesSidebar')) {
		loadMainSidebar();
	}
	
	if(twinSidebar.loaded
	&& (twinSidebar.state.command == 'viewDmtSidebar' || twinSidebar.state.command == objName+'-viewDmgrPlacesSidebar')) {
		loadTwinSidebar();
	}
};

this.isDmgrPlacesSidebar = function(bar) {
	return (bar && bar.box && bar.box.getAttribute('sidebarcommand') == objName+'-viewDmgrPlacesSidebar');
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

Modules.LOADMODULE = function() {
	holdBroadcasters.dmt = 'viewDmtSidebar';
	holdBroadcasters.dmp = objName+'-viewDmgrPlacesSidebar';
	
	AddonManager.getAddonByID("{F8A55C97-3DB6-4961-A81D-0DE0080E53CB}", function(addon) {
		if(!addon || !addon.isActive) {
			if(mainSidebar.state.command == 'viewDmtSidebar') {
				mainSidebar.stateForceCommand(objName+'-viewDmgrPlacesSidebar');
			}
			if(twinSidebar.state.command == 'viewDmtSidebar') {
				twinSidebar.stateForceCommand(objName+'-viewDmgrPlacesSidebar');
			}
			
			Styles.load('dmgrPlaces', 'dmgrPlaces');
			Overlays.overlayWindow(window, 'dmgrPlacesSidebar', null, loadDMT, unloadDMT);
			
			Listeners.add(window, 'SidebarFocusedSync', loadDmgrPlacesFix);
		} else {
			dmtLoaded = true;
			if(mainSidebar.state.command == objName+'-viewDmgrPlacesSidebar') {
				mainSidebar.stateForceCommand('viewDmtSidebar');
			}
			if(twinSidebar.state.command == objName+'-viewDmgrPlacesSidebar') {
				twinSidebar.stateForceCommand('viewDmtSidebar');
			}
			doDMTCommand();
		}
	});
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box) {
			if(isDmgrPlacesSidebar(mainSidebar)) {
				closeSidebar(mainSidebar);
			}
		}
		if(twinSidebar.box) {
			if(isDmgrPlacesSidebar(twinSidebar)) {
				closeSidebar(twinSidebar);
			}
		}
	}
	
	if(dmtLoaded) { return; }
	
	Listeners.remove(window, 'SidebarFocusedSync', loadDmgrPlacesFix);
	
	if(UNLOADED) {
		Styles.unload('dmgrPlaces');
	}
	
	Overlays.removeOverlayWindow(window, 'dmgrPlacesSidebar');
};
