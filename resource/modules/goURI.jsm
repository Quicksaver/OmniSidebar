// VERSION 2.0.0

this.URIBar = {
	mainViewId: objName+'-viewURISidebar',
	twinViewId: objName+'-viewURISidebar-twin',

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'goButton':
			case 'goButtonTwin':
				this.toggleGo();
				break;
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'willCloseSidebar':
				if((e.detail.bar.main && isAncestor(e.detail.focusedNode, $(objName+'-URIBarMenu')))
				|| (e.detail.bar.twin && isAncestor(e.detail.focusedNode, $(objName+'-URIBarMenu-twin')))) {
					e.preventDefault();
				}
				break;
		}
	},

	open: function(button) {
		var broadcaster = $(button.getAttribute('broadcaster'));

		var anchor = $(broadcaster.getAttribute('anchor'));
		// If the button is opened in the panel, we need to change the anchor to the actual toolbar
		if(isAncestor(button, panel.panel)) {
			anchor = button.parentNode;
		}

		var menu = $(broadcaster.getAttribute('menu'));
		menu.style.width = anchor.clientWidth -2 +'px';
		menu.openPopup(anchor, 'after_start');
	},

	// Set the value of the developers tools URI bar to the value in the broadcaster
	reset: function(menu) {
		var broadcaster = $(menu.getAttribute('broadcaster'));

		var textbar = $(broadcaster.getAttribute('textbar'));
		textbar.value = broadcaster.getAttribute('sidebarurl');
		textbar.focus();
		textbar.select();

		var anchor = $(broadcaster.getAttribute('anchor'));
		dispatch(anchor, {
			type: 'openGoURIBar',
			cancelable: false,
			detail: { bar: (anchor == twinSidebar.header) ? twinSidebar : mainSidebar }
		});
	},

	// loses focus from the textbox
	blur: function(menu) {
		var broadcaster = $(menu.getAttribute('broadcaster'));

		document.documentElement.focus();

		var anchor = $(broadcaster.getAttribute('anchor'));
		dispatch(anchor, {
			type: 'closeGoURIBar',
			cancelable: false,
			detail: { bar: (anchor == twinSidebar.header) ? twinSidebar : mainSidebar }
		});
	},

	// Loads the uri bar value into the sidebar
	load: function(button) {
		var broadcaster = $(button.getAttribute('broadcaster'));
		var textbarValue = $(broadcaster.getAttribute('textbar')).value;
		if(!textbarValue.startsWith('about:') && !textbarValue.startsWith('chrome://')) { return; }

		var menu = $(broadcaster.getAttribute('menu'));
		this.blur(menu);
		menu.hidePopup();

		broadcaster.setAttribute('sidebarurl', textbarValue);
		broadcaster.setAttribute('sidebartitle', textbarValue);
		broadcaster.removeAttribute('checked'); // To make sure it always loads the sidebar from the same broadcaster
		SidebarUI.toggle(broadcaster);
	},

	onKeydown: function(e, box) {
		var broadcaster = $(box.getAttribute('broadcaster'));

		switch(e.keyCode) {
			case e.DOM_VK_ESCAPE:
				var menu = $(broadcaster.getAttribute('menu'));
				this.blur(menu);
				menu.hidePopup();
				return false;

			case e.DOM_VK_RETURN:
				this.load($(broadcaster.getAttribute('goButton')));
				return true;

			default: return true;
		}
	},

	toggleGo: function() {
		if(Prefs.goButton) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
		}

		if(Prefs.goButtonTwin) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
		}
	}
};

Modules.LOADMODULE = function() {
	SidebarUI.dontSaveBroadcasters.add(URIBar.mainViewId);
	SidebarUI.dontSaveBroadcasters.add(URIBar.twinViewId);
	Styles.load('goURI', 'goURI');

	Prefs.listen('goButton', URIBar);
	Prefs.listen('goButtonTwin', URIBar);

	Listeners.add(window, 'willCloseSidebar', URIBar, true);

	URIBar.toggleGo();

	SidebarUI.triggers.twin.set('goURITwin', function() { return $(URIBar.twinViewId); });
};

Modules.UNLOADMODULE = function() {
	SidebarUI.triggers.twin.delete('goURITwin');

	Listeners.remove(window, 'willCloseSidebar', URIBar, true);

	Prefs.unlisten('goButton', URIBar);
	Prefs.unlisten('goButtonTwin', URIBar);

	SidebarUI.dontSaveBroadcasters.delete(URIBar.mainViewId);
	SidebarUI.dontSaveBroadcasters.delete(URIBar.twinViewId);

	if(UNLOADED) {
		// This is to solve a ZC when the add-on was disabled with a sidebar opened on the goURI broadcasters
		if(mainSidebar.command == URIBar.mainViewId) { SidebarUI.close(mainSidebar); }
		if(twinSidebar.command == URIBar.twinViewId) { SidebarUI.close(twinSidebar); }

		Styles.unload('goURI');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'goURIMain');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'goURITwin');
	}
};
