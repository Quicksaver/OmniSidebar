// VERSION 2.0.5

this.renderAbove = {
	dragalt: null,
	dragorix: null,
	dragTarget: null,
	dragNotTarget: null,
	dragNewW: null,
	dragOtherW: null,

	handleEvent: function(e) {
		switch(e.type) {
			case 'mousemove':
				var maxWidth = browserBox.clientWidth -Prefs.minSidebarWidth -Prefs.minSpaceBetweenSidebars;
				// we so don't want this...
				if(this.dragTarget.target.width < Prefs.minSidebarWidth) {
					setAttribute(this.dragTarget.target.box, 'width', Prefs.minSidebarWidth);
				}
				// or this
				else if(this.dragTarget.target.width > maxWidth) {
					setAttribute(this.dragTarget.target.box, 'width', maxWidth);
				}

				// If new width makes it overlap the other sidebar...
				if(this.dragNotTarget.target.box) {
					if(this.dragTarget.target.width > browserBox.clientWidth -this.dragNotTarget.oriW -Prefs.minSpaceBetweenSidebars) {
						setAttribute(this.dragNotTarget.target.box, 'width', browserBox.clientWidth -Prefs.minSpaceBetweenSidebars -this.dragTarget.target.width);
					} else {
						setAttribute(this.dragNotTarget.target.box, 'width', this.dragNotTarget.oriW);
					}
				}

				// Temporarily apply new widths in renderabove
				if(this.dragTarget.target.above) {
					this.dragTarget.target.box.style.width = this.dragTarget.target.width +'px';
				}
				if(this.dragNotTarget.target.box && this.dragNotTarget.target.above) {
					this.dragNotTarget.target.box.style.width = this.dragNotTarget.target.width +'px';
				}
				break;

			case 'mouseup':
				Listeners.remove(window, "mousemove", this);
				Listeners.remove(window, "mouseup", this);

				this.dragTarget.target.box.style.width = '';
				if(this.dragNotTarget.target.box) {
					this.dragNotTarget.target.box.style.width = '';
					if(this.dragTarget.target.width > browserBox.clientWidth -this.dragNotTarget.oriW -Prefs.minSpaceBetweenSidebars) {
						setAttribute(this.dragNotTarget.target.box, 'width', browserBox.clientWidth -Prefs.minSpaceBetweenSidebars -this.dragTarget.target.width);
					} else {
						setAttribute(this.dragNotTarget.target.box, 'width', this.dragNotTarget.oriW);
					}
				}

				// Don't need to wait for the timers to fire themselves, since we've finished resizing at this point
				// No weird jump of sidebar size back to the original size for a moment when renderabove is on.
				this.setWidth();

				dispatch(this.dragTarget.target.box, { type: 'endSidebarResize', cancelable: false, detail: { bar: this.dragTarget.target } });
				break;

			case 'browserResized':
				this.setHeight();
				break;

			case 'sidebarWidthChanged':
				this.setWidth();
				break;

			case 'aftercustomization':
				// force a reflow, to prevent the sidebar being shorter momentarily after exiting customize mode
				aSync(function() {
					if(!mainSidebar.closed && mainSidebar.above) {
						mainSidebar.box.clientHeight;
					}
					if(!twinSidebar.closed && twinSidebar.above) {
						twinSidebar.box.clientHeight;
					}
				});
				break;
		}
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'aboveSquared':
				toggleAttribute(mainSidebar.box, 'squareLook', Prefs.aboveSquared);
				toggleAttribute(twinSidebar.box, 'squareLook', Prefs.aboveSquared);
				break;

			case 'showheaderdock':
			case 'showheaderdockTwin':
				this.toggleDockers();
				break;

			case 'renderabove':
			case 'renderaboveTwin':
				this.start();
				break;
		}
	},

	// Drag (resize when renderabove) handlers
	dragStart: function(e) {
		if(e.which != '1' || customizing) { return; }

		Listeners.add(window, "mousemove", this);
		Listeners.add(window, "mouseup", this);

		if(e.target.id == objName+'-resizer' || e.target.id == 'sidebar-splitter') {
			this.dragTarget = {
				target: mainSidebar,
				oriW: mainSidebar.width
			};
			this.dragNotTarget = {
				target: twinSidebar,
				oriW: twinSidebar.width
			};
		} else {
			this.dragTarget = {
				target: twinSidebar,
				oriW: twinSidebar.width
			};
			this.dragNotTarget = {
				target: mainSidebar,
				oriW: mainSidebar.width
			};
		}

		dispatch(this.dragTarget.target.box, { type: 'startSidebarResize', cancelable: false, detail: { bar: this.dragTarget.target } });
	},

	setHeight: function() {
		var moveBy = document.documentElement.getAttribute('sizemode') == 'normal' ? +1 : 0;
		// I can't set these by css, cpu usage goes through the roof?!
		if(mainSidebar.box) { mainSidebar.box.style.height = (Prefs.renderabove) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
		if(twinSidebar.box) { twinSidebar.box.style.height = (Prefs.renderaboveTwin) ? $('appcontent').clientHeight +moveBy +'px' : ''; }
	},

	setWidth: function() {
		// OSX Lion needs the sidebar to be moved one pixel or it will have a space between it and the margin of the window
		// I'm not supporting other versions of OSX, just this one isn't simple as it is
		var moveBy = (!WINNT) ? -1 : 0;
		var leftOffset = moveBy +moveLeft;
		var rightOffset = moveBy +moveRight;

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n';

		if(Prefs.renderabove && mainSidebar.width) {
			sscode += '\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove] { width: ' + mainSidebar.width + 'px; }\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(ltr):not([movetoright]),\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(rtl)[movetoright] {\n\
					left: -' + mainSidebar.width + 'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(ltr)[movetoright],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:-moz-locale-dir(rtl):not([movetoright]) {\n\
					right: -' + mainSidebar.width + 'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(ltr):not([movetoright]) #omnisidebar-resizebox,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoright] #omnisidebar-resizebox {\n\
					left: ' + (mainSidebar.width +leftOffset) + 'px !important;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoright] #omnisidebar-resizebox,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoright]) #omnisidebar-resizebox {\n\
					right: ' + (mainSidebar.width +rightOffset) + 'px !important;\n\
				}\n';
		}

		if(Prefs.renderaboveTwin && twinSidebar.width) {
			sscode += '\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove] { width: ' + twinSidebar.width + 'px; }\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(ltr):not([movetoleft]),\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(rtl)[movetoleft] {\n\
					right: -' + twinSidebar.width + 'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(ltr)[movetoleft],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:-moz-locale-dir(rtl):not([movetoleft]) {\n\
					left: -' + twinSidebar.width + 'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(ltr):not([movetoleft]) #'+objName+'-resizebox-twin,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl)[movetoleft] #'+objName+'-resizebox-twin {\n\
					right: ' + (twinSidebar.width +rightOffset) + 'px !important;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(ltr)[movetoleft] #'+objName+'-resizebox-twin,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove]:not([autohide]):-moz-locale-dir(rtl):not([movetoleft]) #'+objName+'-resizebox-twin {\n\
					left: ' + (twinSidebar.width +leftOffset) + 'px !important;\n\
				}\n';
		}

		sscode += '}';

		Styles.load('aboveWidthURI_'+_UUID, sscode, true);
	},

	setResizerDirection: function(resizer) {
		if(RTL) {
			var value = resizer.getAttribute('dir');
			if(value == 'left') { value = 'right'; } else { value = 'left'; }
			setAttribute(resizer, 'dir', value);
		}
	},

	toggle: function(twin) {
		if(customizing) { return; }

		if(twin) {
			Prefs.renderaboveTwin = !Prefs.renderaboveTwin;
		} else {
			Prefs.renderabove = !Prefs.renderabove;
		}
	},

	toggleDockers: function() {
		toggleAttribute(mainSidebar.box, 'nodock', !Prefs.showheaderdock);
		toggleAttribute(twinSidebar.box, 'nodock', !Prefs.showheaderdockTwin);

		headers.toggleHeaders();
	},

	toggleDockerStatus: function(bar) {
		this.toggleDockers();
		toggleAttribute(bar.docker, 'sidebarDocked', bar.above);
		toggleAttribute(bar.docker, 'tooltiptext', bar.above, Strings.get('buttons', 'dockbutton'), Strings.get('buttons', 'undockbutton'));
	},

	start: function() {
		if(Prefs.renderabove) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove', {
				onLoad: this.loadRenderAboveMain,
				onUnload: this.loadRenderAboveMain
			});
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
		}

		if(Prefs.renderaboveTwin) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin', {
				onLoad: this.loadRenderAboveTwin,
				onUnload: this.loadRenderAboveTwin
			});
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
		}
	},

	init: function(bar) {
		let focused = !UNLOADED && !bar.closed && bar.focused;

		toggleAttribute(bar.box, 'renderabove', bar.above);
		toggleAttribute(bar.box, 'squareLook', Prefs.aboveSquared);

		this.toggleDockerStatus(bar);
		this.setHeight();
		this.setWidth();
		this.setResizerDirection(bar.resizer);

		if(!UNLOADED && bar.above) {
			dispatch(bar.resizeBox, { type: 'sidebarAbove', cancelable: false });
			if(focused) {
				SidebarUI._fireFocusedEvent(bar);
			}
		} else {
			dispatch(bar.box, { type: 'sidebarDocked', cancelable: false });
		}
	},

	loadRenderAboveMain: function(aWindow) {
		if(aWindow[objName] && aWindow[objName].renderAbove) {
			aWindow[objName].renderAbove.init(aWindow[objName].mainSidebar);
		}
	},

	loadRenderAboveTwin: function(aWindow) {
		if(aWindow[objName] && aWindow[objName].renderAbove) {
			aWindow[objName].renderAbove.init(aWindow[objName].twinSidebar);
		}
	},

	loadDockerMain: function(aWindow) {
		if(aWindow[objName] && aWindow[objName].renderAbove) {
			aWindow[objName].renderAbove.toggleDockerStatus(aWindow[objName].mainSidebar);
		}
	},

	loadDockerTwin: function(aWindow) {
		if(aWindow[objName] && aWindow[objName].renderAbove) {
			aWindow[objName].renderAbove.toggleDockerStatus(aWindow[objName].twinSidebar);
		}
	}
};

