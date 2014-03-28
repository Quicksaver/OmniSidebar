moduleAid.VERSION = '1.5.0';

this.customizing = false;

this._mainState = null;
this._twinState = null;

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
	get state () {
		if(!_mainState) {
			var data = SessionStore.getWindowValue(window, objName+'.mainSidebar');
			// if this window doesn't have it's own state, use the state from the opener
			if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
				if(!data && window.opener && !window.opener.closed) {
					data = SessionStore.getWindowValue(window.opener, objName+'.mainSidebar');
				}
				// fallback to a global pref value so the sidebar is rarely reset when it's not supposed to
				if(!data) {
					data = prefAid.lastStateMain;
				}
			}
			
			if(data) {
				_mainState = JSON.parse(data);
			} else {
				_mainState = {
					command: objName+"-viewBlankSidebar",
					closed: true
				};
				// I can remove this in later versions of firefox, this is just to port from the previous pref to the new system
				if(Services.prefs.prefHasUserValue('extensions.'+objPathString+'.lastcommand')) {
					_mainState.command = Services.prefs.getCharPref('extensions.'+objPathString+'.lastcommand');
					Services.prefs.clearUserPref('extensions.'+objPathString+'.lastcommand');
				}
				this.saveState();
			}
		}
		
		return _mainState;
	},
	set state (v) {
		_mainState = {
			command: v,
			closed: !this.box || this.closed
		};
		this.saveState();
	},
	stateForceClosed: function(v) {
		this.state;
		_mainState.closed = v;
		this.saveState();
	},
	stateForceCommand: function(v) {
		this.state;
		_mainState.command = v;
		this.saveState();
	},
	saveState: function() {
		var stringified = JSON.stringify(_mainState);
		if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
			prefAid.lastStateMain = stringified;
		}
		return SessionStore.setWindowValue(window, objName+'.mainSidebar', stringified);
	},
	stateReset: function() {
		_mainState = null;
		if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
			prefAid.reset('lastStateMain');
		}
		SessionStore.deleteWindowValue(window, objName+'.mainSidebar');
	},
	get useSwitch () { return prefAid.useSwitch; },
	get keyset () { return mainKey; },
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
	get state () {
		if(!_twinState) {
			var data = SessionStore.getWindowValue(window, objName+'.twinSidebar');
			// if this window doesn't have it's own state, use the state from the opener
			if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
				if(!data && window.opener && !window.opener.closed) {
					data = SessionStore.getWindowValue(window.opener, objName+'.twinSidebar');
				}
				// fallback to a global pref value so the sidebar is rarely reset when it's not supposed to
				if(!data) {
					data = prefAid.lastStateTwin;
				}
			}
			
			if(data) {
				_twinState = JSON.parse(data);
			} else {
				_twinState = {
					command: objName+"-viewBlankSidebar-twin",
					closed: true
				};
				// I can remove this in later versions of firefox, this is just to port from the previous pref to the new system
				if(Services.prefs.prefHasUserValue('extensions.'+objPathString+'.lastcommandTwin')) {
					_twinState.command = Services.prefs.getCharPref('extensions.'+objPathString+'.lastcommandTwin');
					Services.prefs.clearUserPref('extensions.'+objPathString+'.lastcommandTwin');
				}
				this.saveState();
			}
		}
		
		return _twinState;
	},
	set state (v) {
		_twinState = {
			command: v,
			closed: !this.box || this.closed
		};
		this.saveState();
	},
	stateForceClosed: function(v) {
		this.state;
		_twinState.closed = v;
		this.saveState();
	},
	stateForceCommand: function(v) {
		this.state;
		_twinState.command = v;
		this.saveState();
	},
	saveState: function() {
		var stringified = JSON.stringify(_twinState);
		if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
			prefAid.lastStateTwin = stringified;
		}
		return SessionStore.setWindowValue(window, objName+'.twinSidebar', stringified);
	},
	stateReset: function() {
		_twinState = null;
		if(!privateBrowsingAid.inPrivateBrowsing || prefAid.keepPrivate) {
			prefAid.reset('lastStateTwin');
		}
		SessionStore.deleteWindowValue(window, objName+'.twinSidebar');
	},
	get useSwitch () { return prefAid.useSwitchTwin; },
	get keyset () { return twinKey; },
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
this.__defineGetter__('FullScreen', function() { return window.FullScreen; });
this.__defineGetter__('SessionStore', function() { return window.SessionStore; });

