Modules.VERSION = '1.4.0';

// customizeMenu

this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.__defineGetter__('viewMenu', function() { return $('viewToolbarsMenu').firstChild; }); // View - Toolbars submenu
this.__defineGetter__('customizeMenu', function() { return $('customization-toolbar-menu'); });
this.__defineGetter__('viewSidebarMenu', function() { return $('viewSidebarMenu'); });

this._ShortcutUtils = null;
this.__defineGetter__('ShortcutUtils', function() {
	if(!_ShortcutUtils) {
		var temp = {};
		Cu.import("resource://gre/modules/ShortcutUtils.jsm", temp);
		_ShortcutUtils = temp.ShortcutUtils;
	}
	return _ShortcutUtils;
});

// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
this.setContextMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	var hidden =	!isAncestor(trigger, mainSidebar.button)
			&& !isAncestor(trigger, mainSidebar.header)
			&& !isAncestor(trigger, twinSidebar.button)
			&& !isAncestor(trigger, twinSidebar.header);
		
	toggleAttribute(contextOptions, 'hidden', hidden);
	toggleAttribute(contextSeparator, 'hidden', hidden);
	
	setMenuEntries(contextMenu);
};

this.setViewMenu = function(e) {
	setMenuEntries(viewMenu);
};

this.setCustomizeMenu = function(e) {
	setMenuEntries(customizeMenu);
};

this.setMenuEntries = function(menu) {
	if(mainSidebar.toolbar) {
		setAttribute(menu.getElementsByAttribute('toolbarId', mainSidebar.toolbar.id)[0], 'command', mainSidebar.toolbar.getAttribute('menucommand'));
	}
	if(twinSidebar.toolbar) {
		setAttribute(menu.getElementsByAttribute('toolbarId', twinSidebar.toolbar.id)[0], 'command', twinSidebar.toolbar.getAttribute('menucommand'));
	}
};

this.populateSidebarMenu = function(menu, useButton) {
	while(menu.firstChild) {
		menu.firstChild.remove();
	}
	
	// Populate with Social API entries
	if(SocialSidebar.populateSidebarMenu) { SocialSidebar.populateSidebarMenu({ target: viewSidebarMenu }); }
	
	for(var child of viewSidebarMenu.childNodes) {
		// PanelUI styling is mostly done with toolbarbutton elements, so if I want to use the native styling, I have to use these nodes as well
		if(useButton && child.localName != 'menuseparator') {
			var newItem = document.createElement('toolbarbutton');
			for(var attr of child.attributes) {
				setAttribute(newItem, attr.name, attr.value);
			}
		} else {
			var newItem = child.cloneNode(true);
		}
		
		if(menu.id) {
			newItem.id = newItem.id+'_'+menu.id;
		}
		menu.appendChild(newItem);
	}
	
	menuItemsCheck(menu);
};

this.menuItemsCheck = function(menu) {
	menu = menu.target || menu;
	var mainMenu = (menu == viewSidebarMenu);
	
	for(var child of menu.childNodes) {
		if(!child.getAttribute('observes')) {
			child.hidden = !SocialSidebar.canShow;
			if(child.getAttribute('origin')) {
				if(child.getAttribute('oncommand').contains('show')) {
					var command = ((!UNLOADED) ? objName+'.placeSocialSidebar(this); ' : '')+"SocialSidebar.show(this.getAttribute('origin'));";
					setAttribute(child, 'oncommand', command);
				} else {
					var command = (!UNLOADED) ? objName+'.ensureSocialSwitchBeforeHide(this); ' : 'SocialSidebar.hide();';
					setAttribute(child, 'oncommand', command);
				}
			}
		}
		
		if(mainMenu) { continue; }
		
		// No point in having this menu entry in our lists if it isn't going to be visible
		if(child.hidden || child.collapsed) {
			child.remove();
			continue;
		}
		
		// if we're in the mini panel, let's try to style it like a native PanelUI-subView panel
		if((menu == panelMenu || menu == panelViewMenu) && child.localName != 'menuseparator') {
			child.classList.add('subviewbutton');
			
			// add keyboard shortcuts, as it doesn't display them automatically in panels
			if(child.getAttribute('acceltext')) {
				setAttribute(child, 'shortcut', child.getAttribute('acceltext'));
			} else if(child.getAttribute('key')) {
				var menuKey = $(child.getAttribute('key'));
				if(menuKey) {
					setAttribute(child, 'shortcut', ShortcutUtils.prettifyShortcut(menuKey));
				}
			}
		}
	}
};

this.openSidebarMenu = function(e) {
	if(e.target) {
		if(e.which != 1) { return; }
		var menu = $(e.target.getAttribute('TitleButton'));
	} else {
		var menu = e;
	}
	
	var target = $(menu.getAttribute('target'));
	
	setAttribute(target, 'active', 'true');
	if(!target.getAttribute('TitleButton')) { setAttribute(target, 'TitleButton', 'true'); }
	
	// the title needs to be visible to place the menu correctly
	toggleTitles(true);
	menu.style.minWidth = target.clientWidth +'px';
	
	menu.openPopup(target, 'after_start');
	dispatch(target, { type: 'openSidebarMenu', cancelable: false });
};

