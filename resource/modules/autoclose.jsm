moduleAid.VERSION = '1.2.4';

// stops closing the sidebar when quickly toggling between sidebars in auto-close mode
this.autoCloseBeginToggleSidebar = function(e) {
	if(timerAid['autoCloseSidebarToggled'+(e.detail.bar.twin ? 'Twin' : '')]) {
		e.preventDefault();
	}
};

this.autoCloseEndToggleSidebar = function(e) {
	var bar = e.detail.bar;
	
	if(bar.autoClose) {
		timerAid.init('autoCloseSidebarToggled'+(bar.twin ? 'Twin' : ''), function() {}, 100);
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
	timerAid.cancel('stopCancelAutoClose');
	timerAid.cancel('cancelAutoClose');
	autoClose(e);
};

this.autoClose = function(e) {
	if(timerAid.cancelAutoClose) {
		timerAid.init('stopCancelAutoClose', function() {
			timerAid.cancel('cancelAutoClose');
		}, 250);
		return;
	}
	
	timerAid.init('autoClose', function() {
		if(timerAid.cancelAutoClose) {
			timerAid.cancel('cancelAutoClose');
			return;
		}
		
		var focusedNode = document.commandDispatcher.focusedElement || e.target;
		
		if(mainSidebar.box && !mainSidebar.closed && prefAid.autoClose) {
			if(!isAncestor(focusedNode, mainSidebar.box)
			&& dispatch(mainSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: mainSidebar, focusedNode: focusedNode } })) {
				listenerAid.add(mainSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				closeHide(mainSidebar);
			}
		}
		
		if(twinSidebar.box && !twinSidebar.closed && prefAid.autoCloseTwin) {
			if(!isAncestor(focusedNode, twinSidebar.box)
			&& dispatch(twinSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: twinSidebar, focusedNode: focusedNode } })) {
				listenerAid.add(twinSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				closeHide(twinSidebar);
			}
		}
	}, 100);
};

this.cancelAutoClose = function() {
	timerAid.cancel('autoClose');
	timerAid.init('cancelAutoClose', function() {}, 2000);
};

this.closeHide = function(bar) {
	if(bar.above && bar.autoHide) {
		setHover(bar, false);
		bar.box.setAttribute('dontReHover', 'true');
	} else {
		toggleSidebar(null, false, bar.twin);
	}
};

this.setAutoClose = function(remove) {
	if(!remove && (prefAid.autoClose || prefAid.autoCloseTwin)) {
		listenerAid.add(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
		listenerAid.add(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
		listenerAid.add(window, 'SidebarFocused', focusContent);
		listenerAid.add(window, 'focus', autoClose, true);
		listenerAid.add(window, 'sidebarAbove', cancelAutoClose);
		listenerAid.add(window, 'sidebarDocked', cancelAutoClose);
		
		// trick to not autoclose when opening tabs in the background sidebar links
		listenerAid.add(window, 'TabOpen', cancelAutoClose);
		listenerAid.add(window, 'TabSelect', forceAutoClose);
	}
	else {
		listenerAid.remove(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
		listenerAid.remove(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
		listenerAid.remove(window, 'SidebarFocused', focusContent);
		listenerAid.remove(window, 'focus', autoClose, true);
		listenerAid.remove(window, 'sidebarAbove', cancelAutoClose);
		listenerAid.remove(window, 'sidebarDocked', cancelAutoClose);
		listenerAid.remove(window, 'TabOpen', cancelAutoClose);
		listenerAid.remove(window, 'TabSelect', forceAutoClose);
	}
};

// Autoclose feature: we can't have the sidebars open when we restart
this.dontOpenOnStartup = function() {
	if(!UNLOADED || UNLOADED == APP_SHUTDOWN) {
		if(prefAid.autoClose) {
			if(mainSidebar.box && !mainSidebar.closed) { closeHide(mainSidebar); }
		}
		if(prefAid.autoCloseTwin) {
			if(twinSidebar.box && !twinSidebar.closed) { closeHide(twinSidebar); }
		}
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('autoClose', setAutoClose);
	prefAid.listen('autoCloseTwin', setAutoClose);
	
	setAutoClose();
	
	if(STARTED == APP_STARTUP) {
		dontOpenOnStartup();
	}
	
	observerAid.add(dontOpenOnStartup, 'quit-application');
};

moduleAid.UNLOADMODULE = function() {
	observerAid.remove(dontOpenOnStartup, 'quit-application');
	
	setAutoClose(true);
	
	prefAid.unlisten('autoClose', setAutoClose);
	prefAid.unlisten('autoCloseTwin', setAutoClose);
};
