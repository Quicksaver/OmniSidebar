Modules.VERSION = '2.0.1';

this.menus = {
	get viewSidebarMenu () { return $('viewSidebarMenu'); },
	
	_ShortcutUtils: null,
	get ShortcutUtils () {
		if(!this._ShortcutUtils) {
			var temp = {};
			Cu.import("resource://gre/modules/ShortcutUtils.jsm", temp);
			this._ShortcutUtils = temp.ShortcutUtils;
		}
		return this._ShortcutUtils;
	},
	
	contextMenu: {
		get menu () { return $('toolbar-context-menu'); },
		get options () { return $(objName+'-contextOptions'); },
		get separator () { return $(objName+'-contextSeparator'); },
		
		handleEvent: function(e) {
			switch(e.type) {
				// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
				case 'popupshowing':
					var trigger = e.originalTarget.triggerNode;
					var hidden =	!isAncestor(trigger, mainSidebar.button)
							&& !isAncestor(trigger, mainSidebar.header)
							&& !isAncestor(trigger, twinSidebar.button)
							&& !isAncestor(trigger, twinSidebar.header);
						
					toggleAttribute(this.options, 'hidden', hidden);
					toggleAttribute(this.separator, 'hidden', hidden);
					
					menus.setMenuEntries(this.menu);
					break;
			}
		}
	},
	
	viewMenu: {
		get menu () { return $('viewToolbarsMenu').firstChild; }, // View - Toolbars submenu
		
		handleEvent: function(e) {
			switch(e.type) {
				// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
				case 'popupshown':
					menus.setMenuEntries(this.menu);
					break;
			}
		}
	},
	
	customizeMenu: {
		get menu () { return $('customization-toolbar-menu'); },
		
		handleEvent: function(e) {
			switch(e.type) {
				// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
				case 'popupshown':
					menus.setMenuEntries(this.menu);
					break;
			}
		}
	},
	
	socialStatusArea: {
		get menu () { return $('social-statusarea-popup'); },
		
		handleEvent: function(e) {
			switch(e.type) {
				case 'popupshowing':
					this.menuItemsCheck(e.target);
					break;
			}
		}
	},
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				// the bookmarks sidebar menu entry has the annoying habit of losing its label during startup, for reasons...
				var bookmarksEntry = $('menu_bookmarksSidebar');
				var labelValue = $('viewBookmarksSidebar') && $('viewBookmarksSidebar').getAttribute('sidebartitle');
				if(bookmarksEntry && labelValue) {
					if(bookmarksEntry.getAttribute('label') != labelValue) {
						setAttribute(bookmarksEntry, 'label', labelValue);
					} else {
						Listeners.remove(window, 'popupshowing', this, true);
					}
				}
				break;
			
			case 'mousedown':
				if(e.which != 1) { return; }
				this.openSidebarMenu($(e.target.getAttribute('TitleButton')));
				break;
			
			case 'endToggleSidebar':
				var bar = e.detail.bar;
				if(!bar.closed && bar.command.startsWith(objName+'-viewBlankSidebar')) {
					this.openSidebarMenu($((bar.twin) ? objName+'-openTwinSidebarMenu' : objName+'-openSidebarMenu'));
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'titleButton':
				this.toggleMenuButton();
				break;
			
			case 'titleButtonTwin':
				this.toggleMenuButtonTwin();
				break;
		}
	},
	
	setMenuEntries: function(menu) {
		if(mainSidebar.toolbar) {
			setAttribute(menu.getElementsByAttribute('toolbarId', mainSidebar.toolbar.id)[0], 'command', mainSidebar.toolbar.getAttribute('menucommand'));
		}
		if(twinSidebar.toolbar) {
			setAttribute(menu.getElementsByAttribute('toolbarId', twinSidebar.toolbar.id)[0], 'command', twinSidebar.toolbar.getAttribute('menucommand'));
		}
	},
	
	populateSidebarMenu: function(menu, useButton) {
		while(menu.firstChild) {
			menu.firstChild.remove();
		}
		
		// Populate with Social API entries
		if(SocialSidebar.populateSidebarMenu) { SocialSidebar.populateSidebarMenu({ target: this.viewSidebarMenu }); }
		
		for(let child of this.viewSidebarMenu.childNodes) {
			// PanelUI styling is mostly done with toolbarbutton elements, so if I want to use the native styling, I have to use these nodes as well
			if(useButton && child.localName != 'menuseparator') {
				var newItem = document.createElement('toolbarbutton');
				for(let attr of child.attributes) {
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
		
		this.menuItemsCheck(menu);
	},
	
	menuItemsCheck: function(menu) {
		var mainMenu = (menu == this.viewSidebarMenu);
		
		for(let child of menu.childNodes) {
			if(!child.getAttribute('observes')) {
				child.hidden = !SocialSidebar.canShow;
				if(child.getAttribute('origin')) {
					if(child.getAttribute('oncommand').contains('show')) {
						var command = ((!UNLOADED) ? objName+'.Social.placeSidebar(this); ' : '')+"SocialSidebar.show(this.getAttribute('origin'));";
						setAttribute(child, 'oncommand', command);
					} else {
						var command = (!UNLOADED) ? objName+'.Social.ensureSwitchBeforeHide(this); ' : 'SocialSidebar.hide();';
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
			if((menu == panel.menu || menu == panel.viewMenu) && child.localName != 'menuseparator') {
				child.classList.add('subviewbutton');
				
				// add keyboard shortcuts, as it doesn't display them automatically in panels
				if(child.getAttribute('acceltext')) {
					setAttribute(child, 'shortcut', child.getAttribute('acceltext'));
				} else if(child.getAttribute('key')) {
					var menuKey = $(child.getAttribute('key'));
					if(menuKey) {
						setAttribute(child, 'shortcut', this.ShortcutUtils.prettifyShortcut(menuKey));
					}
				}
			}
		}
	},
	
	openSidebarMenu: function(menu) {
		var target = $(menu.getAttribute('target'));
		
		setAttribute(target, 'active', 'true');
		if(!target.getAttribute('TitleButton')) { setAttribute(target, 'TitleButton', 'true'); }
		
		// the title needs to be visible to place the menu correctly
		headers.toggleTitles();
		headers.toggleHeaders();
		menu.style.minWidth = target.clientWidth +'px';
		
		menu.openPopup(target, 'after_start');
		dispatch(target, { type: 'openSidebarMenu', cancelable: false });
	},
	
	closeSidebarMenu: function(menu) {
		var bar = (trueAttribute(menu, 'twinSidebar')) ? twinSidebar : mainSidebar;
		
		if(bar.twin) {
			this.toggleMenuButtonTwin();
		} else {
			this.toggleMenuButton();
		}
		
		var target = $(menu.getAttribute('target'));
		target.removeAttribute('active');
		
		headers.toggleTitles();
		headers.toggleHeaders();
		
		dispatch(target, { type: 'closeSidebarMenu', cancelable: false });
		
		// the aSync is probably unnecessary, but I think it'll work better and it'll be smoother
		aSync(function() {
			if(bar.closed) { return; }
			var command = bar.command;
			if(command.startsWith(objName+'-viewBlankSidebar')) {
				SidebarUI.toggle(command, false, bar.twin);
			}
		});
	},
	
	toggleMenuButton: function() {
		if(UNLOADED || window.closed || window.willClose || !Prefs.titleButton) {
			removeAttribute(mainSidebar.titleNode, 'TitleButton');
			Listeners.remove(mainSidebar.titleNode, 'mousedown', this);
		} else {
			setAttribute(mainSidebar.titleNode, 'TitleButton', objName+'-openSidebarMenu');
			Listeners.add(mainSidebar.titleNode, 'mousedown', this);
		}
	},
	
	toggleMenuButtonTwin: function() {
		if(UNLOADED || window.closed || window.willClose || !Prefs.twinSidebar || !Prefs.titleButtonTwin) {
			removeAttribute(twinSidebar.titleNode, 'TitleButton');
			Listeners.remove(twinSidebar.titleNode, 'mousedown', this);
		} else {
			setAttribute(twinSidebar.titleNode, 'TitleButton', objName+'-openTwinSidebarMenu');
			Listeners.add(twinSidebar.titleNode, 'mousedown', this);
		}
	}
};
	
Modules.LOADMODULE = function() {
	Overlays.overlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
	Overlays.overlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	
	Listeners.add(window, 'endToggleSidebar', menus);
	Listeners.add(window, 'popupshowing', menus, true);
	Listeners.add(menus.contextMenu.menu, 'popupshowing', menus.contextMenu);
	Listeners.add(menus.viewMenu.menu, 'popupshown', menus.viewMenu);
	Listeners.add(menus.customizeMenu.menu, 'popupshown', menus.customizeMenu);
	Listeners.add(menus.socialStatusArea.menu, 'popupshowing', menus.socialStatusArea);
	
	SidebarUI.triggers.twin.set('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	SidebarUI.triggers.twin.set('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	SidebarUI.triggers.barSwitch.set('viewSidebarMenuMenu', function() { return $('viewSidebarMenuMenu'); });
	SidebarUI.triggers.barSwitch.set('viewTwinSidebarMenuMenu', function() { return $(objName+'-viewTwinSidebarMenuMenu'); });
	SidebarUI.triggers.barSwitch.set('menuTitle', function() { return $(objName+'-openSidebarMenu'); });
	SidebarUI.triggers.barSwitch.set('menuTitleTwin', function() { return $(objName+'-openTwinSidebarMenu'); });
	
	Prefs.listen('titleButton', menus);
	Prefs.listen('titleButtonTwin', menus);
	
	menus.toggleMenuButton();
	menus.toggleMenuButtonTwin();
};

Modules.UNLOADMODULE = function() {
	SidebarUI.triggers.twin.delete('viewTwinSidebarMenuMenu');
	SidebarUI.triggers.twin.delete('menuTitleTwin');
	
	SidebarUI.triggers.barSwitch.delete('viewSidebarMenuMenu');
	SidebarUI.triggers.barSwitch.delete('viewTwinSidebarMenuMenu');
	SidebarUI.triggers.barSwitch.delete('menuTitle');
	SidebarUI.triggers.barSwitch.delete('menuTitleTwin');
	
	Prefs.unlisten('titleButton', menus);
	Prefs.unlisten('titleButtonTwin', menus);
	
	Listeners.remove(window, 'popupshowing', menus, true);
	Listeners.remove(window, 'endToggleSidebar', menus);
	Listeners.remove(menus.contextMenu.menu, 'popupshowing', menus.contextMenu);
	Listeners.remove(menus.viewMenu.menu, 'popupshown', menus.viewMenu);
	Listeners.remove(menus.customizeMenu.menu, 'popupshown', menus.customizeMenu);
	Listeners.remove(menus.socialStatusArea.menu, 'popupshowing', menus.socialStatusArea);
	
	// ensure the menu is properly reset when unloading
	menus.menuItemsCheck(menus.viewSidebarMenu);
	if(menus.socialStatusArea.menu) { menus.menuItemsCheck(menus.socialStatusArea.menu); }
	
	menus.toggleMenuButton();
	menus.toggleMenuButtonTwin();
	
	if(UNLOADED) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headers.xul', 'menus');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/headersTwin.xul', 'menusTwin');
	}
};
