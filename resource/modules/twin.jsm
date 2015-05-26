Modules.VERSION = '2.0.0';

this.twin = {
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'keepLoaded':
				twinSidebar.reUnload();
				break;
			
			case 'useSwitchTwin':
				switcher.enable(twinSidebar);
				break;
		}
	},
	
	unsetBroadcasters: function() {
		var broadcasters = $$("broadcaster[group='sidebar']");
		for(let broadcaster of broadcasters) {
			if(trueAttribute(broadcaster, 'twinSidebar')) {
				removeAttribute(broadcaster, 'checked');
				removeAttribute(broadcaster, 'twinSidebar');
			}
		}
	},
	
	fixWidths: function() {
		var browser = $('browser');
		var mainWidth = mainSidebar.width;
		var twinWidth = twinSidebar.width;
		
		var main = true;
		while(mainWidth + twinWidth > browser.clientWidth - Prefs.minSpaceBetweenSidebars) {
			main = !main;
			if(main) {
				mainWidth = mainWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + Prefs.minSpaceBetweenSidebars);
			} else {
				twinWidth = twinWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + Prefs.minSpaceBetweenSidebars);
			}
		}
		
		if(mainWidth != mainSidebar.width) { setAttribute(mainSidebar.box, 'width', mainWidth); }
		if(twinWidth != twinSidebar.width) { setAttribute(twinSidebar.box, 'width', twinWidth); }
	},
	
	load: function() {
		twinSidebar.loaded = true;
		switcher.enable(twinSidebar);
		openLast(twinSidebar);
		setClass(twinSidebar);
	},
	
	onLoad: function() {
		// I guess some add-ons can set these, they override the css set ones so we have to erase them
		twinSidebar.sidebar.style.maxWidth = '';
		twinSidebar.sidebar.style.minWidth = Prefs.minSidebarWidth+'px';
		twinSidebar.sidebar.style.width = '';
		
		this.fixWidths();
		
		Watchers.addAttributeWatcher(twinSidebar.box, 'width', self, true);
		
		// Apply initial preferences
		Listeners.add(twinSidebar.sidebar, 'load', SidebarUI, true);
		
		// there are no events dispatched when the overlay loads, so I have to do this here
		if(typeof(menus) != 'undefined') {
			menus.toggleMenuButtonTwin();
		}
		
		this.load();
	},
	
	onUnload: function() {
		twinSidebar.loaded = false;
		
		switcher.disable(twinSidebar);
		
		for(let id of SidebarUI.dontSaveBroadcasters) {
			if(twinSidebar.command == id) {
				SidebarUI.close(twinSidebar);
				break;
			}
		}
		
		this.unsetBroadcasters();
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayWindow(window, "twin", twin);
	
	Prefs.listen('useSwitchTwin', twin);
	Prefs.listen('keepLoaded', twin);
	
	SidebarUI.triggers.twin.set('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	SidebarUI.triggers.twin.set('twinSwitcher', function() { return twinSidebar.switcher; });
	SidebarUI.triggers.blank.set('twinCommand', function() { return $(objName+'-cmd_twinSidebar'); });
	SidebarUI.triggers.blank.set('twinSwitcher', function() { return twinSidebar.switcher; });
};

Modules.UNLOADMODULE = function() {
	SidebarUI.triggers.twin.delete('twinCommand');
	SidebarUI.triggers.twin.delete('twinSwitcher');
	SidebarUI.triggers.blank.delete('twinCommand');
	SidebarUI.triggers.blank.delete('twinSwitcher');
	
	Prefs.unlisten('useSwitchTwin', twin);
	Prefs.unlisten('keepLoaded', twin);
	
	twinSidebar.reUnload();
	
	Listeners.remove(twinSidebar.sidebar, 'load', SidebarUI, true);
	
	Watchers.removeAttributeWatcher(twinSidebar.box, 'width', self, true);
	
	dispatch(twinSidebar.sidebar, { type: 'UnloadingTwinSidebar', cancelable: false });
	
	Overlays.removeOverlayWindow(window, "twin");
};
