Modules.VERSION = '1.3.3';

this.setAutoHide = function(bar, unloaded) {
	toggleAttribute(bar.box, 'autohide', bar.autoHide && !unloaded);
	
	if(!bar.autoHide || unloaded) {
		removeAttribute(bar.resizeBox, 'hover');
		delete bar.resizeBox.hovers;
		
		Listeners.remove(bar.switcher, 'mouseover', autoHideSwitchOver);
		Listeners.remove(bar.switcher, 'dragenter', autoHideSwitchOver);
		Listeners.remove(bar.switcher, 'mouseout', autoHideSwitchOut);
		
		if(bar._transition) {
			Listeners.remove(bar._transition.node, 'transitionend', bar._transition.onEnd);
			delete bar._transition;
		}
		
		bar.autoHideInit = false;
	} else {
		bar.resizeBox.hovers = 0;
		
		// for use to call certain methods when the bar is actually shown (after the CSS transition)
		bar._transition = {
			node: bar.resizeBox,
			prop: 'opacity',
			listeners: [],
			add: function(listener) {
				this.listeners.push(listener);
			},
			remove: function(listener) {
				if(this.listeners.indexOf(listener) > -1) {
					this.listeners.splice(this.listeners.indexOf(listener), 1);
				}
			}
		};
		bar._transition.onEnd = function(e) {
			if(e.target != bar._transition.node || e.propertyName != bar._transition.prop || !trueAttribute(bar, 'hover')) { return; }
			
			for(var listener of bar._transition.listeners) {
				try {
					listener(e);
				}
				catch(ex) { Cu.reportError(ex); }
			}
		};
		Listeners.add(bar._transition.node, 'transitionend', bar._transition.onEnd);
		
		if(!Prefs.noInitialShow) {
			initialShowBar(bar, 1000);
		}
		
		Listeners.add(bar.switcher, 'mouseover', autoHideSwitchOver);
		Listeners.add(bar.switcher, 'dragenter', autoHideSwitchOver);
		Listeners.add(bar.switcher, 'mouseout', autoHideSwitchOut);
		bar.toggleSwitcher();
		
		aSync(function() {
			if(typeof(mainSidebar) == 'undefined') { return; }
			bar.autoHideInit = true;
		}, 2000);
	}
	setAutoHideWidth();
	toggleFX();
};

this.listenerToggleSwitcher = function(e) {
	e.detail.bar.toggleSwitcher();
};

this.visibleOnLoad = function(e) {
	var bar = e.detail.bar;
	
	// visibility:hidden makes it impossible to use .focus() within the sidebar (bookmarks/history)
	setAttribute(bar.resizeBox, 'SidebarFocused', 'true');
};

this.showOnFocus = function(e) {
	var bar = e.detail.bar;
	
	// hover the sidebar for a moment when it opens even if the mouse isn't there, so the user knows the sidebar opened
	if(!Prefs.noInitialShow || bar.autoHideInit || bar.autoHideInit) {
		initialShowBar(bar, 1000);
	}
	
	// ensure visibleOnLoad() is undone
	removeAttribute(bar.resizeBox, 'SidebarFocused');
};

this.showOnResizeStart = function(e) {
	setHover(e.detail.bar, true);
	
	// So it doesn't jump around when resizing
	setAttribute(mainSidebar.box, 'disablefx', 'true');
	setAttribute(twinSidebar.box, 'disablefx', 'true');
};

this.hideOnResizeEnd = function(e) {
	setAutoHideWidth();
	
	// Delayed removal of "nohide" attribute is so the sidebar won't hide itself just after we finished resizing 
	// (finish resizing -> new values saved -> animations) and not (finish resizing -> animations -> new values saved)
	Timers.init('resizeDragEnd', function() {
		toggleFX();
		setHover(e.detail.bar, false);
	}, 100);
};

