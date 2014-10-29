Modules.VERSION = '1.3.0';

// stops closing the sidebar when quickly toggling between sidebars in auto-close mode
this.autoCloseBeginToggleSidebar = function(e) {
	if(Timers['autoCloseSidebarToggled'+(e.detail.bar.twin ? 'Twin' : '')]) {
		e.preventDefault();
	}
};

this.autoCloseEndToggleSidebar = function(e) {
	var bar = e.detail.bar;
	
	if(bar.autoClose) {
		Timers.init('autoCloseSidebarToggled'+(bar.twin ? 'Twin' : ''), function() {}, 100);
	}
};

this.focusContent = function(e) {
	var bar = e.detail.bar;
	
	// For the autoclose feature, we need to focus the sidebar on open or it won't be focused
	if(bar.autoClose) {
		if(bar.sidebar.contentDocument && bar.sidebar.contentDocument.documentElement) {
			bar.sidebar.contentDocument.documentElement.focus();
		} else {
			bar.sidebar.focus();
		}
	}
};

this.forceAutoClose = function(e) {
	Timers.cancel('stopCancelAutoClose');
	Timers.cancel('cancelAutoClose');
	autoClose(e);
};

this.autoClose = function(e) {
	if(Timers.cancelAutoClose) {
		Timers.init('stopCancelAutoClose', function() {
			Timers.cancel('cancelAutoClose');
		}, 250);
		return;
	}
	
	Timers.init('autoClose', function() {
		if(Timers.cancelAutoClose) {
			Timers.cancel('cancelAutoClose');
			return;
		}
		
		try { var focusedNode = document.commandDispatcher.focusedElement || e.target; }
		catch(ex) {
			handleDeadObject(ex);
			return;
		}
		
		if(mainSidebar.box && !mainSidebar.closed && Prefs.autoClose) {
			if(!isAncestor(focusedNode, mainSidebar.box)
			&& dispatch(mainSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: mainSidebar, focusedNode: focusedNode } })) {
				Listeners.add(mainSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				closeHide(mainSidebar);
			}
		}
		
		if(twinSidebar.box && !twinSidebar.closed && Prefs.autoCloseTwin) {
			if(!isAncestor(focusedNode, twinSidebar.box)
			&& dispatch(twinSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: twinSidebar, focusedNode: focusedNode } })) {
				Listeners.add(twinSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				closeHide(twinSidebar);
			}
		}
	}, 100);
};

this.cancelAutoClose = function() {
	Timers.cancel('autoClose');
	Timers.init('cancelAutoClose', function() {}, 2000);
};

this.closeHide = function(bar) {
	if(bar.above && bar.autoHide) {
		setHover(bar, false);
		setAttribute(bar.box, 'dontReHover', 'true');
	} else {
		toggleSidebar(null, false, bar.twin);
	}
};

this.setAutoClose = function(loaded) {
	if(loaded && (Prefs.autoClose || Prefs.autoCloseTwin)) {
		Listeners.add(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
		Listeners.add(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
		Listeners.add(window, 'SidebarFocused', focusContent);
		Listeners.add(window, 'focus', autoClose, true);
		Listeners.add(window, 'sidebarAbove', cancelAutoClose);
		Listeners.add(window, 'sidebarDocked', cancelAutoClose);
		
		// trick to not autoclose when opening tabs in the background sidebar links
		Listeners.add(window, 'TabOpen', cancelAutoClose);
		Listeners.add(window, 'TabSelect', forceAutoClose);
	}
	else {
		Listeners.remove(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
		Listeners.remove(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
		Listeners.remove(window, 'SidebarFocused', focusContent);
		Listeners.remove(window, 'focus', autoClose, true);
		Listeners.remove(window, 'sidebarAbove', cancelAutoClose);
		Listeners.remove(window, 'sidebarDocked', cancelAutoClose);
		Listeners.remove(window, 'TabOpen', cancelAutoClose);
		Listeners.remove(window, 'TabSelect', forceAutoClose);
	}
};

// Autoclose feature: we can't have the sidebars open when we restart
this.dontOpenOnStartup = function() {
	if(!UNLOADED || UNLOADED == APP_SHUTDOWN) {
		if(Prefs.autoClose) {
			if(mainSidebar.box && !mainSidebar.closed) { closeHide(mainSidebar); }
		}
		if(Prefs.autoCloseTwin) {
			if(twinSidebar.box && !twinSidebar.closed) { closeHide(twinSidebar); }
		}
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('autoClose', setAutoClose);
	Prefs.listen('autoCloseTwin', setAutoClose);
	
	setAutoClose(true);
	
	if(STARTED == APP_STARTUP) {
		dontOpenOnStartup();
	}
	
	Observers.add(dontOpenOnStartup, 'quit-application');
};

Modules.UNLOADMODULE = function() {
	Observers.remove(dontOpenOnStartup, 'quit-application');
	
	setAutoClose();
	
	Prefs.unlisten('autoClose', setAutoClose);
	Prefs.unlisten('autoCloseTwin', setAutoClose);
};
