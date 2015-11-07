// VERSION 2.0.1

this.pageInfo = {
	broadcasterId: objName+'-viewPageInfoSidebar',
	get broadcaster () { return $(this.broadcasterId); },
	
	args: null,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarFocusedSync':
				if(e.target
				&& e.target.document
				&& e.target.document.baseURI == 'chrome://browser/content/pageinfo/pageInfo.xul') {
					if(!e.target.opener) {
						e.target.opener = window;
					}
					if(this.args) {
						if(!e.target.arguments) { e.target.arguments = new e.target.Array(); } // Doing it this way to prevent a ZC.
						e.target.arguments.unshift(this.args);
						this.args = null;
					}
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'alwaysPageInfo':
				this.toggleAlways(Prefs.alwaysPageInfo);
				break;
		}
	},
	
	toggleAlways: function(enable) {
		if(enable) {
			Piggyback.add('pageInfo', window, 'BrowserPageInfo', (doc, initialTab, imageElement) => {
				this.args = { doc: doc, initialTab: initialTab, imageElement: imageElement };
				SidebarUI.toggle(this.broadcaster);
			});
		} else {
			Piggyback.revert('pageInfo', window, 'BrowserPageInfo');
		}
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayWindow(window, 'pageInfo');
	
	SidebarUI.triggers.forceOpen.set('viewPageInfoSidebar', function() { return pageInfo.broadcaster; });
	SidebarUI.triggers.forceReload.set('viewPageInfoSidebar', function() { return pageInfo.broadcaster; });
	SidebarUI.dontSaveBroadcasters.add(pageInfo.broadcasterId);
	
	Prefs.listen('alwaysPageInfo', pageInfo);
	pageInfo.toggleAlways(Prefs.alwaysPageInfo);
	
	Listeners.add(window, 'SidebarFocusedSync', pageInfo);
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED && UNLOADED != APP_SHUTDOWN) {
		if(mainSidebar.command == pageInfo.broadcasterId) { SidebarUI.close(mainSidebar); }
		if(twinSidebar.command == pageInfo.broadcasterId) { SidebarUI.close(twinSidebar); }
	}
	
	Listeners.remove(window, 'SidebarFocusedSync', pageInfo);
	
	Prefs.unlisten('alwaysPageInfo', pageInfo);
	pageInfo.toggleAlways(false);
	
	SidebarUI.triggers.forceOpen.delete('viewPageInfoSidebar');
	SidebarUI.triggers.forceReload.delete('viewPageInfoSidebar');
	SidebarUI.dontSaveBroadcasters.delete(pageInfo.broadcasterId);
	
	Overlays.removeOverlayWindow(window, 'pageInfo');
};
