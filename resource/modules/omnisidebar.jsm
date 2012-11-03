moduleAid.VERSION = '1.0.0';

this.customizing = false;

this.mainSidebar = {
	main: true,
	twin: false,
	loaded: false,
	get isOpen () {
		if(!this.box
		|| !this.box.getAttribute('sidebarcommand')
		|| !$(this.box.getAttribute('sidebarcommand'))
		|| $(this.box.getAttribute('sidebarcommand')).localName != 'broadcaster'
		|| $(this.box.getAttribute('sidebarcommand')).getAttribute('sidebarurl') != this.box.getAttribute('src')
		|| this.box.getAttribute('src') != this.sidebar.getAttribute('src')) {
			return false;
		}
		return true;
	},
	get splitter () { return $('sidebar-splitter'); },
	get header () { return $('sidebar-header'); },
	get box () { return $('sidebar-box'); },
	get resizeBox () { return $('omnisidebar_resizebox'); },
	get sidebar () { return $('sidebar'); },
	get title () { return $('sidebar-title'); },
	get docker () { return $('omnisidebar_dock_button'); },
	get toolbar () { return $('omnisidebarToolbar'); },
	get toolbarBroadcaster () { return $('toggleSideToolbar'); },
	get stack () { return $('stackSidebar'); },
	get button () { return $('omnisidebar_button'); },
	get close () { return this.header ? this.header.querySelectorAll('toolbarbutton.tabs-closebutton')[0] : null; },
	get width () { return this.box ? parseInt(this.box.getAttribute('width')) : null; },
	get lastCommand () { return prefAid.lastcommand; },
	set lastCommand (v) { return prefAid.lastcommand = v; },
	lastCommandReset: function() { return prefAid.reset('lastcommand'); },
	get above () { return prefAid.renderabove; },
	get undockMode () { return prefAid.undockMode; },
	get switcher () { return $('omnisidebar_switch'); },
	get goURI () { return $('viewURISidebar'); }
};

this.twinSidebar = {
	main: false,
	twin: true,
	loaded: false,
	get isOpen () {
		if(!this.box
		|| !this.box.getAttribute('sidebarcommand')
		|| !$(this.box.getAttribute('sidebarcommand'))
		|| $(this.box.getAttribute('sidebarcommand')).localName != 'broadcaster'
		|| $(this.box.getAttribute('sidebarcommand')).getAttribute('sidebarurl') != this.box.getAttribute('src')
		|| this.box.getAttribute('src') != this.sidebar.getAttribute('src')) {
			return false;
		}
		return true;
	},
	get splitter () { return $('sidebar-splitter-twin'); },
	get header () { return $('sidebar-header-twin'); },
	get box () { return $('sidebar-box-twin'); },
	get resizeBox () { return $('omnisidebar_resizebox-twin'); },
	get sidebar () { return $('sidebar-twin'); },
	get title () { return $('sidebar-title-twin'); },
	get docker () { return $('omnisidebar_dock_button-twin'); },
	get toolbar () { return $('omnisidebarToolbar-twin'); },
	get toolbarBroadcaster () { return $('toggleSideToolbar-twin'); },
	get stack () { return $('stackSidebar-twin'); },
	get button () { return $('omnisidebar_button-twin'); },
	get close () { return this.header ? this.header.querySelectorAll('toolbarbutton.tabs-closebutton')[0] : null; },
	get width () { return this.box ? parseInt(this.box.getAttribute('width')) : null; },
	get lastCommand () { return prefAid.lastcommandTwin; },
	set lastCommand (v) { return prefAid.lastcommandTwin = v; },
	lastCommandReset: function() { return prefAid.reset('lastcommandTwin'); },
	get above () { return prefAid.renderaboveTwin; },
	get undockMode () { return prefAid.undockModeTwin; },
	get switcher () { return $('omnisidebar_switch-twin'); },
	get goURI () { return $('viewURISidebar-twin'); }
};

this.__defineGetter__('toggleSidebar', function() { return window.toggleSidebar; });
this.__defineSetter__('toggleSidebar', function(v) { return window.toggleSidebar = v; });
this.__defineGetter__('fireSidebarFocusedEvent', function() { return window.fireSidebarFocusedEvent; });
this.__defineSetter__('fireSidebarFocusedEvent', function(v) { return window.fireSidebarFocusedEvent = v; });
this.__defineGetter__('sidebarOnLoad', function() { return window.sidebarOnLoad; });
this.__defineSetter__('sidebarOnLoad', function(v) { return window.sidebarOnLoad = v; });

