moduleAid.VERSION = '1.0.0';

// Compatibility fix for Totaltoolbar, setting all these options on omnisidebar's toolbars just doesn't work and I wantto prevent any possible errors from it
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
	for(var i=0; i<menu.childNodes.length; i++) {
		if(menu.childNodes[i].id.indexOf('toggle_omnisidebar') > -1) {
			hideIt(menu.childNodes[i]);
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

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'loadedSidebarHeader', moveTTButtons);
	moveTTButtons();
	
	listenerAid.add($('toolbar-context-menu'), 'popupshown', setTTContextMenu, false);
	listenerAid.add($('toolbar-context-menu'), 'popupshown', removeTTEntries, false);
	listenerAid.add($('appmenu_customizeMenu'), 'popupshown', removeTTEntries, false);
	listenerAid.add($('viewToolbarsMenu').firstChild, 'popupshown', removeTTEntries, false);
	
	hideIt($('tt-toolbox-sidebarheader'));
};

moduleAid.UNLOADMODULE = function() {
	hideIt($('tt-toolbox-sidebarheader'), true);
	
	listenerAid.remove(window, 'loadedSidebarHeader', moveTTButtons);
	
	listenerAid.remove($('toolbar-context-menu'), 'popupshown', setTTContextMenu, false);
	listenerAid.remove($('toolbar-context-menu'), 'popupshown', removeTTEntries, false);
	listenerAid.remove($('appmenu_customizeMenu'), 'popupshown', removeTTEntries, false);
	listenerAid.remove($('viewToolbarsMenu').firstChild, 'popupshown', removeTTEntries, false);
};
