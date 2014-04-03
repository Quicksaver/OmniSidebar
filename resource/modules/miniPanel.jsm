moduleAid.VERSION = '1.2.1';

this.__defineGetter__('panel', function() { return $(objName+'-panel'); });
this.__defineGetter__('panelToolbar', function() { return $(objName+'-panel-toolbarContainer'); });
this.__defineGetter__('panelMenu', function() { return $(objName+'-panel-menuContainer'); });
this.__defineGetter__('panelToolbarSeparator', function() { return $(objName+'-panel-toolbarSeparator'); });
this.__defineGetter__('panelMenuSeparator', function() { return $(objName+'-panel-menuSeparator'); });

this.__defineGetter__('panelView', function() { return $(objName+'-panelView'); });
this.__defineGetter__('panelViewHeader', function() { return $(objName+'-panelView-header'); });
this.__defineGetter__('panelViewToolbar', function() { return $(objName+'-panelView-toolbarContainer'); });
this.__defineGetter__('panelViewMenu', function() { return $(objName+'-panelView-menuContainer'); });
this.__defineGetter__('panelViewToolbarSeparator', function() { return $(objName+'-panelView-toolbarSeparator'); });
this.__defineGetter__('panelViewMenuSeparator', function() { return $(objName+'-panelView-menuSeparator'); });

this.__defineGetter__('PanelUI', function() { return window.PanelUI; });

this.panelOpenedPanelUI = false;

// Only open the panel if we're doing a right-click or a ctrl+click
this.shouldFollowCommand = function(trigger, twin, e) {
	var metaKey = e && (e.ctrlKey || e.metaKey);
	var panelViewIsOpen = Australis && trueAttribute(panelView, 'current') && PanelUI.panel.state == 'open' && panelView._bar.twin == twin;
	
	if(!e || e.button == 2 || (e.button == 0 && metaKey) || panelViewIsOpen) {
		var bar = (twin) ? twinSidebar : mainSidebar;
		if(e) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			trigger = bar.button;
		}
		
		// if the trigger is our button and it's placed in the PanelUI, open its subview panel instead
		var placement = Australis && CustomizableUI.getPlacementOfWidget(bar.buttonId);
		if(placement && placement.area == 'PanelUI-contents' && (!trigger || trigger == bar.button)) {
			// I can't get to it before it opens, so I have to close it afterwards
			if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
				var panelContext = $('customizationPanelItemContextMenu');
				if(panelContext.state != 'closed') {
					panelContext.hidePopup();
				}
			}
			
			if(!trueAttribute(panelView, 'current') || panelView._bar != bar || PanelUI.panel.state == 'closed') {
				panelView._bar = bar;
				setAttribute(panelViewHeader, 'value', bar.label);
				
				// we kind'a need it open for this...
				panelOpenedPanelUI = false;
				if(PanelUI.panel.state == 'closed') {
					PanelUI.toggle();
					listenerAid.add(PanelUI.panel, 'popupshown', function() {
						PanelUI.multiView.showSubView(panelView.id, trigger);
					}, true, true);
					panelOpenedPanelUI = true;
				}
				else {
					PanelUI.multiView.showSubView(panelView.id, trigger);
				}
			} else {
				PanelUI.multiView.showMainView();
			}
			return false;
		}
		
		if(panel.state == 'closed' || panel._bar != bar) {
			var position = 'bottomcenter topright';
			if(!trigger) {
				trigger = $('navigator-toolbox');
				var side = (bar == leftSidebar) ? 'left' : 'right';
				position = 'bottom'+side+' top'+side;
				
				// it would conserve the last position attr's always with this kind of anchor
				removeAttribute(panel, 'position');
				removeAttribute(panel, 'flip');
				removeAttribute(panel, 'side');
			} else if(trigger == bar.switcher) {
				position = 'after_pointer';
			}
			openPanel(trigger, bar, e, position);
		} else {
			hidePanel();
		}
		return false;
	}
	return true;
};

this.openPanel = function(trigger, bar, e, position) {
	panel._bar = bar;
	var anchor = null;
	var x = 0;
	var y = 0;
	
	if(position == 'after_pointer') {
		x = e.clientX +1;
		y = e.clientY +1;
		anchor = null;
	} else if(trigger) {
		anchor = document.getAnonymousElementByAttribute(trigger, "class", "toolbarbutton-icon") || trigger;
	}
	
	panel.openPopup(anchor, position, x, y, false, false, e);
};

this.hidePanel = function() {
	if(panel && panel.state == 'open') { panel.hidePopup(); }
};

