moduleAid.VERSION = '1.0.0';

this.titlebarButtonBoxFixer = function(aEnabled) {
	if(aEnabled) {
		window.gNavToolbox.style.zIndex = '250';
		// on windows xp the navtoolbox would be over the control buttons in the titlebar, making them unusable
		if(Services.navigator.oscpu == 'Windows NT 5.1') {
			if($('appmenu-button-container')) { $('appmenu-button-container').style.zIndex = '260'; }
			$('titlebar-buttonbox').style.zIndex = '260';
		}
	} else {
		window.gNavToolbox.style.zIndex = '';
		if(Services.navigator.oscpu == 'Windows NT 5.1') {
			if($('appmenu-button-container')) { $('appmenu-button-container').style.zIndex = ''; }
			$('titlebar-buttonbox').style.zIndex = '1';
		}
	}
};

this.lessChromeListener = {
	onEnabled: function(addon) {
		if(addon.id == 'lessChrome.HD@prospector.labs.mozilla') { titlebarButtonBoxFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'lessChrome.HD@prospector.labs.mozilla') { titlebarButtonBoxFixer(false); }
	}
};

this.toggleLessChromeListener = function(unloaded) {
	if(!UNLOADED && !unloaded && (prefAid.renderabove || prefAid.renderaboveTwin)) {
		AddonManager.addAddonListener(lessChromeListener);
		AddonManager.getAddonByID('lessChrome.HD@prospector.labs.mozilla', function(addon) {
			if(addon && addon.isActive) { titlebarButtonBoxFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(lessChromeListener);
		titlebarButtonBoxFixer(false);
	}
};

// on customize the z-index of the controller buttons is reset, it won't work setting it without the timer
this.customizeLessChrome = function() {
	timerAid.init('customizeLessChrome', toggleLessChromeListener, 100);
};

this.cancelLessChrome = function(e) {
	// Omnisidebar popup menus (and a few from right-clicks)
	if(isAncestor(e.target, $('openSidebarMenu'))
	|| isAncestor(e.target, $('openTwinSidebarMenu'))
	|| isAncestor(e.target, $('omnisidebarURIBarMenu'))
	|| isAncestor(e.target, $('omnisidebarURIBarMenu-twin'))
	// Right-clicking the header or elements in the actual sidebars
	|| isAncestor(e.target.triggerNode, mainSidebar.box)
	|| isAncestor(e.target.triggerNode, twinSidebar.box)) {
		e.preventDefault();
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('renderabove', toggleLessChromeListener);
	prefAid.listen('renderaboveTwin', toggleLessChromeListener);
	
	toggleLessChromeListener();
	listenerAid.add(window, "LessChromeShowing", cancelLessChrome, true);
	listenerAid.add(window, "aftercustomization", customizeLessChrome);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, "aftercustomization", customizeLessChrome);
	listenerAid.remove(window, "LessChromeShowing", cancelLessChrome, true);
	toggleLessChromeListener(true);
	
	prefAid.unlisten('renderabove', toggleLessChromeListener);
	prefAid.unlisten('renderaboveTwin', toggleLessChromeListener);
};
