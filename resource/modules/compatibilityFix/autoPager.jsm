moduleAid.VERSION = '1.0.1';

this.unloadAutoPager = function(e) {
	var box = e.target;
	if(box.getAttribute('sidebarcommand') == 'autopagerSiteWizardSidebar') {
		e.preventDefault();
		e.stopPropagation();
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'ShouldCollapseSidebar', unloadAutoPager, true);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'ShouldCollapseSidebar', unloadAutoPager, true);
};
