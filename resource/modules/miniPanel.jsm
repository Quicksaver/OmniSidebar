Modules.VERSION = '2.0.2';

this.__defineGetter__('PanelUI', function() { return window.PanelUI; });

this.panel = {
	get panel () { return $(objName+'-panel'); },
	get toolbar () { return $(objName+'-panel-toolbarContainer'); },
	get menu () { return $(objName+'-panel-menuContainer'); },
	get toolbarSeparator () { return $(objName+'-panel-toolbarSeparator'); },
	get menuSeparator () { return $(objName+'-panel-menuSeparator'); },
	
	get view () { return $(objName+'-panelView'); },
	get viewHeader () { return $(objName+'-panelView-header'); },
	get viewToolbar () { return $(objName+'-panelView-toolbarContainer'); },
	get viewMenu () { return $(objName+'-panelView-menuContainer'); },
	get viewToolbarSeparator () { return $(objName+'-panelView-toolbarSeparator'); },
	get viewMenuSeparator () { return $(objName+'-panelView-menuSeparator'); },
	
	openedPanelUI: false,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				// Linux still opens the context menu when it should open only our panel
				if(!customizing && e.explicitOriginalTarget
				&& (e.explicitOriginalTarget == mainSidebar.button || e.explicitOriginalTarget == twinSidebar.button)) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			
			case 'ViewShowing':
				if(e.target == this.view) {
					this.populate(this.view);
				}
				break;
			
			case 'ViewHiding':
				if(e.target == this.view) {
					this.empty(this.view);
					
					if(this.openedPanelUI) {
						this.openedPanelUI = false;
						if(PanelUI.panel.state == 'open') {
							PanelUI.toggle();
						}
					}
				}
				break;
			
			case 'DOMMouseScroll':
				// there's a madening bug where, if you scroll while it's still scrolling, the box will just scroll back to the start,
				// so I'm just preventing all extra scrolling while it's still scrolling
				if(e.detail > 0 && this.viewToolbar._scrollTarget) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
			
			case 'AskingForNodeOwner':
				if(isAncestor(this.panel.anchorNode, this.panel._bar.button)) {
					e.detail = this.panel._bar.buttonId;
					e.stopPropagation();
				}
				break;
		}
	},
	
	// Only open the panel if we're doing a right-click or a ctrl+click
	shouldFollowCommand: function(trigger, twin, e) {
		var metaKey = e && (e.ctrlKey || e.metaKey);
		var panelViewIsOpen = trueAttribute(this.view, 'current') && PanelUI.panel.state == 'open' && this.view._bar.twin == twin;
		
		if(!e || e.button == 2 || (e.button == 0 && metaKey) || panelViewIsOpen) {
			var bar = (twin) ? twinSidebar : mainSidebar;
			if(e) {
				e.preventDefault();
				e.stopPropagation();
			} else {
				trigger = bar.button;
			}
			
			// if the trigger is our button and it's placed in the PanelUI, open its subview panel instead
			var placement = CustomizableUI.getPlacementOfWidget(bar.buttonId);
			if(placement && placement.area == 'PanelUI-contents' && (!trigger || trigger == bar.button)) {
				// I can't get to it before it opens, so I can only close it afterwards
				if(!WINNT) {
					var panelContext = $('customizationPanelItemContextMenu');
					if(panelContext.state != 'closed') {
						panelContext.hidePopup();
					}
				}
				
				if(!trueAttribute(this.view, 'current') || this.view._bar != bar || PanelUI.panel.state == 'closed') {
					this.view._bar = bar;
					setAttribute(this.viewHeader, 'value', bar.label);
					
					// we kind'a need it open for this...
					this.openedPanelUI = false;
					if(PanelUI.panel.state == 'closed') {
						PanelUI.toggle();
						Listeners.add(PanelUI.panel, 'popupshown', function() {
							PanelUI.multiView.showSubView(this.view.id, trigger);
						}, true, true);
						this.openedPanelUI = true;
					}
					else {
						PanelUI.multiView.showSubView(this.view.id, trigger);
					}
				} else {
					PanelUI.multiView.showMainView();
				}
				return false;
			}
			
			if(this.panel.state == 'closed' || this.panel._bar != bar) {
				var position = 'bottomcenter topright';
				if(!trigger) {
					trigger = $('navigator-toolbox');
					var side = (bar == leftSidebar) ? 'left' : 'right';
					position = 'bottom'+side+' top'+side;
					
					// it would conserve the last position attr's always with this kind of anchor
					removeAttribute(this.panel, 'position');
					removeAttribute(this.panel, 'flip');
					removeAttribute(this.panel, 'side');
				} else if(trigger == bar.switcher) {
					position = 'after_pointer';
				}
				this.open(trigger, bar, e, position);
			} else {
				this.hide();
			}
			return false;
		}
		return true;
	},
	
	open: function(trigger, bar, e, position) {
		this.panel._bar = bar;
		var anchor = null;
		var x = 0;
		var y = 0;
		
		if(position == 'after_pointer') {
			x = e.clientX +1;
			y = e.clientY +1;
		}
		else if(trigger) {
			anchor = $ª(trigger, "toolbarbutton-icon", "class") || trigger;
		}
		
		this.panel.openPopup(anchor, position, x, y, false, false, e);
	},
	
	hide: function() {
		if(this.panel && this.panel.state == 'open') { this.panel.hidePopup(); }
	},
	
	populate: function(miniPanel) {
		var bar = miniPanel._bar;
		if(miniPanel == this.view) {
			var toolbar = this.viewToolbar
			var menu = this.viewMenu;
			var toolbarSeparator = this.viewToolbarSeparator;
			var menuSeparator = this.viewMenuSeparator;
		} else {
			var toolbar = this.toolbar;
			var menu = this.menu;
			var toolbarSeparator = this.toolbarSeparator;
			var menuSeparator = this.menuSeparator;
		}
		
		if(bar.twin) {
			SidebarUI.triggers.twin.set('panel', miniPanel);
		}
		
		if(!bar.toolbar.collapsed && typeof('headers') != 'undefined' && headers.toolbarHasButtons(bar.toolbar)) {
			// Don't let the sidebar header jump around with this change
			bar.stack.style.height = bar.stack.clientHeight+'px';
			bar.stack.style.width = bar.stack.clientWidth+'px';
			
			if(WINNT && Services.navigator.oscpu.includes('6.')) {
				var color = getComputedStyle(miniPanel).backgroundColor;
				var padding = (Services.navigator.oscpu.includes('6.2')) ? 3 : 5;
				bar.toolbar.style.backgroundColor = color;
				bar.toolbar.style.paddingBottom = padding+'px';
				toolbarSeparator.style.marginTop = '-'+(padding -1)+'px';
			}
			else if(LINUX) {
				var padding = 3;
				toolbarSeparator.style.marginTop = '-'+(padding)+'px';
			}
			toolbar._originalParent = bar.toolbar.parentNode;
			toolbar.appendChild(bar.toolbar);
			toolbarSeparator.hidden = false;
		} else {
			toolbarSeparator.hidden = true;
		}
		
		if(bar.titleButton) {
			menus.populateSidebarMenu(menu, true);
			menuSeparator.hidden = false;
		} else {
			menuSeparator.hidden = true;
		}
	},
	
	empty: function(miniPanel) {
		var bar = miniPanel._bar;
		if(miniPanel == this.view) {
			var toolbar = this.viewToolbar
			var menu = this.viewMenu;
			var toolbarSeparator = this.viewToolbarSeparator;
			var menuSeparator = this.viewMenuSeparator;
		} else {
			var toolbar = this.toolbar;
			var menu = this.menu;
			var toolbarSeparator = this.toolbarSeparator;
			var menuSeparator = this.menuSeparator;
		}
		
		SidebarUI.triggers.twin.delete('panel');
		
		if(toolbar._originalParent) {
			bar.stack.style.height = '';
			bar.stack.style.width = '';
			
			if(WINNT && Services.navigator.oscpu.includes('6.')) {
				bar.toolbar.style.backgroundColor = '';
				bar.toolbar.style.paddingBottom = '';
				toolbarSeparator.style.marginTop = '';
			}
			else if(LINUX) {
				toolbarSeparator.style.marginTop = '';
			}
			toolbar._originalParent.appendChild(bar.toolbar);
			toolbar._originalParent = null;
		}
		
		while(menu.firstChild) {
			menu.firstChild.remove();
		}
		
		menuSeparator.hidden = true;
		toolbarSeparator.hidden = true;
	},
	
	onLoad: function() {
		this.panel.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
		this.view.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
		keydownPanel.setupPanel(this.panel);
		keydownPanel.setupPanel(this.view);
		SidebarUI.triggers.barSwitch.set('miniPanel', () => { return this.panel; });
		SidebarUI.triggers.barSwitch.set('miniPanelView', () => { return this.view; });
		
		// for compatibility with all the add-ons that use my backbone
		Listeners.add(this.panel, 'AskingForNodeOwner', this);
		
		Listeners.add(this.view, 'ViewShowing', this);
		Listeners.add(this.view, 'ViewHiding', this);
		Listeners.add(this.viewToolbar, 'DOMMouseScroll', this, true);
	},
	
	onUnload: function() {
		Listeners.remove(this.viewToolbar, 'DOMMouseScroll', this, true);
		Listeners.remove(this.view, 'ViewShowing', this);
		Listeners.remove(this.view, 'ViewHiding', this);
		Listeners.remove(this.panel, 'AskingForNodeOwner', this);
		
		SidebarUI.triggers.barSwitch.delete('miniPanel');
		SidebarUI.triggers.barSwitch.delete('miniPanelView');
		keydownPanel.unsetPanel(this.panel);
		keydownPanel.unsetPanel(this.view);
		delete this.panel._toggleKeyset;
		delete this.view._toggleKeyset;
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(contextMenu, 'popupshowing', panel, true);
	Overlays.overlayWindow(window, "miniPanel", panel);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, "miniPanel");
	Listeners.remove(contextMenu, 'popupshowing', panel, true);
};
