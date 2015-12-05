// VERSION 1.2.0

this.TSTresize = function() {
	gBrowser.treeStyleTab.onResize({ originalTarget: window });
};

Modules.LOADMODULE = function() {
	Styles.load('treestyletab', 'treestyletab');

	Listeners.add(window, 'endToggleSidebar', TSTresize);
	Listeners.add(window, 'sidebarAbove', TSTresize);
	Listeners.add(window, 'sidebarDocked', TSTresize);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'endToggleSidebar', TSTresize);
	Listeners.remove(window, 'sidebarAbove', TSTresize);
	Listeners.remove(window, 'sidebarDocked', TSTresize);

	if(UNLOADED) {
		Styles.unload('treestyletab');
	}
};