Modules.LOADMODULE = function() {
	Overlays.overlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker', { onLoad: renderAbove.loadDockerMain });
	Overlays.overlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin', { onLoad: renderAbove.loadDockerTwin });
	Modules.load('autohide');

	Listeners.add(window, 'sidebarWidthChanged', renderAbove);
	Listeners.add(window, 'aftercustomization', renderAbove);

	Prefs.listen('showheaderdock', renderAbove);
	Prefs.listen('showheaderdockTwin', renderAbove);
	Prefs.listen('renderabove', renderAbove);
	Prefs.listen('renderaboveTwin', renderAbove);
	Prefs.listen('aboveSquared', renderAbove);

	renderAbove.toggleDockers();
	renderAbove.start();

	headers.hideMainHeader.set('docker', function() { return !Prefs.showheaderdock; });
	headers.hideTwinHeader.set('docker', function() { return !Prefs.showheaderdockTwin; });

	Listeners.add(browserBox, 'browserResized', renderAbove);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(browserBox, 'browserResized', renderAbove);

	headers.hideMainHeader.delete('docker');
	headers.hideTwinHeader.delete('docker');

	removeAttribute(mainSidebar.box, 'renderabove');
	removeAttribute(twinSidebar.box, 'renderabove');
	removeAttribute(mainSidebar.box, 'squareLook');
	removeAttribute(twinSidebar.box, 'squareLook');

	Listeners.remove(window, 'sidebarWidthChanged', renderAbove);
	Listeners.remove(window, 'aftercustomization', renderAbove);

	Prefs.unlisten('showheaderdock', renderAbove);
	Prefs.unlisten('showheaderdockTwin', renderAbove);
	Prefs.unlisten('renderabove', renderAbove);
	Prefs.unlisten('renderaboveTwin', renderAbove);
	Prefs.unlisten('aboveSquared', renderAbove);

	Modules.unload('autohide');
	Styles.unload('aboveWidthURI_'+_UUID);

	if(UNLOADED) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'renderAbove');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'renderAboveTwin');
		Overlays.removeOverlayURI("chrome://"+objPathString+"/content/headers.xul", 'renderAboveDocker');
		Overlays.removeOverlayURI("chrome://"+objPathString+"/content/headersTwin.xul", 'renderAboveDockerTwin');
	}
};