this.__defineGetter__('SocialSidebar', function() { return (Services.vc.compare(Services.appinfo.platformVersion, "27.0") >= 0) ? window.SocialSidebar : null; });
this.__defineGetter__('SocialBroadcaster', function() { return $(objName+'-viewSocialSidebar'); });
this.__defineGetter__('SocialBox', function() { return $('social-sidebar-box'); });
this.__defineGetter__('SocialHeader', function() { return $('social-sidebar-header'); });

this._SocialButton = null;
this._SocialBrowser = null;
this.__defineGetter__('SocialButton', function() {
	if(!_SocialButton) { _SocialButton = $('social-sidebar-button'); }
	return _SocialButton;
});
this.__defineGetter__('SocialBrowser', function() {
	if(!_SocialBrowser) { _SocialBrowser = $('social-sidebar-browser'); }
	return _SocialBrowser;
});

this._lastSocialCommand = null;
this.__defineGetter__('lastSocialCommand', function() {
	if(!_lastSocialCommand) {
		_lastSocialCommand = SessionStore.getWindowValue(window, objName+'.lastSocialCommand');
		// if this window doesn't have it's own state, use the state from the opener
		if(!_lastSocialCommand && window.opener && !window.opener.closed) {
			_lastSocialCommand = SessionStore.getWindowValue(window.opener, objName+'.lastSocialCommand');
		}
	}
	return _lastSocialCommand;
});
this.__defineSetter__('lastSocialCommand', function(v) {
	_lastSocialCommand = v;
	return SessionStore.setWindowValue(window, objName+'.lastSocialCommand', v);
});

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
	if(trueAttribute(broadcaster, 'checked') && broadcaster.localName == 'broadcaster') {
		broadcaster.removeAttribute('checked');
		broadcaster.removeAttribute('twinSidebar');
		
		if(SocialSidebar && broadcaster == SocialBroadcaster) {
			setSocialOpenListener(false);
			SocialSidebar.hide();
			setSocialOpenListener(true);
		}
	}
	
	if(!prefAid.keepLoaded || forceUnload || UNLOADED || !dispatch(bar.box, { type: 'ShouldCollapseSidebar' })) {
		unloadSidebarBrowser(bar.sidebar);
		bar.title.value = "";
		setAttribute(bar.box, "sidebarcommand", "");
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
};

this.unloadSidebarBrowser = function(browser) {
	setAttribute(browser, "src", "about:blank");
	if(browser.docShell) { browser.docShell.createAboutBlankContentViewer(null); }
};

this.reUnloadMain = function() {
	if(mainSidebar.box.collapsed) {
		closeSidebar(mainSidebar);
	}
};

// Opens the sidebars last opened page if its closed and should be open, to be called on startup
this.openLast = function(bar) {
	for(var b in holdBroadcasters) {
		if(holdBroadcasters[b] == bar.state.command) {
			return;
		}
	}
	
	if(!bar.state.closed) {
		var lastBroadcaster = $(bar.state.command);
		if(lastBroadcaster && lastBroadcaster.localName == 'broadcaster' && !trueAttribute(lastBroadcaster, 'disabled')) {
			// ensure the focus is on content at startup/opening new window
			var listener = function(e) {
				ensureContentIsFocused(bar);
				e.preventDefault();
				e.stopPropagation();
			};
			listenerAid.add(bar.sidebar.contentWindow, "SidebarFocused", listener, true, true);
			
			if(!toggleSidebar(lastBroadcaster, true, bar.twin)) {
				listenerAid.remove(bar.sidebar.contentWindow, "SidebarFocused", listener, true, true);
			}
			return;
		}
		closeSidebar(bar);
	}
	else if(bar.isOpen
	&& (bar.state.command == bar.box.getAttribute('sidebarcommand') || (privateBrowsingAid.inPrivateBrowsing && !prefAid.keepPrivate))) {
		closeSidebar(bar);
	}
};

this.ensureContentIsFocused = function(bar) {
	if(document.commandDispatcher.focusedWindow == bar.sidebar.contentWindow.content
	|| document.commandDispatcher.focusedWindow == bar.sidebar.contentWindow) {
		window.content.focus();
	}
};