this.closeSidebarMenu = function(menu) {
	var bar = (trueAttribute(menu, 'twinSidebar')) ? twinSidebar : mainSidebar;
	
	if(bar.twin) {
		toggleMenuButtonTwin();
	} else {
		toggleMenuButton();
	}
	
	var target = $(menu.getAttribute('target'));
	target.removeAttribute('active');
	
	toggleTitles(true);
	
	dispatch(target, { type: 'closeSidebarMenu', cancelable: false });
	
	// the aSync is probably unnecessary, but I think it'll work better and it'll be smoother
	aSync(function() {
		if(!bar.box || bar.closed) { return; }
		var command = bar.box.getAttribute('sidebarcommand');
		if(command.startsWith(objName+'-viewBlankSidebar')) {
			toggleSidebar(command, false, bar.twin);
		}
	});
};

this.toggleMenuButton = function() {
	if(UNLOADED || window.closed || window.willClose || !Prefs.titleButton) {
		removeAttribute(mainSidebar.title, 'TitleButton');
		Listeners.remove(mainSidebar.title, 'mousedown', openSidebarMenu);
	} else {
		setAttribute(mainSidebar.title, 'TitleButton', objName+'-openSidebarMenu');
		Listeners.add(mainSidebar.title, 'mousedown', openSidebarMenu);
	}
};

this.toggleMenuButtonTwin = function() {
	if(UNLOADED || window.closed || window.willClose || !Prefs.twinSidebar || !Prefs.titleButtonTwin) {
		removeAttribute(twinSidebar.title, 'TitleButton');
		Listeners.remove(twinSidebar.title, 'mousedown', openSidebarMenu);
	} else {
		setAttribute(twinSidebar.title, 'TitleButton', objName+'-openTwinSidebarMenu');
		Listeners.add(twinSidebar.title, 'mousedown', openSidebarMenu);
	}
};

this.blankSidebarMenu = function(e) {
	var bar = e.detail.bar;
	
	if(!bar.closed && bar.box.getAttribute('sidebarcommand').startsWith(objName+'-viewBlankSidebar')) {
		openSidebarMenu($((bar.twin) ? objName+'-openTwinSidebarMenu' : objName+'-openSidebarMenu'));
	}
};
	
Modules.LOADMODULE = function() {
	Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
	Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	Styles.load('menus', 'menus');
	
	Listeners.add(contextMenu, 'popupshowing', setContextMenu);
	Listeners.add(viewMenu, 'popupshown', setViewMenu);
	Listeners.add(customizeMenu, 'popupshown', setCustomizeMenu);
	Listeners.add($('social-statusarea-popup'), 'popupshowing', menuItemsCheck);
	Listeners.add(window, 'endToggleSidebar', blankSidebarMenu);
	
	twinTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	twinTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	barSwitchTriggers.__defineGetter__('viewSidebarMenuMenu', function() { return $('viewSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('menuTitle', function() { return $(objName+'-openSidebarMenu'); });
	barSwitchTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	Prefs.listen('titleButton', toggleMenuButton);
	Prefs.listen('titleButtonTwin', toggleMenuButtonTwin);
	
	toggleMenuButton();
	toggleMenuButtonTwin();
};

Modules.UNLOADMODULE = function() {
	delete twinTriggers.viewTwinSidebarMenuMenu;
	delete twinTriggers.menuTitleTwin;
	
	delete barSwitchTriggers.viewSidebarMenuMenu;
	delete barSwitchTriggers.viewTwinSidebarMenuMenu;
	delete barSwitchTriggers.menuTitle;
	delete barSwitchTriggers.menuTitleTwin;
	
	Prefs.unlisten('titleButton', toggleMenuButton);
	Prefs.unlisten('titleButtonTwin', toggleMenuButtonTwin);
	
	Listeners.remove(contextMenu, 'popupshowing', setContextMenu);
	Listeners.remove(viewMenu, 'popupshown', setViewMenu);
	Listeners.remove(customizeMenu, 'popupshown', setCustomizeMenu);
	Listeners.remove($('social-statusarea-popup'), 'popupshowing', menuItemsCheck);
	Listeners.remove(window, 'endToggleSidebar', blankSidebarMenu);
	
	// ensure the menu is properly reset when unloading
	menuItemsCheck($('viewSidebarMenu'));
	if($('social-statusarea-popup')) { menuItemsCheck($('social-statusarea-popup')); }
	
	toggleMenuButton();
	toggleMenuButtonTwin();
	
	if(UNLOADED) {
		Styles.unload('menus');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	}
};
