moduleAid.VERSION = '1.0.13';

this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.__defineGetter__('contextItem', function() { return $(objName+'-toggle_sidebartoolbar_context'); });
this.__defineGetter__('contextItemTwin', function() { return $(objName+'-toggle_sidebartoolbar_context-twin'); });

this.__defineGetter__('appMenu', function() { return $('appmenu_customizeMenu'); });
this.__defineGetter__('appMenuItem', function() { return $(objName+'-toggle_sidebartoolbar_appmenu'); });
this.__defineGetter__('appMenuItemTwin', function() { return $(objName+'-toggle_sidebartoolbar_appmenu-twin'); });

this.__defineGetter__('viewToolbarsMenu', function() { return $('viewToolbarsMenu').firstChild; }); // View - Toolbars submenu
this.__defineGetter__('viewToolbarsMenuItem', function() { return $(objName+'-toggle_sidebartoolbar_viewtoolbars'); });
this.__defineGetter__('viewToolbarsMenuItemTwin', function() { return $(objName+'-toggle_sidebartoolbar_viewtoolbars-twin'); });

this.__defineGetter__('viewSidebarMenu', function() { return $('viewSidebarMenu'); });

this.doOpenOptions = function() {
	openOptions();
};

// Australis adds its own menuitems for custom toolbars now, we don't want them as we use custom methods of our own
this.cleanMenuToolbars = function(menu) {
	if(!Australis) { return; }
	
	var toCheck = [];
	if(mainSidebar.toolbar) { toCheck.push(mainSidebar.toolbar.id); }
	if(twinSidebar.toolbar) { toCheck.push(twinSidebar.toolbar.id); }
	if(!toCheck.length) { return; }
	
	var items = menu.querySelectorAll('menuitem');
	
	for(var i=0; i<items.length; i++) {
		for(var t=0; t<toCheck.length; t++) {
			if(items[i].id == 'toggle_'+toCheck[t]) {
				items[i].parentNode.removeChild(items[i]);
			}
		}
	}
};

// Sets toolbar context menu omnisidebar options item according to what called it
// The timers is so the menus are given enough time to be populated
this.setContextMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	
	toggleAttribute(contextOptions, 'hidden',
		!isAncestor(trigger, mainSidebar.button)
		&& !isAncestor(trigger, mainSidebar.header)
		&& !isAncestor(trigger, twinSidebar.button)
		&& !isAncestor(trigger, twinSidebar.header));
	toggleAttribute(contextSeparator, 'hidden',
		!isAncestor(trigger, mainSidebar.button)
		&& !isAncestor(trigger, mainSidebar.header)
		&& !isAncestor(trigger, twinSidebar.button)
		&& !isAncestor(trigger, twinSidebar.header));
	
	var before = (Australis) ? contextMenu.querySelector('#toggle_PersonalToolbar').nextSibling : contextMenu.querySelector('#toggle_addon-bar');
	if(contextItem) {
		contextMenu.insertBefore(contextItem, before);
	}
	if(contextItemTwin) {
		contextMenu.insertBefore(contextItemTwin, before);
	}
	
	cleanMenuToolbars(contextMenu);
},

this.setAppMenu = function() {
	if(appMenuItem) {
		appMenu.insertBefore(appMenuItem, appMenu.querySelector('#toggle_addon-bar'));
	}
	if(appMenuItemTwin) {
		appMenu.insertBefore(appMenuItemTwin, appMenu.querySelector('#toggle_addon-bar'));
	}
};

this.setViewToolbarsMenu = function() {
	var before = (Australis) ? viewToolbarsMenu.querySelector('#toggle_PersonalToolbar').nextSibling : viewToolbarsMenu.querySelector('#toggle_addon-bar');
	if(viewToolbarsMenuItem) {
		viewToolbarsMenu.insertBefore(viewToolbarsMenuItem, before);
		viewToolbarsMenuItem.hidden = false;
	}
	if(viewToolbarsMenuItemTwin) {
		viewToolbarsMenu.insertBefore(viewToolbarsMenuItemTwin, before);
		viewToolbarsMenuItemTwin.hidden = false;
	}
	
	cleanMenuToolbars(viewToolbarsMenu);
};

