moduleAid.VERSION = '1.0.13';

this.__defineGetter__('browser', function() { return $('browser'); });

this.dragalt = null;
this.dragorix = null;
this.dragTarget = null;
this.dragNotTarget = null;
this.dragNewW = null;
this.dragOtherW = null;

this.aboveRTL = false;

// Drag (resize when renderabove) handlers
this.dragStart = function(e) {
	if(e.which != '1' || customizing) { return; }
	
	listenerAid.add(window, "mousemove", drag, false);
	listenerAid.add(window, "mouseup", dragEnd, false);
	
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
	listenerAid.remove(window, "mousemove", drag, false);
	listenerAid.remove(window, "mouseup", dragEnd, false);
	
	dragTarget.target.box.style.width = '';
	if(dragNotTarget.target.box) {
		dragNotTarget.target.box.style.width = '';
		if(dragTarget.target.width > browser.clientWidth -dragNotTarget.oriW -prefAid.minSpaceBetweenSidebars) {
			dragNotTarget.target.box.setAttribute('width', browser.clientWidth -prefAid.minSpaceBetweenSidebars -dragTarget.target.width);
		} else {
			dragNotTarget.target.box.setAttribute('width', dragNotTarget.oriW);
		}
	}
	
	// Don't need to wait for the timers to fire themselves, since we've finished resizing at this point
	// No weird jump of sidebar size back to the original size for a moment when renderabove is on.
	setAboveWidth();
	
	dispatch(dragTarget.target.box, { type: 'endSidebarResize', cancelable: false, detail: { bar: dragTarget.target } });
};