// Keep sidebar visible when opening menus within it
this.holdPopupNodes = [];
this.holdPopupMenu = function(e) {
	// don't do anything on tooltips! the UI might collapse altogether
	if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
	
	var trigger = e.originalTarget.triggerNode;
	var target = e.target;
	
	// don't bother with any of this if the opened popup is a child of any currently opened panel
	for(p of holdPopupNodes) {
		if(target != p.popup && isAncestor(target, p.popup)) { return; }
	}
	
	// check if the trigger node is present in our sidebar toolbars
	var hold = null;
	for(var b in sidebars) {
		if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
		
		if(isAncestor(trigger, sidebars[b].box) || isAncestor(e.originalTarget, sidebars[b].box)) {
			hold = sidebars[b];
			break;
		}
	}
	
	// try to use the anchor specified when opening the popup, if any
	if(!hold && target.anchorNode) {
		for(var b in sidebars) {
			if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
			
			if(isAncestor(target.anchorNode, sidebars[b].box)) {
				hold = sidebars[b];
				break;
			}
		}
	}
	
	// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
	if(!hold && !trigger) {
		if(target.id == 'customizationui-widget-panel') {
			barsLoop:
			for(var b in sidebars) {
				if(!sidebars[b].resizeBox || !sidebars[b].toolbar || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(sidebars[b].toolbar.id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w] && widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = sidebars[b];
					break barsLoop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else {
			for(var b in sidebars) {
				if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
				
				if(isAncestor(target, sidebars[b].box)) {
					hold = sidebars[b];
					
					// the search engine selection menu is an anonymous child of the searchbar: e.target == $('searchbar'),
					// so we need to explicitely get the actual menu to use
					if(target.id == 'searchbar') {
						target = document.getAnonymousElementByAttribute(target, 'anonid', 'searchbar-popup');
					}
					
					break;
				}
			}
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = dispatch(target, { type: 'AskingForNodeOwner', asking: true });
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			
			if(trigger) {
				for(var b in sidebars) {
					if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
					
					if(isAncestor(trigger, sidebars[b].box)) {
						hold = sidebars[b];
						break;
					}
				}
			}
		}
	}
	
	// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
	if(hold && target.state == 'open') {
		// if we're opening the sidebar now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNodes.push(target);
		
		if(!trueAttribute(hold.resizeBox, 'hover') && !$$('#'+hold.box.id+':hover')[0]) {
			hideIt(target);
			hold._transition.add(popupsFinishedVisible);
			Timers.init('ensureHoldPopupShows', popupsFinishedVisible, 400);
		}
		
		setHover(hold, true);
		
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			Listeners.remove(target, 'popuphidden', selfRemover);
			popupsRemoveListeners();
			
			// making sure we don't collapse it permanently
			hideIt(target, true);
			
			setHover(hold, false);
			
			aSync(function() {
				if(typeof(holdPopupNodes) != 'undefined' && holdPopupNodes.indexOf(target) > -1) {
					holdPopupNodes.splice(holdPopupNodes.indexOf(target), 1);
				}
			}, 150);
		}
		Listeners.add(target, 'popuphidden', selfRemover);
	}
};

this.popupsRemoveListeners = function() {
	Timers.cancel('ensureHoldPopupShows');
	for(var b in sidebars) {
		if(sidebars[b].autoHide && sidebars[b]._transition) {
			sidebars[b]._transition.remove(popupsFinishedVisible);
		}
	}
};

this.popupsFinishedVisible = function() {
	popupsRemoveListeners();
	if(holdPopupNodes.length > 0) {
		for(var popup of holdPopupNodes) {
			// don't bother if the popup was never hidden to begin with,
			// it's not needed (the toolbar was already visible when it opened), so the popup is already properly placed,
			// also this prevents some issues, for example the context menu jumping to the top left corner
			if(!popup.collapsed) { continue; }
			
			// obviously we won't need to move it if it isn't open
			if(popup.open || popup.state == 'open') {
				popup.moveTo(-1,-1);
				hideIt(popup, true);
			}
		}
		
		// in case opening the popup triggered the toolbar to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
		// won't hide the toolbar with the popup still shown
		for(var b in sidebars) {
			if(!sidebars[b].autoHide || !trueAttribute(sidebars[b].resizeBox, 'hover')) { continue; }
			
			if(sidebars[b].hovers === 1 && $$('#'+sidebars[b].box.id+':hover')[0]) {
				setHover(sidebars[b], true);
			}
		}
	}
};

this.setAutoHideWidth = function() {
	// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
	// I'm not supporting other versions of OSX, just this one isn't simple as it is
	var moveBy = (!WINNT) ? -1 : 0;
	var leftOffset = moveBy +moveLeft;
	var rightOffset = moveBy +moveRight;
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(ltr):not([movetoright]) .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(ltr)[movetoleft] .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(rtl)[movetoright] .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(rtl):not([movetoleft]) .omnisidebar_resize_box {\n';
	sscode += '		left: '+leftOffset+'px !important;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(ltr)[movetoright] .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(ltr):not([movetoleft]) .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(rtl):not([movetoright]) .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(rtl)[movetoleft] .omnisidebar_resize_box {\n';
	sscode += '		right: '+rightOffset+'px !important;\n';
	sscode += '	}\n';
	
	if(Prefs.renderabove && Prefs.autoHide && mainSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]):not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]) #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]):not([dontReHover]) #omnisidebar-resizebox[hiding],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright]:not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright]:not([dontReHover]) #omnisidebar-resizebox[hiding] {\n';
		sscode += '		left: ' + (mainSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright]:not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright]:not([dontReHover]) #omnisidebar-resizebox[hiding],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]):not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]):not([dontReHover]) #omnisidebar-resizebox[hiding] {\n';
		sscode += '		right: ' + (mainSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	if(Prefs.renderaboveTwin && Prefs.autoHideTwin && twinSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]) #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin[hiding],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft] #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin[hiding] {\n';
		sscode += '		right: ' + (twinSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft] #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin[hiding],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]) #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin[hiding] {\n';
		sscode += '		left: ' + (twinSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	sscode += '}';
	
	Styles.load('autoHideWidthURI_'+_UUID, sscode, true);
};

