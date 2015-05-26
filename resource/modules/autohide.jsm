Modules.VERSION = '2.0.0';

this.autoHide = {
	handleEvent: function(e) {
		switch(e.type) {
			// handles mousing over the sidebar switch
			case 'endToggleSidebar':
				e.detail.bar.toggleSwitcher();
				break;
			
			case 'SidebarFocusedSync':
				// visibility:hidden makes it impossible to use .focus() within the sidebar (bookmarks/history)
				setAttribute(e.detail.bar.resizeBox, 'SidebarFocused', 'true');
				break;
			
			case 'SidebarFocused':
				var bar = e.detail.bar;
				
				// hover the sidebar for a moment when it opens even if the mouse isn't there, so the user knows the sidebar opened
				if(!Prefs.noInitialShow || bar.autoHideInit) {
					this.initialShow(bar, 1000);
				}
				
				removeAttribute(bar.resizeBox, 'SidebarFocused');
				break;
			
			case 'startSidebarResize':
				this.setHover(e.detail.bar, true);
				
				// So it doesn't jump around when resizing
				setAttribute(mainSidebar.box, 'disablefx', 'true');
				setAttribute(twinSidebar.box, 'disablefx', 'true');
				break;
			
			case 'endSidebarResize':
				this.setWidth();
				
				// Delayed removal of "nohide" attribute is so the sidebar won't hide itself just after we finished resizing 
				// (finish resizing -> new values saved -> animations) and not (finish resizing -> animations -> new values saved)
				Timers.init('resizeDragEnd', () => {
					this.toggleFX();
					this.setHover(e.detail.bar, false);
				}, 100);
				break;
			
			case 'popupshown':
				this.holdPopupMenu(e);
				break;
			
			case 'transitionend':
				this.popupsFinishedVisible();
				break;
			
			case 'sidebarWidthChanged':
				this.setWidth();
				break;
			
			case 'dragenter':
			case 'drop':
			case 'dragend':
				Listeners.remove(gBrowser, "dragenter", this);
				Listeners.remove(window, "drop", this);
				Listeners.remove(window, "dragend", this);
				
				this.setHover(mainSidebar, false);
				this.setHover(twinSidebar, false);
				
				if(mainSidebar.resizeBox) { this.hidingSidebar(mainSidebar); }
				if(twinSidebar.resizeBox) { this.hidingSidebar(twinSidebar); }
				break;
			
			case 'focus':
				if(!e.target) { return; }
				
				var bar = null;
				if(mainSidebar.sidebar && document.commandDispatcher.focusedWindow == mainSidebar.sidebar.contentWindow) {
					bar = mainSidebar;
				} else if(twinSidebar.sidebar && document.commandDispatcher.focusedWindow == twinSidebar.sidebar.contentWindow) {
					bar = twinSidebar;
				}
				
				if(bar && !bar.closed && bar.above && bar.autoHide && !bar.contentFocused && document.commandDispatcher.focusedElement
				&& (document.commandDispatcher.focusedElement.localName == 'input' || document.commandDispatcher.focusedElement.localName == 'textarea')) {
					this.setHover(bar, true);
					bar.contentFocused = true;
				}
				break;
			
			case 'blur':
				if(!e.target) { return; }
				
				if(mainSidebar.contentFocused) {
					this.setHover(mainSidebar, false);
					mainSidebar.contentFocused = false;
				}
				if(twinSidebar.contentFocused) {
					this.setHover(twinSidebar, false);
					twinSidebar.contentFocused = false;
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'fx':
				this.toggleFX();
				break;
			
			case 'autoHide':
			case 'autoHideTwin':
				this.toggle();
				break;
		}
	},
	
	unset: function(bar) {
		if(!bar._autohide) { return; }
		
		removeAttribute(bar.box, 'autohide');
		removeAttribute(bar.resizeBox, 'hover');
		delete bar.resizeBox.hovers;
		
		Listeners.remove(bar.resizeBox, 'transitionend', bar._autohide);
		Listeners.remove(bar.switcher, 'mouseover', bar._autohide);
		Listeners.remove(bar.switcher, 'dragenter', bar._autohide);
		Listeners.remove(bar.switcher, 'mouseout', bar._autohide);
		delete bar._autohide;
		
		bar.autoHideInit = false;
		
		this.setWidth();
		this.toggleFX();
	},
	
	set: function(bar) {
		if(bar._autohide) { return; }
		
		setAttribute(bar.box, 'autohide', 'true');
		bar.resizeBox.hovers = 0;
		
		// for use to call certain methods when the bar is actually shown (after the CSS transition)
		bar._autohide = {
			listeners: new Set(),
			add: function(listener) {
				this.listeners.add(listener);
			},
			remove: function(listener) {
				this.listeners.delete(listener);
			},
			handleEvent: function(e) {
				switch(e.type) {
					case 'transitionend':
						if(e.target != bar.resizeBox || e.propertyName != 'opacity' || !trueAttribute(bar, 'hover')) { return; }
						
						for(let listener of this.listeners) {
							try {
								if(listener.handleEvent) {
									listener.handleEvent(e);
								} else {
									listener(e);
								}
							}
							catch(ex) { Cu.reportError(ex); }
						}
						break;
					
					case 'mouseover':
					case 'dragenter':
						var hover = bar.above && bar.autoHide;
						
						if(hover) {
							// this also cancels the hiding if that was already initialized
							Timers.init('switchMouseOver', () => {
								autoHide.setHover(bar, true);
							}, (Timers['hidingSidebar'+(bar.twin ? 'Twin' : '')]) ? 0 : Prefs.showDelay);
						}
						break;
					
					case 'mouseout':
						Timers.cancel('switchMouseOver');
						autoHide.setHover(bar, false);
						break;
				}
			}
		};
		
		Listeners.add(bar.resizeBox, 'transitionend', bar._autohide);
		Listeners.add(bar.switcher, 'mouseover', bar._autohide);
		Listeners.add(bar.switcher, 'dragenter', bar._autohide);
		Listeners.add(bar.switcher, 'mouseout', bar._autohide);
		
		if(!Prefs.noInitialShow) {
			this.initialShow(bar, 1000);
		}
		
		bar.toggleSwitcher();
		
		aSync(function() {
			if(typeof(mainSidebar) == 'undefined') { return; }
			bar.autoHideInit = true;
		}, 2000);
		
		this.setWidth();
		this.toggleFX();
	},
	
	// Keep sidebar visible when opening menus within it
	holdPopupNodes: new Set(),
	holdPopupMenu: function(e) {
		// don't do anything on tooltips! the UI might collapse altogether
		if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
		
		var trigger = e.originalTarget.triggerNode;
		var target = e.target;
		
		// don't bother with any of this if the opened popup is a child of any currently opened panel
		for(let popup of this.holdPopupNodes) {
			if(target != popup && isAncestor(target, popup)) { return; }
		}
		
		// check if the trigger node is present in our sidebar toolbars
		var hold = null;
		for(let bar of sidebars) {
			if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }
			
			if(isAncestor(trigger, bar.box) || isAncestor(e.originalTarget, bar.box)) {
				hold = bar;
				break;
			}
		}
		
		// try to use the anchor specified when opening the popup, if any
		if(!hold && target.anchorNode) {
			for(let bar of sidebars) {
				if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }
				
				if(isAncestor(target.anchorNode, bar.box)) {
					hold = bar;
					break;
				}
			}
		}
		
		// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
		if(!hold && !trigger) {
			if(target.id == 'customizationui-widget-panel') {
				barsLoop: for(let bar of sidebars) {
					if(!bar.resizeBox || !bar.toolbar || bar.closed || !bar.above || !bar.autoHide) { continue; }
					
					var widgets = CustomizableUI.getWidgetsInArea(bar.toolbar.id);
					for(let w of widgets) {
						var widget = w.forWindow(window);
						if(!widget || !widget.node || !widget.node.open) { continue; }
						
						hold = bar;
						break barsLoop;
					}
				}
			}
			
			// let's just assume all panels that are children from these toolbars are opening from them
			else {
				for(let bar of sidebars) {
					if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }
					
					if(isAncestor(target, bar.box)) {
						hold = bar;
						
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
					for(let bar of sidebars) {
						if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }
						
						if(isAncestor(trigger, bar.box)) {
							hold = bar;
							break;
						}
					}
				}
			}
		}
		
		// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
		if(hold && target.state == 'open') {
			// if we're opening the sidebar now, the anchor may move, so we need to reposition the popup when it does
			this.holdPopupNodes.add(target);
			
			if(!trueAttribute(hold.resizeBox, 'hover') && !$$('#'+hold.box.id+':hover')[0]) {
				hideIt(target);
				hold._autohide.add(this);
				Timers.init('ensureHoldPopupShows', () => { this.popupsFinishedVisible(); }, 400);
			}
			
			this.setHover(hold, true);
			
			var selfRemover = (ee) => {
				if(ee.originalTarget != e.originalTarget) { return; } //submenus
				Listeners.remove(target, 'popuphidden', selfRemover);
				this.popupsRemoveListeners();
				
				// making sure we don't collapse it permanently
				hideIt(target, true);
				
				this.setHover(hold, false);
				
				aSync(() => {
					this.holdPopupNodes.delete(target);
				}, 150);
			}
			Listeners.add(target, 'popuphidden', selfRemover);
		}
	},
	
	popupsRemoveListeners: function() {
		Timers.cancel('ensureHoldPopupShows');
		for(let bar of sidebars) {
			if(bar.autoHide && bar._autohide) {
				bar._autohide.remove(this);
			}
		}
	},
	
	popupsFinishedVisible: function() {
		this.popupsRemoveListeners();
		if(this.holdPopupNodes.size > 0) {
			for(let popup of this.holdPopupNodes) {
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
			for(let bar of sidebars) {
				if(!bar.autoHide || !trueAttribute(bar.resizeBox, 'hover')) { continue; }
				
				if(bar.hovers === 1 && $$('#'+bar.box.id+':hover')[0]) {
					this.setHover(bar, true);
				}
			}
		}
	},
	
	setWidth: function() {
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
	},
	
	onDragEnter: function(bar) {
		this.setHover(bar, true, 1);
		Listeners.add(gBrowser, "dragenter", this);
		Listeners.add(window, "drop", this);
		Listeners.add(window, "dragend", this);
	},
	
	// delays auto hiding of the sidebar
	hidingSidebar: function(bar) {
		setAttribute(bar.resizeBox, 'hiding', 'true');
		Timers.init('hidingSidebar'+(bar.twin ? 'Twin' : ''), function() {
			removeAttribute(bar.resizeBox, 'hiding');
		}, Prefs.hideDelay);
	},
	
	setHover: function(bar, hover, force) {
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
	},
	
	initialShow: function(bar, delay) {
		if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { return; }
		
		if(bar.box.hidden) {
			this.setHover(bar, false, 0);
			return;
		}
		
		this.setHover(bar, true);
		
		// don't use Timers, because if we use multiple initialShow()'s it would get stuck open
		// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
		var thisShowing = aSync(() => {
			if(typeof(autoHide) != 'undefined' && bar.initialShowings.has(thisShowing)) {
				this.setHover(bar, false);
				bar.initialShowings.delete(thisShowing);
			}
		}, delay);
		bar.initialShowings.add(thisShowing);
	},
	
	toggleFX: function() {
		toggleAttribute(mainSidebar.box, 'disablefx', !Prefs.fx);
		toggleAttribute(twinSidebar.box, 'disablefx', !Prefs.fx);
	},
	
	loadMain: function(window) {
		if(window[objName] && window[objName].autoHide) {
			window[objName].autoHide.set(window[objName].mainSidebar);
		}
	},
	
	loadTwin: function(window) {
		if(window[objName] && window[objName].autoHide) {
			window[objName].autoHide.set(window[objName].twinSidebar);
		}
	},
	
	unloadMain: function(window) {
		if(window[objName] && window[objName].autoHide) {
			window[objName].autoHide.unset(window[objName].mainSidebar);
		}
	},
	
	unloadTwin: function(window) {
		if(window[objName] && window[objName].autoHide) {
			window[objName].autoHide.unset(window[objName].twinSidebar);
		}
	},
	
	toggle: function() {
		if(Prefs.autoHide) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide', {
				onLoad: this.loadMain,
				onUnload: this.unloadMain
			});
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
		}
		
		if(Prefs.autoHideTwin) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin', {
				onLoad: this.loadTwin,
				onUnload: this.unloadTwin
			});
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
		}
	}
};

