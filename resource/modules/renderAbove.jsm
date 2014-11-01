Modules.VERSION = '1.1.1';

this.dragalt = null;
this.dragorix = null;
this.dragTarget = null;
this.dragNotTarget = null;
this.dragNewW = null;
this.dragOtherW = null;

// Drag (resize when renderabove) handlers
this.dragStart = function(e) {
	if(e.which != '1' || customizing) { return; }
	
	Listeners.add(window, "mousemove", drag);
	Listeners.add(window, "mouseup", dragEnd);
	
	if(e.target.id == objName+'-resizer' || e.target.id == 'sidebar-splitter') {
		dragTarget = {
			target: mainSidebar,
			oriW: mainSidebar.width
		};
		dragNotTarget = {
			target: twinSidebar,
			oriW: twinSidebar.width
		};
	} else {
		dragTarget = {
			target: twinSidebar,
			oriW: twinSidebar.width
		};
		dragNotTarget = {
			target: mainSidebar,
			oriW: mainSidebar.width
		};
	}
	
	dispatch(dragTarget.target.box, { type: 'startSidebarResize', cancelable: false, detail: { bar: dragTarget.target } });
};

this.dragEnd = function(e) {
	Listeners.remove(window, "mousemove", drag);
	Listeners.remove(window, "mouseup", dragEnd);
	
	dragTarget.target.box.style.width = '';
	if(dragNotTarget.target.box) {
		dragNotTarget.target.box.style.width = '';
		if(dragTarget.target.width > browser.clientWidth -dragNotTarget.oriW -Prefs.minSpaceBetweenSidebars) {
			setAttribute(dragNotTarget.target.box, 'width', browser.clientWidth -Prefs.minSpaceBetweenSidebars -dragTarget.target.width);
		} else {
			setAttribute(dragNotTarget.target.box, 'width', dragNotTarget.oriW);
		}
	}
	
	// Don't need to wait for the timers to fire themselves, since we've finished resizing at this point
	// No weird jump of sidebar size back to the original size for a moment when renderabove is on.
	setAboveWidth();
	
	dispatch(dragTarget.target.box, { type: 'endSidebarResize', cancelable: false, detail: { bar: dragTarget.target } });
};

this.drag = function(e) {
	var maxWidth = browser.clientWidth -Prefs.minSidebarWidth -Prefs.minSpaceBetweenSidebars;
	if(dragTarget.target.width < Prefs.minSidebarWidth) { setAttribute(dragTarget.target.box, 'width', Prefs.minSidebarWidth); } // we so don't want this...
	else if(dragTarget.target.width > maxWidth) { setAttribute(dragTarget.target.box, 'width', maxWidth); } // or this
	
	// If new width makes it overlap the other sidebar...
	if(dragNotTarget.target.box) {
		if(dragTarget.target.width > browser.clientWidth -dragNotTarget.oriW -Prefs.minSpaceBetweenSidebars) {
			setAttribute(dragNotTarget.target.box, 'width', browser.clientWidth -Prefs.minSpaceBetweenSidebars -dragTarget.target.width);
		} else {
			setAttribute(dragNotTarget.target.box, 'width', dragNotTarget.oriW);
		}
	}
	
	// Temporarily apply new widths in renderabove
	if(dragTarget.target.above) {
		dragTarget.target.box.style.width = dragTarget.target.width +'px';
	}
	if(dragNotTarget.target.box && dragNotTarget.target.above) {
		dragNotTarget.target.box.style.width = dragNotTarget.target.width +'px';
	}
};