// Dummy methods that will be properly replaced by the corresponding modules when they are loaded
this.buttonLabels = function(btn, onLoad) {
	if(UNLOADED) { return; }
	if(toggleButtons()) { buttonLabels(btn, onLoad); }
};

// Toggle modules
this.toggleButtons = function() {
	return moduleAid.loadIf('buttons', mainSidebar.button || twinSidebar.button);
};

this.toggleTwin = function() {
	moduleAid.loadIf('twin', prefAid.twinSidebar);
};

// Adds an 'insidebar' class tag to the opened page for easier costumization
this.setclass = function(bar) {
	if(typeof(bar.contentDocument) != 'undefined') { // Fix for newly created profiles (unloaded sidebars)
		if(!UNLOADED && !bar.contentDocument.documentElement.classList.contains('inSidebar')) {
			bar.contentDocument.documentElement.classList.add('inSidebar');
		} else if(UNLOADED) {
			bar.contentDocument.documentElement.classList.remove('inSidebar');
		}
	}
};

this.closeSidebar = function(bar, broadcaster) {
	dispatch(bar.sidebar.contentWindow, { type: 'SidebarClosed', cancelable: false });
	
	if(!broadcaster && bar.box.getAttribute('sidebarcommand')) {
		broadcaster = $(bar.box.getAttribute('sidebarcommand'));
	}
	if(broadcaster && broadcaster.localName == 'broadcaster') {
		broadcaster.removeAttribute('checked');
		broadcaster.removeAttribute('twinSidebar');
	}
	
	bar.sidebar.setAttribute("src", "about:blank");
	if(bar.sidebar.docShell) { bar.sidebar.docShell.createAboutBlankContentViewer(null); }
	bar.title.value = "";
	bar.box.setAttribute("sidebarcommand", "");
	bar.box.hidden = true;
	bar.splitter.hidden = true;
	
	buttonLabels(bar.button);
};

// Opens the sidebars last opened page if its closed and should be open, to be called on startup
this.openLast = function(bar) {
	if(bar.box.getAttribute('sidebarcommand')) {
		if($(bar.box.getAttribute('sidebarcommand'))
		&& $(bar.box.getAttribute('sidebarcommand')).localName == 'broadcaster'
		&& $(bar.box.getAttribute('sidebarcommand')).getAttribute('disabled') != 'true') {
			if(dispatch(bar.box, { type: 'willOpenLast', detail: { bar: bar } })) {
				toggleSidebar($(bar.box.getAttribute('sidebarcommand')), true, bar.twin);
				return true;
			}
			return false;
		}
		closeSidebar(bar);
	}
	return false;
};

// omnisidebar button opens the last sidebar opened
this.setlast = function() {
	setLastCommand(mainSidebar);
};

this.setLastCommand = function(bar) {
	if(bar.box.getAttribute('sidebarcommand') 
	&& $(bar.box.getAttribute('sidebarcommand'))
	&& $(bar.box.getAttribute('sidebarcommand')).localName == 'broadcaster'
	&& $(bar.box.getAttribute('sidebarcommand')).getAttribute('disabled') != 'true') {
		var saveCommand = true;
		for(var x in dontSaveBroadcasters) {
			if(dontSaveBroadcasters[x] == bar.box.getAttribute('sidebarcommand')) {
				saveCommand = false;
				break;
			}
		}
		if(saveCommand) {
			bar.lastCommand = bar.box.getAttribute('sidebarcommand');
		}
		
		if(bar.isOpen) {
			aSync(function() { setclass(bar.sidebar); }); // aSync to see if it resolves a problem of not inserting the class tag sometimes
		}
		return;
	}
	else if(!$(bar.lastCommand)
	|| $(bar.lastCommand).localName != 'broadcaster'
	|| $(bar.lastCommand).getAttribute('disabled') == 'true') {
		bar.lastCommandReset();
		closeSidebar(bar);
		
		if($(bar.lastCommand) && $(bar.lastCommand).localName == 'broadcaster') {
			$(bar.lastCommand).removeAttribute('checked');
			$(bar.lastCommand).removeAttribute('twinSidebar');
		}
	}
};

