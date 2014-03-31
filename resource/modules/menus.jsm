moduleAid.VERSION = '1.2.0';

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
	
	// Populate with Social API entries
	if(SocialSidebar) { SocialSidebar.populateSidebarMenu({ target: viewSidebarMenu }); }
	
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
	menu = (menu.target) ? menu.target : menu;
	var mainMenu = (menu == viewSidebarMenu);
	
	for(var m=0; m<menu.childNodes.length; m++) {
		if(!menu.childNodes[m].getAttribute('observes')) {
			if(!UNLOADED && !SocialSidebar) {
				// Social sidebar menu entry sometimes appears when it shouldn't
				menu.childNodes[m].hidden = !mainMenu;
			} else {
				menu.childNodes[m].hidden = !SocialSidebar.canShow;
				if(menu.childNodes[m].getAttribute('origin')) {
					if(menu.childNodes[m].getAttribute('oncommand').indexOf('show') > -1) {
						var command = ((!UNLOADED) ? objName+'.placeSocialSidebar(this); ' : '')+"SocialSidebar.show(this.getAttribute('origin'));";
						setAttribute(menu.childNodes[m], 'oncommand', command);
					} else {
						var command = (!UNLOADED) ? objName+'.ensureSocialSwitchBeforeHide(this); ' : 'SocialSidebar.hide();';
						setAttribute(menu.childNodes[m], 'oncommand', command);
					}
				}
			}
		}
		
		if(mainMenu) { continue; }
		
		// No point in having this menu entry in our lists if it isn't going to be visible
		if(menu.childNodes[m].hidden || menu.childNodes[m].collapsed) {
			menu.removeChild(menu.childNodes[m]);
			m--;
			continue;
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
	toggleTitles();
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
	
	toggleTitles();
	
	dispatch(target, { type: 'closeSidebarMenu', cancelable: false });
	
	// the aSync is probably unnecessary, but I think it'll work better and it'll be smoother
	aSync(function() {
		if(!bar.box || bar.closed) { return; }
		var command = bar.box.getAttribute('sidebarcommand');
		if(command.indexOf(objName+'-viewBlankSidebar') == 0) {
			toggleSidebar(command, false, bar.twin);
		}
	});
};

this.toggleMenuButton = function() {
	if(UNLOADED || !prefAid.titleButton) {
		removeAttribute(mainSidebar.title, 'TitleButton');
		listenerAid.remove(mainSidebar.title, 'click', openSidebarMenu);
	} else {
		setAttribute(mainSidebar.title, 'TitleButton', objName+'-openSidebarMenu');
		listenerAid.add(mainSidebar.title, 'click', openSidebarMenu);
	}
};

this.toggleMenuButtonTwin = function() {
	if(UNLOADED || !prefAid.twinSidebar || !prefAid.titleButtonTwin) {
		removeAttribute(twinSidebar.title, 'TitleButton');
		listenerAid.remove(twinSidebar.title, 'click', openSidebarMenu);
	} else {
		setAttribute(twinSidebar.title, 'TitleButton', objName+'-openTwinSidebarMenu');
		listenerAid.add(twinSidebar.title, 'click', openSidebarMenu);
	}
};

this.blankSidebarMenu = function(e) {
	var bar = e.detail.bar;
	
	if(!bar.closed && bar.box.getAttribute('sidebarcommand').indexOf(objName+'-viewBlankSidebar') == 0) {
		openSidebarMenu($((bar.twin) ? objName+'-openTwinSidebarMenu' : objName+'-openSidebarMenu'));
	}
};
	
moduleAid.LOADMODULE = function() {
	overlayAid.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
	overlayAid.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	styleAid.load('menus', 'menus');
	
	listenerAid.add(contextMenu, 'popupshowing', setContextMenu);
	if(!Australis) {
		listenerAid.add(appMenu, 'popupshowing', setAppMenu);
	}
	listenerAid.add(viewToolbarsMenu, 'popupshowing', setViewToolbarsMenu);
	listenerAid.add($('social-statusarea-popup'), 'popupshowing', menuItemsCheck);
	listenerAid.add(window, 'endToggleSidebar', blankSidebarMenu);
	
	twinTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	twinTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	barSwitchTriggers.__defineGetter__('viewSidebarMenuMenu', function() { return $('viewSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	barSwitchTriggers.__defineGetter__('menuTitle', function() { return $(objName+'-openSidebarMenu'); });
	barSwitchTriggers.__defineGetter__('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	prefAid.listen('titleButton', toggleMenuButton);
	prefAid.listen('titleButtonTwin', toggleMenuButtonTwin);
	
	toggleMenuButton();
	toggleMenuButtonTwin();
};

moduleAid.UNLOADMODULE = function() {
	delete twinTriggers.viewTwinSidebarMenuMenu;
	delete twinTriggers.menuTitleTwin;
	
	delete barSwitchTriggers.viewSidebarMenuMenu;
	delete barSwitchTriggers.viewTwinSidebarMenuMenu;
	delete barSwitchTriggers.menuTitle;
	delete barSwitchTriggers.menuTitleTwin;
	
	prefAid.unlisten('titleButton', toggleMenuButton);
	prefAid.unlisten('titleButtonTwin', toggleMenuButtonTwin);
	
	listenerAid.remove(contextMenu, 'popupshowing', setContextMenu);
	if(!Australis) {
		listenerAid.remove(appMenu, 'popupshowing', setAppMenu);
	}
	listenerAid.remove(viewToolbarsMenu, 'popupshowing', setViewToolbarsMenu);
	listenerAid.remove($('social-statusarea-popup'), 'popupshowing', menuItemsCheck);
	listenerAid.remove(window, 'endToggleSidebar', blankSidebarMenu);
	
	// ensure the menu is properly reset when unloading
	menuItemsCheck($('viewSidebarMenu'));
	if($('social-statusarea-popup')) { menuItemsCheck($('social-statusarea-popup')); }
	
	toggleMenuButton();
	toggleMenuButtonTwin();
	
	if(UNLOADED) {
		styleAid.unload('menus');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	}
};
