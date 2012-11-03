moduleAid.VERSION = '1.0.0';

// omnisidebar button opens the last sidebar opened
this.setlastTwin = function() {
	setLastCommand(twinSidebar);
};

this.setBroadcastersTwin = function(initialize) {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i = 0; i < broadcasters.length; ++i) {
		if(initialize) {
			objectWatcher.addAttributeWatcher(broadcasters[i], 'disabled', setlastTwin);
		}
		else if(!initialize) {
			objectWatcher.removeAttributeWatcher(broadcasters[i], 'disabled', setlastTwin);
			if(broadcasters[i].getAttribute('twinSidebar') == 'true') {
				broadcasters[i].removeAttribute('checked');
				broadcasters[i].removeAttribute('twinSidebar');
			}
		}
	}
};

this.fixWidths = function() {
	var browser = $('browser');
	var mainWidth = mainSidebar.width;
	var twinWidth = twinSidebar.width;
	
	var main = true;
	while(mainWidth + twinWidth > browser.clientWidth - prefAid.minSpaceBetweenSidebars) {
		main = !main;
		if(main) {
			mainWidth = mainWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + prefAid.minSpaceBetweenSidebars);
		} else {
			twinWidth = twinWidth - Math.min(5, mainWidth + twinWidth - browser.clientWidth + prefAid.minSpaceBetweenSidebars);
		}
	}
	
	if(mainWidth != mainSidebar.width) { mainSidebar.box.setAttribute('width', mainWidth); }
	if(twinWidth != twinSidebar.width) { twinSidebar.box.setAttribute('width', twinWidth); }
};

this.loadTwinSidebar = function() {
	twinSidebar.loaded = true;
	
	if(_sidebarCommandTwin) {
		for(var b in holdBroadcasters) {
			if(holdBroadcasters[b] == _sidebarCommandTwin) {
				return;
			}
		}
	}
	
	if(!openLast(twinSidebar) && _sidebarCommandTwin) {
		toggleSidebar(_sidebarCommandTwin, false, true);
	}
	_sidebarCommandTwin = null;
};

this.loadedTwin = function() {
	// I guess some add-ons can set these, they override the css set ones so we have to erase them
	twinSidebar.sidebar.style.maxWidth = '';
	twinSidebar.sidebar.style.minWidth = prefAid.minSidebarWidth+'px';
	twinSidebar.sidebar.style.width = '';
	
	fixWidths();
	
	Globals.twinWidth = twinSidebar.width;
	objectWatcher.addAttributeWatcher(twinSidebar.box, 'width', watchWidth);
	
	// Apply initial preferences
	setBroadcastersTwin(true);
	listenerAid.add(twinSidebar.sidebar, 'DOMContentLoaded', setlastTwin, true);
	
	_sidebarCommandTwin = twinSidebar.box.getAttribute('sidebarcommand');
	loadTwinSidebar();
};

this.unloadedTwin = function() {
	twinSidebar.loaded = false;
	
	for(var x in dontSaveBroadcasters) {
		if(twinSidebar.box.getAttribute('sidebarcommand') == dontSaveBroadcasters[x]) {
			closeSidebar(twinSidebar);
		}
	}
	
	setBroadcastersTwin(false);
	
	if(!UNLOADED && twinSidebar.isOpen) {
		_sidebarCommandTwin = twinSidebar.box.getAttribute('sidebarcommand');
	}
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, "twin", null,
		function(window) {
			window[objName].loadedTwin();
		},
		function(window) {
			window[objName].unloadedTwin();
		}
	);
	
	twinTriggers.__defineGetter__('twinButton', function() { return twinSidebar.button; });
	blankTriggers.__defineGetter__('twinButton', function() { return twinSidebar.button; });
};

moduleAid.UNLOADMODULE = function() {
	delete twinTriggers.twinButton;
	delete blankTriggers.twinButton;
	
	listenerAid.remove(twinSidebar.sidebar, 'DOMContentLoaded', setlastTwin, true);
	
	objectWatcher.removeAttributeWatcher(twinSidebar.box, 'width', watchWidth);
	
	overlayAid.removeOverlayWindow(window, "twin");
};