// this redefines broadcasters oncommand attribute to pass themselves as (obj) this to toggleSidebar() instead of just its command id string
this.setBroadcasters = function(initialize) {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i = 0; i < broadcasters.length; ++i) {
		if(initialize) {
			if(!broadcasters[i]._oncommand) {
				broadcasters[i]._oncommand = broadcasters[i].getAttribute('oncommand');
				broadcasters[i].setAttribute('oncommand', 'toggleSidebar(this);');
			}
			objectWatcher.addAttributeWatcher(broadcasters[i], 'disabled', setlast);
		}
		else if(!initialize) {
			if(broadcasters[i]._oncommand) {
				broadcasters[i].setAttribute('oncommand', broadcasters[i]._oncommand);
				delete broadcasters[i]._oncommand;
			}
			objectWatcher.removeAttributeWatcher(broadcasters[i], 'disabled', setlast);
		}
	}
};

// handler for entering and leaving the toolbar customize window
this.customize = function(e) {
	customizing = e.type == 'beforecustomization';
	if(customizing || toggleButtons()) {
		buttonLabels(mainSidebar.button);
		buttonLabels(twinSidebar.button);
	}
	
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i=0; i<broadcasters.length; i++) {
		if(customizing) {
			broadcasters[i].removeAttribute("checked");
			broadcasters[i].removeAttribute('twinSidebar');
		} else if(mainSidebar.box && broadcasters[i].id == mainSidebar.box.getAttribute('sidebarcommand')) {
			broadcasters[i].setAttribute("checked", 'true');
		} else if(twinSidebar.box && broadcasters[i].id == twinSidebar.box.getAttribute('sidebarcommand')) {
			broadcasters[i].setAttribute('checked', 'true');
			broadcasters[i].setAttribute('twinSidebar', 'true');
		}
	}
};

this.watchWidth = function(box) {
	var width = box.getAttribute('width');
	if(!width || width == '0') { 
		width = box.clientWidth || box == mainSidebar.box ? Globals.mainWidth : box == twinSidebar.box ? Globals.twinWidth : false || 300;
		box.setAttribute('width', width);
	}
	if(box == mainSidebar.box) { Globals.mainWidth = parseInt(width); }
	else if(box == twinSidebar.box) { Globals.twinWidth = parseInt(width); }
	
	windowMediator.callOnAll(function(aWindow) {
		aWindow[objName].widthChanged(box == mainSidebar.box, box == twinSidebar.box);
	}, 'navigator:browser');
};

this.widthChanged = function(main, twin) {
	var box = main ? mainSidebar.box : twin ? twinSidebar.box : null;
	if(!box) { return; }
	
	box.setAttribute('width', main ? Globals.mainWidth : twin ? Globals.twinWidth : null);
	timerAid.init('boxResize_'+box.id, function() {
		dispatch(box, { type: 'sidebarWidthChanged', cancelable: false, detail: { bar: (twin) ? twinSidebar : mainSidebar } });
	}, 500);
};

// object of broadcaster id's that shouldn't be saved between sessions
this.dontSaveBroadcasters = {};
// object of broadcaster id's that may be added after the sidebars are loaded
this.holdBroadcasters = {};

// object of elements or parent elements that only open the sidebar and don't close it
this.forceOpenTriggers = {};
// object of elements or parent elements that trigger the twin sidebar by default
this.twinTriggers = {};
// object of elements or parent elements that force the sidebar to open about:blank in case the command triggered is already opened on the other sidebar
this.blankTriggers = {};
// object of elements or parent elements that force the sidebar to open in case the command triggered is already opened on the other sidebar, after closing it
this.barSwitchTriggers = {};

