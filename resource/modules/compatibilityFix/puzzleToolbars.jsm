Modules.VERSION = '1.0.0';

this.__defineGetter__('puzzleBars', function() { return window.puzzleBars; });
this.__defineGetter__('lateralBar', function() { return puzzleBars && puzzleBars.lateralBar; });
this.__defineGetter__('lateralPP', function() { return puzzleBars && puzzleBars.lateralPP; });

this.pztFixer = function(loaded) {
	if(loaded) {
		// we need to access and follow some of PZT's preferences
		Prefs.setDefaults({
			lateral_bar: true,
			lateral_placement: 'left',
			lateral_autohide: false
		}, 'puzzlebars');
		
		// make sure the sidebars are moved in relation to the lateral bar so it isn't covered unnecessarily
		// -1px for lateral bar's box-shadow
		moveLeftBy.__defineGetter__('pztLateralBar', function() {
			if(Prefs.lateral_bar && Prefs.lateral_placement == 'left' && !Prefs.lateral_autohide && puzzleBars.onFullScreen && !puzzleBars.onFullScreen.hideBars
			&& lateralBar && lateralBar._loaded && !lateralBar.collapsed) {
				return lateralBar.parentNode.clientWidth -1;
			}
			return 0;
		});
		moveRightBy.__defineGetter__('pztLateralBar', function() {
			if(Prefs.lateral_bar && Prefs.lateral_placement == 'right' && !Prefs.lateral_autohide && puzzleBars.onFullScreen && !puzzleBars.onFullScreen.hideBars
			&& lateralBar && lateralBar._loaded && !lateralBar.collapsed) {
				return lateralBar.parentNode.clientWidth -1;
			}
			return 0;
		});
		
		Prefs.listen('lateral_bar', pztRedoWidths);
		Prefs.listen('lateral_placement', pztRedoWidths);
		Prefs.listen('lateral_autohide', pztRedoWidths);
		Listeners.add(window, 'LoadedPuzzleBar', pztRedoIfLateral);
		Listeners.add(window, 'UnloadedPuzzleBar', pztRedoIfLateral);
		Listeners.add(window, 'ToggledPuzzleBar', pztRedoIfLateral);
		Listeners.add(window, 'PuzzleBarCustomized', pztRedoIfLateral);
		
		// when hovering the lateral bar, show the sidebar if it's set to autohide
		Listeners.add(window, 'LoadedPuzzleBar', pztLoadedToolbar);
		Listeners.add(window, 'UnloadedPuzzleBar', pztLoadedToolbar);
		
		pztSetMouseOverLateral(true);
	} else {
		delete moveLeftBy.pztLateralBar;
		delete moveRightBy.pztLateralBar;
		Timers.cancel('pztRedoWidthsLater');
		
		Prefs.unlisten('lateral_bar', pztRedoWidths);
		Prefs.unlisten('lateral_placement', pztRedoWidths);
		Prefs.unlisten('lateral_autohide', pztRedoWidths);
		Listeners.remove(window, 'LoadedPuzzleBar', pztRedoIfLateral);
		Listeners.remove(window, 'UnloadedPuzzleBar', pztRedoIfLateral);
		Listeners.remove(window, 'ToggledPuzzleBar', pztRedoIfLateral);
		Listeners.remove(window, 'PuzzleBarCustomized', pztRedoIfLateral);
		
		Listeners.remove(window, 'LoadedPuzzleBar', pztLoadedToolbar);
		Listeners.remove(window, 'UnloadedPuzzleBar', pztLoadedToolbar);
		
		pztSetMouseOverLateral(false);
	}
	
	pztRedoWidths();
};

this.pztRedoIfLateral = function(e) {
	if(lateralBar == e.target) {
		pztRedoWidths();
	}
};

this.pztRedoWidths = function() {
	// during startup sometimes the lateralBar may not be fully initialized, probably because of overlays stuff finishing loading stylesheets
	if(pztRedoWidthsLater()) { return; }
	
	if(typeof(setAboveWidth) != 'undefined') {
		setAboveWidth();
	}
	if(typeof(setAutoHideWidth) != 'undefined') {
		setAutoHideWidth();
	}
};

this.pztRedoWidthsLater = function() {
	if(lateralBar && lateralBar._loaded && !lateralBar.collapsed && lateralBar.parentNode.clientWidth == 0) {
		Timers.init('pztRedoWidthsLater', pztRedoWidths, 50);
		return true;
	}
	
	Timers.cancel('pztRedoWidthsLater');
	return false;
};

this.pztSetMouseOverLateral = function(setup) {
	if(setup && Prefs.lateral_bar && !Prefs.lateral_autohide) {
		Listeners.add(lateralBar, 'mouseover', pztMouseOver);
		Listeners.add(lateralBar, 'dragenter', pztMouseOver);
		Listeners.add(lateralBar, 'mouseout', pztMouseOut);
		Listeners.add(lateralPP, 'mouseover', pztMouseOver);
		Listeners.add(lateralPP, 'dragenter', pztMouseOver);
		Listeners.add(lateralPP, 'mouseout', pztMouseOut);
	} else {
		Listeners.remove(lateralBar, 'mouseover', pztMouseOver);
		Listeners.remove(lateralBar, 'dragenter', pztMouseOver);
		Listeners.remove(lateralBar, 'mouseout', pztMouseOut);
		Listeners.remove(lateralPP, 'mouseover', pztMouseOver);
		Listeners.remove(lateralPP, 'dragenter', pztMouseOver);
		Listeners.remove(lateralPP, 'mouseout', pztMouseOut);
	}
};

this.pztMouseOver = function(e) {
	var bar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
	autoHideSwitchOver({ target: bar.switcher });
};

this.pztMouseOut = function(e) {
	var bar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
	autoHideSwitchOut({ target: bar.switcher });
};

this.pztLoadedToolbar = function(e) {
	if(e.target == lateralBar) {
		pztSetMouseOverLateral(e.type == 'LoadedPuzzleBar');
	}
};

this.pztListener = {
	onEnabled: function(addon) {
		if(addon.id == 'thePuzzlePiece@quicksaver') { pztFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'thePuzzlePiece@quicksaver') { pztFixer(false); }
	}
};

Modules.LOADMODULE = function() {
	AddonManager.addAddonListener(pztListener);
	AddonManager.getAddonByID('thePuzzlePiece@quicksaver', function(addon) {
		if(addon && addon.isActive) { pztFixer(true); }
	});
};

Modules.UNLOADMODULE = function() {
	AddonManager.removeAddonListener(pztListener);
	pztFixer(false);
};
