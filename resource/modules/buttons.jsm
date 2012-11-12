moduleAid.VERSION = '1.0.3';

this.buttonsToWatch = [
	{ id: 'feedbar-button', watchAttr: 'new', trueVal: 'true', modifierAttr: 'feednew' },
	{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE', modifierAttr: 'updscannew' },
	{ id: 'tools-updatescan-button', watchAttr: 'status', trueVal: 'CHANGE_DISABLED', modifierAttr: 'updscannew' }
];

this.setButtonModifiers = function(bar) {
	if(!bar.button) { return; }
	
	var modifiers = {};
	for(var i=0; i<buttonsToWatch.length; i++) {
		if(modifiers[buttonsToWatch[i].modifierAttr]) { continue; }
		
		modifiers[buttonsToWatch[i].modifierAttr] = !customizing && isAncestor($(buttonsToWatch[i].id), bar.toolbar) && $(buttonsToWatch[i].id).getAttribute(buttonsToWatch[i].watchAttr) == buttonsToWatch[i].trueVal;
	}
	
	for(var a in modifiers) {
		toggleAttribute(bar.button, a, modifiers[a]);
	}
};

this.updateButtonModifier = function(obj, attr, oldValue, newValue) {
	var bar = (isAncestor(obj, mainSidebar.toolbar)) ? mainSidebar : (isAncestor(obj, twinSidebar.toolbar)) ? twinSidebar : null;
	
	if(bar && bar.button) {
		var modifiers = {};
		for(var i=0; i<buttonsToWatch.length; i++) {
			if(buttonsToWatch[i].id == obj.id && buttonsToWatch[i].watchAttr == attr) {
				if(modifiers[buttonsToWatch[i].modifierAttr]) { continue; }
				
				modifiers[buttonsToWatch[i].modifierAttr] = newValue == buttonsToWatch[i].trueVal;
			}
		}
		
		for(var a in modifiers) {
			toggleAttribute(bar.button, a, modifiers[a]);
		}
	}
};

this.customizeButtonModifiers = function() {
	for(var i=0; i<buttonsToWatch.length; i++) {
		if(customizing || (!isAncestor($(buttonsToWatch[i].id), mainSidebar.toolbar) && !isAncestor($(buttonsToWatch[i].id), twinSidebar.toolbar))) {
			objectWatcher.removeAttributeWatcher($(buttonsToWatch[i].id), buttonsToWatch[i].watchAttr, updateButtonModifier);
		} else {
			objectWatcher.addAttributeWatcher($(buttonsToWatch[i].id), buttonsToWatch[i].watchAttr, updateButtonModifier);
		}
	}
		
	setButtonModifiers(mainSidebar);
	setButtonModifiers(twinSidebar);
};

// Keep the button label and tooltip when the observe attribute changes
this.buttonLabels = function(btn, onLoad) {
	if(!btn) { return; }
	
	aSync(function() { btn.setAttribute('loaded', 'true'); });
	if(btn == mainSidebar.button) {
		var box = mainSidebar.box;
		var check = !box || box.hidden || customizing;
		
		if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
			setButtonModifiers(mainSidebar);
		}
		
		if(prefAid.twinSidebar) {
			btn.setAttribute('label', stringsAid.get('buttons', 'buttonMainLabel'));
			if(check) {
				btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonMainTooltip'));
			} else {
				btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonMainCloseTooltip'));
			}
		} else {
			btn.setAttribute('label', stringsAid.get('buttons', 'buttonlabel'));
			if(check) {
				btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonTooltip'));
			} else {
				btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonCloseTooltip'));
			}
		}
		
		toggleAttribute(btn, 'checked', !check);
		toggleAttribute(btn, 'movetoright', prefAid.moveSidebars);
		
		setAttribute($('wrapper-omnisidebar_button'), 'title', btn.getAttribute('label'));
		
		return;
	}
	
	if(btn == twinSidebar.button) {
		var box = twinSidebar.box;
		var check = !box || box.hidden || customizing;
		
		if(onLoad && window.document.baseURI == 'chrome://browser/content/browser.xul') {
			setButtonModifiers(twinSidebar);
		}
		
		btn.setAttribute('label', stringsAid.get('buttons', 'buttonTwinLabel'));
		if(check) {
			btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonTwinTooltip'));
		} else {
			btn.setAttribute('tooltiptext', stringsAid.get('buttons', 'buttonTwinCloseTooltip'));
		}
		
		toggleAttribute(btn, 'checked', !check);
		toggleAttribute(btn, 'movetoleft', prefAid.moveSidebars);
		
		setAttribute($('wrapper-omnisidebar_button-twin'), 'title', btn.getAttribute('label'));
	}
};

this.updateButtons = function() {
	if(mainSidebar.button) { buttonLabels(mainSidebar.button); }
	if(twinSidebar.button) { buttonLabels(twinSidebar.button); }
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'buttons', null, null, function() {
		removeAttribute(mainSidebar.button, 'loaded');
		removeAttribute(twinSidebar.button, 'loaded');
	});
	
	prefAid.listen('moveSidebars', updateButtons);
	
	if(window.document.baseURI == 'chrome://browser/content/browser.xul') {
		listenerAid.add(window, 'beforecustomization', customizeButtonModifiers, false);
		listenerAid.add(window, 'aftercustomization', customizeButtonModifiers, false);
		listenerAid.add(window, 'loadedSidebarHeader', customizeButtonModifiers, false);
	
		customizeButtonModifiers();
	}
};

moduleAid.UNLOADMODULE = function() {
	if(window.document.baseURI == 'chrome://browser/content/browser.xul') {
		for(var i=0; i<buttonsToWatch.length; i++) {
			objectWatcher.removeAttributeWatcher($(buttonsToWatch[i].id), buttonsToWatch[i].watchAttr, updateButtonModifier);
		}
		
		listenerAid.remove(window, 'beforecustomization', customizeButtonModifiers, false);
		listenerAid.remove(window, 'aftercustomization', customizeButtonModifiers, false);
		listenerAid.remove(window, 'loadedSidebarHeader', customizeButtonModifiers, false);
	}
		
	prefAid.unlisten('moveSidebars', updateButtons);
	
	self.buttonLabels = function(btn, onLoad) {
		if(UNLOADED) { return; }
		if(toggleButtons()) { buttonLabels(btn, onLoad); }
	};
	
	overlayAid.removeOverlayWindow(window, 'buttons');
};
