Modules.VERSION = '3.0.8';

this.mainSidebar = {
	main: true,
	twin: false,
	_loaded: false,
	get loaded () { return this._loaded; },
	set loaded (v) {
		this._loaded = v;
		dispatch(this.box, { type: 'LoadedSidebar', cancelable: false, detail: v });
		return v;
	},
	autoHideInit: false,
	initialShowings: new Set(),
	contentFocused: false,
	holdFocused: false,
	get command () { return this.box && this.box.getAttribute('sidebarcommand'); },
	set command (v) { return setAttribute(this.box, 'sidebarcommand', v); },
	get isSocial () { return !this.box || this.box.getAttribute('origin') || (typeof(Social) != 'undefined' && isAncestor(Social.browser, this.box)); },
	get isOpen () {
		if(this.isSocial) { return true; }
		
		if(!this.command
		|| !$(this.command)
		|| $(this.command).localName != 'broadcaster'
		|| $(this.command).getAttribute('sidebarurl') != this.box.getAttribute('src')
		|| this.box.getAttribute('src') != this.sidebar.getAttribute('src')) {
			return false;
		}
		return true;
	},
	get focused () {
		return	this.sidebar && this.sidebar.contentWindow
			&& (document.commandDispatcher.focusedWindow == this.sidebar.contentWindow.content || document.commandDispatcher.focusedWindow == this.sidebar.contentWindow);
	},
	get closed () { return !this.box || this.box.hidden || this.box.collapsed; },
	get label () { return Strings.get('buttons', (Prefs.twinSidebar) ? 'buttonMainLabel' : 'buttonlabel'); },
	get splitter () { return $('sidebar-splitter'); },
	get header () { return $('sidebar-header'); },
	get box () { return $('sidebar-box'); },
	get resizeBox () { return $(objName+'-resizebox'); },
	get resizer () { return $(objName+'-resizer'); },
	get sidebar () { return $('sidebar'); },
	get titleNode () { return $('sidebar-title'); },
	get title () { return this.titleNode.value; },
	// both .value and setAttribute to fix a bug where the title wouldn't show sometimes when starting firefox with the sidebar closed
	set title (v) { this.titleNode.value = v; setAttribute(this.titleNode, 'value', v); return v; },
	get titleButton () { return Prefs.showheadertitle && Prefs.titleButton; },
	get docker () { return $(objName+'-dock_button'); },
	toolbarId: objName+'-Toolbar',
	get toolbar () { return $(this.toolbarId); },
	get stack () { return $(objName+'-stackSidebar'); },
	buttonId: objName+'-button',
	get button () { return $(this.buttonId); },
	get close () { return this.header ? $$('toolbarbutton.close-icon', this.header)[0] : null; },
	get width () {
		if(this.box) {
			var width = this.box.getAttribute('width');
			if(!width || width == '0' || width == 'NaN') {
				width = (!width) ? 300 : Math.max(this.box.clientWidth, Prefs.minSidebarWidth) || 300;
				this.box.setAttribute('width', width);
				document.persist(this.box.id, 'width');
			}
			return parseInt(width);
		}
		return null;
	},
	reUnload: function() {
		if(this.box.collapsed) {
			SidebarUI.close(this);
		}
	},
	_state: null,
	get state () {
		if(!this._state) {
			this.noPersist();
			
			var data = SessionStore.getWindowValue(window, objName+'.mainSidebar');
			
			// if this window doesn't have it's own state, use the state from the opener
			if(!data && window.opener && !window.opener.closed
			&& (!PrivateBrowsing.isPrivate(window) == PrivateBrowsing.isPrivate(window.opener) || Prefs.keepPrivate)) {
				data = SessionStore.getWindowValue(window.opener, objName+'.mainSidebar');
			}
			
			// fallback to a global pref value so the sidebar is rarely reset when it's not supposed to
			if(!data && (!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate)) {
				data = Prefs.lastStateMain;
			}
			
			if(data) {
				this._state = JSON.parse(data);
			} else {
				this._state = {
					command: objName+"-viewBlankSidebar",
					closed: true
				};
				this.saveState();
			}
		}
		
		return this._state;
	},
	set state (v) {
		this._state.command = v;
		this._state.closed = this.closed;
		this.saveState();
	},
	stateForceClosed: function(v) {
		this.state;
		this._state.closed = v;
		this.saveState();
	},
	stateForceCommand: function(v) {
		this.state;
		this._state.command = v;
		this.saveState();
	},
	saveState: function() {
		var stringified = JSON.stringify(this._state);
		if(!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate) {
			Prefs.lastStateMain = stringified;
		}
		return SessionStore.setWindowValue(window, objName+'.mainSidebar', stringified);
	},
	stateReset: function() {
		this._state = null;
		if(!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate) {
			Prefs.reset('lastStateMain');
		}
		SessionStore.deleteWindowValue(window, objName+'.mainSidebar');
	},
	noPersist: function() {
		// the native SidebarUI persists the attributes of sidebar-box,
		// which can cause the sidebar to open after restarting firefox when it's not supposed to
		if(Services.xulStore.hasValue(document.documentURI, 'sidebar-box', 'src')) {
			Services.xulStore.removeValue(document.documentURI, 'sidebar-box', 'src');
		}
		if(Services.xulStore.hasValue(document.documentURI, 'sidebar-box', 'sidebarcommand')) {
			Services.xulStore.removeValue(document.documentURI, 'sidebar-box', 'sidebarcommand');
		}
	},
	get keyset () { return mainKey; },
	get keysetPanel () { return Prefs.mainKeysetPanel; },
	get above () { return Prefs.renderabove; },
	get autoHide () { return Prefs.autoHide; },
	get autoClose () { return Prefs.autoClose; },
	get useSwitch () { return Prefs.useSwitch; },
	needSwitch: new Set(),
	get isSwitchNeeded () {
		return (this.needSwitch.size > 0);
	},
	get switcher () { return $(objName+'-switch'); },
	toggleSwitcher: function() {
		hideIt(this.switcher, this.useSwitch || (this.above && this.autoHide && !this.closed) || this.isSwitchNeeded);
	},
	get goURI () { return $(objName+'-viewURISidebar'); },
	get goURIButton () { return $(objName+'-uri_sidebar_button'); }
};

