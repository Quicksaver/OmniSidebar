moduleAid.VERSION = '1.0.1';

// I was overriding the delicious keyset before (ctrl+shift+S) I don't know why. Maybe so it wouldn't conflict with my own keyset at the time?
// I'm not doing that anymore.

this.keepDeliciousPinned = function() {
	prefAid['sidebar.pinned'] = true;
};

// delicious has the bad habit of hiding my box and also removing the addWatcher funcitons for some reason
this.boxNeverHidden = function(box) {
	box.hidden = false;
};

this.watchHiddenBox = function(e) {
	var target = e.target || e.resizeBox;
	if(!target) { return; }
	
	if(!UNLOADED) {
		target.hidden = false;
		objectWatcher.addPropertyWatcher(target, 'hidden', boxNeverHidden);
	} else {
		objectWatcher.removePropertyWatcher(target, 'hidden', boxNeverHidden);
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

moduleAid.LOADMODULE = function() {
	styleAid.load('deliciousFix', 'delicious');
	
	var deliciousPrefs = {};
	deliciousPrefs['sidebar.pinned'] = true;
	prefAid.setDefaults(deliciousPrefs, 'ybookmarks@yahoo');
	
	this.backups = {
		pinned: prefAid['sidebar.pinned']
	};
	
	prefAid.listen('sidebar.pinned', keepDeliciousPinned);
	keepDeliciousPinned();
	
	listenerAid.add(window, 'SidebarFocusedSync', deliciousHeaderHideFix);
	listenerAid.add(window, 'sidebarAbove', watchHiddenBox);
	watchHiddenBox(mainSidebar);
	watchHiddenBox(twinSidebar);
};

moduleAid.UNLOADMODULE = function() {
	watchHiddenBox(mainSidebar);
	watchHiddenBox(twinSidebar);
	listenerAid.remove(window, 'sidebarAbove', watchHiddenBox);
	listenerAid.remove(window, 'SidebarFocusedSync', deliciousHeaderHideFix);
	
	prefAid.unlisten('sidebar.pinned', keepDeliciousPinned);
	
	if(this.backups) {
		prefAid['sidebar.pinned'] = this.backups.pinned;
		delete this.backups;
	}
	
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewYBookmarksSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewYBookmarksSidebar') { closeSidebar(twinSidebar); }
		styleAid.unload('deliciousFix', 'delicious');
	}
};
