Modules.VERSION = '2.0.1';

this.buttons = {
	toWatch: [
		{ id: 'feedbar-button', watchAttr: 'new', trueVal: 'true', modifierAttr: 'feednew' },
		{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE', modifierAttr: 'updscannew' },
		{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE_DISABLED', modifierAttr: 'updscannew' }
	],
	
	attrWatcher: function(obj, attr, oldValue, newValue) {
		var bar = (isAncestor(obj, mainSidebar.toolbar)) ? mainSidebar : (isAncestor(obj, twinSidebar.toolbar)) ? twinSidebar : null;
		
		if(bar && bar.button) {
			var modifiers = {};
			for(let watch of this.toWatch) {
				if(watch.id == obj.id && watch.watchAttr == attr) {
					if(modifiers[watch.modifierAttr]) { continue; }
					
					modifiers[watch.modifierAttr] = newValue == watch.trueVal;
				}
			}
			
			for(var a in modifiers) {
				toggleAttribute(bar.button, a, modifiers[a]);
			}
		}
	},
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'beforecustomization':
			case 'aftercustomization':
			case 'loadedSidebarHeader':
				this.customizeModifiers();
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'moveSidebars':
				if(mainSidebar.button) { this.labels(mainSidebar.button); }
				if(twinSidebar.button) { this.labels(twinSidebar.button); }
				break;
		}
	},
	
	setModifiers: function(bar) {
		if(!bar.button) { return; }
		
		var modifiers = {};
		for(let watch of this.toWatch) {
			if(modifiers[watch.modifierAttr]) { continue; }
			
			modifiers[watch.modifierAttr] = !customizing && isAncestor($(watch.id), bar.toolbar) && $(watch.id).getAttribute(watch.watchAttr) == watch.trueVal;
		}
		
		for(var a in modifiers) {
			toggleAttribute(bar.button, a, modifiers[a]);
		}
	},
	
	customizeModifiers: function() {
		for(let watch of this.toWatch) {
			var node = $(watch.id);
			if(customizing || (!isAncestor(node, mainSidebar.toolbar) && !isAncestor(node, twinSidebar.toolbar))) {
				Watchers.removeAttributeWatcher(node, watch.watchAttr, this);
			} else {
				Watchers.addAttributeWatcher(node, watch.watchAttr, this);
			}
		}
			
		this.setModifiers(mainSidebar);
		this.setModifiers(twinSidebar);
	},
	
	// Keep the button label and tooltip when the observe attribute changes
	labels: function(btn, onLoad) {
		if(!btn) { return; }
		
		aSync(function() { setAttribute(btn, 'loaded', 'true'); });
		if(btn == mainSidebar.button) {
			var check = mainSidebar.closed || customizing;
			
			if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
				this.setModifiers(mainSidebar);
			}
			
			setAttribute(btn, 'label', mainSidebar.label);
			if(Prefs.twinSidebar) {
				if(check) {
					setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonMainTooltip'));
				} else {
					setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonMainCloseTooltip'));
				}
			} else {
				if(check) {
					setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonTooltip'));
				} else {
					setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonCloseTooltip'));
				}
			}
			
			toggleAttribute(btn, 'checked', !check);
			toggleAttribute(btn, 'movetoright', Prefs.moveSidebars);
			
			setAttribute($('wrapper-'+objName+'-button'), 'title', btn.getAttribute('label'));
			
			return;
		}
		
		if(btn == twinSidebar.button) {
			var check = twinSidebar.closed || customizing;
			
			if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
				this.setModifiers(twinSidebar);
			}
			
			setAttribute(btn, 'label', twinSidebar.label);
			if(check) {
				setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonTwinTooltip'));
			} else {
				setAttribute(btn, 'tooltiptext', Strings.get('buttons', 'buttonTwinCloseTooltip'));
			}
			
			toggleAttribute(btn, 'checked', !check);
			toggleAttribute(btn, 'movetoleft', Prefs.moveSidebars);
			
			setAttribute($('wrapper-'+objName+'-button-twin'), 'title', btn.getAttribute('label'));
		}
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('moveSidebars', buttons);
	
	Listeners.add(window, 'beforecustomization', buttons);
	Listeners.add(window, 'aftercustomization', buttons);
	Listeners.add(window, 'loadedSidebarHeader', buttons);

	buttons.customizeModifiers();
};

Modules.UNLOADMODULE = function() {
	for(let watch of buttons.toWatch) {
		Watchers.removeAttributeWatcher($(watch.id), watch.watchAttr, buttons);
	}
	
	Listeners.remove(window, 'beforecustomization', buttons);
	Listeners.remove(window, 'aftercustomization', buttons);
	Listeners.remove(window, 'loadedSidebarHeader', buttons);
		
	Prefs.unlisten('moveSidebars', buttons);
	
	removeAttribute(mainSidebar.button, 'loaded');
	removeAttribute(twinSidebar.button, 'loaded');
};