this.drag = function(e) {
	var maxWidth = browser.clientWidth -prefAid.minSidebarWidth -prefAid.minSpaceBetweenSidebars;
	if(dragTarget.target.width < prefAid.minSidebarWidth) { dragTarget.target.box.setAttribute('width', prefAid.minSidebarWidth); } // we so don't want this...
	else if(dragTarget.target.width > maxWidth) { dragTarget.target.box.setAttribute('width', maxWidth); } // or this
	
	// If new width makes it overlap the other sidebar...
	if(dragNotTarget.target.box) {
		if(dragTarget.target.width > browser.clientWidth -dragNotTarget.oriW -prefAid.minSpaceBetweenSidebars) {
			dragNotTarget.target.box.setAttribute('width', browser.clientWidth -prefAid.minSpaceBetweenSidebars -dragTarget.target.width);
		} else {
			dragNotTarget.target.box.setAttribute('width', dragNotTarget.oriW);
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
	if(mainSidebar.box) { mainSidebar.box.style.height = (prefAid.renderabove && (Australis || !customizing)) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
	if(twinSidebar.box) { twinSidebar.box.style.height = (prefAid.renderaboveTwin && (Australis || !customizing)) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
};

this.setAboveWidth = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('aboveWidthURI_'+_UUID);
	
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
	
	if(prefAid.renderabove && mainSidebar.width) {
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
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[renderabove][customizing]:-moz-locale-dir(ltr):not([movetoright]) #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[customizing]:-moz-locale-dir(ltr):not([movetoright]) #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[renderabove][customizing]:-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[customizing]:-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox {\n';
		sscode += '		left: ' + (mainSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[renderabove][customizing]:-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[customizing]:-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[renderabove][customizing]:-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #sidebar-box[customizing]:-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox {\n';
		sscode += '		right: ' + (mainSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	if(prefAid.renderaboveTwin && twinSidebar.width) {
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
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[renderabove][customizing]:-moz-locale-dir(ltr):not([movetoleft]) #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[customizing]:-moz-locale-dir(ltr):not([movetoleft]) #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[renderabove][customizing]:-moz-locale-dir(rtl)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[customizing]:-moz-locale-dir(rtl)[movetoleft] #omnisidebar-resizebox-twin {\n';
		sscode += '		right: ' + (twinSidebar.width +rightOffset) + 'px !important;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[renderabove][customizing]:-moz-locale-dir(ltr)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[customizing]:-moz-locale-dir(ltr)[movetoleft] #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoleft]) #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[renderabove][customizing]:-moz-locale-dir(rtl):not([movetoleft]) #omnisidebar-resizebox-twin,\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not(['+objName+'_Australis]) #'+objName+'-sidebar-box-twin[customizing]:-moz-locale-dir(rtl):not([movetoleft]) #omnisidebar-resizebox-twin {\n';
		sscode += '		left: ' + (twinSidebar.width +leftOffset) + 'px !important;\n';
		sscode += '	}\n';
	}
	
	sscode += '}';
	
	styleAid.load('aboveWidthURI_'+_UUID, sscode, true);
};

this.setResizerDirection = function(resizer) {
	if(aboveRTL) {
		var value = resizer.getAttribute('dir');
		if(value == 'left') { value = 'right'; } else { value = 'left'; }
		setAttribute(resizer, 'dir', value);
	}
};

this.toggleSquared = function() {
	toggleAttribute(mainSidebar.box, 'squareLook', prefAid.aboveSquared);
	toggleAttribute(twinSidebar.box, 'squareLook', prefAid.aboveSquared);
};

this.toggleAbove = function(twin) {
	if(customizing) { return; }
	
	if(twin) {
		prefAid.renderaboveTwin = !prefAid.renderaboveTwin;
	} else {
		prefAid.renderabove = !prefAid.renderabove;
	}
};

this.toggleDockers = function(noHeaders) {
	toggleAttribute(mainSidebar.box, 'nodock', prefAid.hideheaderdock);
	toggleAttribute(twinSidebar.box, 'nodock', prefAid.hideheaderdockTwin);
	
	if(!noHeaders) {
		toggleHeaders();
	}
};

this.toggleDockerStatus = function(bar) {
	toggleAttribute(bar.docker, 'sidebarDocked', bar.above);
	toggleAttribute(bar.docker, 'tooltiptext', bar.above, stringsAid.get('buttons', 'dockbutton'), stringsAid.get('buttons', 'undockbutton'));
};

this.toggleRenderAbove = function() {
	if(prefAid.renderabove) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove', null, loadRenderAboveMain, loadRenderAboveMain);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
	}
	
	if(prefAid.renderaboveTwin) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin', null, loadRenderAboveTwin, loadRenderAboveTwin);
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
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
	toggleAttribute(bar.box, 'squareLook', prefAid.aboveSquared);
	
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

moduleAid.LOADMODULE = function() {
	aboveRTL = (window.getComputedStyle($('main-window')).getPropertyValue('direction') == 'rtl');
	
	styleAid.load('aboveSheet', 'above');
	overlayAid.overlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker', null,
		function(aWindow) { aWindow[objName].toggleDockerStatus(aWindow[objName].mainSidebar); }
	);
	overlayAid.overlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin', null,
		function(aWindow) { aWindow[objName].toggleDockerStatus(aWindow[objName].twinSidebar); }
	);
	moduleAid.load('autohide');
	
	listenerAid.add(window, 'sidebarWidthChanged', setAboveWidth);
	
	prefAid.listen('hideheaderdock', toggleDockers);
	prefAid.listen('hideheaderdockTwin', toggleDockers);
	prefAid.listen('renderabove', toggleRenderAbove);
	prefAid.listen('renderaboveTwin', toggleRenderAbove);
	prefAid.listen('aboveSquared', toggleSquared);
	
	toggleDockers(true);
	toggleRenderAbove();
	
	hideMainHeader.__defineGetter__('docker', function() { return prefAid.hideheaderdock; });
	hideTwinHeader.__defineGetter__('docker', function() { return prefAid.hideheaderdockTwin; });
	
	listenerAid.add(browser, 'browserResized', setHeight);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(browser, 'browserResized', setHeight);
	
	delete hideMainHeader.docker;
	delete hideTwinHeader.docker;
	
	removeAttribute(mainSidebar.box, 'renderabove');
	removeAttribute(twinSidebar.box, 'renderabove');
	removeAttribute(mainSidebar.box, 'squareLook');
	removeAttribute(twinSidebar.box, 'squareLook');
	
	listenerAid.remove(window, 'sidebarWidthChanged', setAboveWidth);
	
	prefAid.unlisten('hideheaderdock', toggleDockers);
	prefAid.unlisten('hideheaderdockTwin', toggleDockers);
	prefAid.unlisten('renderabove', toggleRenderAbove);
	prefAid.unlisten('renderaboveTwin', toggleRenderAbove);
	prefAid.unlisten('aboveSquared', toggleSquared);
	
	moduleAid.unload('autohide');
	styleAid.unload('aboveWidthURI_'+_UUID);
	
	if(UNLOADED) {
		styleAid.unload('aboveSheet');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
		overlayAid.removeOverlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker');
		overlayAid.removeOverlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin');
	}
};