this.onDragEnter = function(bar) {
	setHover(bar, true, 1);
	Listeners.add(window.gBrowser, "dragenter", onDragExitAll);
	Listeners.add(window, "drop", onDragExitAll);
	Listeners.add(window, "dragend", onDragExitAll);
};

this.onDragExit = function(bar) {
	setHover(bar, false);
	if(!bar.resizeBox.hovers) {
		hidingSidebar(bar);
	}
};

this.onDragExitAll = function() {
	Listeners.remove(window.gBrowser, "dragenter", onDragExitAll);
	Listeners.remove(window, "drop", onDragExitAll);
	Listeners.remove(window, "dragend", onDragExitAll);
	setBothHovers(false);
	if(mainSidebar.resizeBox) { hidingSidebar(mainSidebar); }
	if(twinSidebar.resizeBox) { hidingSidebar(twinSidebar); }
};

// delays auto hiding of the sidebar
this.hidingSidebar = function(bar) {
	bar.resizeBox.setAttribute('hiding', 'true');
	Timers.init('hidingSidebar'+(bar.twin ? 'Twin' : ''), function() {
		removeAttribute(bar.resizeBox, 'hiding');
	}, Prefs.hideDelay);
};

// handles mousing over the sidebar switch
this.autoHideSwitchOver = function(e) {
	var bar = e.target == twinSidebar.switcher ? twinSidebar : mainSidebar;
	var hover = bar.above && bar.autoHide;
	
	if(hover) {
		Timers.init('switchMouseOver', function() {
			setHover(bar, true);
		}, Prefs.showDelay);
	}
};

this.autoHideSwitchOut = function(e) {
	var bar = e.target == twinSidebar.switcher ? twinSidebar : mainSidebar;
	
	Timers.cancel('switchMouseOver');
	setHover(bar, false);
};

this.autoHideFocus = function(e) {
	if(!e.target) { return; }
	
	var bar = null;
	if(mainSidebar.sidebar && document.commandDispatcher.focusedWindow == mainSidebar.sidebar.contentWindow) {
		bar = mainSidebar;
	} else if(twinSidebar.sidebar && document.commandDispatcher.focusedWindow == twinSidebar.sidebar.contentWindow) {
		bar = twinSidebar;
	}
	
	if(bar && !bar.closed && bar.above && bar.autoHide && !bar.contentFocused && document.commandDispatcher.focusedElement
	&& (document.commandDispatcher.focusedElement.localName == 'input' || document.commandDispatcher.focusedElement.localName == 'textarea')) {
		setHover(bar, true);
		bar.contentFocused = true;
	}
};

this.autoHideBlur = function(e) {
	if(!e.target) { return; }
	
	if(mainSidebar.contentFocused) {
		setHover(mainSidebar, false);
		mainSidebar.contentFocused = false;
	}
	if(twinSidebar.contentFocused) {
		setHover(twinSidebar, false);
		twinSidebar.contentFocused = false;
	}
};

this.setBothHovers = function(hover) {
	setHover(mainSidebar, hover);
	setHover(twinSidebar, hover);
};

this.setHover = function(bar, hover, force) {
	if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { return; }
	
	if(hover) {
		bar.resizeBox.hovers++;
		setAttribute(bar.resizeBox, 'hover', 'true');
		removeAttribute(bar.box, 'dontReHover');
		if(force != undefined && typeof(force) == 'number') {
			bar.resizeBox.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			bar.resizeBox.hovers = force;
		} else if(bar.resizeBox.hovers > 0) {
			bar.resizeBox.hovers--;
		}
		if(bar.resizeBox.hovers == 0) {
			removeAttribute(bar.resizeBox, 'hover');
		}
	}
};

