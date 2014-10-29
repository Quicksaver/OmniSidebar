Modules.VERSION = '1.1.0';

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
