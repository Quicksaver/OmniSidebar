moduleAid.VERSION = '1.3.3';

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
	get closed () { return this.box.hidden || this.box.collapsed; },
	get splitter () { return $('sidebar-splitter'); },
	get header () { return $('sidebar-header'); },
	get box () { return $('sidebar-box'); },
	get resizeBox () { return $(objName+'-resizebox'); },
	get resizer () { return $(objName+'-resizer'); },
	get sidebar () { return $('sidebar'); },
	get title () { return $('sidebar-title'); },
	get titleButton () { return !prefAid.hideheadertitle && prefAid.titleButton; },
	get docker () { return $(objName+'-dock_button'); },
	get toolbar () { return $(objName+'-Toolbar'); },
	get toolbarBroadcaster () { return $(objName+'-toggleSideToolbar'); },
	get stack () { return $(objName+'-stackSidebar'); },
	get button () { return $(objName+'-button'); },
	get close () { return this.header ? this.header.querySelectorAll('toolbarbutton.tabs-closebutton')[0] : null; },
	get width () {
		if(this.box) {
			var width = this.box.getAttribute('width');
			if(!width || width == '0' || width == 'NaN') {
				width = (!width) ? 300 : Math.max(this.box.clientWidth, prefAid.minSidebarWidth) || 300;
				this.box.setAttribute('width', width);
			}
			return parseInt(width);
		}
		return null;
	},
	get lastCommand () { return prefAid.lastcommand; },
	set lastCommand (v) { return prefAid.lastcommand = v; },
	lastCommandReset: function() { return prefAid.reset('lastcommand'); },
	get useSwitch () { return prefAid.useSwitch; },
	get keysetPanel () { return prefAid.mainKeysetPanel; },
	get above () { return prefAid.renderabove; },
	get autoHide () { return prefAid.autoHide; },
	get autoClose () { return prefAid.autoClose; },
	get switcher () { return $(objName+'-switch'); },
	toggleSwitcher: function() {
		hideIt(this.switcher, this.useSwitch || (this.above && this.autoHide && !this.closed));
	},
	get goURI () { return $(objName+'-viewURISidebar'); },
	get goURIButton () { return $(objName+'-uri_sidebar_button'); }
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
	get closed () { return this.box.hidden || this.box.collapsed; },
	get splitter () { return $(objName+'-sidebar-splitter-twin'); },
	get header () { return $(objName+'-sidebar-header-twin'); },
	get box () { return $(objName+'-sidebar-box-twin'); },
	get resizeBox () { return $(objName+'-resizebox-twin'); },
	get resizer () { return $(objName+'-resizer-twin'); },
	get sidebar () { return $(objName+'-sidebar-twin'); },
	get title () { return $(objName+'-sidebar-title-twin'); },
	get titleButton () { return !prefAid.hideheadertitleTwin && prefAid.titleButtonTwin; },
	get docker () { return $(objName+'-dock_button-twin'); },
	get toolbar () { return $(objName+'-Toolbar-twin'); },
	get toolbarBroadcaster () { return $(objName+'-toggleSideToolbar-twin'); },
	get stack () { return $(objName+'-stackSidebar-twin'); },
	get button () { return $(objName+'-button-twin'); },
	get close () { return this.header ? this.header.querySelectorAll('toolbarbutton.tabs-closebutton')[0] : null; },
	get width () {
		if(this.box) {
			var width = this.box.getAttribute('width');
			if(!width || width == '0' || width == 'NaN') {
				width = (!width) ? 300 : Math.max(this.box.clientWidth, prefAid.minSidebarWidth) || 300;
				this.box.setAttribute('width', width);
			}
			return parseInt(width);
		}
		return null;
	},
	get lastCommand () { return prefAid.lastcommandTwin; },
	set lastCommand (v) { return prefAid.lastcommandTwin = v; },
	lastCommandReset: function() { return prefAid.reset('lastcommandTwin'); },
	get useSwitch () { return prefAid.useSwitchTwin; },
	get keysetPanel () { return prefAid.twinKeysetPanel; },
	get above () { return prefAid.renderaboveTwin; },
	get autoHide () { return prefAid.autoHideTwin; },
	get autoClose () { return prefAid.autoCloseTwin; },
	get switcher () { return $(objName+'-switch-twin'); },
	toggleSwitcher: function() {
		hideIt(this.switcher, this.useSwitch || (this.above && this.autoHide && !this.closed));
	},
	get goURI () { return $(objName+'-viewURISidebar-twin'); },
	get goURIButton () { return $(objName+'-uri_sidebar_button-twin'); }
};

