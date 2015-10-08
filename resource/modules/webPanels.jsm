// VERSION 1.0.0

// for now this works only with the main sidebar
this.webPanels = {
	uri: "",
	
	open: function(title, uri) {
		// Ensure that the web panels sidebar is open.
		SidebarUI.show("viewWebPanelsSidebar").then((toggled) => {
			if(toggled) {
				// Set the title of the panel.
				mainSidebar.title = title;
			}
		});
		
		// Tell the Web Panels sidebar to load the bookmark.
		if(mainSidebar.sidebar.docShell && mainSidebar.sidebar.contentDocument && mainSidebar.sidebar.contentDocument.getElementById("web-panels-browser")) {
			mainSidebar.sidebar.contentWindow.loadWebPanel(uri);
			if(this.uri) {
				this.uri = "";
				mainSidebar.sidebar.removeEventListener("load", this, true);
			}
		} else {
			// The panel is still being constructed.  Attach an onload handler.
			if(!this.uri) {
				mainSidebar.sidebar.addEventListener("load", this, true);
			}
			this.uri = uri;
		}
	},
	
	handleEvent: function(e) {
		if(this.uri && mainSidebar.sidebar.contentDocument && mainSidebar.sidebar.contentDocument.getElementById("web-panels-browser")) {
			mainSidebar.sidebar.contentWindow.loadWebPanel(this.uri);
		}
		this.uri = "";
		mainSidebar.sidebar.removeEventListener("load", this, true);
	}
};

Modules.LOADMODULE = function() {
	Piggyback.add(objName, window, 'openWebPanel', function() {
		webPanels.open.apply(webPanels, arguments);
	});
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert(objName, window, 'openWebPanel');
};
