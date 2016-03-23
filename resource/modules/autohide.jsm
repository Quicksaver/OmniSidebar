// VERSION 2.0.10

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
				// this is probably the event from the native SidebarUI that can be fired during startup, it doesn't really matter to us
				if(!e.detail) { return; }
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

			case 'popupshowing':
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
		Listeners.remove(bar.resizeBox, 'click', bar._autohide);
		Listeners.remove(bar.switcher, 'click', bar._autohide);
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
							let delay = (Timers['hidingSidebar'+(bar.twin ? 'Twin' : '')]) ? 0 : Prefs.showDelay;

							// this also cancels the hiding if that was already initialized
							Timers.init('switchMouseOver', () => {
								// Try not to double-mouseover items in child popups, otherwise it could lead to the toolbar getting stuck open.
								// For instance, NoScript's "dis/allow scripts on this page" changes the DOM of the popup, where hovered items could
								// be removed without triggering a mouseout event, leading to a subsequent mouseover on new/moved items.
								if(isAncestor(e.target, autoHide.hoveredPopup)) { return; }
								for(let popup of autoHide.holdPopupNodes) {
									if(isAncestor(e.target, popup)) {
										autoHide.hoveredPopup = popup;
										break;
									}
								}

								autoHide.setHover(bar, true);
							}, delay);
						}
						break;

					case 'mouseout':
						Timers.cancel('switchMouseOver');

						// see note above about preventing double-mouseovers
						if(isAncestor(e.target, autoHide.hoveredPopup)) {
							autoHide.hoveredPopup = null;
						}

						autoHide.setHover(bar, false);
						break;

					case 'click':
						// When pressing a button in the sidebar toolbar while keeping the mouse moving, it's possible the mouse would leave the sidebar/toolbar
						// before a popup is opened. So the siebar could temporarily start to hide because it is only stuck open *after*
						// the popup is finished opening. This would cause some visual glitches in the popups, like them flashing, showing only the borders,
						// or jumping to the top-left edge of the window.
						autoHide.initialShow(bar, 500);
						break;
				}
			}
		};

		Listeners.add(bar.resizeBox, 'transitionend', bar._autohide);
		Listeners.add(bar.switcher, 'mouseover', bar._autohide);
		Listeners.add(bar.switcher, 'dragenter', bar._autohide);
		Listeners.add(bar.switcher, 'mouseout', bar._autohide);
		Listeners.add(bar.resizeBox, 'click', bar._autohide);
		Listeners.add(bar.switcher, 'click', bar._autohide);

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
	hoveredPopup: null,
	holdPopupNodes: new Set(),
	releasePopups: new Map(),
	holdPopupMenu: function(e) {
		// don't do anything on tooltips! the UI might collapse altogether
		if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }

		// no need to do any of this if none of the sidebars are autohiding (or are closed)
		let proceed = false;
		for(let bar of sidebars) {
			if(bar.resizeBox && !bar.closed && bar.above && bar.autoHide) {
				proceed = true;
				break;
			}
		}
		if(!proceed) { return; }

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
							target = $ª(target, 'searchbar-popup');
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

		// Similarly to the 'click' handler above,
		// popups shouldn't flash or jump around because the sidebars are temporarily hidden before the popup is fully shown.
		if(e.type == 'popupshowing') {
			if(hold && (trueAttribute(hold.resizeBox, 'hover') || $$('#'+hold.box.id+':hover')[0])) {
				this.initialShow(hold, 500);
			}
			return;
		}

		// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
		if(hold && target.state == 'open') {
			// if we're opening the sidebar now, the anchor may move, so we need to reposition the popup when it does
			this.holdPopupNodes.add(target);

			// make sure the popup stays in the set, so that ones that open and close quickly
			// (i.e. multiple dis/allow actions in NoScript's popup) aren't removed while they're still open
			if(this.releasePopups.has(target)) {
				this.releasePopups.get(target).cancel();
				this.releasePopups.delete(target);
			}

			if(!trueAttribute(hold.resizeBox, 'hover') && !$$('#'+hold.box.id+':hover')[0]) {
				target.collapsed = true;
				hold._autohide.add(this);
				Timers.init('ensureHoldPopupShows', () => { this.popupsFinishedVisible(); }, 400);
			}

			this.setHover(hold, true);

			let selfRemover = (ee) => {
				if(ee.originalTarget != e.originalTarget) { return; } //submenus
				Listeners.remove(target, 'popuphidden', selfRemover);

				this.popupsRemoveListeners();
				if(this.hoveredPopup == target) {
					// it's unlikely that a mouseout will occur once the popup is hidden,
					// so make sure to undo whatever mouseover event hovered the popup
					this.setHover(hold, false);

					this.hoveredPopup = null;
				}

				// making sure we don't collapse it permanently
				target.collapsed = false;

				this.setHover(hold, false);

				this.releasePopups.set(target, aSync(() => {
					this.holdPopupNodes.delete(target);
				}, 150));
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
					popup.collapsed = false;
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

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(ltr):not([movetoright]) .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(ltr)[movetoleft] .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(rtl)[movetoright] .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(rtl):not([movetoleft]) .omnisidebar_resize_box {\n\
					left: '+leftOffset+'px !important;\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(ltr)[movetoright] .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(ltr):not([movetoleft]) .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:-moz-locale-dir(rtl):not([movetoright]) .omnisidebar_resize_box,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:-moz-locale-dir(rtl)[movetoleft] .omnisidebar_resize_box {\n\
					right: '+rightOffset+'px !important;\n\
				}\n';

		if(Prefs.renderabove && Prefs.autoHide && mainSidebar.width) {
			sscode += '\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]):not([dontReHover]) #'+objName+'-resizebox:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]) #'+objName+'-resizebox[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoright]):not([dontReHover]) #'+objName+'-resizebox[hiding],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright]:not([dontReHover]) #'+objName+'-resizebox:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright] #'+objName+'-resizebox[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoright]:not([dontReHover]) #'+objName+'-resizebox[hiding] {\n\
					left: ' + (mainSidebar.width +leftOffset) + 'px !important;\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright]:not([dontReHover]) #'+objName+'-resizebox:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright] #'+objName+'-resizebox[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoright]:not([dontReHover]) #'+objName+'-resizebox[hiding],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]):not([dontReHover]) #'+objName+'-resizebox:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]) #'+objName+'-resizebox[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #sidebar-box[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoright]):not([dontReHover]) #'+objName+'-resizebox[hiding] {\n\
					right: ' + (mainSidebar.width +rightOffset) + 'px !important;\n\
				}\n';
		}

		if(Prefs.renderaboveTwin && Prefs.autoHideTwin && twinSidebar.width) {
			sscode += '\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]):not([dontReHover]) #'+objName+'-resizebox-twin:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]) #'+objName+'-resizebox-twin[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr):not([movetoleft]):not([dontReHover]) #'+objName+'-resizebox-twin[hiding],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft]:not([dontReHover]) #'+objName+'-resizebox-twin:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft] #'+objName+'-resizebox-twin[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl)[movetoleft]:not([dontReHover]) #'+objName+'-resizebox-twin[hiding] {\n\
					right: ' + (twinSidebar.width +rightOffset) + 'px !important;\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft]:not([dontReHover]) #'+objName+'-resizebox-twin:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft] #'+objName+'-resizebox-twin[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(ltr)[movetoleft]:not([dontReHover]) #'+objName+'-resizebox-twin[hiding],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]):not([dontReHover]) #'+objName+'-resizebox-twin:hover,\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]) #'+objName+'-resizebox-twin[hover],\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-sidebar-box-twin[renderabove][autohide]:not([collapsed]):-moz-locale-dir(rtl):not([movetoleft]):not([dontReHover]) #'+objName+'-resizebox-twin[hiding] {\n\
					left: ' + (twinSidebar.width +leftOffset) + 'px !important;\n\
				}\n';
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
		if(!bar.resizeBox || !bar.above || !bar.autoHide) { return; }

		if(bar.closed) {
			bar.resizeBox.hovers = 0;
			removeAttribute(bar.resizeBox, 'hover');
			return;
		}

		if(hover) {
			bar.resizeBox.hovers++;
			setAttribute(bar.resizeBox, 'hover', 'true');
			removeAttribute(bar.box, 'dontReHover');
			if(force !== undefined) {
				bar.resizeBox.hovers = force;
			}
		}
		else {
			if(force !== undefined) {
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
		if(!bar.resizeBox || !bar.above || !bar.autoHide) { return; }

		this.setHover(bar, true);

		// If the bar is closed, the above setHover will nill the hover status, and the following becomes useless.
		if(bar.closed) { return; }

		// don't use Timers, because if we use multiple initialShow()'s it would get stuck open
		// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
		let thisShowing = aSync(() => {
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
	Listeners.add(window, 'popupshowing', autoHide);
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
	Listeners.remove(window, 'popupshowing', autoHide);
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
