moduleAid.VERSION = '1.0.0';

this.openURIBar = function(button) {
	var broadcaster = $(button.getAttribute('broadcaster'));
	
	$(broadcaster.getAttribute('menu')).style.width = $(broadcaster.getAttribute('anchor')).clientWidth -2 +'px';
	$(broadcaster.getAttribute('menu')).openPopup($(broadcaster.getAttribute('anchor')), 'after_start');
};

// Set the value of the developers tools URI bar to the value in the broadcaster
this.resetURIBar = function(menu) {
	var broadcaster = $(menu.getAttribute('broadcaster'));
	
	$(broadcaster.getAttribute('textbar')).value = broadcaster.getAttribute('sidebarurl');
	$(broadcaster.getAttribute('textbar')).focus();
	$(broadcaster.getAttribute('textbar')).select();
	
	dispatch($(broadcaster.getAttribute('anchor')), {
		type: 'openGoURIBar',
		cancelable: false,
		detail: { bar: ($(broadcaster.getAttribute('anchor')) == twinSidebar.header) ? twinSidebar : mainSidebar }
	});
};

// loses focus from the texbox
this.blurURIBar = function(menu) {
	var broadcaster = $(menu.getAttribute('broadcaster'));
	
	$('main-window').focus();
	
	dispatch($(broadcaster.getAttribute('anchor')), {
		type: 'closeGoURIBar',
		cancelable: false,
		detail: { bar: ($(broadcaster.getAttribute('anchor')) == twinSidebar.header) ? twinSidebar : mainSidebar }
	});
};

// Loads the uri bar value into the sidebar
this.loadURIBar = function(button) {
	var broadcaster = $(button.getAttribute('broadcaster'));
	
	if($(broadcaster.getAttribute('textbar')).value.indexOf('about:') !== 0 && $(broadcaster.getAttribute('textbar')).value.indexOf('chrome://') !== 0) { return; }
	
	blurURIBar($(broadcaster.getAttribute('menu')));
	$(broadcaster.getAttribute('menu')).hidePopup();
	
	broadcaster.setAttribute('sidebarurl', $(broadcaster.getAttribute('textbar')).value);
	broadcaster.setAttribute('sidebartitle', $(broadcaster.getAttribute('textbar')).value);
	broadcaster.removeAttribute('checked'); // To make sure it always loads the sidebar from the same broadcaster
	toggleSidebar(broadcaster);
};

this.keydownURIBar = function(e, box) {
	var broadcaster = $(box.getAttribute('broadcaster'));
	
	switch(e.keyCode) {
		case e.DOM_VK_ESCAPE:
			blurURIBar($(broadcaster.getAttribute('menu')));
			$(broadcaster.getAttribute('menu')).hidePopup();
			return false;
		
		case e.DOM_VK_RETURN:
		case e.DOM_VK_ENTER:
			loadURIBar($(broadcaster.getAttribute('goButton')));
			return true;
		
		default: return true;
	}
};

this.toggleGoURI = function() {
	if(prefAid.goButton) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain', null, toggleToolbarsGoURI, toggleToolbarsGoURI);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
	}
	
	if(prefAid.goButtonTwin) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin', null, toggleToolbarsGoURI, toggleToolbarsGoURI);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
	}
};

this.toggleToolbarsGoURI = function(window) {
	if(!UNLOADED) {
		aSync(function() { if(window[objName] && window[objName].toggleToolbars) { window[objName].toggleToolbars(); } });
	}
};

this.listenGoCloseSidebar = function(e) {
	if((e.detail.bar.main && isAncestor(e.detail.focusedNode, $('omnisidebarURIBarMenu')))
	|| (e.detail.bar.twin && isAncestor(e.detail.focusedNode, $('omnisidebarURIBarMenu-twin')))) {
		e.preventDefault();
	}
};

moduleAid.LOADMODULE = function() {
	dontSaveBroadcasters.goURIMain = 'viewURISidebar';
	dontSaveBroadcasters.goURITwin = 'viewURISidebar-twin';
	styleAid.load('goURI', 'goURI');
	
	prefAid.listen('goButton', toggleGoURI);
	prefAid.listen('goButtonTwin', toggleGoURI);
	
	listenerAid.add(window, 'willCloseSidebar', listenGoCloseSidebar, true);
	
	toggleGoURI();
	
	twinTriggers.__defineGetter__('goURITwin', function() { return $('viewURISidebar-twin'); });
};

moduleAid.UNLOADMODULE = function() {
	delete twinTriggers.goURITwin;
	
	listenerAid.remove(window, 'willCloseSidebar', listenGoCloseSidebar, true);
	
	prefAid.unlisten('goButton', toggleGoURI);
	prefAid.unlisten('goButtonTwin', toggleGoURI);
	
	if(UNLOADED) {
		// This is to solve a ZC when the add-on was disabled with a sidebar opened on the goURI broadcasters
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == 'viewURISidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == 'viewURISidebar-twin') { closeSidebar(twinSidebar); }
		
		styleAid.unload('goURI');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
	}
};
