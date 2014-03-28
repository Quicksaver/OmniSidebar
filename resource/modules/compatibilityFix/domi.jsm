moduleAid.VERSION = '1.1.1';

this.doDOMICommand = function() {
	delete holdBroadcasters.domi;
	if(mainSidebar.loaded && mainSidebar.state.command == objName+'-viewDOMInspectorSidebar') { loadMainSidebar(); }
	if(twinSidebar.loaded && twinSidebar.state.command == objName+'-viewDOMInspectorSidebar') { loadTwinSidebar(); }
};

this.isDOMISidebar = function(bar) {
	return (bar && bar.box && bar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar');
};

this.loadDOMIFix = function(e) {
	if(e.target
	&& e.target.document
	&& e.target.document.baseURI == 'chrome://inspector/content/inspector.xul'
	&& e.detail
	&& isDOMISidebar(e.detail.bar)) {
		if(!e.target.arguments) {
			e.target.arguments = new e.target.Array(); // Doing it this way to prevent a ZC.
		}
		e.target.arguments.push(window.content.document);
	}
};

this.loadDOMI = function() {
	doDOMICommand();
	
	var checked = mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar';
	var twin = false;
	if(!checked && twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') {
		checked = true;
		twin = true;
	}
	toggleAttribute($(objName+'-viewDOMInspectorSidebar'), 'checked', checked);
	toggleAttribute($(objName+'-viewDOMInspectorSidebar'), 'twinSidebar', twin);
	aSync(function() { setAttribute($(objName+'-dominspector_sidebar_button'), 'observes', objName+'-viewDOMInspectorSidebar'); });
};

moduleAid.LOADMODULE = function() {
	holdBroadcasters.domi = objName+'-viewDOMInspectorSidebar';
	
	AddonManager.getAddonByID("inspector@mozilla.org", function(addon) {
		if(UNLOADED) { return; }
		
		if(addon && addon.isActive) {
			overlayAid.overlayWindow(window, 'domi', null, loadDOMI);
			listenerAid.add(window, 'SidebarFocusedSync', loadDOMIFix);
		} else {
			AddonManager.getAddonByID("inspector-dp@mozilla.org", function(addon) {
				if(addon && addon.isActive) {
					overlayAid.overlayWindow(window, 'domi', null, loadDOMI);
					listenerAid.add(window, 'SidebarFocusedSync', loadDOMIFix);
				} else {
					doDOMICommand();
				}
			});
		}
	});
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED) {
		if(mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') { closeSidebar(mainSidebar); }
		if(twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == objName+'-viewDOMInspectorSidebar') { closeSidebar(twinSidebar); }
	}
	
	listenerAid.remove(window, 'SidebarFocusedSync', loadDOMIFix);
	overlayAid.removeOverlayWindow(window, 'domi');
};
