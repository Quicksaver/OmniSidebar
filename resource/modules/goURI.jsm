Modules.VERSION = '1.1.0';

this.openURIBar = function(button) {
	var broadcaster = $(button.getAttribute('broadcaster'));
	
	var anchor = $(broadcaster.getAttribute('anchor'));
	// If the button is opened in the panel, we need to change the anchor to the actual toolbar
	if(isAncestor(button, panel)) {
		anchor = button.parentNode;
	}
	
	$(broadcaster.getAttribute('menu')).style.width = anchor.clientWidth -2 +'px';
	$(broadcaster.getAttribute('menu')).openPopup(anchor, 'after_start');
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

// loses focus from the textbox
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
	var textbarValue = $(broadcaster.getAttribute('textbar')).value;
	if(!textbarValue.startsWith('about:') && !textbarValue.startsWith('chrome://')) { return; }
	
	blurURIBar($(broadcaster.getAttribute('menu')));
	$(broadcaster.getAttribute('menu')).hidePopup();
	
	broadcaster.setAttribute('sidebarurl', textbarValue);
	broadcaster.setAttribute('sidebartitle', textbarValue);
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
			loadURIBar($(broadcaster.getAttribute('goButton')));
			return true;
		
		default: return true;
	}
};

this.toggleGoURI = function() {
	if(Prefs.goButton) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain', null, toggleToolbarsGoURI, toggleToolbarsGoURI);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
	}
	
	if(Prefs.goButtonTwin) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin', null, toggleToolbarsGoURI, toggleToolbarsGoURI);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
	}
};

this.toggleToolbarsGoURI = function(window) {
	if(!UNLOADED) {
		aSync(function() { if(window[objName] && window[objName].toggleToolbars) { window[objName].toggleToolbars(); } });
	}
};

this.listenGoCloseSidebar = function(e) {
	if((e.detail.bar.main && isAncestor(e.detail.focusedNode, $(objName+'-URIBarMenu')))
	|| (e.detail.bar.twin && isAncestor(e.detail.focusedNode, $(objName+'-URIBarMenu-twin')))) {
		e.preventDefault();
	}
};

Modules.LOADMODULE = function() {
	dontSaveBroadcasters.goURIMain = objName+'-viewURISidebar';
	dontSaveBroadcasters.goURITwin = objName+'-viewURISidebar-twin';
	Styles.load('goURI', 'goURI');
	
	Prefs.listen('goButton', toggleGoURI);
	Prefs.listen('goButtonTwin', toggleGoURI);
	
	Listeners.add(window, 'willCloseSidebar', listenGoCloseSidebar, true);
	
	toggleGoURI();
	
	twinTriggers.__defineGetter__('goURITwin', function() { return $(objName+'-viewURISidebar-twin'); });
};

Modules.UNLOADMODULE = function() {
	delete twinTriggers.goURITwin;
	
	Listeners.remove(window, 'willCloseSidebar', listenGoCloseSidebar, true);
	
	Prefs.unlisten('goButton', toggleGoURI);
	Prefs.unlisten('goButtonTwin', toggleGoURI);
	
	if(UNLOADED) {
		// This is to solve a ZC when the add-on was disabled with a sidebar opened on the goURI broadcasters
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewURISidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewURISidebar-twin') { closeSidebar(twinSidebar); }
		
		Styles.unload('goURI');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
	}
};
