moduleAid.VERSION = '1.0.7';

this.__defineGetter__('mainMenuPopup', function() { return $('mainKeyset-menupopup'); });
this.__defineGetter__('twinMenuPopup', function() { return $('twinKeyset-menupopup'); });

this.optionsRTL = false;

this.isStillAvailable = function(key, list) {
	if(key.keycode != 'none' && !list[key.keycode]) { return false; }
	
	return true;
};

this.fillKeycodes = function(whichTrigger) {
	var mainKey = {
		keycode: $('mainKeyset-menu').value,
		accel: $('accelCheckboxMain').checked,
		shift: $('shiftCheckboxMain').checked,
		alt: $('altCheckboxMain').checked
	};
	var twinKey = {
		keycode: $('twinKeyset-menu').value,
		accel: $('accelCheckboxTwin').checked,
		shift: $('shiftCheckboxTwin').checked,
		alt: $('altCheckboxTwin').checked
	};
	if(mainKey.keycode != 'none' && twinKey.keycode != 'none' && keysetAid.compareKeys(mainKey, twinKey)) {
		if(!whichTrigger || whichTrigger == 'main') { mainKey.keycode = 'none'; }
		if(!whichTrigger || whichTrigger == 'twin') { twinKey.keycode = 'none'; }
	}
	
	if(!whichTrigger || whichTrigger == 'main' || keysetAid.compareKeys(mainKey, twinKey, true)) {
		var mainAvailable = keysetAid.getAvailable(mainKey, true);
		if(!isStillAvailable(mainKey, mainAvailable)) {
			mainKey.keycode = 'none';
		}
		
		var item = mainMenuPopup.firstChild.nextSibling;
		while(item) {
			item.setAttribute('hidden', 'true');
			item.setAttribute('disabled', 'true');
			item = item.nextSibling;
		}
		if(mainKey.keycode == 'none') {
			mainMenuPopup.parentNode.selectedItem = mainMenuPopup.firstChild;
			$(mainMenuPopup.parentNode.getAttribute('preference')).value = 'none';
		}
		
		for(var i=1; i<mainMenuPopup.childNodes.length; i++) {
			var item = mainMenuPopup.childNodes[i];
			var keycode = item.getAttribute('value');
			if(!mainAvailable[keycode] || keysetAid.compareKeys(mainAvailable[keycode], twinKey)) {
				continue;
			}
			
			item.removeAttribute('hidden');
			item.removeAttribute('disabled');
			if(keycode == mainKey.keycode) {
				mainMenuPopup.parentNode.selectedItem = item;
				// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
				if(keycode == '*') {
					var mainItemIndex = mainMenuPopup.parentNode.selectedIndex;
					aSync(function() { mainMenuPopup.parentNode.selectedIndex = mainItemIndex; });
				}
			}
		}
	}
	
	if(!whichTrigger || whichTrigger == 'twin' || keysetAid.compareKeys(mainKey, twinKey, true)) {
		var twinAvailable = keysetAid.getAvailable(twinKey, true);
		if(!isStillAvailable(twinKey, twinAvailable)) {
			twinKey.keycode = 'none';
		}
		
		var item = twinMenuPopup.firstChild.nextSibling;
		while(item) {
			item.setAttribute('hidden', 'true');
			item.setAttribute('disabled', 'true');
			item = item.nextSibling;
		}
		if(twinKey.keycode == 'none') {
			twinMenuPopup.parentNode.selectedItem = twinMenuPopup.firstChild;
			$(twinMenuPopup.parentNode.getAttribute('preference')).value = 'none';
		}
		
		for(var i=1; i<twinMenuPopup.childNodes.length; i++) {
			var item = twinMenuPopup.childNodes[i];
			var keycode = item.getAttribute('value');
			if(!twinAvailable[keycode] || keysetAid.compareKeys(twinAvailable[keycode], mainKey)) {
				continue;
			}
			
			item.removeAttribute('hidden');
			item.removeAttribute('disabled');
			if(keycode == twinKey.keycode) {
				twinMenuPopup.parentNode.selectedItem = item;
				// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
				if(keycode == '*') {
					var twinItemIndex = twinMenuPopup.parentNode.selectedIndex;
					aSync(function() { twinMenuPopup.parentNode.selectedIndex = twinItemIndex; });
				}
			}
		}
	}
};

moduleAid.LOADMODULE = function() {
	optionsRTL = (window.getComputedStyle($('omnisidebar-options-window')).getPropertyValue('direction') == 'rtl');
	if(optionsRTL) {
		overlayAid.overlayWindow(window, 'optionsRTL');
	}
	
	if(Australis || Services.appinfo.OS == 'WINNT' || Services.appinfo.OS == 'Darwin') {
		$('omnisidebar_coloroption').removeAttribute('hidden');
		$('omnisidebar_coloroptionTwin').removeAttribute('hidden');
		sizeProperly();
		
		if(Services.appinfo.OS == 'Darwin') {
			overlayAid.overlayWindow(window, 'optionsMac');
		}
		
		if(Australis) {
			overlayAid.overlayWindow(window, 'optionsAustralis');
		}
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
};