this.populateSidebarMenu = function(menu) {
	while(menu.firstChild) {
		menu.removeChild(menu.firstChild);
	}
	
	for(var i=0; i<viewSidebarMenu.childNodes.length; i++) {
		// cloneNode(deep) deep argument is optional and defaults to true in Firefox 13+. For compatibility with Firefox 12-, deep must always be provided.
		var newItem = viewSidebarMenu.childNodes[i].cloneNode(true);
		if(menu.id) {
			newItem.id = newItem.id+'_'+menu.id;
		}
		menu.appendChild(newItem);
	}
	
	menuItemsCheck(menu);
};

this.menuItemsCheck = function(menu) {
	for(var m=0; m<menu.childNodes.length; m++) {
		if(!menu.childNodes[m].getAttribute('observes')) {
			// Social sidebar menu entry sometimes appears when it shouldn't
			menu.childNodes[m].hidden = true;
		}
		
		// No point in having this menu entry in our lists if it isn't going to be visible
		if(menu.childNodes[m].hidden) {
			menu.removeChild(menu.childNodes[m]);
			m--;
			continue;
		}
		
		toggleAttribute(menu.childNodes[m], 'checked', trueAttribute($(menu.childNodes[m].getAttribute('observes')), 'checked') && menu.getAttribute('twinSidebar') == $(menu.childNodes[m].getAttribute('observes')).getAttribute('twinSidebar'));
	}
};

this.openSidebarMenu = function(e, menu) {
	if(e.which != 1) { return; }
	
	$(menu).style.minWidth = $($(menu).getAttribute('target')).clientWidth +'px';
	$($(menu).getAttribute('target')).setAttribute('active', 'true');
	$(menu).openPopup($($(menu).getAttribute('target')), 'after_start');
	
	dispatch($($(menu).getAttribute('target')), { type: 'openSidebarMenu', cancelable: false });
};

this.closeSidebarMenu = function(menu) {
	$(menu.getAttribute('target')).removeAttribute('active');
	
	dispatch($(menu.getAttribute('target')), { type: 'closeSidebarMenu', cancelable: false });
};

this.toggleMenuButton = function() {
	if(UNLOADED || !prefAid.titleButton) {
		delete barSwitchTriggers.menuTitle;
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/menus.xul', 'menuTitle');
	} else {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/menus.xul', 'menuTitle');
		barSwitchTriggers.__defineGetter__('menuTitle', function() { return $(objName+'-openSidebarMenu'); });
	}
};

this.toggleMenuButtonTwin = function() {
	if(UNLOADED || !prefAid.titleButtonTwin) {
		delete barSwitchTriggers.menuTitleTwin;
		delete twinTriggers.menuTitleTwin;
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/menusTwin.xul', 'menuTitleTwin');
	} else {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/menusTwin.xul', 'menuTitleTwin');
		barSwitchTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
		twinTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	}
};
	
moduleAid.LOADMODULE = function() {
	overlayAid.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
	overlayAid.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	styleAid.load('menus', 'menus');
	
	listenerAid.add(contextMenu, 'popupshown', setContextMenu, false);
	if(!Australis) {
		listenerAid.add(appMenu, 'popupshown', setAppMenu, false);
	}
	listenerAid.add(viewToolbarsMenu, 'popupshown', setViewToolbarsMenu, false);
	
	twinTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('viewSidebarMenuMenu', function() { return $('viewSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	
	prefAid.listen('titleButton', toggleMenuButton);
	prefAid.listen('titleButtonTwin', toggleMenuButtonTwin);
	
	toggleMenuButton();
	toggleMenuButtonTwin();
};

moduleAid.UNLOADMODULE = function() {
	delete twinTriggers.viewTwinSidebarMenuMenu;
	delete barSwitchTriggers.viewSidebarMenuMenu;
	delete barSwitchTriggers.viewTwinSidebarMenuMenu;
	
	prefAid.unlisten('titleButton', toggleMenuButton);
	prefAid.unlisten('titleButtonTwin', toggleMenuButtonTwin);
	
	listenerAid.remove(contextMenu, 'popupshown', setContextMenu, false);
	if(!Australis) {
		listenerAid.remove(appMenu, 'popupshown', setAppMenu, false);
	}
	listenerAid.remove(viewToolbarsMenu, 'popupshown', setViewToolbarsMenu, false);
	
	// ensure the menu is properly reset when unloading
	menuItemsCheck($('viewSidebarMenu'));
	
	toggleMenuButton();
	toggleMenuButtonTwin();
	
	if(UNLOADED) {
		styleAid.unload('menus');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	}
};