this.__defineGetter__('leftSidebar', function() { return !prefAid.moveSidebars ? mainSidebar : twinSidebar; });
this.__defineGetter__('rightSidebar', function() { return prefAid.moveSidebars ? mainSidebar : twinSidebar; });

this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('toggleSidebar', function() { return window.toggleSidebar; });
this.__defineSetter__('toggleSidebar', function(v) { return window.toggleSidebar = v; });
this.__defineGetter__('fireSidebarFocusedEvent', function() { return window.fireSidebarFocusedEvent; });
this.__defineSetter__('fireSidebarFocusedEvent', function(v) { return window.fireSidebarFocusedEvent = v; });
this.__defineGetter__('sidebarOnLoad', function() { return window.sidebarOnLoad; });
this.__defineSetter__('sidebarOnLoad', function(v) { return window.sidebarOnLoad = v; });
this.__defineGetter__('browser', function() { return $('browser'); });

this.__defineGetter__('moveLeft', function() {
	if(typeof(moveLeftBy) == 'undefined') { return 0; }
	var ret = 0;
	for(var x in moveLeftBy) {
		ret += moveLeftBy[x];
	}
	return ret;
});
this.__defineGetter__('moveRight', function() {
	if(typeof(moveRightBy) == 'undefined') { return 0; }
	var ret = 0;
	for(var x in moveRightBy) {
		ret += moveRightBy[x];
	}
	return ret;
});

// Dummy methods that will be properly replaced by the corresponding modules when they are loaded
this.buttonLabels = function(btn, onLoad) {
	if(UNLOADED) { return; }
	if(toggleButtons()) { buttonLabels(btn, onLoad); }
};

// Toggle modules
this.toggleButtons = function() {
	return moduleAid.loadIf('buttons', mainSidebar.button || twinSidebar.button || Australis && customizing);
};

this.toggleTwin = function() {
	moduleAid.loadIf('twin', prefAid.twinSidebar);
};

// Adds 'inSidebar' and "glassStyle" class tags to the opened page for easier costumization
this.setclass = function(bar) {
	if(!bar) { return; } // failsafe, could happen if a sidebar is closing when this is triggered
	
	if(typeof(bar.contentDocument) != 'undefined') { // Fix for newly created profiles (unloaded sidebars)
		if(!UNLOADED) {
			if(!bar.contentDocument.documentElement.classList.contains('inSidebar')) {
				bar.contentDocument.documentElement.classList.add('inSidebar');
			}
			if(prefAid.glassStyle && !bar.contentDocument.documentElement.classList.contains('glassStyle')) {
				bar.contentDocument.documentElement.classList.add('glassStyle');
			} else if(!prefAid.glassStyle && bar.contentDocument.documentElement.classList.contains('glassStyle')) {
				bar.contentDocument.documentElement.classList.remove('glassStyle');
			}
		} else {
			bar.contentDocument.documentElement.classList.remove('inSidebar');
			bar.contentDocument.documentElement.classList.remove('glassStyle');
		}
	}
};

this.setClasses = function() {
	setclass(mainSidebar.sidebar);
	setclass(twinSidebar.sidebar);
};

this.closeSidebar = function(bar, forceUnload, broadcaster) {
	if(forceUnload === undefined) { forceUnload = true; }
	
	dispatch(bar.sidebar.contentWindow, { type: 'SidebarClosed', cancelable: false });
	
	if(!broadcaster && bar.box.getAttribute('sidebarcommand')) {
		broadcaster = $(bar.box.getAttribute('sidebarcommand'));
	}
	if(broadcaster && broadcaster.localName == 'broadcaster') {
		broadcaster.removeAttribute('checked');
		broadcaster.removeAttribute('twinSidebar');
	}
	
	if(!prefAid.keepLoaded || forceUnload || UNLOADED || !dispatch(bar, { type: 'ShouldCollapseSidebar' })) {
		bar.sidebar.setAttribute("src", "about:blank");
		if(bar.sidebar.docShell) { bar.sidebar.docShell.createAboutBlankContentViewer(null); }
		bar.title.value = "";
		bar.box.setAttribute("sidebarcommand", "");
		bar.box.hidden = true;
		hideIt(bar.box, true);
	}
	else {
		hideIt(bar.box);
	}
	
	bar.splitter.hidden = true;
	buttonLabels(bar.button);
};

