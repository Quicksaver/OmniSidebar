Modules.VERSION = '2.0.1';

this.dmgrPlaces = {
	broadcasterId: objName+'-viewDmgrPlacesSidebar',
	get broadcaster () { return $(this.broadcasterId); },
	
	dmtLoaded: false,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocusedSync':
				if(e.target
				&& e.target.document
				&& e.target.document.baseURI == 'chrome://browser/content/places/places.xul'
				&& e.detail && dmgrPlaces.is(e.detail.bar)) {
					if(!e.target.arguments) {
						e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
					}
					e.target.arguments.push("Downloads");
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'alwaysDMT':
				this.toggleAlways(Prefs.alwaysDMT);
				break;
		}
	},
	
	toggleAlways: function(enable) {
		if(enable) {
			Piggyback.add('dmt', window, 'BrowserDownloadsUI', () => { SidebarUI.toggle(this.broadcaster); });
		} else {
			Piggyback.revert('dmt', window, 'BrowserDownloadsUI');
		}
		
		this.acceltext();
	},
	
	acceltext: function() {
		if(this.broadcaster) {
			var str = this.broadcaster.getAttribute((DARWIN) ? 'MacAcceltext' : 'WinLinAcceltext');
			var parts = str.split('+');
			parts[parts.length-1] = parts[parts.length-1].toUpperCase();
			str = parts.join('+');
			toggleAttribute(this.broadcaster, 'acceltext', Prefs.alwaysDMT, str);
		}
	},
	
	init: function() {
		SidebarUI.holdBroadcasters.delete('viewDmtSidebar');
		SidebarUI.holdBroadcasters.delete(this.broadcasterId);
		
		if(mainSidebar.loaded
		&& (mainSidebar.state.command == 'viewDmtSidebar' || mainSidebar.state.command == this.broadcasterId)) {
			self.onLoad();
		}
		
		if(twinSidebar.loaded
		&& (twinSidebar.state.command == 'viewDmtSidebar' || twinSidebar.state.command == this.broadcasterId)) {
			twin.load();
		}
	},
	
	onLoad: function() {
		this.init();
		
		Prefs.listen('alwaysDMT', this);
		this.toggleAlways(Prefs.alwaysDMT);
		
		var checked = mainSidebar.command == this.broadcasterId;
		var twin = false;
		if(!checked && twinSidebar.command == this.broadcasterId) {
			checked = true;
			twin = true;
		}
		toggleAttribute(this.broadcaster, 'checked', checked);
		toggleAttribute(this.broadcaster, 'twinSidebar', twin);	
		this.acceltext();
	},
	
	onUnload: function() {
		Prefs.unlisten('alwaysDMT', this);
		this.toggleAlways(false);
	},
	
	is: function(bar) {
		return (bar && bar.command == this.broadcasterId);
	}
};

Modules.LOADMODULE = function() {
	SidebarUI.holdBroadcasters.add('viewDmtSidebar');
	SidebarUI.holdBroadcasters.add(dmgrPlaces.broadcasterId);
	
	AddonManager.getAddonByID("{F8A55C97-3DB6-4961-A81D-0DE0080E53CB}", function(addon) {
		if(!addon || !addon.isActive) {
			if(mainSidebar.state.command == 'viewDmtSidebar') {
				mainSidebar.stateForceCommand(dmgrPlaces.broadcasterId);
			}
			if(twinSidebar.state.command == 'viewDmtSidebar') {
				twinSidebar.stateForceCommand(dmgrPlaces.broadcasterId);
			}
			
			Styles.load('dmgrPlaces', 'dmgrPlaces');
			Overlays.overlayWindow(window, 'dmgrPlacesSidebar', dmgrPlaces);
			
			Listeners.add(window, 'SidebarFocusedSync', dmgrPlaces);
		} else {
			dmgrPlaces.dmtLoaded = true;
			if(mainSidebar.state.command == dmgrPlaces.broadcasterId) {
				mainSidebar.stateForceCommand('viewDmtSidebar');
			}
			if(twinSidebar.state.command == dmgrPlaces.broadcasterId) {
				twinSidebar.stateForceCommand('viewDmtSidebar');
			}
			dmgrPlaces.init();
		}
	});
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(dmgrPlaces.is(mainSidebar)) {
			SidebarUI.close(mainSidebar);
		}
		if(dmgrPlaces.is(twinSidebar)) {
			SidebarUI.close(twinSidebar);
		}
	}
	
	if(dmgrPlaces.dmtLoaded) { return; }
	
	Listeners.remove(window, 'SidebarFocusedSync', dmgrPlaces);
	
	if(UNLOADED) {
		Styles.unload('dmgrPlaces');
	}
	
	Overlays.removeOverlayWindow(window, 'dmgrPlacesSidebar');
};
