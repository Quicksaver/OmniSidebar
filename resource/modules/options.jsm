Modules.VERSION = '1.1.2';

this.keys = [
	{
		id: objName+'-key_mainSidebar',
		get disabled () { return trueAttribute($('mainKeyset-menu'), 'disabled'); },
		get keycode () { return $('mainKeyset-menu').value; },
		get accel () { return $('accelCheckboxMain').checked; },
		get shift () { return $('shiftCheckboxMain').checked; },
		get alt () { return $('altCheckboxMain').checked; },
		get menu () { return $('mainKeyset-menupopup'); }
	},
	{
		id: objName+'-key_twinSidebar',
		get disabled () { return trueAttribute($('twinKeyset-menu'), 'disabled'); },
		get keycode () { return $('twinKeyset-menu').value; },
		get accel () { return $('accelCheckboxTwin').checked; },
		get shift () { return $('shiftCheckboxTwin').checked; },
		get alt () { return $('altCheckboxTwin').checked; },
		get menu () { return $('twinKeyset-menupopup'); }
	}
];

this.fillKeycodes = function() {
	for(var key of keys) {
		var available = Keysets.getAvailable(key, keys);
		if(!isStillAvailable(key, available)) {
			key.keycode = 'none';
		}
		
		var item = key.menu.firstChild.nextSibling;
		while(item) {
			item.setAttribute('hidden', 'true');
			item.setAttribute('disabled', 'true');
			item = item.nextSibling;
		}
		if(key.keycode == 'none') {
			key.menu.parentNode.selectedItem = key.menu.firstChild;
			$(key.menu.parentNode.getAttribute('preference')).value = 'none';
		}
		
		for(var item of key.menu.childNodes) {
			var keycode = item.getAttribute('value');
			if(!available[keycode]) { continue; }
			
			item.removeAttribute('hidden');
			item.removeAttribute('disabled');
			if(keycode == key.keycode) {
				key.menu.parentNode.selectedItem = item;
				// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
				if(keycode == '*') {
					var itemIndex = key.menu.parentNode.selectedIndex;
					aSync(function() { key.menu.parentNode.selectedIndex = itemIndex; });
				}
			}
		}
	}
};

this.isStillAvailable = function(key, list) {
	if(!list[key.keycode]) { return false; }
	return true;
};

this.openReleaseNotesTab = function(aWindow) {
	// this doesn't work in e10s yet
	//aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('about:'+objPathString);
	aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('chrome://'+objPathString+'/content/whatsnew.xhtml');
	aWindow.gBrowser.selectedTab.loadOnStartup = true; // for Tab Mix Plus
};

this.openReleaseNotes = function(e) {
	if(e.type == 'click' && e.which != 1) { return; }
	if(e.type == 'keypress' && e.keycode != e.DOM_VK_RETURN) { return; }
	
	if(window.opener && window.opener instanceof window.opener.ChromeWindow && window.opener.gBrowser) {
		openReleaseNotesTab(window.opener);
	} else {
		Windows.callOnMostRecent(openReleaseNotesTab, 'navigator:browser');
	}
	
	e.preventDefault();
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	if(RTL) {
		Overlays.overlayWindow(window, 'optionsRTL');
	}
	
	if(DARWIN) {
		Overlays.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
	
	Listeners.add($('releaseNotesLink'), 'keypress', openReleaseNotes, true);
	Listeners.add($('releaseNotesLink'), 'click', openReleaseNotes, true);
};
