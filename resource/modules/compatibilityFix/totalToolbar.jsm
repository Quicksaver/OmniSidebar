Modules.VERSION = '1.1.0';

// I will probably remove this for Australis...

// Compatibility fix for Totaltoolbar, setting all these options on omnisidebar's toolbars just doesn't work and I want to prevent any possible errors from it
this.setTTContextMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	
	toggleAttribute($('tt-toolbar-properties'), 'disabled',	
		isAncestor(trigger, mainSidebar.button)
		|| isAncestor(trigger, twinSidebar.button)
		|| isAncestor(trigger, mainSidebar.header)
		|| isAncestor(trigger, twinSidebar.header));
};

this.removeTTEntries = function(e) {
	var menu = e.target;
	for(var child of menu.childNodes) {
		if(child.id.contains('toggle_omnisidebar')) {
			hideIt(child);
		}
	}
};

this.moveTTButtons = function() {
	// won't work without the aSync for some reason
	aSync(function() {
		if(!mainSidebar.toolbar || !$('tt-toolbar-sidebarheader').firstChild) { return; } // we could be loading the twin first for some reason, I dunno....
		
		while($('tt-toolbar-sidebarheader').firstChild) {
			mainSidebar.toolbar.appendChild($('tt-toolbar-sidebarheader').firstChild);
		}
		
		$('tt-toolbar-sidebarheader').setAttribute('currentset', $('tt-toolbar-sidebarheader').currentSet);
		mainSidebar.toolbar.setAttribute('currentset', mainSidebar.toolbar.currentSet);
		
		document.persist(mainSidebar.toolbar.id, 'currentset');
		document.persist('tt-toolbar-sidebarheader', 'currentset');
	});
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'loadedSidebarHeader', moveTTButtons);
	moveTTButtons();
	
	Listeners.add($('toolbar-context-menu'), 'popupshown', setTTContextMenu, false);
	Listeners.add($('toolbar-context-menu'), 'popupshown', removeTTEntries, false);
	Listeners.add($('appmenu_customizeMenu'), 'popupshown', removeTTEntries, false);
	Listeners.add($('viewToolbarsMenu').firstChild, 'popupshown', removeTTEntries, false);
	
	hideIt($('tt-toolbox-sidebarheader'));
};

Modules.UNLOADMODULE = function() {
	hideIt($('tt-toolbox-sidebarheader'), true);
	
	Listeners.remove(window, 'loadedSidebarHeader', moveTTButtons);
	
	Listeners.remove($('toolbar-context-menu'), 'popupshown', setTTContextMenu, false);
	Listeners.remove($('toolbar-context-menu'), 'popupshown', removeTTEntries, false);
	Listeners.remove($('appmenu_customizeMenu'), 'popupshown', removeTTEntries, false);
	Listeners.remove($('viewToolbarsMenu').firstChild, 'popupshown', removeTTEntries, false);
};
