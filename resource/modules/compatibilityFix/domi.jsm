// VERSION 2.0.1

this.DOMi = {
	broadcasterId: objName+'-viewDOMInspectorSidebar',
	get broadcaster () { return $(this.broadcasterId); },
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocusedSync':
				if(e.target
				&& e.target.document
				&& e.target.document.baseURI == 'chrome://inspector/content/inspector.xul'
				&& e.detail && this.is(e.detail.bar)) {
					if(!e.target.arguments) {
						e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
					}
					e.target.arguments.push(window.content.document);
				}
				break;
		}
	},
	
	init: function() {
		SidebarUI.holdBroadcasters.delete(this.broadcasterId);
		if(mainSidebar.loaded && mainSidebar.state.command == this.broadcasterId) { self.onLoad(); }
		if(twinSidebar.loaded && twinSidebar.state.command == this.broadcasterId) { twin.load(); }
	},
	
	is: function(bar) {
		return (bar && bar.command == this.broadcasterId);
	},
	
	onLoad: function() {
		this.init();
		
		var checked = mainSidebar.command == this.broadcasterId;
		var twin = false;
		if(!checked && twinSidebar.command == this.broadcasterId) {
			checked = true;
			twin = true;
		}
		toggleAttribute(this.broadcaster, 'checked', checked);
		toggleAttribute(this.broadcaster, 'twinSidebar', twin);
		aSync(() => { setAttribute($(objName+'-dominspector_sidebar_button'), 'observes', this.broadcasterId); });
	}
};

Modules.LOADMODULE = function() {
	SidebarUI.holdBroadcasters.add(DOMi.broadcasterId);
	
	AddonManager.getAddonByID("inspector@mozilla.org", function(addon) {
		if(UNLOADED) { return; }
		
		if(addon && addon.isActive) {
			Overlays.overlayWindow(window, 'domi', DOMi);
			Listeners.add(window, 'SidebarFocusedSync', DOMi);
		} else {
			AddonManager.getAddonByID("inspector-dp@mozilla.org", function(addon) {
				if(addon && addon.isActive) {
					Overlays.overlayWindow(window, 'domi', DOMi);
					Listeners.add(window, 'SidebarFocusedSync', DOMi);
				} else {
					DOMi.init();
				}
			});
		}
	});
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED && UNLOADED != APP_SHUTDOWN) {
		if(mainSidebar.command == DOMi.broadcasterId) { SidebarUI.close(mainSidebar); }
		if(twinSidebar.command == DOMi.broadcasterId) { SidebarUI.close(twinSidebar); }
	}
	
	Listeners.remove(window, 'SidebarFocusedSync', DOMi);
	Overlays.removeOverlayWindow(window, 'domi');
};
