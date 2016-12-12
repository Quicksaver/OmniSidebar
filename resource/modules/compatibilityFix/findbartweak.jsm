/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.1

this.__defineGetter__('findbartweak', function() { return window.findbartweak; });

this.fbt = {
	id: 'fbt@quicksaver',
	broadcasterId: 'findbartweak-findInTabs-broadcaster',

	initialized: false,

	handleEvent: function(e) {
		switch(e.type) {
			case 'ShouldCollapseSidebar':
				if(e.target.getAttribute('sidebarcommand') == 'findbartweak-findInTabs-broadcaster') {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},

	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},

	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},

	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},

	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},

	enable: function() {
		if(this.initialized) { return; }
		this.initialized = true;

		Listeners.add(window, 'ShouldCollapseSidebar', this, true);
		SidebarUI.dontSaveBroadcasters.add(this.broadcasterId);
	},

	disable: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		Listeners.remove(window, 'ShouldCollapseSidebar', this, true);
		SidebarUI.dontSaveBroadcasters.delete(this.broadcasterId);

		if(UNLOADED && UNLOADED != APP_SHUTDOWN) {
			if(mainSidebar.command == this.broadcasterId) { SidebarUI.close(mainSidebar); }
			if(twinSidebar.command == this.broadcasterId) { SidebarUI.close(twinSidebar); }
		}
	}
};

Modules.LOADMODULE = function() {
	fbt.listen();
};

Modules.UNLOADMODULE = function() {
	fbt.unlisten();
};
