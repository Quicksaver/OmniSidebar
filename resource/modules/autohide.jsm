Modules.VERSION = '1.2.1';

this.setAutoHide = function(bar) {
	toggleAttribute(bar.box, 'autohide', bar.autoHide);
	
	if(!bar.autoHide) {
		removeAttribute(bar.resizeBox, 'hover');
		delete bar.resizeBox.hovers;
		
		Listeners.remove(bar.switcher, 'mouseover', autoHideSwitchOver);
		Listeners.remove(bar.switcher, 'dragenter', autoHideSwitchOver);
		Listeners.remove(bar.switcher, 'mouseout', autoHideSwitchOut);
		
		bar.autoHideInit = false;
	} else {
		bar.resizeBox.hovers = 0;
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

this.showOnFocus = function(e) {
	var bar = e.detail.bar;
	
	// hover the sidebar for a moment when it opens even if the mouse isn't there, so the user knows the sidebar opened
	if(!Prefs.noInitialShow || bar.autoHideInit || bar.autoHideInit) {
		initialShowBar(bar, 1000);
	}
};

this.showOnOpenMenu = function(e) {
	var bar = e.target == twinSidebar.title ? twinSidebar : mainSidebar;
	setHover(bar, true);
};

this.hideOnCloseMenu = function(e) {
	var bar = e.target == twinSidebar.title ? twinSidebar : mainSidebar;
	setHover(bar, false);
};

this.showOnOpenGOMenu = function(e) {
	setHover(e.detail.bar, true);
};

this.hideOnCloseGOMenu = function(e) {
	setHover(e.detail.bar, false);
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

this.showOnMenuShown = function(e) {
	var trigger = e.originalTarget.triggerNode || e.originalTarget;
	
	if(isAncestor(trigger, mainSidebar.box)) {
		setHover(mainSidebar, true);
	}
	else if(isAncestor(trigger, twinSidebar.box)) {
		setHover(twinSidebar, true);
	}
};

this.hideOnMenuHidden = function() {
	setBothHovers(false);
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

this.setBothHovers = function(hover) {
	setHover(mainSidebar, hover);
	setHover(twinSidebar, hover);
};

this.setHover = function(bar, hover, force) {
	if(!bar.resizeBox || !bar.above || !bar.autoHide) { return; }
	
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
	if(!bar.resizeBox || !bar.above || !bar.autoHide) { return; }
	
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

this.toggleAutoHide = function() {
	if(Prefs.autoHide) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide', null, loadAutoHideMain, loadAutoHideMain);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
	}
	
	if(Prefs.autoHideTwin) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin', null, loadAutoHideTwin, loadAutoHideTwin);
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
	Listeners.add(window, 'openSidebarMenu', showOnOpenMenu);
	Listeners.add(window, 'closeSidebarMenu', hideOnCloseMenu);
	Listeners.add(window, 'openGoURIBar', showOnOpenGOMenu);
	Listeners.add(window, 'closeGoURIBar', hideOnCloseGOMenu);
	Listeners.add(window, 'startSidebarResize', showOnResizeStart);
	Listeners.add(window, 'endSidebarResize', hideOnResizeEnd);
	Listeners.add(window, 'popupshown', showOnMenuShown);
	Listeners.add(window, 'popuphidden', hideOnMenuHidden);
	
	Listeners.add(window, 'sidebarWidthChanged', setAutoHideWidth);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'endToggleSidebar', listenerToggleSwitcher);
	Listeners.remove(window, 'SidebarFocused', showOnFocus);
	Listeners.remove(window, 'openSidebarMenu', showOnOpenMenu);
	Listeners.remove(window, 'closeSidebarMenu', hideOnCloseMenu);
	Listeners.remove(window, 'openGoURIBar', showOnOpenGOMenu);
	Listeners.remove(window, 'closeGoURIBar', hideOnCloseGOMenu);
	Listeners.remove(window, 'startSidebarResize', showOnResizeStart);
	Listeners.remove(window, 'endSidebarResize', hideOnResizeEnd);
	Listeners.remove(window, 'popupshown', showOnMenuShown);
	Listeners.remove(window, 'popuphidden', hideOnMenuHidden);
	
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