this.twinSidebar = {
	main: false,
	twin: true,
	_loaded: false,
	get loaded () { return this._loaded; },
	set loaded (v) {
		this._loaded = v;
		dispatch(this.box, { type: 'LoadedSidebar', cancelable: false, detail: v });
		return v;
	},
	autoHideInit: false,
	initialShowings: new Set(),
	contentFocused: false,
	holdFocused: false,
	get command () { return this.box && this.box.getAttribute('sidebarcommand'); },
	set command (v) { return setAttribute(this.box, 'sidebarcommand', v); },
	get isSocial () { return !this.box || this.box.getAttribute('origin') || (typeof(Social) != 'undefined' && isAncestor(Social.browser, this.box)); },
	get isOpen () {
		if(this.isSocial) { return true; }
		
		if(!this.command
		|| !$(this.command)
		|| $(this.command).localName != 'broadcaster'
		|| $(this.command).getAttribute('sidebarurl') != this.box.getAttribute('src')
		|| this.box.getAttribute('src') != this.sidebar.getAttribute('src')) {
			return false;
		}
		return true;
	},
	get focused () {
		return	this.sidebar && this.sidebar.contentWindow
			&& (document.commandDispatcher.focusedWindow == this.sidebar.contentWindow.content || document.commandDispatcher.focusedWindow == this.sidebar.contentWindow);
	},
	get closed () { return !this.box || this.box.hidden || this.box.collapsed; },
	get label () { return Strings.get('buttons', 'buttonTwinLabel'); },
	get splitter () { return $(objName+'-sidebar-splitter-twin'); },
	get header () { return $(objName+'-sidebar-header-twin'); },
	get box () { return $(objName+'-sidebar-box-twin'); },
	get resizeBox () { return $(objName+'-resizebox-twin'); },
	get resizer () { return $(objName+'-resizer-twin'); },
	get sidebar () { return $(objName+'-sidebar-twin'); },
	get titleNode () { return $(objName+'-sidebar-title-twin'); },
	get title () { return this.titleNode.value; },
	// both .value and setAttribute to fix a bug where the title wouldn't show sometimes when starting firefox with the sidebar closed
	set title (v) { this.titleNode.value = v; setAttribute(this.titleNode, 'value', v); return v; },
	get titleButton () { return Prefs.showheadertitleTwin && Prefs.titleButtonTwin; },
	get docker () { return $(objName+'-dock_button-twin'); },
	toolbarId: objName+'-Toolbar-twin',
	get toolbar () { return $(this.toolbarId); },
	get stack () { return $(objName+'-stackSidebar-twin'); },
	buttonId: objName+'-button-twin',
	get button () { return $(this.buttonId); },
	get close () { return this.header ? $$('toolbarbutton.close-icon', this.header)[0] : null; },
	get width () {
		if(this.box) {
			var width = this.box.getAttribute('width');
			if(!width || width == '0' || width == 'NaN') {
				width = (!width) ? 300 : Math.max(this.box.clientWidth, Prefs.minSidebarWidth) || 300;
				this.box.setAttribute('width', width);
			}
			return parseInt(width);
		}
		return null;
	},
	reUnload: function() {
		if(this.box.collapsed) {
			SidebarUI.close(this);
		}
	},
	_state: null,
	get state () {
		if(!this._state) {
			this.noPersist();
			
			var data = SessionStore.getWindowValue(window, objName+'.twinSidebar');
			
			// if this window doesn't have it's own state, use the state from the opener
			if(!data && window.opener && !window.opener.closed
			&& (!PrivateBrowsing.isPrivate(window) == PrivateBrowsing.isPrivate(window.opener) || Prefs.keepPrivate)) {
				data = SessionStore.getWindowValue(window.opener, objName+'.twinSidebar');
			}
			
			// fallback to a global pref value so the sidebar is rarely reset when it's not supposed to
			if(!data && (!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate)) {
				data = Prefs.lastStateTwin;
			}
			
			if(data) {
				this._state = JSON.parse(data);
			} else {
				this._state = {
					command: objName+"-viewBlankSidebar-twin",
					closed: true
				};
				this.saveState();
			}
		}
		
		return this._state;
	},
	set state (v) {
		this._state.command = v;
		this._state.closed = this.closed;
		this.saveState();
	},
	stateForceClosed: function(v) {
		this.state;
		this._state.closed = v;
		this.saveState();
	},
	stateForceCommand: function(v) {
		this.state;
		this._state.command = v;
		this.saveState();
	},
	saveState: function() {
		var stringified = JSON.stringify(this._state);
		if(!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate) {
			Prefs.lastStateTwin = stringified;
		}
		return SessionStore.setWindowValue(window, objName+'.twinSidebar', stringified);
	},
	stateReset: function() {
		this._state = null;
		if(!PrivateBrowsing.inPrivateBrowsing || Prefs.keepPrivate) {
			Prefs.reset('lastStateTwin');
		}
		SessionStore.deleteWindowValue(window, objName+'.twinSidebar');
	},
	noPersist: function() {
		// the native SidebarUI persists the attributes of sidebar-box,
		// which can cause the sidebar to open after restarting firefox when it's not supposed to
		if(Services.xulStore.hasValue(document.documentURI, objName+'-sidebar-box-twin', 'src')) {
			Services.xulStore.removeValue(document.documentURI, objName+'-sidebar-box-twin', 'src');
		}
		if(Services.xulStore.hasValue(document.documentURI, objName+'-sidebar-box-twin', 'sidebarcommand')) {
			Services.xulStore.removeValue(document.documentURI, objName+'-sidebar-box-twin', 'sidebarcommand');
		}
	},
	get keyset () { return twinKey; },
	get keysetPanel () { return Prefs.twinKeysetPanel; },
	get above () { return Prefs.renderaboveTwin; },
	get autoHide () { return Prefs.autoHideTwin; },
	get autoClose () { return Prefs.autoCloseTwin; },
	get useSwitch () { return Prefs.useSwitchTwin; },
	needSwitch: new Set(),
	get isSwitchNeeded () {
		return (this.needSwitch.size > 0);
	},
	get switcher () { return $(objName+'-switch-twin'); },
	toggleSwitcher: function() {
		hideIt(this.switcher, this.useSwitch || (this.above && this.autoHide && !this.closed) || this.isSwitchNeeded);
	},
	get goURI () { return $(objName+'-viewURISidebar-twin'); },
	get goURIButton () { return $(objName+'-uri_sidebar_button-twin'); }
};

