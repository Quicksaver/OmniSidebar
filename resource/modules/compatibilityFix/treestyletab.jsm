/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

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
