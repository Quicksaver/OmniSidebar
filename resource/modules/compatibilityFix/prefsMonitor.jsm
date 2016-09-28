/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.prefsMonitorAddon = {
	id: '{517f9e52-c795-4764-bf77-5e2db596cee6}',

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
		Styles.load('prefsMonitor', 'prefsMonitor', false, 'agent');
	},

	disable: function() {
		Styles.unload('prefsMonitor');
	}
};

Modules.LOADMODULE = function() {
	prefsMonitorAddon.listen();
};

Modules.UNLOADMODULE = function() {
	prefsMonitorAddon.unlisten();
};
