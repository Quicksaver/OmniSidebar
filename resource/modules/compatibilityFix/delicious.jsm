Modules.VERSION = '1.1.0';

// I was overriding the delicious keyset before (ctrl+shift+S) I don't know why. Maybe so it wouldn't conflict with my own keyset at the time?
// I'm not doing that anymore.

this.keepDeliciousPinned = function() {
	Prefs['sidebar.pinned'] = true;
};

// delicious has the bad habit of hiding my box and also removing the Watchers methods for some reason
this.boxNeverHidden = function(box) {
	box.hidden = false;
};

this.watchHiddenBox = function(e) {
	var target = e.target || e.resizeBox;
	if(!target) { return; }
	
	if(!UNLOADED) {
		target.hidden = false;
		Watchers.addPropertyWatcher(target, 'hidden', boxNeverHidden);
	} else {
		Watchers.removePropertyWatcher(target, 'hidden', boxNeverHidden);
	}
};

// Delicious also likes to hide my sidebar header...
this.deliciousHeaderHideFix = function(e) {
	if(e.target && e.target.document && e.target.document.baseURI == 'chrome://ybookmarks/content/ybsidebar.xul') {
		// Don't bother undoing this, when the sidebar is closed this is lost, plus we close the delicious sidebar when we unload (easier this way), so no issues here.
		var ybPanel = e.target.document.getElementById('ybSidebarPanel');
		ybPanel.setSearchBoxFocus = function() { this._searchBox.focus(); };
	}
};

Modules.LOADMODULE = function() {
	Styles.load('deliciousFix', 'delicious');
	
	var deliciousPrefs = {};
	deliciousPrefs['sidebar.pinned'] = true;
	Prefs.setDefaults(deliciousPrefs, 'ybookmarks@yahoo');
	
	this.backups = {
		pinned: Prefs['sidebar.pinned']
	};
	
	Prefs.listen('sidebar.pinned', keepDeliciousPinned);
	keepDeliciousPinned();
	
	Listeners.add(window, 'SidebarFocusedSync', deliciousHeaderHideFix);
	Listeners.add(window, 'sidebarAbove', watchHiddenBox);
	watchHiddenBox(mainSidebar);
	watchHiddenBox(twinSidebar);
};

Modules.UNLOADMODULE = function() {
	watchHiddenBox(mainSidebar);
	watchHiddenBox(twinSidebar);
	Listeners.remove(window, 'sidebarAbove', watchHiddenBox);
	Listeners.remove(window, 'SidebarFocusedSync', deliciousHeaderHideFix);
	
	Prefs.unlisten('sidebar.pinned', keepDeliciousPinned);
	
	if(this.backups) {
		Prefs['sidebar.pinned'] = this.backups.pinned;
		delete this.backups;
	}
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewYBookmarksSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewYBookmarksSidebar') { closeSidebar(twinSidebar); }
		Styles.unload('deliciousFix', 'delicious');
	}
};