this.reUnloadMain = function() {
	if(mainSidebar.box.collapsed) {
		closeSidebar(mainSidebar);
	}
};

// Opens the sidebars last opened page if its closed and should be open, to be called on startup
this.openLast = function(bar) {
	if(bar.box.getAttribute('sidebarcommand')) {
		if($(bar.box.getAttribute('sidebarcommand'))
		&& $(bar.box.getAttribute('sidebarcommand')).localName == 'broadcaster'
		&& !trueAttribute($(bar.box.getAttribute('sidebarcommand')), 'disabled')) {
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
	&& !trueAttribute($(bar.box.getAttribute('sidebarcommand')), 'disabled')) {
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
	|| trueAttribute($(bar.lastCommand), 'disabled')) {
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
				setAttribute(broadcasters[i], 'oncommand', 'toggleSidebar(this);');
			}
			objectWatcher.addAttributeWatcher(broadcasters[i], 'disabled', setlast);
		}
		else if(!initialize) {
			if(broadcasters[i]._oncommand) {
				setAttribute(broadcasters[i], 'oncommand', broadcasters[i]._oncommand);
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

this.watchWidth = function(box, attr, oldW, newW) {
	// Reject the change if it's invalid
	if(!newW || newW == '0' || newW == 'NaN') { return false; }
	
	var width = box.getAttribute('width');
	if(!width || width == '0' || width == 'NaN') {
		width = (!width) ? 300 : Math.max(box.clientWidth, prefAid.minSidebarWidth) || 300;
		box.setAttribute('width', width);
	}
	
	widthChanged(box == mainSidebar.box, box == twinSidebar.box);
	return true;
};

this.widthChanged = function(main, twin) {
	var box = main ? mainSidebar.box : twin ? twinSidebar.box : null;
	if(!box) { return; }
	
	timerAid.init('boxResize_'+box.id, function() {
		dispatch(box, { type: 'sidebarWidthChanged', cancelable: false, detail: { bar: (twin) ? twinSidebar : mainSidebar } });
	}, 500);
};

this.browserResized = function(e) {
	browserMinWidth(e); // this needs to be immediate, so the browser width never goes below these values
	
	// The listeners to this event aren't very heavy (so far at least), it doesn't slow down the resizing of the windows when I set the delay to 0.
	timerAid.init('browserResized', function() {
		dispatch(browser, { type: 'browserResized', cancelable: false });
	}, 0);
};

// this simulates the default browser behavior when the sidebars are docked
this.browserMinWidth = function(e) {
	var minWidth = prefAid.minSpaceBetweenSidebars;
	if(mainSidebar.width && !mainSidebar.closed) { minWidth += mainSidebar.width; }
	if(twinSidebar.width && !twinSidebar.closed) { minWidth += twinSidebar.width; }
	$('main-window').style.minWidth = minWidth+'px';
	
	if(e && e.type && e.type == 'endToggleSidebar' && $('main-window').clientWidth < minWidth) {
		window.resizeBy(0, 0); // The values don't matter as minWidth takes precedence
	}
};

this.clickSwitcher = function(e, bar) {
	if(dispatch(bar.switcher, { type: 'clickedSwitcher', detail: { bar: bar, clickEvent: e } })
	&& trueAttribute(bar.switcher, 'enabled')
	&& shouldFollowCommand(bar.switcher, bar.twin, e)
	&& e.button == 0) {
		toggleSidebar(bar.switcher);
	}
};

// This makes it so we can scroll the webpage and the sidebar while the mouse is over the switch, while still able to click on it
this.scrollSwitcher = function(e) {
	if(!e.target.classList.contains('omnisidebar_switch') || e.defaultPrevented) { return; }
	
	setAttribute(e.target, 'scrolling', 'true');
	timerAid.init('scrollSwitcher', restoreSwitcherMouseEvents, 150);
};

this.restoreSwitcherMouseEvents = function() {
	removeAttribute(mainSidebar.switcher, 'scrolling');
	removeAttribute(twinSidebar.switcher, 'scrolling');
};

this.setSwitcherOffset = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('switcherOffset_'+_UUID);
	
	// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
	// I'm not supporting other versions of OSX, just this one isn't simple as it is
	var moveBy = (Services.appinfo.OS != 'WINNT') ? -1 : 0;
	var leftOffset = moveBy +moveLeft;
	var rightOffset = moveBy +moveRight;
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(ltr):not([movetoright]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(ltr)[movetoleft],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(rtl)[movetoright],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(rtl):not([movetoleft]) {\n';
	sscode += '		left: '+leftOffset+'px !important;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(ltr)[movetoright],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(ltr):not([movetoleft]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(rtl):not([movetoright]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(rtl)[movetoleft] {\n';
	sscode += '		right: '+rightOffset+'px !important;\n';
	sscode += '	}\n';
	
	sscode += '}';
	
	styleAid.load('switcherOffset_'+_UUID, sscode, true);
};

this.setSwitcherHeight = function() {
	var moveBy = $('main-window').getAttribute('sizemode') == 'normal' ? +1 : 0;
	// I can't set these by css, cpu usage goes through the roof?!
	if(mainSidebar.switcher) { mainSidebar.switcher.style.height = $('appcontent').clientHeight +moveBy +'px'; }
	if(twinSidebar.switcher) { twinSidebar.switcher.style.height = $('appcontent').clientHeight +moveBy +'px'; }
};

this.setSwitcherWidth = function() {
	var width = (Services.appinfo.OS == 'WINNT') ? 3 : (Services.appinfo.OS == 'Darwin') ? 8 : 4;
	width += prefAid.switcherAdjust;
	
	styleAid.unload('switcherWidth_'+_UUID);
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	.omnisidebar_switch { width: '+width+'px; }\n';
	sscode += '}';
	
	styleAid.load('switcherWidth_'+_UUID, sscode, true);
};

this.enableSwitcher = function(bar) {
	toggleAttribute(bar.switcher, 'enabled', bar.useSwitch);
	setSwitcherHeight();
	bar.toggleSwitcher();
	
	listenerAid.add(bar.switcher, 'wheel', scrollSwitcher, true);
};

this.enableMainSwitcher = function() {
	enableSwitcher(mainSidebar);
};

// Our command method for the keyboard shortcuts
this.keysetCommand = function(twin, cmd) {
	var bar = (twin) ? twinSidebar : mainSidebar;
	if(!bar.keysetPanel || shouldFollowCommand(null, twin)) {
		$(objName+'-'+cmd).doCommand();
	}
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
// object of elements or parent elements that should reload the sidebar if it's already opened and forceOpen is true
this.forceReloadTriggers = {};

// toggleSidebar(), fireSidebarFocusedEvent() and sidebarOnLoad() modified for use with two sidebars
this.toggleOmniSidebar = function(commandID, forceOpen, twin, forceUnload, forceBlank, forceBarSwitch, forceReload) {
	// Always make sure we hide our popup
	hidePanel();
	
	if(customizing) { return false; }
	
	if(!forceOpen) { forceOpen = false; }
	if(!twin) { twin = false; }
	if(!forceUnload) { forceUnload = false; }
	if(!forceBlank) { forceBlank = false; }
	if(!forceBarSwitch) { forceBarSwitch = false; }
	if(!forceReload) { forceReload = false; }
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
		
		if(!forceReload && forceOpen) {
			for(var t in forceReloadTriggers) {
				if(isAncestor(commandID, forceReloadTriggers[t])) {
					forceReload = true;
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
	if(!sidebarBroadcaster) { return false; } // Prevent some unforseen error here
	
	if(!dispatch(bar.sidebar, { type: 'beginToggleSidebar', detail: {
		bar: bar,
		commandID: commandID,
		forceUnload: forceUnload,
		forceOpen: forceOpen,
		forceBlank: forceBlank,
		forceBarSwitch: forceBarSwitch,
		forceReload: forceReload
	} })) {
		return false;
	}
	
	// Can't let both sidebars display the same page, it becomes unstable
	if(trueAttribute(sidebarBroadcaster, "checked")
	&& prefAid.twinSidebar
	&& (	(!twin && trueAttribute(sidebarBroadcaster, 'twinSidebar'))
		|| (twin && !trueAttribute(sidebarBroadcaster, 'twinSidebar')))) {
			if(forceBlank) {
				bar.lastCommandReset();
				commandID = bar.lastCommand;
				sidebarBroadcaster = $(commandID);
				if(!sidebarBroadcaster) { return false; } // Prevent some unforseen error here
			} else {
				if(!toggleSidebar(commandID, false, !twin, true)) { return false; }
				if(!forceBarSwitch) { return true; }
			}
	}
	
	if(trueAttribute(sidebarBroadcaster, "checked")) {
		if(forceReload) {
			closeSidebar(bar, true, sidebarBroadcaster);
		}
		else {
			if(!forceOpen) {
				closeSidebar(bar, forceUnload, sidebarBroadcaster);
				
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
			return true;
		}
	}
	
	sidebarBroadcaster.setAttribute("checked", "true");
	toggleAttribute(sidebarBroadcaster, 'twinSidebar', twin);
	
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(var i=0; i<broadcasters.length; i++) {
		if(broadcasters[i] != sidebarBroadcaster
		&& ((!twin && !trueAttribute(broadcasters[i], 'twinSidebar')) || (twin && trueAttribute(broadcasters[i], 'twinSidebar')))) {
			broadcasters[i].removeAttribute("checked");
			broadcasters[i].removeAttribute('twinSidebar');
		}
	}
	bar.box.hidden = false;
	hideIt(bar.box, true);
	bar.splitter.hidden = false;
	
	buttonLabels(bar.button);
	
	var newTitle = sidebarBroadcaster.getAttribute("sidebartitle") || sidebarBroadcaster.getAttribute("label");
	var url = sidebarBroadcaster.getAttribute("sidebarurl");
	
	if(!prefAid.keepLoaded || forceUnload || bar.sidebar.getAttribute('src') != url) {
		bar.sidebar.setAttribute("src", url);
		bar.box.setAttribute("sidebarcommand", sidebarBroadcaster.id);
		bar.box.setAttribute("src", url);
		bar.title.value = newTitle;
		bar.title.setAttribute('value', newTitle); // Correct a bug where the title wouldn't show sometimes when starting firefox with the sidebar closed
	}
	
	if(!bar.sidebar.contentDocument || bar.sidebar.contentDocument.readyState != 'complete' || bar.sidebar.contentDocument.location.href != url) {
		listenerAid.add(bar.sidebar, "load", sidebarOnLoad, true, true);
	} else {
		fireSidebarFocusedEvent(twin);
	}
	
	dispatch(bar.sidebar, { type: 'endToggleSidebar', cancelable: false, detail: { bar: bar } });
	return true;
};

this.fireOmniSidebarFocusedEvent = function(twin) {
	var bar = (twin) ? twinSidebar : mainSidebar;
	aSync(function() { dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocused', cancelable: false, detail: { bar: bar } }); });
};

this.omniSidebarOnLoad = function(e) {
	var target = e.currentTarget;
	fireSidebarFocusedEvent(twinSidebar.sidebar && target == twinSidebar.sidebar);
};

this.fireFocusedSyncEvent = function(e) {
	var bar = e.currentTarget == twinSidebar.sidebar ? twinSidebar : mainSidebar;
	dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocusedSync', cancelable: false, detail: { bar: bar } });
};

this.loadMainSidebar = function() {
	mainSidebar.loaded = true;
	enableMainSwitcher();
	
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
	
	// The first time we install the add-on lets open the sidebar so the user knows something's changed
	if(prefAid.firstEnabled) {
		prefAid.firstEnabled = false;
		if(!mainSidebar.isOpen && mainSidebar.closed) {
			toggleSidebar('viewBookmarksSidebar');
		}
	}
};

this.unloadMainSidebar = function() {
	mainSidebar.loaded = false;
	
	listenerAid.remove(mainSidebar.switcher, 'wheel', scrollSwitcher, true);
	
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
	// This will be moved here in the future, when Australis hits release
	moduleAid.loadIf('australis', Australis);
	
	// We make a lot of assumptions in the code that the panel is always loaded, so never remove this from here
	moduleAid.load('miniPanel');
	
	moduleAid.load('compatibilityFix/windowFixes');
	
	overlayAid.overlayWindow(window, "mainSidebar", null, loadMainSidebar, unloadMainSidebar);
	setBroadcasters(true);
	
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
	
	objectWatcher.addAttributeWatcher(mainSidebar.box, 'width', watchWidth, true);
	
	listenerAid.add(window, 'sidebarWidthChanged', setSwitcherOffset);
	setSwitcherOffset();
	
	// Toggle modules
	prefAid.listen('useSwitch', enableMainSwitcher);
	prefAid.listen('twinSidebar', toggleTwin);
	
	moduleAid.load('headers');
	moduleAid.load('privateBrowsing');
	moduleAid.load('forceOpen');
	toggleTwin();
	
	// Apply initial preferences
	prefAid.listen('switcherAdjust', setSwitcherWidth);
	prefAid.listen('glassStyle', setClasses);
	prefAid.listen('keepLoaded', reUnloadMain);
	
	setSwitcherWidth();
	
	listenerAid.add(mainSidebar.sidebar, 'DOMContentLoaded', setlast, true);
	listenerAid.add(mainSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	listenerAid.add(window, 'beforecustomization', customize, false);
	listenerAid.add(window, 'aftercustomization', customize, false);
	
	// can't let the browser be resized below the dimensions of the sidebars
	browserMinWidth();
	listenerAid.add(browser, 'resize', browserResized);
	listenerAid.add(browser, 'browserResized', setSwitcherHeight);
	listenerAid.add(window, 'endToggleSidebar', browserResized);
	
	if(!mainSidebar.close._tooltiptext) {
		mainSidebar.close._tooltiptext = mainSidebar.close.getAttribute('tooltiptext');
		mainSidebar.close.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonCloseTooltip'));
	}
	
	blankTriggers.__defineGetter__('mainCommand', function() { return $(objName+'-cmd_mainSidebar'); });
	blankTriggers.__defineGetter__('mainSwitcher', function() { return mainSidebar.switcher; });
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED && mainSidebar.isOpen) {
		setclass(mainSidebar.sidebar);
	}
	
	delete blankTriggers.mainCommand;
	delete blankTriggers.mainSwitcher;
	
	if(mainSidebar.close._tooltiptext) {
		mainSidebar.close.setAttribute('tooltiptext', mainSidebar.close._tooltiptext);
		delete mainSidebar.close._tooltiptext;
	}
	
	listenerAid.remove(browser, 'resize', browserResized);
	listenerAid.remove(browser, 'browserResized', setSwitcherHeight);
	listenerAid.remove(window, 'endToggleSidebar', browserResized);
	$('main-window').style.minWidth = '';
	
	listenerAid.remove(window, 'beforecustomization', customize, false);
	listenerAid.remove(window, 'aftercustomization', customize, false);
	
	listenerAid.remove(mainSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	listenerAid.remove(mainSidebar.sidebar, 'DOMContentLoaded', setlast, true);
	
	prefAid.unlisten('switcherAdjust', setSwitcherWidth);
	prefAid.unlisten('glassStyle', setClasses);
	prefAid.unlisten('keepLoaded', reUnloadMain);
	
	reUnloadMain();
	
	styleAid.unload('switcherWidth_'+_UUID);
	
	listenerAid.remove(window, 'sidebarWidthChanged', setSwitcherOffset);
	
	objectWatcher.removeAttributeWatcher(mainSidebar.box, 'width', watchWidth, true);
	
	moduleAid.unload('twin');
	moduleAid.unload('forceOpen');
	moduleAid.unload('privateBrowsing');
	moduleAid.unload('headers');
	
	prefAid.unlisten('twinSidebar', toggleTwin);
	prefAid.unlisten('useSwitch', enableMainSwitcher);
	
	styleAid.unload('switcherOffset_'+_UUID);
	
	if(this.backups) {
		toggleSidebar = this.backups.toggleSidebar;
		fireSidebarFocusedEvent = this.backups.fireSidebarFocusedEvent;
		sidebarOnLoad = this.backups.sidebarOnLoad;
		delete this.backups;
	}
	
	setBroadcasters(false);
	overlayAid.removeOverlayWindow(window, "mainSidebar");
	
	moduleAid.unload('compatibilityFix/windowFixes');
	moduleAid.unload('miniPanel');
	moduleAid.unload('australis');
};