// toggleSidebar(), fireSidebarFocusedEvent() and sidebarOnLoad() modified for use with two sidebars
this.toggleOmniSidebar = function(commandID, forceOpen, twin, forceBlank, forceBarSwitch) {
	if(customizing) { return; }
	
	if(!forceOpen) { forceOpen = false; }
	if(!twin) { twin = false; }
	if(!forceBlank) { forceBlank = false; }
	if(!forceBarSwitch) { forceBarSwitch = false; }
	var bar = (twin) ? twinSidebar : mainSidebar;
	
	if(!commandID) {
		commandID = bar.box.getAttribute("sidebarcommand") || bar.lastCommand;
	}
	else if(typeof(commandID) != "string") {
		if(!forceOpen) {
			for(var t in forceOpenTriggers) {
				if(isAncestor(commandID, forceOpenTriggers[t])) {
					forceOpen = true;
					break;
				}
			}
		}
		
		if(!twin) {
			for(var t in twinTriggers) {
				if(isAncestor(commandID, twinTriggers[t])) {
					twin = true;
					bar = twinSidebar;
					break;
				}
			}
		}
		
		if(!forceBlank) {
			for(var t in blankTriggers) {
				if(isAncestor(commandID, blankTriggers[t])) {
					forceBlank = true;
					commandID = bar.box.getAttribute("sidebarcommand") || bar.lastCommand;
					break;
				}
			}
		}
		
		if(!forceBlank && !forceBarSwitch) {
			for(var t in barSwitchTriggers) {
				if(isAncestor(commandID, barSwitchTriggers[t])) {
					forceBarSwitch = true;
					break;
				}
			}
		}
		
		if(typeof(commandID) != "string") {
			while(commandID && commandID.localName != 'broadcaster' && commandID.getAttribute('observes')) {
				commandID = $(commandID.getAttribute('observes'));
			}
			commandID = commandID.id;
		}
	}
	
	var sidebarBroadcaster = $(commandID);
	if(!sidebarBroadcaster) { return; } // Prevent some unforseen error here
	
	if(!dispatch(bar.sidebar, { type: 'beginToggleSidebar', detail: { bar: bar } })) { return; }
	
	// Can't let both sidebars display the same page, it becomes unstable
	if(sidebarBroadcaster.getAttribute("checked") == "true"
	&& prefAid.twinSidebar
	&& (	(!twin && sidebarBroadcaster.getAttribute('twinSidebar') == 'true')
		|| (twin && sidebarBroadcaster.getAttribute('twinSidebar') != 'true'))) {
			if(forceBlank) {
				bar.lastCommandReset();
				commandID = bar.lastCommand;
				sidebarBroadcaster = $(commandID);
				if(!sidebarBroadcaster) { return; } // Prevent some unforseen error here
			} else {
				toggleSidebar(commandID, false, !twin);
				if(!forceBarSwitch) {
					return;
				}
			}
	}
	
	if(sidebarBroadcaster.getAttribute("checked") == "true") {
		if(!forceOpen) {
			closeSidebar(bar, sidebarBroadcaster);
			
			if(dispatch(bar.sidebar, { type: 'closedSidebar', detail: { bar: bar } })) {
				if(window.content) {
					try { window.content.focus(); }
					catch(ex) { window.gBrowser.selectedBrowser.focus(); }
				} else {
					window.gBrowser.selectedBrowser.focus();
				}
			}
		} else {
			fireSidebarFocusedEvent(twin);
		}
		
		dispatch(bar.sidebar, { type: 'endToggleSidebar', cancelable: false, detail: { bar: bar } });
		return;
	}
	
	sidebarBroadcaster.setAttribute("checked", "true");
	toggleAttribute(sidebarBroadcaster, 'twinSidebar', twin);
	
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i=0; i<broadcasters.length; i++) {
		if(broadcasters[i] != sidebarBroadcaster
		&& ((!twin && broadcasters[i].getAttribute('twinSidebar') != 'true') || (twin && broadcasters[i].getAttribute('twinSidebar') == 'true'))) {
			broadcasters[i].removeAttribute("checked");
			broadcasters[i].removeAttribute('twinSidebar');
		}
	}
	bar.box.hidden = false;
	bar.splitter.hidden = false;
	
	buttonLabels(bar.button);
	
	var newTitle = sidebarBroadcaster.getAttribute("sidebartitle") || sidebarBroadcaster.getAttribute("label");
	var url = sidebarBroadcaster.getAttribute("sidebarurl");
	
	bar.sidebar.setAttribute("src", url);
	bar.box.setAttribute("sidebarcommand", sidebarBroadcaster.id);
	bar.box.setAttribute("src", url);
	bar.title.value = newTitle;
	bar.title.setAttribute('value', newTitle); // Correct a bug where the title wouldn't show sometimes when starting firefox with the sidebar closed
	
	if(!bar.sidebar.contentDocument || bar.sidebar.contentDocument.readyState != 'complete' || bar.sidebar.contentDocument.location.href != url) {
		listenerAid.add(bar.sidebar, "load", sidebarOnLoad, true, true);
	} else {
		fireSidebarFocusedEvent(twin);
	}
	
	dispatch(bar.sidebar, { type: 'endToggleSidebar', cancelable: false, detail: { bar: bar } });
};

