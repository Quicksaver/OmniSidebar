moduleAid.VERSION = '1.1.6';

this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });

this.setAutoHide = function(bar) {
	toggleAttribute(bar.box, 'autohide', bar.autoHide);
	
	if(!bar.autoHide) {
		removeAttribute(bar.resizeBox, 'hover');
		delete bar.resizeBox.hovers;
		
		listenerAid.remove(bar.switcher, 'mouseover', autoHideSwitchOver);
		listenerAid.remove(bar.switcher, 'dragenter', autoHideSwitchOver);
		listenerAid.remove(bar.switcher, 'mouseout', autoHideSwitchOut);
		listenerAid.remove(bar.switcher, 'dragexit', autoHideSwitchOut);
	} else {
		bar.resizeBox.hovers = 0;
		setHover(bar, true);
		timerAid.init('autohideSetSidebar'+(bar.twin ? 'Twin' : ''), function() { setHover(bar, false);}, 1000);
		
		listenerAid.add(bar.switcher, 'mouseover', autoHideSwitchOver);
		listenerAid.add(bar.switcher, 'dragenter', autoHideSwitchOver);
		listenerAid.add(bar.switcher, 'mouseout', autoHideSwitchOut);
		listenerAid.add(bar.switcher, 'dragexit', autoHideSwitchOut);
		bar.toggleSwitcher();
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
	if(bar.above && bar.autoHide) {
		setHover(bar, true, 1);
		timerAid.init('autohideSidebar'+(bar.twin ? 'Twin' : ''), function() { setHover(bar, false);}, 1000);
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
	timerAid.init('resizeDragEnd', function() {
		toggleFX();
		setHover(e.detail.bar, false);
	}, 100);
};

this.showOnOpenContextMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	
	if(isAncestor(trigger, mainSidebar.header)) {
		setHover(mainSidebar, true);
	}
	else if(isAncestor(trigger, twinSidebar.header)) {
		setHover(twinSidebar, true);
	}
};

this.hideOnCloseContextMenu = function() {
	setBothHovers(false);
};

this.setAutoHideWidth = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('autoHideWidthURI_'+_UUID);
	
	// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
	// I'm not supporting other versions of OSX, just this one isn't simple as it is
	var moveBy = (Services.appinfo.OS != 'WINNT') ? -1 : 0;
	var leftOffset = moveBy +moveLeft;
	var rightOffset = moveBy +moveRight;
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([movetoright]) .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide][movetoleft] .omnisidebar_resize_box {\n';
	sscode += '		left: '+leftOffset+'px !important;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide][movetoright] .omnisidebar_resize_box,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([movetoleft]) .omnisidebar_resize_box {\n';
	sscode += '		right: '+rightOffset+'px !important;\n';
	sscode += '	}\n';
	
	if(prefAid.renderabove && prefAid.autoHide && mainSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([movetoright]):not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([movetoright]) #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([movetoright]):not([dontReHover]) #omnisidebar-resizebox[hiding] { left: ' + (mainSidebar.width +leftOffset) + 'px !important; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide][movetoright]:not([dontReHover]) #omnisidebar-resizebox:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide][movetoright] #omnisidebar-resizebox[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide][movetoright]:not([dontReHover]) #omnisidebar-resizebox[hiding] { right: ' + (mainSidebar.width +rightOffset) + 'px !important; }\n';
	}
	
	if(prefAid.renderaboveTwin && prefAid.autoHideTwin && twinSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([movetoleft]) #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([movetoleft]):not([dontReHover]) #omnisidebar-resizebox-twin[hiding] { right: ' + (twinSidebar.width +rightOffset) + 'px !important; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide][movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide][movetoleft] #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide][movetoleft]:not([dontReHover]) #omnisidebar-resizebox-twin[hiding] { left: ' + (twinSidebar.width +leftOffset) + 'px !important; }\n';
	}
	
	sscode += '}';
	
	styleAid.load('autoHideWidthURI_'+_UUID, sscode, true);
};

