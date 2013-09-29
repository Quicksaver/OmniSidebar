moduleAid.VERSION = '1.0.0';

this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
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
	
	listenerAid.add(window, 'keydown', keydownPanel, true);
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
	
	listenerAid.remove(window, 'keydown', keydownPanel, true);
	listenerAid.remove(panel, 'mouseover', mouseOverPanel);
	listenerAid.remove(panel, 'mousemove', mouseOverPanel);
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

// Bugfix: keyboard navigation doesn't work in our panel for some reason (probably because it has more than menuitems)
this.keydownPanel = function(e) {
	switch(e.which) {
		case e.DOM_VK_A: case e.DOM_VK_B: case e.DOM_VK_C: case e.DOM_VK_D: case e.DOM_VK_E: case e.DOM_VK_F: case e.DOM_VK_G: case e.DOM_VK_H: case e.DOM_VK_I: case e.DOM_VK_J: case e.DOM_VK_K: case e.DOM_VK_L: case e.DOM_VK_M: case e.DOM_VK_N: case e.DOM_VK_O: case e.DOM_VK_P: case e.DOM_VK_Q: case e.DOM_VK_R: case e.DOM_VK_S: case e.DOM_VK_T: case e.DOM_VK_U: case e.DOM_VK_V: case e.DOM_VK_W: case e.DOM_VK_X: case e.DOM_VK_Y: case e.DOM_VK_Z:
			var items = panel.querySelectorAll('menuitem');
			for(var i=0; i<items.length; i++) {
				if(menuItemAccesskeyCode(items[i].getAttribute('accesskey'), e) == e.which) {
					e.preventDefault();
					e.stopPropagation();
					items[i].doCommand();
					break;
				}
			}
			break;
		
		case e.DOM_VK_UP:
		case e.DOM_VK_DOWN:
		case e.DOM_VK_HOME:
		case e.DOM_VK_END:
			e.preventDefault();
			e.stopPropagation();
			listenerAid.add(panel, 'mouseover', mouseOverPanel);
			listenerAid.add(panel, 'mousemove', mouseOverPanel);
			
			var items = panel.querySelectorAll('menuitem');
			var active = -1;
			for(var i=0; i<items.length; i++) {
				if(trueAttribute(items[i], '_moz-menuactive')) {
					active = i;
					break;
				}
			}
			
			removeAttribute(items[active], '_moz-menuactive');
			
			switch(e.which) {
				case e.DOM_VK_UP:
					active--;
					if(active < 0) { active = items.length -1; }
					break;
				case e.DOM_VK_DOWN:
					active++;
					if(active >= items.length) { active = 0; }
					break;
				case e.DOM_VK_HOME:
					active = 0;
					break;
				case e.DOM_VK_END:
					active = items.length -1;
					break;
			}
			
			setAttribute(items[active], '_moz-menuactive', 'true');
			
			break;
		
		case e.DOM_VK_ENTER:
		case e.DOM_VK_RETURN:
			var items = panel.querySelectorAll('menuitem');
			for(var i=0; i<items.length; i++) {
				if(trueAttribute(items[i], '_moz-menuactive')) {
					e.preventDefault();
					e.stopPropagation();
					items[i].doCommand();
					break;
				}
			}
			break;
		
		default: break;
	}
};

this.menuItemAccesskeyCode = function(str, e) {
	if(!str) return null;
	str = str.toLowerCase();
	if(str == 'a') return e.DOM_VK_A; if(str == 'b') return e.DOM_VK_B; if(str == 'c') return e.DOM_VK_C; if(str == 'd') return e.DOM_VK_D; if(str == 'e') return e.DOM_VK_E; if(str == 'f') return e.DOM_VK_F; if(str == 'g') return e.DOM_VK_G; if(str == 'h') return e.DOM_VK_H; if(str == 'i') return e.DOM_VK_I; if(str == 'j') return e.DOM_VK_J; if(str == 'k') return e.DOM_VK_K; if(str == 'l') return e.DOM_VK_L; if(str == 'm') return e.DOM_VK_M; if(str == 'n') return e.DOM_VK_N; if(str == 'o') return e.DOM_VK_O; if(str == 'p') return e.DOM_VK_P; if(str == 'q') return e.DOM_VK_Q; if(str == 'r') return e.DOM_VK_R; if(str == 's') return e.DOM_VK_S; if(str == 't') return e.DOM_VK_T; if(str == 'u') return e.DOM_VK_U; if(str == 'v') return e.DOM_VK_V; if(str == 'w') return e.DOM_VK_W; if(str == 'x') return e.DOM_VK_X; if(str == 'y') return e.DOM_VK_Y; if(str == 'z') return e.DOM_VK_Z;
	return null;
};

this.mouseOverPanel = function() {
	listenerAid.remove(panel, 'mouseover', mouseOverPanel);
	listenerAid.remove(panel, 'mousemove', mouseOverPanel);
	var items = panel.querySelectorAll('menuitem');
	for(var i=0; i<items.length; i++) {
		removeAttribute(items[i], '_moz-menuactive');
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(contextMenu, 'popupshowing', panelDontOpenContext, true);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(contextMenu, 'popupshowing', panelDontOpenContext, true);
};
