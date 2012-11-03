moduleAid.VERSION = '1.0.0';

this.openLastWatcher = function(e) {
	if(privateBrowsingAid.inPrivateBrowsing) {
		if(!prefAid.keepPrivate) {
			e.preventDefault();
		}
		
		if(e.detail.bar.twin) {
			privateWatcher.twinHiddenBefore = false;
		} else {
			privateWatcher.mainHiddenBefore = false;
		}
	}
};

this.privateWatcher = {
	mainHiddenBefore: null,
	twinHiddenBefore: null,
	mainLastBefore: null,
	twinLastBefore: null,
	mainGoURIBefore: null,
	twinGoURIBefore: null,
	
	mainHiddenAfter: null,
	twinHiddenAfter: null,
	mainLastAfter: null,
	twinLastAfter: null,
	mainGoURIAfter: null,
	twinGoURIAfter: null,
	
	// override native firefox behavior with this statement outside of the init loop
	autoStarted: function() {
		this.onEnter();
	},
	
	onEnter: function() {
		this.mainHiddenBefore = (mainSidebar.box) ? mainSidebar.box.hidden : true;
		this.twinHiddenBefore = (twinSidebar.box) ? twinSidebar.box.hidden : true;
		this.mainLastBefore = prefAid.lastcommand;
		this.twinLastBefore = prefAid.lastcommandTwin;
		this.mainGoURIBefore = (mainSidebar.goURI) ? mainSidebar.goURI.getAttribute('sidebarurl') : 'about:blank';
		this.twinGoURIBefore = (twinSidebar.goURI) ? twinSidebar.goURI.getAttribute('sidebarurl') : 'about:blank';
		
		if(!prefAid.keepPrivate) {
			if(mainSidebar.box && !mainSidebar.box.hidden) {
				closeSidebar(mainSidebar);
			}
			if(twinSidebar.box && !twinSidebar.box.hidden) {
				closeSidebar(twinSidebar);
			}
			prefAid.reset('lastcommand');
			prefAid.reset('lastcommandTwin');
			setAttribute(mainSidebar.goURI, 'sidebarurl', 'about:blank');
			setAttribute(twinSidebar.goURI, 'sidebarurl', 'about:blank');
		}
		else {
			aSync(function() {
				if(mainSidebar.box && mainSidebar.box.hidden != privateWatcher.mainHiddenBefore) {
					toggleSidebar(privateWatcher.mainLastBefore);
				}
				if(twinSidebar.box && twinSidebar.box.hidden != privateWatcher.twinHiddenBefore) {
					toggleSidebar(privateWatcher.twinLastBefore, false, true);
				}
			});
		}
	},
	
	onExit: function() {
		if(!prefAid.keepPrivate) {
			if(mainSidebar.box && (mainSidebar.box.hidden != this.mainHiddenBefore || prefAid.lastcommand != this.mainLastBefore)) {
				toggleSidebar(this.mainLastBefore);
			}
			if(twinSidebar.box && (twinSidebar.box.hidden != this.twinHiddenBefore || prefAid.lastcommandTwin != this.twinLastBefore)) {
				toggleSidebar(this.twinLastBefore, false, true);
			}
			prefAid.lastcommand = this.mainLastBefore;
			prefAid.lastcommandTwin = this.twinLastBefore;
			setAttribute(mainSidebar.goURI, 'sidebarurl', this.mainGoURIBefore);
			setAttribute(twinSidebar.goURI, 'sidebarurl', this.twinGoURIBefore);
		}
		else {
			this.mainHiddenAfter = (mainSidebar.box) ? mainSidebar.box.hidden : true;
			this.twinHiddenAfter = (twinSidebar.box) ? twinSidebar.box.hidden : true;
			this.mainLastAfter = prefAid.lastcommand;
			this.twinLastAfter = prefAid.lastcommandTwin;
			
			aSync(function() {
				if(UNLOADED) { return; }
				
				if(mainSidebar.box) {
					if(mainSidebar.box.hidden != privateWatcher.mainHiddenAfter 
					|| prefAid.lastcommand != privateWatcher.mainLastAfter
					|| mainSidebar.box.getAttribute('sidebarcommand') != prefAid.lastcommand) {
						toggleSidebar(privateWatcher.mainLastAfter);
					}
				}
				
				if(twinSidebar.box) {
					if(twinSidebar.box.hidden != privateWatcher.twinHiddenAfter 
					|| prefAid.lastcommandTwin != privateWatcher.twinLastAfter
					|| twinSidebar.box.getAttribute('sidebarcommand') != prefAid.lastcommandTwin) {
						toggleSidebar(privateWatcher.twinLastAfter, false, true);
					}
				}
			});
		}
	},
	
	addonEnabled: function() {
		this.mainHiddenBefore = (mainSidebar.box) ? mainSidebar.box.hidden : true;
		this.twinHiddenBefore = (twinSidebar.box) ? twinSidebar.box.hidden : true;
		this.mainLastBefore = (mainSidebar.box) ? mainSidebar.box.getAttribute('sidebarcommand') || prefAid.lastcommand : prefAid.lastcommand;
		this.twinLastBefore = (twinSidebar.box) ? twinSidebar.box.getAttribute('sidebarcommand') || prefAid.lastcommandTwin : prefAid.lastcommandTwin;
		this.mainGoURIBefore = 'about:blank';
		this.twinGoURIBefore = 'about:blank';
	},
	
	addonDisabled: function() {
		if(!prefAid.keepPrivate) {
			prefAid.lastcommand = this.mainLastBefore;
			prefAid.lastcommandTwin = this.twinLastBefore;
		}
	},
	
	onQuit: function() {
		if(privateBrowsingAid.inPrivateBrowsing) {
			this.onExit();
		}
	}
};

moduleAid.LOADMODULE = function() {
	privateBrowsingAid.addWatcher(privateWatcher);
	listenerAid.add(window, 'willOpenLast', openLastWatcher, true);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'willOpenLast', openLastWatcher, true);
	privateBrowsingAid.removeWatcher(privateWatcher);
};
