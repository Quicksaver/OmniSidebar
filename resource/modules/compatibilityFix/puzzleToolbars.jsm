Modules.VERSION = '2.0.1';

this.__defineGetter__('puzzleBars', function() { return window.puzzleBars; });

this.pzt = {
	id: 'thePuzzlePiece@quicksaver',
	
	get lateral () { return puzzleBars && puzzleBars.lateral; },
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedPuzzleBar':
				if(this.lateral && e.target == this.lateral.bar) {
					this.setMouseOver();
					this.redoWidths();
				}
				break;
			
			case 'UnloadedPuzzleBar':
				if(this.lateral && e.target == this.lateral.bar) {
					this.unsetMouseOver();
					this.redoWidths();
				}
				break;
			
			case 'ToggledPuzzleBar':
			case 'PuzzleBarCustomized':
				if(this.lateral && e.target == this.lateral.bar) {
					this.redoWidths();
				}
				break;
			
			case 'mouseover':
			case 'dragenter':
			case 'mouseout':
				var bar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
				if(bar._autohide) {
					bar._autohide.handleEvent(e);
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'lateral_bar':
			case 'lateral_placement':
			case 'lateral_autohide':
				this.redoWidths();
				break;
		}
	},
	
	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},
	
	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},
	
	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},
	
	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},
	
	enable: function() {
		// we need to access and follow some of PZT's preferences
		Prefs.setDefaults({
			lateral_bar: true,
			lateral_placement: 'left',
			lateral_autohide: false
		}, 'puzzlebars');
		
		// make sure the sidebars are moved in relation to the lateral bar so it isn't covered unnecessarily
		// -1px for lateral bar's box-shadow
		moveLeftBy.__defineGetter__('pztLateralBar', () => {
			if(Prefs.lateral_bar && Prefs.lateral_placement == 'left' && !Prefs.lateral_autohide
			&& puzzleBars && puzzleBars.onFullScreen && !puzzleBars.onFullScreen.hideBars
			&& this.lateral && this.lateral.bar && this.lateral.bar._loaded && !this.lateral.bar.collapsed) {
				return this.lateral.bar.parentNode.clientWidth -1;
			}
			return 0;
		});
		moveRightBy.__defineGetter__('pztLateralBar', () => {
			if(Prefs.lateral_bar && Prefs.lateral_placement == 'right' && !Prefs.lateral_autohide
			&& puzzleBars && puzzleBars.onFullScreen && !puzzleBars.onFullScreen.hideBars
			&& this.lateral && this.lateral.bar && this.lateral.bar._loaded && !this.lateral.bar.collapsed) {
				return this.lateral.bar.parentNode.clientWidth -1;
			}
			return 0;
		});
		
		Prefs.listen('lateral_bar', this);
		Prefs.listen('lateral_placement', this);
		Prefs.listen('lateral_autohide', this);
		Listeners.add(window, 'LoadedPuzzleBar', this);
		Listeners.add(window, 'UnloadedPuzzleBar', this);
		Listeners.add(window, 'ToggledPuzzleBar', this);
		Listeners.add(window, 'PuzzleBarCustomized', this);
		
		// when hovering the lateral bar, show the sidebar if it's set to autohide
		Listeners.add(window, 'LoadedPuzzleBar', this);
		Listeners.add(window, 'UnloadedPuzzleBar', this);
		
		this.setMouseOver();
		this.redoWidths();
	},
	
	disable: function() {
		delete moveLeftBy.pztLateralBar;
		delete moveRightBy.pztLateralBar;
		Timers.cancel('pztRedoWidthsLater');
		
		if(Prefs._prefObjects['lateral_bar']) {
			Prefs.unlisten('lateral_bar', this);
			Prefs.unlisten('lateral_placement', this);
			Prefs.unlisten('lateral_autohide', this);
		}
		Listeners.remove(window, 'LoadedPuzzleBar', this);
		Listeners.remove(window, 'UnloadedPuzzleBar', this);
		Listeners.remove(window, 'ToggledPuzzleBar', this);
		Listeners.remove(window, 'PuzzleBarCustomized', this);
		
		Listeners.remove(window, 'LoadedPuzzleBar', this);
		Listeners.remove(window, 'UnloadedPuzzleBar', this);
		
		this.unsetMouseOver();
		this.redoWidths();
	},
	
	redoWidths: function() {
		// during startup sometimes the lateralBar may not be fully initialized, probably because of overlays stuff finishing loading stylesheets
		if(this.redoWidthsLater()) { return; }
		
		if(typeof(renderAbove) != 'undefined') {
			renderAbove.setWidth();
		}
		if(typeof(autoHide) != 'undefined') {
			autoHide.setWidth();
		}
	},
	
	redoWidthsLater: function() {
		if(this.lateral
		&& this.lateral.bar
		&& this.lateral.bar._loaded
		&& !this.lateral.bar.collapsed
		&& this.lateral.bar.parentNode.clientWidth == 0) {
			Timers.init('pztRedoWidthsLater', () => { this.redoWidths(); }, 50);
			return true;
		}
		
		Timers.cancel('pztRedoWidthsLater');
		return false;
	},
	
	setMouseOver: function() {
		if(!Prefs.lateral_bar || Prefs.lateral_autohide) {
			this.unsetMouseOver();
			return;
		}
		
		Listeners.add(this.lateral && this.lateral.bar, 'mouseover', this);
		Listeners.add(this.lateral && this.lateral.bar, 'dragenter', this);
		Listeners.add(this.lateral && this.lateral.bar, 'mouseout', this);
		Listeners.add(this.lateral && this.lateral.PP, 'mouseover', this);
		Listeners.add(this.lateral && this.lateral.PP, 'dragenter', this);
		Listeners.add(this.lateral && this.lateral.PP, 'mouseout', this);
	},
	
	unsetMouseOver: function() {
		Listeners.remove(this.lateral && this.lateral.bar, 'mouseover', this);
		Listeners.remove(this.lateral && this.lateral.bar, 'dragenter', this);
		Listeners.remove(this.lateral && this.lateral.bar, 'mouseout', this);
		Listeners.remove(this.lateral && this.lateral.PP, 'mouseover', this);
		Listeners.remove(this.lateral && this.lateral.PP, 'dragenter', this);
		Listeners.remove(this.lateral && this.lateral.PP, 'mouseout', this);
	}
};

Modules.LOADMODULE = function() {
	pzt.listen();
};

Modules.UNLOADMODULE = function() {
	pzt.unlisten();
};