this.sidebars = new Set([ mainSidebar, twinSidebar ]);
this.__defineGetter__('leftSidebar', function() { return (LTR != Prefs.moveSidebars) ? mainSidebar : twinSidebar; });
this.__defineGetter__('rightSidebar', function() { return (LTR == Prefs.moveSidebars) ? mainSidebar : twinSidebar; });

this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('browserBox', function() { return $('browser'); });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('SessionStore', function() { return window.SessionStore; });

this.moveLeftBy = {};
this.moveRightBy = {};
this.__defineGetter__('moveLeft', function() {
	var ret = 0;
	for(var x in moveLeftBy) {
		ret += moveLeftBy[x];
	}
	return ret;
});
this.__defineGetter__('moveRight', function() {
	var ret = 0;
	for(var x in moveRightBy) {
		ret += moveRightBy[x];
	}
	return ret;
});

this.handleEvent = function(e) {
	switch(e.type) {
		case 'SidebarFocused':
			// this is probably the event from the native SidebarUI that can be fired during startup, it doesn't really matter to us
			if(!e.detail) { return; }
			// no break;
			
		case 'SidebarFocusedSync':
			setClass(e.detail.bar);
			break;
		
		case 'endToggleSidebar':
			setLastCommand(e.detail.bar);
			browserResized(true);
			break;
		
		case 'beforecustomization':
			customize(true);
			break;
		
		case 'aftercustomization':
			customize(false);
			break;
		
		case 'resize':
			browserResized(false);
			break;
	}
};

this.observe = function(aSubject, aTopic, aData) {
	switch(aSubject) {
		case 'glassStyle':
			setClass(mainSidebar);
			setClass(twinSidebar);
			break;
		
		case 'keepLoaded':
			mainSidebar.reUnload();
			break;
		
		case 'useSwitch':
			switcher.enable(mainSidebar);
			break;
	}
};

this.attrWatcher = function(obj, prop, oldVal, newVal) {
	switch(prop) {
		case 'disabled':
			setLastCommand(mainSidebar);
			setLastCommand(twinSidebar);
			break;
		
		case 'width':
			// Reject the change if it's invalid
			if(!newVal || newVal == '0' || newVal == 'NaN') { return false; }
			
			var width = obj.getAttribute('width');
			if(!width || width == '0' || width == 'NaN') {
				width = (!width) ? 300 : Math.max(obj.clientWidth, Prefs.minSidebarWidth) || 300;
				obj.setAttribute('width', width);
			}
			
			var bar = (obj == mainSidebar.box) ? mainSidebar : (obj == twinSidebar.box) ? twinSidebar : null;
			if(bar) {
				document.persist(obj.id, 'width');
				
				Timers.init('boxResize_'+bar.box.id, function() {
					dispatch(bar.box, { type: 'sidebarWidthChanged', cancelable: false, detail: { bar: bar } });
				}, 500);
			}
			return true;
	}
};

// Adds 'inSidebar' and 'glassStyle' class tags to the opened page for easier costumization.
// I may overcall this function, but sometimes the sidebar wouldn't get these classes, and other times there would be a visible lag when applying the classes,
// so I'm jsut "always" placing these classes to prevent all of this.
this.setClass = function(bar) {
	if(!bar) { return; } // failsafe, could happen if a sidebar is closing when this is triggered
	
	if(bar.sidebar.contentDocument) { // Fix for newly created profiles (unloaded sidebars)
		if(!UNLOADED) {
			bar.sidebar.contentDocument.documentElement.classList.add('inSidebar');
			if(Prefs.glassStyle) {
				bar.sidebar.contentDocument.documentElement.classList.add('glassStyle');
			} else {
				bar.sidebar.contentDocument.documentElement.classList.remove('glassStyle');
			}
		} else {
			bar.sidebar.contentDocument.documentElement.classList.remove('inSidebar');
			bar.sidebar.contentDocument.documentElement.classList.remove('glassStyle');
		}
	}
};

