Modules.VERSION = '1.1.0';

this.buttonsToWatch = [
	{ id: 'feedbar-button', watchAttr: 'new', trueVal: 'true', modifierAttr: 'feednew' },
	{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE', modifierAttr: 'updscannew' },
	{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE_DISABLED', modifierAttr: 'updscannew' }
];

this.setButtonModifiers = function(bar) {
	if(!bar.button) { return; }
	
	var modifiers = {};
	for(var watch of buttonsToWatch) {
		if(modifiers[watch.modifierAttr]) { continue; }
		
		modifiers[watch.modifierAttr] = !customizing && isAncestor($(watch.id), bar.toolbar) && $(watch.id).getAttribute(watch.watchAttr) == watch.trueVal;
	}
	
	for(var a in modifiers) {
		toggleAttribute(bar.button, a, modifiers[a]);
	}
};

this.updateButtonModifier = function(obj, attr, oldValue, newValue) {
	var bar = (isAncestor(obj, mainSidebar.toolbar)) ? mainSidebar : (isAncestor(obj, twinSidebar.toolbar)) ? twinSidebar : null;
	
	if(bar && bar.button) {
		var modifiers = {};
		for(var watch of buttonsToWatch) {
			if(watch.id == obj.id && watch.watchAttr == attr) {
				if(modifiers[watch.modifierAttr]) { continue; }
				
				modifiers[watch.modifierAttr] = newValue == watch.trueVal;
			}
		}
		
		for(var a in modifiers) {
			toggleAttribute(bar.button, a, modifiers[a]);
		}
	}
};

this.customizeButtonModifiers = function() {
	for(var watch of buttonsToWatch) {
		if(customizing || (!isAncestor($(watch.id), mainSidebar.toolbar) && !isAncestor($(watch.id), twinSidebar.toolbar))) {
			Watchers.removeAttributeWatcher($(watch.id), watch.watchAttr, updateButtonModifier);
		} else {
			Watchers.addAttributeWatcher($(watch.id), watch.watchAttr, updateButtonModifier);
		}
	}
		
	setButtonModifiers(mainSidebar);
	setButtonModifiers(twinSidebar);
};

// Keep the button label and tooltip when the observe attribute changes
this.buttonLabels = function(btn, onLoad) {
	if(!btn) { return; }
	
	aSync(function() { setAttribute(btn, 'loaded', 'true'); });
	if(btn == mainSidebar.button) {
		var box = mainSidebar.box;
		var check = !box || mainSidebar.closed || customizing;
		
		if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
			setButtonModifiers(mainSidebar);
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
		var box = twinSidebar.box;
		var check = !box || twinSidebar.closed || customizing;
		
		if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
			setButtonModifiers(twinSidebar);
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
};

this.updateButtons = function() {
	if(mainSidebar.button) { buttonLabels(mainSidebar.button); }
	if(twinSidebar.button) { buttonLabels(twinSidebar.button); }
};

Modules.LOADMODULE = function() {
	Prefs.listen('moveSidebars', updateButtons);
	
	Listeners.add(window, 'beforecustomization', customizeButtonModifiers);
	Listeners.add(window, 'aftercustomization', customizeButtonModifiers);
	Listeners.add(window, 'loadedSidebarHeader', customizeButtonModifiers);

	customizeButtonModifiers();
};

Modules.UNLOADMODULE = function() {
	for(var watch of buttonsToWatch) {
		Watchers.removeAttributeWatcher($(watch.id), watch.watchAttr, updateButtonModifier);
	}
	
	Listeners.remove(window, 'beforecustomization', customizeButtonModifiers);
	Listeners.remove(window, 'aftercustomization', customizeButtonModifiers);
	Listeners.remove(window, 'loadedSidebarHeader', customizeButtonModifiers);
		
	Prefs.unlisten('moveSidebars', updateButtons);
	
	self.buttonLabels = function(btn, onLoad) {
		if(UNLOADED) { return; }
		if(toggleButtons()) { buttonLabels(btn, onLoad); }
	};
};