this.fireOmniSidebarFocusedEvent = function(twin) {
	var bar = (twin) ? twinSidebar : mainSidebar;
	dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocusedSync', cancelable: false, detail: { bar: bar } });
	aSync(function() { dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocused', cancelable: false, detail: { bar: bar } }); });
};

this.omniSidebarOnLoad = function(e) {
	var target = e.currentTarget;
	fireSidebarFocusedEvent(twinSidebar.sidebar && target == twinSidebar.sidebar);
};

this.loadMainSidebar = function() {
	mainSidebar.loaded = true;
	
	if(_sidebarCommand) {
		for(var b in holdBroadcasters) {
			if(holdBroadcasters[b] == _sidebarCommand) {
				return;
			}
		}
	}
	
	if(!openLast(mainSidebar) && _sidebarCommand) {
		toggleSidebar(_sidebarCommand);
	}
	_sidebarCommand = null;
};

this.unloadMainSidebar = function() {
	mainSidebar.loaded = false;
	
	for(var x in dontSaveBroadcasters) {
		if(mainSidebar.box.getAttribute('sidebarcommand') == dontSaveBroadcasters[x]) {
			closeSidebar(mainSidebar);
			return;
		}
	}
	
	if(!UNLOADED && mainSidebar.isOpen) {
		_sidebarCommand = mainSidebar.box.getAttribute('sidebarcommand');
	}
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	
	overlayAid.overlayWindow(window, "mainSidebar", null, loadMainSidebar, unloadMainSidebar);
	setBroadcasters(true);
	hideIt(mainSidebar.box, true);
	
	if(!this.backups) {
		this.backups = {
			toggleSidebar: toggleSidebar,
			fireSidebarFocusedEvent: fireSidebarFocusedEvent,
			sidebarOnLoad: sidebarOnLoad
		};
	}
	toggleSidebar = toggleOmniSidebar;
	fireSidebarFocusedEvent = fireOmniSidebarFocusedEvent;
	sidebarOnLoad = omniSidebarOnLoad;
	
	// I guess some add-ons can set these, they override the css set ones so we have to erase them
	mainSidebar.sidebar.style.maxWidth = '';
	mainSidebar.sidebar.style.minWidth = prefAid.minSidebarWidth+'px';
	mainSidebar.sidebar.style.width = '';
	
	Globals.mainWidth = mainSidebar.width;
	objectWatcher.addAttributeWatcher(mainSidebar.box, 'width', watchWidth);
	
	// Toggle modules
	prefAid.listen('twinSidebar', toggleTwin);
	
	moduleAid.load('headers');
	moduleAid.load('privateBrowsing');
	moduleAid.load('forceOpen');
	toggleTwin();
	
	// Apply initial preferences
	listenerAid.add(mainSidebar.sidebar, 'DOMContentLoaded', setlast, true);
	
	listenerAid.add(window, 'beforecustomization', customize, false);
	listenerAid.add(window, 'aftercustomization', customize, false);
	
	if(!mainSidebar.close._tooltiptext) {
		mainSidebar.close._tooltiptext = mainSidebar.close.getAttribute('tooltiptext');
		mainSidebar.close.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonCloseTooltip'));
	}
	
	blankTriggers.__defineGetter__('mainButton', function() { return mainSidebar.button; });
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED && mainSidebar.isOpen) {
		setclass(mainSidebar.sidebar);
	}
	
	delete blankTriggers.mainButton;
	
	if(mainSidebar.close._tooltiptext) {
		mainSidebar.close.setAttribute('tooltiptext', mainSidebar.close._tooltiptext);
		delete mainSidebar.close._tooltiptext;
	}
	
	listenerAid.remove(window, 'beforecustomization', customize, false);
	listenerAid.remove(window, 'aftercustomization', customize, false);
	
	listenerAid.remove(mainSidebar.sidebar, 'DOMContentLoaded', setlast, true);
	
	objectWatcher.removeAttributeWatcher(mainSidebar.box, 'width', watchWidth);
	
	moduleAid.unload('twin');
	moduleAid.unload('forceOpen');
	moduleAid.unload('privateBrowsing');
	moduleAid.unload('headers');
	
	prefAid.unlisten('twinSidebar', toggleTwin);
	
	if(this.backups) {
		toggleSidebar = this.backups.toggleSidebar;
		fireSidebarFocusedEvent = this.backups.fireSidebarFocusedEvent;
		sidebarOnLoad = this.backups.sidebarOnLoad;
		delete this.backups;
	}
	
	setBroadcasters(false);
	overlayAid.removeOverlayWindow(window, "mainSidebar");
	
	moduleAid.unload('compatibilityFix/windowFixes');
};