// Opens the sidebars last opened page if its closed and should be open, to be called on startup
this.openLast = function(bar) {
	for(let id of SidebarUI.holdBroadcasters) {
		if(id == bar.state.command) { return; }
	}
	
	if(!bar.state.closed) {
		var lastBroadcaster = $(bar.state.command);
		if(lastBroadcaster && lastBroadcaster.localName == 'broadcaster' && !trueAttribute(lastBroadcaster, 'disabled')) {
			// make sure nothing triggers the SidebarFocused event too soon (i.e. renderAbove), so that the correct panel is loaded and (not) focused during startup
			bar.holdFocused = true;
			
			SidebarUI.toggle(lastBroadcaster, true, bar.twin).then(toggled => {
				// ensure the focus is on content at startup/opening new window
				if(toggled) {
					// ensure we don't lock the SidebarFocused event forever, in case something goes wrong
					aSync(function() {
						try { bar.holdFocused = false; } catch(ex) {}
					}, 5000);
					
					Listeners.add(bar.sidebar, "SidebarFocused", function() {
						bar.holdFocused = false;
						if(bar.focused) {
							SidebarUI.focusContent(window.gBrowserInit._getUriToLoad());
						}
					}, false, true);
				}
			});
			return;
		}
		SidebarUI.close(bar);
	}
	else if(bar.isOpen
	&& (bar.state.command == bar.command || (PrivateBrowsing.inPrivateBrowsing && !Prefs.keepPrivate))) {
		SidebarUI.close(bar);
	}
};

// omnisidebar button opens the last sidebar opened
this.setLastCommand = function(bar) {
	if(bar.command 
	&& $(bar.command)
	&& $(bar.command).localName == 'broadcaster'
	&& !trueAttribute($(bar.command), 'disabled')) {
		var saveCommand = true;
		for(let id of SidebarUI.dontSaveBroadcasters) {
			if(id == bar.command) {
				saveCommand = false;
				break;
			}
		}
		if(saveCommand) {
			bar.state = bar.command;
		}
		setClass(bar);
		aSync(function() { setClass(bar); });
	}
	else {
		var lastBroadcaster = $(bar.state.command);
		if(!lastBroadcaster
		|| lastBroadcaster.localName != 'broadcaster'
		|| trueAttribute(lastBroadcaster, 'disabled')) {
			bar.stateReset();
			SidebarUI.close(bar);
			
			lastBroadcaster = $(bar.state.command);
			if(lastBroadcaster && lastBroadcaster.localName == 'broadcaster') {
				lastBroadcaster.removeAttribute('checked');
				lastBroadcaster.removeAttribute('twinSidebar');
			}
		}
	}
};

// this redefines broadcasters oncommand attribute to pass themselves as (obj) this to SidebarUI.toggle() instead of just its command id string
this.setBroadcasters = function() {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(let broadcaster of broadcasters) {
		if(!broadcaster._oncommand) {
			broadcaster._oncommand = broadcaster.getAttribute('oncommand');
			setAttribute(broadcaster, 'oncommand', 'SidebarUI.toggle(this);');
		}
		Watchers.addAttributeWatcher(broadcaster, 'disabled', self);
	}
};

this.unsetBroadcasters = function() {
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(let broadcaster of broadcasters) {
		if(broadcaster._oncommand) {
			setAttribute(broadcaster, 'oncommand', broadcaster._oncommand);
			delete broadcaster._oncommand;
		}
		Watchers.removeAttributeWatcher(broadcaster, 'disabled', self);
	}
};

// handler for entering and leaving the toolbar customize window
this.customize = function(inCustomize = customizing) {
	if(inCustomize || toggleButtons()) {
		buttonLabels(mainSidebar.button);
		buttonLabels(twinSidebar.button);
	}
	
	var broadcasters = $$("broadcaster[group='sidebar']");
	for(let broadcaster of broadcasters) {
		if(inCustomize) {
			broadcaster.removeAttribute("checked");
			broadcaster.removeAttribute('twinSidebar');
		}
		else if(broadcaster.id == mainSidebar.command) {
			broadcaster.setAttribute("checked", 'true');
		}
		else if(broadcaster.id == twinSidebar.command) {
			broadcaster.setAttribute('checked', 'true');
			broadcaster.setAttribute('twinSidebar', 'true');
		}
	}
};

this.browserResized = function(resize) {
	browserMinWidth(resize); // this needs to be immediate, so the browser width never goes below these values
	
	// The listeners to this event aren't very heavy (so far at least), it doesn't slow down the resizing of the windows when I set the delay to 0.
	Timers.init('browserResized', function() {
		dispatch(browserBox, { type: 'browserResized', cancelable: false });
	}, 0);
};

// this simulates the default browser behavior when the sidebars are docked
this.browserMinWidth = function(resize) {
	var minWidth = Prefs.minSpaceBetweenSidebars;
	if(mainSidebar.width && !mainSidebar.closed) { minWidth += mainSidebar.width; }
	if(twinSidebar.width && !twinSidebar.closed) { minWidth += twinSidebar.width; }
	document.documentElement.style.minWidth = minWidth+'px';
	
	if(resize && document.documentElement.clientWidth < minWidth) {
		window.resizeBy(0, 0); // The values don't matter as minWidth takes precedence
	}
};

