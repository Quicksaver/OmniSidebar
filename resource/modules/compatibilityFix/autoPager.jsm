moduleAid.VERSION = '1.0.0';

this.unloadAutoPager = function(e) {
	var bar = e.target;
	if(bar.box.getAttribute('sidebarcommand') == 'autopagerSiteWizardSidebar') {
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
