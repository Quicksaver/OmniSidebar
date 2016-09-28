/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.0

this.unloadAutoPager = function(e) {
	var box = e.target;
	if(box.getAttribute('sidebarcommand') == 'autopagerSiteWizardSidebar') {
		e.preventDefault();
		e.stopPropagation();
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'ShouldCollapseSidebar', unloadAutoPager, true);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'ShouldCollapseSidebar', unloadAutoPager, true);
};