// Our command method for the keyboard shortcuts
this.keysetCommand = function(twin, cmd) {
	var bar = (twin) ? twinSidebar : mainSidebar;
	if(!bar.keysetPanel || panel.shouldFollowCommand(null, twin)) {
		$(objName+'-'+cmd).doCommand();
	}
};

this.switcher = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'sidebarWidthChanged':
				this.setOffset();
				break;
			
			case 'browserResized':
				this.setHeight();
				break;
		}
	},
	
	onClick: function(e, bar) {
		if(dispatch(bar.switcher, { type: 'clickedSwitcher', detail: { bar: bar, clickEvent: e } })
		&& trueAttribute(bar.switcher, 'enabled')
		&& panel.shouldFollowCommand(bar.switcher, bar.twin, e)
		&& e.button == 0) {
			SidebarUI.toggle(bar.switcher);
		}
	},
	
	// This makes it so we can scroll the webpage and the sidebar while the mouse is over the switch, while still able to click on it
	scrollNodes: new Set(),
	onScroll: function(e, bar) {
		if(e.defaultPrevented || !dispatch(bar.switcher, { type: 'scrolledSwitcher', detail: { bar: bar, scrollEvent: e } })) { return; }
		
		var active = false;
		for(let node of this.scrollNodes) {
			setAttribute(node, 'scrolling', 'true');
			active = true;
		}
		
		if(active) {
			// restore the switcher's mouse events
			Timers.init('scrollSwitcher', () => {
				for(let node of this.scrollNodes) {
					removeAttribute(node, 'scrolling');
				}
			}, 200);
		}
	},
	
	setOffset: function() {
		// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
		// I'm not supporting other versions of OSX, just this one isn't simple as it is
		var moveBy = (!WINNT) ? -1 : 0;
		var leftOffset = moveBy;
		var rightOffset = moveBy;
		
		var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(ltr):not([movetoright]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(ltr)[movetoleft],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(rtl)[movetoright],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(rtl):not([movetoleft]) {\n';
		sscode += '		left: '+leftOffset+'px;\n';
		sscode += '	}\n';
		
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(ltr)[movetoright],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(ltr):not([movetoleft]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch:-moz-locale-dir(rtl):not([movetoright]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-switch-twin:-moz-locale-dir(rtl)[movetoleft] {\n';
		sscode += '		right: '+rightOffset+'px;\n';
		sscode += '	}\n';
		
		sscode += '}';
		
		Styles.load('switcherOffset_'+_UUID, sscode, true);
	},
	
	setHeight: function() {
		var moveBy = document.documentElement.getAttribute('sizemode') == 'normal' ? +1 : 0;
		
		// I can't set these by css, cpu usage goes bonkers?!
		if(mainSidebar.switcher) { mainSidebar.switcher.style.height = $('appcontent').clientHeight +moveBy +'px'; }
		if(twinSidebar.switcher) { twinSidebar.switcher.style.height = $('appcontent').clientHeight +moveBy +'px'; }
	},
	
	enable: function(bar) {
		toggleAttribute(bar.switcher, 'enabled', bar.useSwitch);
		this.setHeight();
		bar.toggleSwitcher();
		this.scrollNodes.add(bar.switcher);
	},
	
	disable: function(bar) {
		this.scrollNodes.delete(bar.switcher);
	}
};

// replacement of SidebarUI that works with two sidebars
this.SidebarUI = {
	main: mainSidebar,
	twin: twinSidebar,
	
	// object of broadcaster id's that shouldn't be saved between sessions
	dontSaveBroadcasters: new Set(),
	// object of broadcaster id's that may be added after the sidebars are loaded
	holdBroadcasters: new Set(),
	
	triggers: {
		// object of elements or parent elements that only open the sidebar and don't close it
		forceOpen: new Map(),
		// object of elements or parent elements that trigger the twin sidebar by default
		twin: new Map(),
		// object of elements or parent elements that force the sidebar to open about:blank in case the command triggered is already opened on the other sidebar
		blank: new Map(),
		// object of elements or parent elements that force the sidebar to open in case the command triggered is already opened on the other sidebar, after closing it
		barSwitch: new Map(),
		// object of elements or parent elements that should reload the sidebar if it's already opened and forceOpen is true
		forceReload: new Map(),
	},
	
	_listeners: new Set(),
	
	addListener: function(aListener) {
		this._listeners.add(aListener);
	},
	
	removeListener: function(aListener) {
		this._listeners.delete(aListener);
	},
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'load':
				var bar = e.currentTarget == twinSidebar.sidebar ? twinSidebar : mainSidebar;
				this._fireFocusedSyncEvent(bar);
				break;
		}
	},
	
	// Fire a "SidebarFocused" event on the sidebar's |window| to give the sidebar a chance to adjust focus as needed. An additional event is needed, because
	// we don't want to focus the sidebar when it's opened on startup or in a new window, only when the user opens the sidebar.
	_fireFocusedEvent: function(bar = mainSidebar) {
		if(bar.holdFocused) { return; }
		
		aSync(function() { dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocused', cancelable: false, detail: { bar: bar } }); });
		
		// Run the original function for backwards compatibility.
		window.fireSidebarFocusedEvent();
	},
	
	_fireFocusedSyncEvent: function(bar = mainSidebar) {
		dispatch(bar.sidebar.contentWindow, { type: 'SidebarFocusedSync', cancelable: false, detail: { bar: bar } });
	},
	
	toggle: Task.async(function* (commandID, forceOpen = false, twin = false, forceUnload = false, forceBlank = false, forceBarSwitch = false, forceReload = false) {
		// Always make sure we hide our popup
		aSync(function() { panel.hide(); });
		
		if(customizing) { return false; }
		
		var bar = (twin) ? twinSidebar : mainSidebar;
		
		if(!commandID) {
			commandID = bar.command || bar.state.command;
		}
		else if(typeof(commandID) != "string") {
			if(!forceOpen) {
				for(let trigger of this.triggers.forceOpen.values()) {
					if(isAncestor(commandID, (typeof(trigger) == 'function') ? trigger() : trigger)) {
						forceOpen = true;
						break;
					}
				}
			}
			
			if(!forceReload && forceOpen) {
				for(let trigger of this.triggers.forceReload.values()) {
					if(isAncestor(commandID, (typeof(trigger) == 'function') ? trigger() : trigger)) {
						forceReload = true;
						break;
					}
				}
			}
			
			if(!twin) {
				for(let l of this._listeners) {
					if(l.forceTwin) {
						try {
							if(l.forceTwin(commandID)) {
								twin = true;
								bar = twinSidebar;
								break;
							}
						}
						catch(ex) { Cu.reportError(ex); }
					}
				}
			}
			
			if(!twin) {
				for(let trigger of this.triggers.twin.values()) {
					if(isAncestor(commandID, (typeof(trigger) == 'function') ? trigger() : trigger)) {
						twin = true;
						bar = twinSidebar;
						break;
					}
				}
			}
			
			if(!forceBlank) {
				for(let trigger of this.triggers.blank.values()) {
					if(isAncestor(commandID, (typeof(trigger) == 'function') ? trigger() : trigger)) {
						forceBlank = true;
						commandID = bar.command || bar.state.command;
						break;
					}
				}
			}
			
			if(!forceBlank && !forceBarSwitch) {
				for(let trigger of this.triggers.barSwitch.values()) {
					if(isAncestor(commandID, (typeof(trigger) == 'function') ? trigger() : trigger)) {
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
		
		var otherBar = (twin) ? mainSidebar : twinSidebar;
		var sidebarBroadcaster = $(commandID);
		
		// if the last command was an add-on's sidebar, and it's been disabled/removed
		if(!sidebarBroadcaster) {
			commandID = objName+'-viewBlankSidebar';
			if(twin) { commandID += '-twin'; }
			sidebarBroadcaster = $(commandID);
			
			if(!sidebarBroadcaster) { return false; } // we're not ready for this yet
		}
		
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
		&& Prefs.twinSidebar
		&& (	(!twin && trueAttribute(sidebarBroadcaster, 'twinSidebar'))
			|| (twin && !trueAttribute(sidebarBroadcaster, 'twinSidebar')))) {
				if(forceBlank) {
					bar.stateReset();
					commandID = bar.state.command;
					sidebarBroadcaster = $(commandID);
					if(!sidebarBroadcaster) { return false; } // Prevent some unforseen error here
				} else {
					yield this.toggle(commandID, false, !twin, true).then((toggled) => {
						if(!toggled) { return false; }
					});
					
					if(!forceBarSwitch) { return true; }
				}
		}
		
		// in case the other sidebar is still loaded with the sidebar we want to open, make sure we unload it
		if(otherBar.box && otherBar.command == sidebarBroadcaster.id) {
			this.close(otherBar);
		}
		
		// can we close the sidebar (if it's opened or if we need to)?
		var tryClose = trueAttribute(sidebarBroadcaster, "checked") && bar.isOpen;
		if(tryClose) {
			for(let l of this._listeners) {
				if(l.tryClose) {
					try {
						tryClose = l.tryClose(sidebarBroadcaster, bar);
						if(!tryClose) {
							break;
						}
					}
					catch(ex) { Cu.reportError(ex); }
				}
			}
		}
		if(tryClose) {
			if(forceReload) {
				this.close(bar, sidebarBroadcaster);
			}
			else {
				if(!forceOpen) {
					this.close(bar, sidebarBroadcaster, forceUnload);
					
					if(dispatch(bar.sidebar, { type: 'closedSidebar', detail: { bar: bar } })) {
						this.focusContent();
						this.visibilityChange(commandID, false);
					}
				} else {
					this._fireFocusedEvent(bar);
				}
				
				return this.endToggle(bar);
			}
		}
		
		// can we actually toggle the sidebar?
		for(let l of this._listeners) {
			if(l.tryOpen) {
				try {
					if(!l.tryOpen(sidebarBroadcaster, bar, otherBar)) {
						return false;
					}
				}
				catch(ex) { Cu.reportError(ex); }
			}
		}
		
		setAttribute(sidebarBroadcaster, "checked", "true");
		toggleAttribute(sidebarBroadcaster, 'twinSidebar', twin);
		
		var broadcasters = $$("broadcaster[group='sidebar']");
		for(let broadcaster of broadcasters) {
			if(broadcaster != sidebarBroadcaster
			&& ((!twin && !trueAttribute(broadcaster, 'twinSidebar')) || (twin && trueAttribute(broadcaster, 'twinSidebar')))) {
				removeAttribute(broadcaster, "checked");
				removeAttribute(broadcaster, 'twinSidebar');
			}
		}
		bar.box.hidden = false;
		hideIt(bar.box, true);
		bar.splitter.hidden = false;
		
		buttonLabels(bar.button);
		
		// let something else handle the sidebar open command if necessary
		for(let l of this._listeners) {
			if(l.tryHandle) {
				try {
					if(l.tryHandle(sidebarBroadcaster, bar)) {
						this.visibilityChange(commandID, true);
						return this.endToggle(bar);
					}
				}
				catch(ex) { Cu.reportError(ex); }
			}
		}
		
		// nothing handled, so use default routines
		
		var title = sidebarBroadcaster.getAttribute("sidebartitle") || sidebarBroadcaster.getAttribute("label");
		var url = sidebarBroadcaster.getAttribute("sidebarurl");
		
		if(!Prefs.keepLoaded || forceUnload || bar.sidebar.getAttribute('src') != url || url == 'about:blank') {
			// anything special that needs to be done to unload the current sidebar
			for(let l of this._listeners) {
				if(l.tryUnload) {
					try {
						l.tryUnload(bar);
					}
					catch(ex) { Cu.reportError(ex); }
				}
			}
			
			bar.sidebar.hidden = false;
			
			setAttribute(bar.sidebar, "src", url);
			bar.command = sidebarBroadcaster.id;
			
			// We set this attribute here in addition to setting it on the <browser> element itself, because the code in SidebarUI.uninit() persists this
			// attribute, not the "src" of the <browser id="sidebar">. The reason it does that is that we want to delay sidebar load a bit when a browser
			// window opens. See delayedStartup() and SidebarUI.startDelayedLoad().
			setAttribute(bar.box, "src", url);
			
			bar.title = title;
		}
		
		if(!bar.sidebar.contentDocument || bar.sidebar.contentDocument.readyState != 'complete' || bar.sidebar.contentDocument.location.href != url) {
			Listeners.add(bar.sidebar, "load", (e) => {
				// We're handling the 'load' event before it bubbles up to the usual (non-capturing) event handlers.
				// Let it bubble up before firing the SidebarFocused event.
				aSync(() => { this._fireFocusedEvent(bar); });
				
				// Run the original function for backwards compatibility.
				window.sidebarOnLoad(e);
			}, true, true);
		} else {
			this._fireFocusedEvent(bar);
		}
		
		this.visibilityChange(commandID, true);
		return this.endToggle(bar);
	}),
	
	endToggle: function(bar) {
		dispatch(bar.sidebar, { type: 'endToggleSidebar', cancelable: false, detail: { bar: bar } });
		return true;
	},
	
	close: function(bar = mainSidebar, broadcaster = null, forceUnload = true) {
		// the sidebar shouldn't be remote, so we can do this
		dispatch(bar.sidebar.contentWindow, { type: 'SidebarClosed', cancelable: false });
		
		var commandID = bar.command;
		
		if(!broadcaster && commandID) {
			broadcaster = $(commandID);
		}
		if(broadcaster && broadcaster.localName == 'broadcaster' && trueAttribute(broadcaster, 'checked')) {
			broadcaster.removeAttribute('checked');
			broadcaster.removeAttribute('twinSidebar');
			
			// anything special that needs to be done when closing the current sidebar
			for(let l of this._listeners) {
				if(l.onClose) {
					try {
						l.onClose(broadcaster);
					}
					catch(ex) { Cu.reportError(ex); }
				}
			}
		}
		
		if(!Prefs.keepLoaded || forceUnload || UNLOADED || !dispatch(bar.box, { type: 'ShouldCollapseSidebar' })) {
			this.unloadBrowser(bar.sidebar);
			bar.title = "";
			bar.command = "";
			bar.box.hidden = true;
			hideIt(bar.box, true);
		}
		else {
			hideIt(bar.box);
		}
		
		removeAttribute(bar.box, 'origin');
		bar.splitter.hidden = true;
		buttonLabels(bar.button);
		
		bar.state = bar.state.command;
	},
	
	focusContent: function(uri = gBrowser.currentURI.spec) {
		// this check comes from gBrowserInit._delayedStartup, it tries to focus the location bar first if applicable, otherwise it focuses the tab content
		// http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser.js#1297
		if(!(window.isBlankPageURL(uri) || uri == "about:privatebrowsing") || !window.focusAndSelectUrlBar()) {
			if(window.content) {
				try { window.content.focus(); }
				catch(ex) { gBrowser.selectedBrowser.focus(); }
			} else {
				gBrowser.selectedBrowser.focus();
			}
		}
	},
	
	visibilityChange: function(commandID, isOpen) {
		gBrowser.selectedBrowser.messageManager.sendAsyncMessage("Sidebar:VisibilityChange", { commandID: commandID, isOpen: isOpen });
	},
	
	unloadBrowser: function(browser) {
		setAttribute(browser, "src", "about:blank");
		if(browser.docShell) { browser.docShell.createAboutBlankContentViewer(null); }
	},
	
	// shims for compatibility with the new SidebarUI object
	
	show: function(commandID) {
		return this.toggle(commandID, true);
	},
	
	hide: function(bar = mainSidebar) {
		if(bar.isOpen) {
			this.visibilityChange(bar.command, false);
			this.close(bar, null, false);
		}
	},
	
	init: function() {},
	uninit: function() {},
	startDelayedLoad: function() {}
};

this.onLoad = function() {
	mainSidebar.loaded = true;
	switcher.enable(mainSidebar);
	openLast(mainSidebar);
	setClass(mainSidebar);
	
	// The first time we install the add-on lets open the sidebar so the user knows something's changed
	if(Prefs.firstEnabled) {
		Prefs.firstEnabled = false;
		if(!mainSidebar.isOpen && mainSidebar.closed) {
			SidebarUI.toggle('viewBookmarksSidebar');
		}
	}
};

this.onUnload = function() {
	mainSidebar.loaded = false;
	switcher.disable(mainSidebar);
	
	for(let id of SidebarUI.dontSaveBroadcasters) {
		if(mainSidebar.command == id) {
			SidebarUI.close(mainSidebar);
			return;
		}
	}
};

this.openOptions = function() {
	PrefPanes.open(window);
	panel.hide();
};

// Dummy method that will follow through to the corresponding module when it is loaded
this.buttonLabels = function(btn, onLoad) {
	if(UNLOADED) { return; }
	if(toggleButtons()) { buttons.labels(btn, onLoad); }
};

// Toggle modules
this.toggleButtons = function() {
	return Modules.loadIf('buttons', mainSidebar.button || twinSidebar.button || customizing);
};

this.toggleTwin = function() {
	Modules.loadIf('twin', Prefs.twinSidebar);
};

Modules.LOADMODULE = function() {
	// We make a lot of assumptions in the code that the panel is always loaded, so never remove this from here
	Modules.load('miniPanel');
	
	Modules.load('compatibilityFix/windowFixes');
	
	Overlays.overlayWindow(window, "mainSidebar", self);
	setBroadcasters();
	
	this._SidebarUI = window.SidebarUI;
	window.SidebarUI = SidebarUI;
	
	Modules.load('webPanels');
	Modules.load('social');
	
	// I guess some add-ons can set these, they override the css set ones so we have to erase them
	mainSidebar.sidebar.style.maxWidth = '';
	mainSidebar.sidebar.style.minWidth = Prefs.minSidebarWidth+'px';
	mainSidebar.sidebar.style.width = '';
	
	Watchers.addAttributeWatcher(mainSidebar.box, 'width', self, true);
	Listeners.add(window, 'sidebarWidthChanged', switcher);
	switcher.setOffset();
	
	// Toggle modules
	Prefs.listen('useSwitch', self);
	Prefs.listen('twinSidebar', toggleTwin);
	
	Modules.load('headers');
	Modules.load('forceOpen');
	toggleTwin();
	
	// Apply initial preferences
	Prefs.listen('glassStyle', self);
	Prefs.listen('keepLoaded', self);
	
	Listeners.add(window, 'endToggleSidebar', self);
	Listeners.add(mainSidebar.sidebar, 'load', SidebarUI, true);
	
	Listeners.add(window, 'beforecustomization', self);
	Listeners.add(window, 'aftercustomization', self);
	customize();
	
	// set our custom classes so the sidebars can be styled properly
	Listeners.add(window, 'SidebarFocusedSync', self);
	Listeners.add(window, 'SidebarFocused', self);
	
	// can't let the browser be resized below the dimensions of the sidebars
	browserMinWidth();
	Listeners.add(window, 'resize', self);
	Listeners.add(browserBox, 'browserResized', switcher);
	
	if(!mainSidebar.close._tooltiptext) {
		mainSidebar.close._tooltiptext = mainSidebar.close.getAttribute('tooltiptext');
		mainSidebar.close.setAttribute('tooltiptext', Strings.get('buttons', 'buttonCloseTooltip'));
	}
	
	SidebarUI.triggers.blank.set('mainCommand', function() { return $(objName+'-cmd_mainSidebar'); });
	SidebarUI.triggers.blank.set('mainSwitcher', function() { return mainSidebar.switcher; });
};

Modules.UNLOADMODULE = function() {
	if(UNLOADED && mainSidebar.isOpen) {
		setClass(mainSidebar);
	}
	
	SidebarUI.triggers.blank.delete('mainCommand');
	SidebarUI.triggers.blank.delete('mainSwitcher');
	
	if(mainSidebar.close._tooltiptext) {
		mainSidebar.close.setAttribute('tooltiptext', mainSidebar.close._tooltiptext);
		delete mainSidebar.close._tooltiptext;
	}
	
	Listeners.remove(window, 'resize', self);
	Listeners.remove(browserBox, 'browserResized', switcher);
	document.documentElement.style.minWidth = '';
	
	Listeners.remove(window, 'SidebarFocusedSync', self);
	Listeners.remove(window, 'SidebarFocused', self);
	
	Listeners.remove(window, 'beforecustomization', self);
	Listeners.remove(window, 'aftercustomization', self);
	
	Listeners.remove(mainSidebar.sidebar, 'load', SidebarUI, true);
	Listeners.remove(window, 'endToggleSidebar', self);
	
	Prefs.unlisten('glassStyle', self);
	Prefs.unlisten('keepLoaded', self);
	
	mainSidebar.reUnload();
	
	Listeners.remove(window, 'sidebarWidthChanged', switcher);
	Watchers.removeAttributeWatcher(mainSidebar.box, 'width', self, true);
	
	Modules.unload('twin');
	Modules.unload('forceOpen');
	Modules.unload('headers');
	
	Prefs.unlisten('twinSidebar', toggleTwin);
	Prefs.unlisten('useSwitch', self);
	Styles.unload('switcherOffset_'+_UUID);
	
	Modules.unload('social');
	Modules.unload('webPanels');
	
	window.SidebarUI = this._SidebarUI;
	delete this._SidebarUI;
	
	unsetBroadcasters();
	Overlays.removeOverlayWindow(window, "mainSidebar");
	
	Modules.unload('compatibilityFix/windowFixes');
	Modules.unload('miniPanel');
	Modules.unload('buttons');
};
