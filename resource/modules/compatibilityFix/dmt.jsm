moduleAid.VERSION = '1.0.1';

this.DMTbackups = {};

this.toggleAlwaysDMT = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.alwaysDMT) {
		if(!DMTbackups.command) {
			DMTbackups.command = $('Tools:Downloads').getAttribute('oncommand');
		}
		setAttribute($('Tools:Downloads'), 'oncommand', 'toggleSidebar("viewDmSidebar");');
		
		if(!DMTbackups.button) {
			DMTbackups.button = {
				command: $('downloads-button').getAttribute('oncommand'),
				label: $('downloads-button').getAttribute('label'),
				tooltip: $('downloads-button').getAttribute('tooltip')
			};
		}
		setAttribute($('downloads-button'), 'observes', 'viewDmSidebar');
	} else {
		removeAttribute($('downloads-button'), 'observes');
		removeAttribute($('downloads-button'), 'checked');
		removeAttribute($('downloads-button'), 'twinSidebar');
		removeAttribute($('downloads-button'), 'autoCheck');
		removeAttribute($('downloads-button'), 'type');
		removeAttribute($('downloads-button'), 'group');
		removeAttribute($('downloads-button'), 'sidebartitle');
		removeAttribute($('downloads-button'), 'sidebarurl');
		if(DMTbackups.button) {
			setAttribute($('downloads-button'), 'oncommand', DMTbackups.button.command);
			setAttribute($('downloads-button'), 'label', DMTbackups.button.label);
			setAttribute($('downloads-button'), 'tooltip', DMTbackups.button.tooltip);
			delete DMTbackups.button;
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
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($('viewDmSidebar'), 'checked', checked);
	toggleAttribute($('viewDmSidebar'), 'twinSidebar', twin);
};

this.unloadDMT = function() {
	toggleAlwaysDMT(true);
	
	prefAid.unlisten('alwaysDMT', toggleAlwaysDMT);
};

this.doDMTCommand = function() {
	delete holdBroadcasters.dm;
	delete holdBroadcasters.dmt;
	if(mainSidebar.loaded && (_sidebarCommand == 'viewDmSidebar' || _sidebarCommand == 'viewDmtSidebar')) { loadMainSidebar(); }
	if(twinSidebar.loaded && (_sidebarCommandTwin == 'viewDmSidebar' || _sidebarCommandTwin == 'viewDmtSidebar')) { loadTwinSidebar(); }
};

this.loadDmgrFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://mozapps/content/downloads/downloads.xul') {
		if(!e.target.arguments) {
			e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
		}
		e.target.arguments.push(null);
		e.target.arguments.push(Ci.nsIDownloadManagerUI.REASON_USER_INTERACTED);
		
		// for example when using Ctrl+J to toggle the downloads sidebar, we wouldn't be able to close it the same way without clicking the actual browser window.
		if(prefAid.alwaysDMT) {
			if(window.content) {
				window.content.focus();
			} else {
				window.gBrowser.selectedBrowser.focus();
			}
		}
	}
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.dm = 'viewDmSidebar';
	holdBroadcasters.dmt = 'viewDmtSidebar';
	
	listenerAid.add(window, 'SidebarFocusedSync', loadDmgrFix);
	
	AddonManager.getAddonByID("{F8A55C97-3DB6-4961-A81D-0DE0080E53CB}", function(addon) {
		if(!addon || !addon.isActive) {
			overlayAid.overlayWindow(window, 'dmtSidebar', null, loadDMT, unloadDMT);
			if(_sidebarCommand == 'viewDmtSidebar') { _sidebarCommand = 'viewDmSidebar'; }
			if(_sidebarCommandTwin == 'viewDmtSidebar') { _sidebarCommandTwin = 'viewDmSidebar'; }
		} else {
			if(_sidebarCommand == 'viewDmSidebar') { _sidebarCommand = 'viewDmtSidebar'; }
			if(_sidebarCommandTwin == 'viewDmSidebar') { _sidebarCommandTwin = 'viewDmtSidebar'; }
			doDMTCommand();
		}
	});
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'SidebarFocusedSync', loadDmgrFix);
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewDmSidebar') { closeSidebar(twinSidebar); }
	}
	
	overlayAid.removeOverlayWindow(window, 'dmtSidebar');
};