this.setHeight = function() {
	var moveBy = $('main-window').getAttribute('sizemode') == 'normal' ? +1 : 0;
	// I can't set these by css, cpu usage goes through the roof?!
	if(mainSidebar.box) { mainSidebar.box.style.height = (Prefs.renderabove) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
	if(twinSidebar.box) { twinSidebar.box.style.height = (Prefs.renderaboveTwin) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
};

this.setAboveWidth = function() {
	// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
	// I'm not supporting other versions of OSX, just this one isn't simple as it is
	var moveBy = (!WINNT) ? -1 : 0;
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
	
	if(Prefs.renderabove && mainSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove] { width: ' + mainSidebar.width + 'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(ltr):not([movetoright]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(rtl)[movetoright] {\n';
		sscode += '		left: -' + mainSidebar.width + 'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(ltr)[movetoright],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(rtl):not([movetoright]) {\n';
		sscode += '		right: -' + mainSidebar.width + 'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(ltr):not([movetoright]) #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox {\n';
		sscode += '		left: ' + (mainSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox {\n';
		sscode += '		right: ' + (mainSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	if(Prefs.renderaboveTwin && twinSidebar.width) {
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove] { width: ' + twinSidebar.width + 'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(ltr):not([movetoleft]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(rtl)[movetoleft] {\n';
		sscode += '		right: -' + twinSidebar.width + 'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(ltr)[movetoleft],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(rtl):not([movetoleft]) {\n';
		sscode += '		left: -' + twinSidebar.width + 'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(ltr):not([movetoleft]) #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoleft] #omnisidebar-resizebox-twin {\n';
		sscode += '		right: ' + (twinSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoleft]) #omnisidebar-resizebox-twin {\n';
		sscode += '		left: ' + (twinSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	sscode += '}';
	
	Styles.load('aboveWidthURI_'+_UUID, sscode, true);
};

this.setResizerDirection = function(resizer) {
	if(RTL) {
		var value = resizer.getAttribute('dir');
		if(value == 'left') { value = 'right'; } else { value = 'left'; }
		setAttribute(resizer, 'dir', value);
	}
};

this.toggleSquared = function() {
	toggleAttribute(mainSidebar.box, 'squareLook', Prefs.aboveSquared);
	toggleAttribute(twinSidebar.box, 'squareLook', Prefs.aboveSquared);
};

this.toggleAbove = function(twin) {
	if(customizing) { return; }
	
	if(twin) {
		Prefs.renderaboveTwin = !Prefs.renderaboveTwin;
	} else {
		Prefs.renderabove = !Prefs.renderabove;
	}
};

this.toggleDockers = function() {
	toggleAttribute(mainSidebar.box, 'nodock', Prefs.hideheaderdock);
	toggleAttribute(twinSidebar.box, 'nodock', Prefs.hideheaderdockTwin);
	
	toggleHeaders();
};

this.toggleDockerStatus = function(bar) {
	toggleAttribute(bar.docker, 'sidebarDocked', bar.above);
	toggleAttribute(bar.docker, 'tooltiptext', bar.above, Strings.get('buttons', 'dockbutton'), Strings.get('buttons', 'undockbutton'));
};

this.toggleRenderAbove = function() {
	if(Prefs.renderabove) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove', null, loadRenderAboveMain, loadRenderAboveMain);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
	}
	
	if(Prefs.renderaboveTwin) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin', null, loadRenderAboveTwin, loadRenderAboveTwin);
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
	}
};

this.loadRenderAboveMain = function(window) {
	if(window[objName] && window[objName].setAbove) { window[objName].setAbove(window[objName].mainSidebar); }
};

this.loadRenderAboveTwin = function(window) {
	if(window[objName] && window[objName].setAbove) { window[objName].setAbove(window[objName].twinSidebar); }
};

this.setAbove = function(bar) {
	toggleAttribute(bar.box, 'renderabove', bar.above);
	toggleAttribute(bar.box, 'squareLook', Prefs.aboveSquared);
	
	toggleDockerStatus(bar);
	
	setHeight();
	setAboveWidth();
	setResizerDirection(bar.resizer);
	
	if(bar.above) {
		dispatch(bar.resizeBox, { type: 'sidebarAbove', cancelable: false });
		if(!UNLOADED && !bar.closed) {
			fireSidebarFocusedEvent(bar.twin);
		}
	} else {
		dispatch(bar.box, { type: 'sidebarDocked', cancelable: false });
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker', null,
		function(aWindow) { aWindow[objName].toggleDockerStatus(aWindow[objName].mainSidebar); }
	);
	Overlays.overlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin', null,
		function(aWindow) { aWindow[objName].toggleDockerStatus(aWindow[objName].twinSidebar); }
	);
	Modules.load('autohide');
	
	Listeners.add(window, 'sidebarWidthChanged', setAboveWidth);
	
	Prefs.listen('hideheaderdock', toggleDockers);
	Prefs.listen('hideheaderdockTwin', toggleDockers);
	Prefs.listen('renderabove', toggleRenderAbove);
	Prefs.listen('renderaboveTwin', toggleRenderAbove);
	Prefs.listen('aboveSquared', toggleSquared);
	
	toggleDockers();
	toggleRenderAbove();
	
	hideMainHeader.__defineGetter__('docker', function() { return Prefs.hideheaderdock; });
	hideTwinHeader.__defineGetter__('docker', function() { return Prefs.hideheaderdockTwin; });
	
	Listeners.add(browser, 'browserResized', setHeight);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(browser, 'browserResized', setHeight);
	
	delete hideMainHeader.docker;
	delete hideTwinHeader.docker;
	
	removeAttribute(mainSidebar.box, 'renderabove');
	removeAttribute(twinSidebar.box, 'renderabove');
	removeAttribute(mainSidebar.box, 'squareLook');
	removeAttribute(twinSidebar.box, 'squareLook');
	
	Listeners.remove(window, 'sidebarWidthChanged', setAboveWidth);
	
	Prefs.unlisten('hideheaderdock', toggleDockers);
	Prefs.unlisten('hideheaderdockTwin', toggleDockers);
	Prefs.unlisten('renderabove', toggleRenderAbove);
	Prefs.unlisten('renderaboveTwin', toggleRenderAbove);
	Prefs.unlisten('aboveSquared', toggleSquared);
	
	Modules.unload('autohide');
	Styles.unload('aboveWidthURI_'+_UUID);
	
	if(UNLOADED) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
		Overlays.removeOverlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker');
		Overlays.removeOverlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin');
	}
};