// omnisidebar button opens the last sidebar opened
this.setlast = function(e) {
	if(e && e.detail && e.detail.bar) {
		setLastCommand(e.detail.bar);
	} else {
		setLastCommand(mainSidebar);
		setLastCommand(twinSidebar);
	}
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
			bar.state = bar.box.getAttribute('sidebarcommand');
		}
		
		if(bar.isOpen) {
			aSync(function() { setclass(bar.sidebar); }); // aSync to see if it resolves a problem of not inserting the class tag sometimes
		}
		return;
	}
	else {
		var lastBroadcaster = $(bar.state.command);
		if(!lastBroadcaster
		|| lastBroadcaster.localName != 'broadcaster'
		|| trueAttribute(lastBroadcaster, 'disabled')) {
			bar.stateReset();
			closeSidebar(bar);
			
			lastBroadcaster = $(bar.state.command);
			if(lastBroadcaster && lastBroadcaster.localName == 'broadcaster') {
				lastBroadcaster.removeAttribute('checked');
				lastBroadcaster.removeAttribute('twinSidebar');
			}
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
this.scrollNodes = {};
this.scrollSwitcher = function(e) {
	if(e.defaultPrevented) { return; }
	
	var active = false;
	for(var n in scrollNodes) {
		setAttribute(scrollNodes[n], 'scrolling', 'true');
		active = true;
	}
	
	if(active) {
		timerAid.init('scrollSwitcher', restoreSwitcherMouseEvents, 200);
	}
};

this.restoreSwitcherMouseEvents = function() {
	for(var n in scrollNodes) {
		removeAttribute(scrollNodes[n], 'scrolling');
	}
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

this.enableSwitcher = function(bar) {
	toggleAttribute(bar.switcher, 'enabled', bar.useSwitch);
	setSwitcherHeight();
	bar.toggleSwitcher();
};

this.enableMainSwitcher = function() {
	enableSwitcher(mainSidebar);
	scrollNodes.mainSwitcher = mainSidebar.switcher;
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
	
	// don't do command if it comes from the fullScreen handler, let ours do the work
	if(Services.vc.compare(Services.appinfo.platformVersion, "10.0") >= 0 && arguments.callee.caller == FullScreen.enterDomFullscreen) { return false; }
	
	if(customizing) { return false; }
	
	if(!forceOpen) { forceOpen = false; }
	if(!twin) { twin = false; }
	if(!forceUnload) { forceUnload = false; }
	if(!forceBlank) { forceBlank = false; }
	if(!forceBarSwitch) { forceBarSwitch = false; }
	if(!forceReload) { forceReload = false; }
	var bar = (twin) ? twinSidebar : mainSidebar;
	
	if(!commandID) {
		commandID = bar.box.getAttribute("sidebarcommand") || bar.state.command;
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
		
		if(!twin && SocialSidebar && commandID == SocialBroadcaster && trueAttribute(SocialBroadcaster, 'twinSidebar')) {
			twin = true;
			bar = twinSidebar;
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
					commandID = bar.box.getAttribute("sidebarcommand") || bar.state.command;
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
	&& prefAid.twinSidebar
	&& (	(!twin && trueAttribute(sidebarBroadcaster, 'twinSidebar'))
		|| (twin && !trueAttribute(sidebarBroadcaster, 'twinSidebar')))) {
			if(forceBlank) {
				bar.stateReset();
				commandID = bar.state.command;
				sidebarBroadcaster = $(commandID);
				if(!sidebarBroadcaster) { return false; } // Prevent some unforseen error here
			} else {
				if(!toggleSidebar(commandID, false, !twin, true)) { return false; }
				if(!forceBarSwitch) { return true; }
			}
	}
	
	if(trueAttribute(sidebarBroadcaster, "checked")
	&& (!SocialSidebar || sidebarBroadcaster != SocialBroadcaster || SocialBroadcaster.getAttribute('origin') == bar.box.getAttribute('origin'))) {
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
	
	// make sure we actually can show the social sidebar
	if(SocialSidebar && sidebarBroadcaster == SocialBroadcaster) {
		var canSocial = true;
		if((Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0 && !prefAid['enabled']) || !SocialSidebar.canShow) {
			canSocial = false;
		}
		
		var origin = SocialBroadcaster.getAttribute('origin');
		if(canSocial && !origin) {
			origin = (SocialSidebar.provider) ? SocialSidebar.provider.origin : lastSocialCommand;
			setAttribute(SocialBroadcaster, 'origin', origin);
		}
		
		if(canSocial
		&& (	(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0 && !prefAid['sidebar.open'])
			|| !SocialSidebar.opened || !SocialSidebar.provider || SocialSidebar.provider.origin != origin)) {
				setSocialOpenListener(false);
				SocialSidebar.show(origin);
				setSocialOpenListener(true);
		}
		
		if(canSocial && !SocialSidebar.provider) {
			// we may have an invalid last social command, so let's reset it
			if(origin == lastSocialCommand) {
				lastSocialCommand = '';
			}
			canSocial = false;
		}
		
		// in case we can't, let's reset the command so we don't (or shouldn't) trigger this again
		if(!canSocial) {
			if(bar.state.command == SocialBroadcaster.id) {
				bar.stateReset();
			}
			return false;
		}
		
		// this doesn't happen above if we're switching sidebars, because placeSocialSidebar() overrides the twinSidebar attr
		var otherBar = (twin) ? mainSidebar : twinSidebar;
		if(otherBar.box && otherBar.box.getAttribute('sidebarcommand') == SocialBroadcaster.id) {
			closeSidebar(otherBar);
		}
	}
	
	setAttribute(sidebarBroadcaster, "checked", "true");
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
	
	// if we're toggling a social sidebar
	if(SocialSidebar && sidebarBroadcaster == SocialBroadcaster) {
		placeSocialSidebar(null, twin);
		unloadSidebarBrowser(bar.sidebar);
		bar.sidebar.hidden = true;
		SocialBrowser.hidden = false;
		SocialButton.hidden = false;
		
		setAttribute(bar.box, "sidebarcommand", sidebarBroadcaster.id);
		setAttribute(bar.box, 'origin', sidebarBroadcaster.getAttribute('origin'));
		
		var newTitle = SocialSidebar.provider.name;
		bar.title.value = newTitle;
		setAttribute(bar.title, 'value', newTitle);
		setAttribute(sidebarBroadcaster, 'sidebartitle', newTitle);
		
		if(_swapSocialTwinFlag && _swapSocialTwinFlag != 'about:blank') {
			if(_swapSocialTwinFlag != SocialBrowser.getAttribute('src')) {
				unloadSidebarBrowser(SocialBrowser);
			}
			
			// when switching between the main and twin sidebar, somehow the social sidebar is closed (for some reason)
			setSocialOpenListener(false);
			if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
				prefAid['sidebar.open'] = true; // this implies SocialSidebar.update()
			} else {
				$('socialSidebarBroadcaster').hidden = false;
				SocialSidebar.update();
			}
			setSocialOpenListener(true);
		}
		_swapSocialTwinFlag = null;
		
		dispatch(bar.sidebar, { type: 'endToggleSidebar', cancelable: false, detail: { bar: bar } });
		return true;
	}
	
	// only other choice is we're toggling a normal sidebar
	var newTitle = sidebarBroadcaster.getAttribute("sidebartitle") || sidebarBroadcaster.getAttribute("label");
	var url = sidebarBroadcaster.getAttribute("sidebarurl");
	
	if(!prefAid.keepLoaded || forceUnload || bar.sidebar.getAttribute('src') != url || url == 'about:blank') {
		if(bar.box.getAttribute('origin') || isAncestor(SocialBrowser, bar.box)) {
			removeAttribute(bar.box, 'origin');
			
			setSocialOpenListener(false);
			SocialSidebar.hide();
			setSocialOpenListener(true);
			
			SocialBrowser.hidden = true;
			SocialButton.hidden = true;
		}
		
		bar.sidebar.hidden = false;
		
		setAttribute(bar.sidebar, "src", url);
		setAttribute(bar.box, "sidebarcommand", sidebarBroadcaster.id);
		setAttribute(bar.box, "src", url);
		
		bar.title.value = newTitle;
		setAttribute(bar.title, 'value', newTitle); // Correct a bug where the title wouldn't show sometimes when starting firefox with the sidebar closed
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

// for compatibility with the Social API sidebars:
// we move its browser element into our sidebars, then it proceeds from there
this._swapSocialTwinFlag = null;
this._backupSocialStyle = null;
this.placeSocialSidebar = function(el, twin) {
	var bar = (twin) ? twinSidebar : mainSidebar;
	if(!twin && prefAid.twinSidebar && el) {
		for(var t in twinTriggers) {
			if(isAncestor(el, twinTriggers[t])) {
				bar = twinSidebar;
				break;
			}
		}
	}
	
	if(!_backupSocialStyle) {
		_backupSocialStyle = {
			minWidth: SocialBrowser.style.minWidth,
			width: SocialBrowser.style.width,
			maxWidth: SocialBrowser.style.maxWidth
		};
		
		SocialBrowser.style.minWidth = '';
		SocialBrowser.style.width = '';
		SocialBrowser.style.maxWidth = '';
	}
	
	if(!isAncestor(SocialBrowser, bar.box)) {
		_swapSocialTwinFlag = SocialBrowser.getAttribute('src');
		if(el && SocialBrowser.getAttribute('origin') != el.getAttribute('origin')) {
			unloadSidebarBrowser(SocialBrowser);
			SocialBrowser.hidden = true; // prevent showing the last panel when switching sidebars
		}
		
		bar.box.hidden = false;
		
		var tempSocial = overlayAid.swapBrowsers(window, SocialBrowser);
		bar.sidebar.parentNode.appendChild(SocialBrowser);
		overlayAid.swapBrowsers(window, SocialBrowser, tempSocial);
		bar.title.parentNode.insertBefore(SocialButton, bar.title.nextSibling);
		
		if(bar.twin) {
			twinTriggers.__defineGetter__('SocialButton', function() { return SocialButton; });
		} else {
			delete twinTriggers.SocialButton;
		}
	}
	
	toggleAttribute(SocialBroadcaster, 'twinSidebar', bar.twin);
};

this.restoreSocialSidebar = function() {
	delete twinTriggers.SocialButton;
	
	var tempSocial = overlayAid.swapBrowsers(window, SocialBrowser);
	SocialBox.appendChild(SocialBrowser);
	overlayAid.swapBrowsers(window, SocialBrowser, tempSocial);
	
	SocialHeader.appendChild(SocialButton);
	
	SocialBrowser.hidden = false;
	SocialButton.hidden = false;
};

this.toggleSocialSidebar = function() {
	if((Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0 && (!prefAid['enabled'] || !prefAid['sidebar.open']))
	|| !SocialSidebar.canShow || !SocialSidebar.opened || !SocialSidebar.provider) {
		if(SocialBroadcaster // the overlay might not have loaded yet?
		&&	((mainSidebar.box && mainSidebar.box.getAttribute('sidebarcommand') == SocialBroadcaster.id)
			|| (twinSidebar.box && twinSidebar.box.getAttribute('sidebarcommand') == SocialBroadcaster.id))
		) {
			toggleSidebar(SocialBroadcaster);
		}
		return;
	}
	
	var bar = (trueAttribute(SocialBroadcaster, 'twinSidebar')) ? twinSidebar : mainSidebar;
	if(bar.box.getAttribute('origin') == SocialSidebar.provider.origin) { return; }
	
	setAttribute(SocialBroadcaster, 'sidebartitle', SocialSidebar.provider.name);
	setAttribute(SocialBroadcaster, 'origin', SocialSidebar.provider.origin);
	lastSocialCommand = SocialSidebar.provider.origin;
	
	toggleSidebar(SocialBroadcaster, false, bar.twin);
};

this.setSocialOpenListener = function(enable) {
	if(enable) {
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			prefAid.listen('sidebar.open', toggleSocialSidebar);
		} else {
			if(!SocialSidebar._update) {
				SocialSidebar._update = SocialSidebar.update;
				SocialSidebar.update = function() { SocialSidebar._update(); toggleSocialSidebar(); };
			}
		}
	} else {
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			prefAid.unlisten('sidebar.open', toggleSocialSidebar);
		} else {
			if(SocialSidebar._update) {
				SocialSidebar.update = SocialSidebar._update;
				delete SocialSidebar._update;
			}
		}
	}
};

this.ensureSocialSwitchBeforeHide = function(el) {
	for(var t in barSwitchTriggers) {
		if(isAncestor(el, barSwitchTriggers[t])) {
			var twin = false;
			for(var e in twinTriggers) {
				if(isAncestor(el, twinTriggers[e])) {
					twin = true;
					break;
				}
			}
			
			if((twin && isAncestor(SocialBrowser, mainSidebar.box)) || (!twin && isAncestor(SocialBrowser, twinSidebar.box))) {
				placeSocialSidebar(el);
				SocialSidebar.show(el.getAttribute('origin'));
				return;
			}
			
			break;
		}
	}
	
	SocialSidebar.hide();
};

this.onMozEnteredFullScreen = function() {
	toggleAttribute(document.documentElement, objName+'-mozFullScreen', document.mozFullScreen);
};

this.loadMainSidebar = function() {
	mainSidebar.loaded = true;
	enableMainSwitcher();
	openLast(mainSidebar);
	
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
	
	delete scrollNodes.mainSwitcher;
	
	for(var x in dontSaveBroadcasters) {
		if(mainSidebar.box.getAttribute('sidebarcommand') == dontSaveBroadcasters[x]) {
			closeSidebar(mainSidebar);
			return;
		}
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
	
	this.backups = {
		toggleSidebar: toggleSidebar,
		fireSidebarFocusedEvent: fireSidebarFocusedEvent,
		sidebarOnLoad: sidebarOnLoad
	};
	toggleSidebar = toggleOmniSidebar;
	fireSidebarFocusedEvent = fireOmniSidebarFocusedEvent;
	sidebarOnLoad = omniSidebarOnLoad;
	
	// SocialAPI compatibility
	if(SocialSidebar) {
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			// the preference listener only triggers when there's a change in the open preference
			this.backups.show = SocialSidebar.show;
			SocialSidebar.show = function(origin) {
				// always show the sidebar, and set the provider
				this.setProvider(origin);
				if(!prefAid['sidebar.open']) { prefAid['sidebar.open'] = true; }
				else { toggleSocialSidebar(); }
			};
			
			var socialDefaults = {};
			socialDefaults['enabled'] = false;
			socialDefaults['sidebar.open'] = true;
			prefAid.setDefaults(socialDefaults, 'social', '');
		}
		
		barSwitchTriggers.__defineGetter__('socialSidebar', function() { return SocialBroadcaster; });
		
		// if we start with the social sidebar opened, but neither the main or the twin sidebars had last been opened with it and can't open it now, we close the social sidebar
		if(!privateBrowsingAid.inPrivateBrowsing
		&&	((Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0 && prefAid['enabled'] && prefAid['sidebar.open'])
			|| (Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") >= 0 && SocialSidebar.opened))
		) {
			// close the social sidebar when it...
			if(	
				// can't go to the mainSidebar when it is already open or when it's supposed to open something else after this
				((mainSidebar.box && !mainSidebar.closed && mainSidebar.box.getAttribute('sidebarcommand'))
				|| (mainSidebar.state.command != objName+'-viewSocialSidebar' && !mainSidebar.state.closed))
			&&
				// can't go to the twinSidebar when it's supposed to open something else after this
				(!prefAid.twinSidebar || (twinSidebar.state.command != objName+'-viewSocialSidebar' && !twinSidebar.state.closed))
			) {
				SocialSidebar.hide();
			}
			
			// open the sidebar in the main sidebar if it's not supposed to open in the twin
			else if(!prefAid.twinSidebar || (twinSidebar.state.command != objName+'-viewSocialSidebar' && !twinSidebar.state.closed)) {
				mainSidebar.stateForceCommand(objName+'-viewSocialSidebar');
				mainSidebar.stateForceClosed(false);
			}
			
			// open in the twin
			else {
				twinSidebar.stateForceCommand(objName+'-viewSocialSidebar');
				twinSidebar.stateForceClosed(false);
			}
		}
		
		setSocialOpenListener(true);
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			prefAid.listen('enabled', toggleSocialSidebar);
		}
	}
	
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
	moduleAid.load('forceOpen');
	toggleTwin();
	
	// Apply initial preferences
	prefAid.listen('glassStyle', setClasses);
	prefAid.listen('keepLoaded', reUnloadMain);
	
	listenerAid.add(window, 'endToggleSidebar', setlast);
	listenerAid.add(mainSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	
	listenerAid.add(window, 'beforecustomization', customize, false);
	listenerAid.add(window, 'aftercustomization', customize, false);
	
	// can't let the browser be resized below the dimensions of the sidebars
	browserMinWidth();
	listenerAid.add(browser, 'resize', browserResized);
	listenerAid.add(browser, 'browserResized', setSwitcherHeight);
	listenerAid.add(window, 'endToggleSidebar', browserResized);
	
	// make sure our margin triggers don't interfere with webpage scrolling
	listenerAid.add(window, 'wheel', scrollSwitcher, true);
	
	if(Services.vc.compare(Services.appinfo.platformVersion, "10.0") >= 0) {
		listenerAid.add(window, 'fullscreen', onMozEnteredFullScreen);
		listenerAid.add(window, 'MozEnteredDomFullscreen', onMozEnteredFullScreen);
	}
	
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
	
	removeAttribute(document.documentElement, objName+'-mozFullScreen');
	
	listenerAid.remove(window, 'wheel', scrollSwitcher, true);
	
	listenerAid.remove(browser, 'resize', browserResized);
	listenerAid.remove(browser, 'browserResized', setSwitcherHeight);
	listenerAid.remove(window, 'endToggleSidebar', browserResized);
	$('main-window').style.minWidth = '';
	
	if(Services.vc.compare(Services.appinfo.platformVersion, "10.0") >= 0) {
		listenerAid.remove(window, 'fullscreen', onMozEnteredFullScreen);
		listenerAid.remove(window, 'MozEnteredDomFullscreen', onMozEnteredFullScreen);
	}
	
	listenerAid.remove(window, 'beforecustomization', customize, false);
	listenerAid.remove(window, 'aftercustomization', customize, false);
	
	listenerAid.remove(mainSidebar.sidebar, 'load', fireFocusedSyncEvent, true);
	listenerAid.remove(window, 'endToggleSidebar', setlast);
	
	prefAid.unlisten('glassStyle', setClasses);
	prefAid.unlisten('keepLoaded', reUnloadMain);
	
	reUnloadMain();
	
	listenerAid.remove(window, 'sidebarWidthChanged', setSwitcherOffset);
	
	objectWatcher.removeAttributeWatcher(mainSidebar.box, 'width', watchWidth, true);
	
	moduleAid.unload('twin');
	moduleAid.unload('forceOpen');
	moduleAid.unload('headers');
	
	prefAid.unlisten('twinSidebar', toggleTwin);
	prefAid.unlisten('useSwitch', enableMainSwitcher);
	
	styleAid.unload('switcherOffset_'+_UUID);
	
	if(SocialSidebar) {
		setSocialOpenListener(false);
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			prefAid.unlisten('enabled', toggleSocialSidebar);
		}
		
		delete barSwitchTriggers.socialSidebar;
		
		if(_backupSocialStyle) {
			SocialBrowser.style.minWidth = _backupSocialStyle.minWidth;
			SocialBrowser.style.width = _backupSocialStyle.width;
			SocialBrowser.style.maxWidth = _backupSocialStyle.maxWidth;
			
			_backupSocialStyle = null;
		}
		
		if(!isAncestor(SocialBrowser, SocialBox)) {
			restoreSocialSidebar();
			
			// Let's make sure this is visible...
			mainSidebar.sidebar.hidden = false;
		}
		
		if(Services.vc.compare(Services.appinfo.platformVersion, "30.0a1") < 0) {
			SocialSidebar.show = this.backups.show;
		}
		
		// to prevent the sidebar from staying open with an empty panel, since the social browser is moved back to its place
		if(mainSidebar.box.getAttribute('sidebarcommand') == objName+'-viewSocialSidebar') { closeSidebar(mainSidebar); }
	}
	
	toggleSidebar = this.backups.toggleSidebar;
	fireSidebarFocusedEvent = this.backups.fireSidebarFocusedEvent;
	sidebarOnLoad = this.backups.sidebarOnLoad;
	delete this.backups;
	
	setBroadcasters(false);
	overlayAid.removeOverlayWindow(window, "mainSidebar");
	
	moduleAid.unload('compatibilityFix/windowFixes');
	moduleAid.unload('miniPanel');
	moduleAid.unload('australis');
};