this.initialShowBar = function(bar, delay) {
	if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { return; }
	
	if(bar.box.hidden) {
		setHover(bar, false, 0);
		return;
	}
	
	setHover(bar, true);
	
	// don't use Timers, because if we use multiple initialShowBar()'s it would get stuck open
	// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
	var thisShowing = aSync(function() {
		if(typeof(setHover) != 'undefined' && bar.initialShowings) {
			setHover(bar, false);
			bar.initialShowings.splice(bar.initialShowings.indexOf(thisShowing), 1);
		}
	}, delay);
	bar.initialShowings.push(thisShowing);
};

this.toggleFX = function() {
	toggleAttribute(mainSidebar.box, 'disablefx', !Prefs.fx);
	toggleAttribute(twinSidebar.box, 'disablefx', !Prefs.fx);
};

this.loadAutoHideMain = function(window) {
	if(window[objName] && window[objName].setAutoHide) { window[objName].setAutoHide(window[objName].mainSidebar); }
};

this.loadAutoHideTwin = function(window) {
	if(window[objName] && window[objName].setAutoHide) { window[objName].setAutoHide(window[objName].twinSidebar); }
};

this.unloadAutoHideMain = function(window) {
	if(window[objName] && window[objName].setAutoHide) { window[objName].setAutoHide(window[objName].mainSidebar, true); }
};

this.unloadAutoHideTwin = function(window) {
	if(window[objName] && window[objName].setAutoHide) { window[objName].setAutoHide(window[objName].twinSidebar, true); }
};

this.toggleAutoHide = function() {
	if(Prefs.autoHide) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide', null, loadAutoHideMain, unloadAutoHideMain);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
	}
	
	if(Prefs.autoHideTwin) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin', null, loadAutoHideTwin, unloadAutoHideTwin);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
	}
};

Modules.LOADMODULE = function() {
	Styles.load('autohideSheet', 'autohide');
	
	Prefs.listen('autoHide', toggleAutoHide);
	Prefs.listen('autoHideTwin', toggleAutoHide);
	Prefs.listen('fx', toggleFX);
	
	toggleAutoHide();
	
	Listeners.add(window, 'endToggleSidebar', listenerToggleSwitcher);
	Listeners.add(window, 'SidebarFocused', showOnFocus);
	Listeners.add(window, 'SidebarFocusedSync', visibleOnLoad);
	Listeners.add(window, 'startSidebarResize', showOnResizeStart);
	Listeners.add(window, 'endSidebarResize', hideOnResizeEnd);
	Listeners.add(window, 'popupshown', holdPopupMenu);
	Listeners.add(window, 'focus', autoHideFocus, true);
	Listeners.add(window, 'blur', autoHideBlur, true);
	
	Listeners.add(window, 'sidebarWidthChanged', setAutoHideWidth);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'endToggleSidebar', listenerToggleSwitcher);
	Listeners.remove(window, 'SidebarFocused', showOnFocus);
	Listeners.remove(window, 'SidebarFocusedSync', visibleOnLoad);
	Listeners.remove(window, 'startSidebarResize', showOnResizeStart);
	Listeners.remove(window, 'endSidebarResize', hideOnResizeEnd);
	Listeners.remove(window, 'popupshown', holdPopupMenu);
	Listeners.remove(window, 'focus', autoHideFocus, true);
	Listeners.remove(window, 'blur', autoHideBlur, true);
	
	Listeners.remove(mainSidebar.switcher, 'mouseover', autoHideSwitchOver);
	Listeners.remove(mainSidebar.switcher, 'dragenter', autoHideSwitchOver);
	Listeners.remove(mainSidebar.switcher, 'mouseout', autoHideSwitchOut);
	Listeners.remove(twinSidebar.switcher, 'mouseover', autoHideSwitchOver);
	Listeners.remove(twinSidebar.switcher, 'dragenter', autoHideSwitchOver);
	Listeners.remove(twinSidebar.switcher, 'mouseout', autoHideSwitchOut);
	
	Listeners.remove(window, 'sidebarWidthChanged', setAutoHideWidth);
	
	Prefs.unlisten('autoHide', toggleAutoHide);
	Prefs.unlisten('autoHideTwin', toggleAutoHide);
	Prefs.unlisten('fx', toggleFX);
	
	Styles.unload('autoHideWidthURI_'+_UUID);
	
	if(UNLOADED) {
		Styles.unload('autohideSheet');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
	}
};