this.onDragEnter = function(bar) {
	setHover(bar, true, 1);
	listenerAid.add(window.gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.add(window, "dragdrop", onDragExitAll, false);
	listenerAid.add(window, "dragend", onDragExitAll, false);
};

this.onDragExit = function(bar) {
	setHover(bar, false);
	hidingSidebar(bar);
};

this.onDragExitAll = function() {
	listenerAid.remove(window.gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.remove(window, "dragdrop", onDragExitAll, false);
	listenerAid.remove(window, "dragend", onDragExitAll, false);
	setBothHovers(false);
	if(mainSidebar.resizeBox) { hidingSidebar(mainSidebar); }
	if(twinSidebar.resizeBox) { hidingSidebar(twinSidebar); }
};

// delays auto hiding of the sidebar
this.hidingSidebar = function(bar) {
	bar.resizeBox.setAttribute('hiding', 'true');
	timerAid.init('hidingSidebar'+(bar.twin ? 'Twin' : ''), function() {
		bar.resizeBox.removeAttribute('hiding');
	}, prefAid.hideDelay);
};

// handles mousing over the sidebar switch
this.autoHideSwitchOver = function(e) {
	var bar = e.target == twinSidebar.switcher ? twinSidebar : mainSidebar;
	var hover = bar.above && bar.autoHide;
	
	if(hover) {
		timerAid.init('switchMouseOver', function() {
			setHover(bar, true);
		}, prefAid.showDelay);
	}
};

this.autoHideSwitchOut = function(e) {
	var bar = e.target == twinSidebar.switcher ? twinSidebar : mainSidebar;
	
	timerAid.cancel('switchMouseOver');
	setHover(bar, false);
};

this.setBothHovers = function(hover) {
	if(mainSidebar.resizeBox) { setHover(mainSidebar, hover); }
	if(twinSidebar.resizeBox) { setHover(twinSidebar, hover); }
};

this.setHover = function(bar, hover, force) {
	if(!bar.resizeBox) { return; }
	
	if(hover) {
		bar.resizeBox.hovers++;
		bar.resizeBox.setAttribute('hover', 'true');
		bar.box.removeAttribute('dontReHover');
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
			bar.resizeBox.removeAttribute('hover');
		}
	}
};

this.toggleFX = function() {
	toggleAttribute(mainSidebar.box, 'disablefx', !prefAid.fx);
	toggleAttribute(twinSidebar.box, 'disablefx', !prefAid.fx);
};

this.loadAutoHideMain = function(window) {
	window[objName].setAutoHide(window[objName].mainSidebar);
};

this.loadAutoHideTwin = function(window) {
	window[objName].setAutoHide(window[objName].twinSidebar);
};

this.toggleAutoHide = function(e) {
	if(prefAid.autoHide) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide', null, loadAutoHideMain, loadAutoHideMain);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
	}
	
	if(prefAid.autoHideTwin) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin', null, loadAutoHideTwin, loadAutoHideTwin);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
	}
};

moduleAid.LOADMODULE = function() {
	styleAid.load('autohideSheet', 'autohide');
	
	prefAid.listen('autoHide', toggleAutoHide);
	prefAid.listen('autoHideTwin', toggleAutoHide);
	prefAid.listen('fx', toggleFX);
	
	toggleAutoHide();
	
	listenerAid.add(window, 'endToggleSidebar', listenerToggleSwitcher);
	listenerAid.add(window, 'SidebarFocused', showOnFocus);
	listenerAid.add(window, 'openSidebarMenu', showOnOpenMenu);
	listenerAid.add(window, 'closeSidebarMenu', hideOnCloseMenu);
	listenerAid.add(window, 'openGoURIBar', showOnOpenGOMenu);
	listenerAid.add(window, 'closeGoURIBar', hideOnCloseGOMenu);
	listenerAid.add(window, 'startSidebarResize', showOnResizeStart);
	listenerAid.add(window, 'endSidebarResize', hideOnResizeEnd);
	listenerAid.add(contextMenu, 'popupshown', showOnOpenContextMenu, false);
	listenerAid.add(contextMenu, 'popuphiding', hideOnCloseContextMenu, false);
	
	listenerAid.add(window, 'sidebarWidthChanged', setAutoHideWidth);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'endToggleSidebar', listenerToggleSwitcher);
	listenerAid.remove(window, 'SidebarFocused', showOnFocus);
	listenerAid.remove(window, 'openSidebarMenu', showOnOpenMenu);
	listenerAid.remove(window, 'closeSidebarMenu', hideOnCloseMenu);
	listenerAid.remove(window, 'openGoURIBar', showOnOpenGOMenu);
	listenerAid.remove(window, 'closeGoURIBar', hideOnCloseGOMenu);
	listenerAid.remove(window, 'startSidebarResize', showOnResizeStart);
	listenerAid.remove(window, 'endSidebarResize', hideOnResizeEnd);
	listenerAid.remove(contextMenu, 'popupshown', showOnOpenContextMenu, false);
	listenerAid.remove(contextMenu, 'popuphiding', hideOnCloseContextMenu, false);
	
	listenerAid.remove(mainSidebar.switcher, 'mouseover', autoHideSwitchOver);
	listenerAid.remove(mainSidebar.switcher, 'dragenter', autoHideSwitchOver);
	listenerAid.remove(mainSidebar.switcher, 'mouseout', autoHideSwitchOut);
	listenerAid.remove(mainSidebar.switcher, 'dragexit', autoHideSwitchOut);
	listenerAid.remove(twinSidebar.switcher, 'mouseover', autoHideSwitchOver);
	listenerAid.remove(twinSidebar.switcher, 'dragenter', autoHideSwitchOver);
	listenerAid.remove(twinSidebar.switcher, 'mouseout', autoHideSwitchOut);
	listenerAid.remove(twinSidebar.switcher, 'dragexit', autoHideSwitchOut);
	
	listenerAid.remove(window, 'sidebarWidthChanged', setAutoHideWidth);
	
	prefAid.unlisten('autoHide', toggleAutoHide);
	prefAid.unlisten('autoHideTwin', toggleAutoHide);
	prefAid.unlisten('fx', toggleFX);
	
	styleAid.unload('autoHideWidthURI_'+_UUID);
	
	if(UNLOADED) {
		styleAid.unload('autohideSheet');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
	}
};
