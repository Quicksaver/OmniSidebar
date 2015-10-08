// VERSION 1.0.0

this.__defineGetter__('findbartweak', function() { return window.findbartweak; });

this.fbt = {
	id: 'fbt@quicksaver',
	
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
		Listeners.add(window, 'ShouldCollapseSidebar', this, true);
	},
	
	disable: function() {
		Listeners.remove(window, 'ShouldCollapseSidebar', this, true);
	}
};

Modules.LOADMODULE = function() {
	fbt.listen();
};

Modules.UNLOADMODULE = function() {
	fbt.unlisten();
};