this.populatePanel = function(miniPanel) {
	var bar = miniPanel._bar;
	if(miniPanel == panelView) {
		var toolbar = panelViewToolbar
		var menu = panelViewMenu;
		var toolbarSeparator = panelViewToolbarSeparator;
		var menuSeparator = panelViewMenuSeparator;
	} else {
		var toolbar = panelToolbar;
		var menu = panelMenu;
		var toolbarSeparator = panelToolbarSeparator;
		var menuSeparator = panelMenuSeparator;
	}
	
	if(bar.twin) {
		twinTriggers.panel = miniPanel;
	}
	
	if(!bar.toolbar.collapsed) {
		// Don't let the sidebar header jump around with this change
		bar.stack.style.height = bar.stack.clientHeight+'px';
		bar.stack.style.width = bar.stack.clientWidth+'px';
		
		if(Services.appinfo.OS == 'WINNT' && Services.navigator.oscpu.indexOf('6.') > -1) {
			var color = window.getComputedStyle(miniPanel).getPropertyValue('background-color');
			var padding = (Services.navigator.oscpu.indexOf('6.2') > -1) ? 3 : 5;
			bar.toolbar.style.backgroundColor = color;
			bar.toolbar.style.paddingBottom = padding+'px';
			toolbarSeparator.style.marginTop = '-'+(padding -1)+'px';
		}
		else if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
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
		populateSidebarMenu(menu, Australis);
		menuSeparator.hidden = false;
	} else {
		menuSeparator.hidden = true;
	}
};

this.emptyPanel = function(miniPanel) {
	var bar = miniPanel._bar;
	if(miniPanel == panelView) {
		var toolbar = panelViewToolbar
		var menu = panelViewMenu;
		var toolbarSeparator = panelViewToolbarSeparator;
		var menuSeparator = panelViewMenuSeparator;
	} else {
		var toolbar = panelToolbar;
		var menu = panelMenu;
		var toolbarSeparator = panelToolbarSeparator;
		var menuSeparator = panelMenuSeparator;
	}
	
	delete twinTriggers.panel;
	
	if(!bar.toolbar.collapsed && toolbar._originalParent) {
		bar.stack.style.height = '';
		bar.stack.style.width = '';
		
		if(Services.appinfo.OS == 'WINNT' && Services.navigator.oscpu.indexOf('6.') > -1) {
			bar.toolbar.style.backgroundColor = '';
			bar.toolbar.style.paddingBottom = '';
			toolbarSeparator.style.marginTop = '';
		}
		else if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
			toolbarSeparator.style.marginTop = '';
		}
		toolbar._originalParent.appendChild(bar.toolbar);
		toolbar._originalParent = null;
	}
	
	while(menu.firstChild) {
		menu.removeChild(menu.firstChild);
	}
	
	menuSeparator.hidden = true;
	toolbarSeparator.hidden = true;
};

// Linux still opens the context menu when it should open only our panel
this.panelDontOpenContext = function(e) {
	if(!customizing && e.explicitOriginalTarget
	&& (e.explicitOriginalTarget == mainSidebar.button || e.explicitOriginalTarget == twinSidebar.button)) {
		e.preventDefault();
		e.stopPropagation();
	}
};

this.panelViewShowing = function(e) {
	if(e.target == panelView) {
		populatePanel(panelView);
	}
};

this.panelViewHiding = function(e) {
	if(e.target == panelView) {
		emptyPanel(panelView);
		
		if(panelOpenedPanelUI) {
			panelOpenedPanelUI = false;
			if(PanelUI.panel.state == 'open') {
				PanelUI.toggle();
			}
		}
	}
};

this.panelViewToolbarScrolling = function(e) {
	// there's a madening bug where, if you scroll while it's still scrolling, the box will just scroll back to the start,
	// so I'm just preventing all extra scrolling while it's still scrolling
	if(e.detail > 0 && panelViewToolbar._scrollTarget) {
		e.preventDefault();
		e.stopPropagation();
	}
};

this.loadMiniPanel = function() {
	panel.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
	keydownPanel.setupPanel(panel);
	barSwitchTriggers.__defineGetter__('miniPanel', function() { return panel; });
	
	if(Australis) {
		keydownPanel.setupPanel(panelView);
		barSwitchTriggers.__defineGetter__('miniPanelView', function() { return panelView; });
		panelView.__defineGetter__('_toggleKeyset', function() { return (this._bar && this._bar.keysetPanel && this._bar.keyset.keycode != 'none') ? this._bar.keyset : null; });
		
		listenerAid.add(panelView, 'ViewShowing', panelViewShowing);
		listenerAid.add(panelView, 'ViewHiding', panelViewHiding);
		listenerAid.add(panelViewToolbar, 'DOMMouseScroll', panelViewToolbarScrolling, true);
	}
};

this.unloadMiniPanel = function() {
	if(Australis) {
		listenerAid.remove(panelViewToolbar, 'DOMMouseScroll', panelViewToolbarScrolling, true);
		listenerAid.remove(panelView, 'ViewShowing', panelViewShowing);
		listenerAid.remove(panelView, 'ViewHiding', panelViewHiding);
		
		keydownPanel.unsetPanel(panelView);
		delete barSwitchTriggers.miniPanelView;
		delete panelView._toggleKeyset;
	}
	
	delete barSwitchTriggers.miniPanel;
	keydownPanel.unsetPanel(panel);
	delete panel._toggleKeyset;
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(contextMenu, 'popupshowing', panelDontOpenContext, true);
	overlayAid.overlayWindow(window, (Australis) ? "miniPanelAustralis" : "miniPanel", null, loadMiniPanel, unloadMiniPanel);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, (Australis) ? "miniPanelAustralis" : "miniPanel");
	listenerAid.remove(contextMenu, 'popupshowing', panelDontOpenContext, true);
};
