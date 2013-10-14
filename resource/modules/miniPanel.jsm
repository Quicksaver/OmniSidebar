moduleAid.VERSION = '1.1.1';

this.__defineGetter__('panel', function() { return $(objName+'-panel'); });
this.__defineGetter__('panelToolbar', function() { return $(objName+'-panel-toolbarContainer'); });
this.__defineGetter__('panelMenu', function() { return $(objName+'-panel-menuContainer'); });
this.__defineGetter__('panelToolbarSeparator', function() { return $(objName+'-panel-toolbarSeparator'); });
this.__defineGetter__('panelMenuSeparator', function() { return $(objName+'-panel-menuSeparator'); });

// Only open the panel if we're doing a right-click or a ctrl+click
this.shouldFollowCommand = function(trigger, twin, e) {
	var metaKey = e && (e.ctrlKey || e.metaKey);
	if(!e || e.button == 2 || (e.button == 0 && metaKey)) {
		var bar = (twin) ? twinSidebar : mainSidebar;
		if(!bar.isOpen) {
			if(e) {
				e.preventDefault();
				e.stopPropagation();
			}
			
			var position = 'after_end';
			if(!e) {
				trigger = bar.button || $('navigator-toolbox');
			} else if(trigger == bar.switcher) {
				position = 'after_pointer';
			}
			openPanel(trigger, bar, e, position);
			return false;
		}
	}
	return true;
};

this.openPanel = function(trigger, bar, e, position) {
	panel._bar = bar;
	
	var x = 0;
	var y = 0;
	if(position == 'after_pointer') {
		x = e.clientX +1;
		y = e.clientY +1;
	}
	
	panel.openPopup((position != 'after_pointer') ? trigger : null, position, x, y, false, false, e);
};

this.hidePanel = function() {
	if(panel && panel.state == 'open') { panel.hidePopup(); }
};

this.populatePanel = function() {
	var bar = panel._bar;
	if(bar.twin) {
		twinTriggers.panel = panel;
	}
	
	if(!bar.toolbar.collapsed) {
		if(Services.appinfo.OS == 'WINNT' && Services.navigator.oscpu.indexOf('6.') > -1) {
			var color = window.getComputedStyle(panel).getPropertyValue('background-color');
			var padding = (Services.navigator.oscpu.indexOf('6.2') > -1) ? 3 : 5;
			bar.toolbar.style.backgroundColor = color;
			bar.toolbar.style.paddingBottom = padding+'px';
			panelToolbarSeparator.style.marginTop = '-'+(padding -1)+'px';
		}
		else if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
			var padding = 3;
			panelToolbarSeparator.style.marginTop = '-'+(padding)+'px';
		}
		panelToolbar._originalParent = bar.toolbar.parentNode;
		panelToolbar.appendChild(bar.toolbar);
		panelToolbarSeparator.hidden = false;
	} else {
		panelToolbarSeparator.hidden = true;
	}
	
	if(bar.titleButton) {
		populateSidebarMenu(panelMenu);
		panelMenuSeparator.hidden = false;
	} else {
		panelMenuSeparator.hidden = true;
	}
};

this.emptyPanel = function() {
	var bar = panel._bar;
	delete twinTriggers.panel;
	
	if(!bar.toolbar.collapsed && panelToolbar._originalParent) {
		if(Services.appinfo.OS == 'WINNT' && Services.navigator.oscpu.indexOf('6.') > -1) {
			bar.toolbar.style.backgroundColor = '';
			bar.toolbar.style.paddingBottom = '';
			panelToolbarSeparator.style.marginTop = '';
		}
		else if(Services.appinfo.OS != 'WINNT' && Services.appinfo.OS != 'Darwin') {
			panelToolbarSeparator.style.marginTop = '';
		}
		panelToolbar._originalParent.appendChild(bar.toolbar);
		panelToolbar._originalParent = null;
	}
	
	while(panelMenu.firstChild) {
		panelMenu.removeChild(panelMenu.firstChild);
	}
	
	panelMenuSeparator.hidden = true;
	panelToolbarSeparator.hidden = true;
};

// Linux still opens the context menu when it should open only our panel
this.panelDontOpenContext = function(e) {
	if(e.explicitOriginalTarget
	&& (e.explicitOriginalTarget == mainSidebar.button || e.explicitOriginalTarget == twinSidebar.button)) {
		var bar = (e.explicitOriginalTarget == mainSidebar.button) ? mainSidebar : twinSidebar;
		if(!bar.isOpen) {
			e.preventDefault();
			e.stopPropagation();
		}
	}
};

this.loadMiniPanel = function() {
	keydownPanel.setupPanel(panel);
};

this.unloadMiniPanel = function() {
	keydownPanel.unsetPanel(panel);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(contextMenu, 'popupshowing', panelDontOpenContext, true);
	overlayAid.overlayWindow(window, "miniPanel", null, loadMiniPanel, unloadMiniPanel);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, "miniPanel");
	listenerAid.remove(contextMenu, 'popupshowing', panelDontOpenContext, true);
};