Modules.LOADMODULE = function() {
	Styles.load('autohideSheet', 'autohide');
	
	Prefs.listen('autoHide', autoHide);
	Prefs.listen('autoHideTwin', autoHide);
	Prefs.listen('fx', autoHide);
	
	autoHide.toggle();
	
	Listeners.add(window, 'endToggleSidebar', autoHide);
	Listeners.add(window, 'SidebarFocused', autoHide);
	Listeners.add(window, 'SidebarFocusedSync', autoHide);
	Listeners.add(window, 'startSidebarResize', autoHide);
	Listeners.add(window, 'endSidebarResize', autoHide);
	Listeners.add(window, 'popupshown', autoHide);
	Listeners.add(window, 'focus', autoHide, true);
	Listeners.add(window, 'blur', autoHide, true);
	Listeners.add(window, 'sidebarWidthChanged', autoHide);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'endToggleSidebar', autoHide);
	Listeners.remove(window, 'SidebarFocused', autoHide);
	Listeners.remove(window, 'SidebarFocusedSync', autoHide);
	Listeners.remove(window, 'startSidebarResize', autoHide);
	Listeners.remove(window, 'endSidebarResize', autoHide);
	Listeners.remove(window, 'popupshown', autoHide);
	Listeners.remove(window, 'focus', autoHide, true);
	Listeners.remove(window, 'blur', autoHide, true);
	Listeners.remove(window, 'sidebarWidthChanged', autoHide);
	
	autoHide.unset(mainSidebar);
	autoHide.unset(twinSidebar);
	
	Prefs.unlisten('autoHide', autoHide);
	Prefs.unlisten('autoHideTwin', autoHide);
	Prefs.unlisten('fx', autoHide);
	
	Styles.unload('autoHideWidthURI_'+_UUID);
	
	if(UNLOADED) {
		Styles.unload('autohideSheet');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAbove.xul', 'autoHide');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/renderAboveTwin.xul', 'autoHideTwin');
	}
};
