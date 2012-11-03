moduleAid.VERSION = '1.0.0';

// stops closing the sidebar when quickly toggling between sidebars in auto-close mode
this.autoCloseBeginToggleSidebar = function(e) {
	if(timerAid['toggleSidebar'+(e.detail.bar.twin ? 'Twin' : '')]) {
		e.preventDefault();
	}
};

this.autoCloseEndToggleSidebar = function(e) {
	var bar = e.detail.bar;
	
	if(bar.above && bar.undockMode == 'autoclose') {
		timerAid.init('toggleSidebar'+(bar.twin ? 'Twin' : ''), function() {}, 100);
	}
};

this.focusContent = function(e) {
	var bar = e.detail.bar;
	
	// For the autoclose feature, we need to focus the sidebar on open or it won't be focused
	if(bar.above && bar.undockMode == 'autoclose') {
		if(bar.sidebar.contentDocument && bar.sidebar.contentDocument.documentElement) {
			bar.sidebar.contentDocument.documentElement.focus();
		} else {
			bar.sidebar.focus();
		}
	}
};

this.autoClose = function(e) {
	timerAid.init('autoClose', function() {
		var focusedNode = document.commandDispatcher.focusedElement || e.target;
		
		if(mainSidebar.box && !mainSidebar.box.hidden && prefAid.renderabove && prefAid.undockMode == 'autoclose') {
			if(!isAncestor(focusedNode, mainSidebar.box)
			&& dispatch(mainSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: mainSidebar, focusedNode: focusedNode } })) {
				listenerAid.add(mainSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				toggleSidebar();
			}
		}
		
		if(twinSidebar.box && !twinSidebar.box.hidden && prefAid.renderaboveTwin && prefAid.undockModeTwin == 'autoclose') {
			if(!isAncestor(focusedNode, twinSidebar.box)
			&& dispatch(twinSidebar.sidebar, { type: 'willCloseSidebar', detail: { bar: twinSidebar, focusedNode: focusedNode } })) {
				listenerAid.add(twinSidebar.sidebar, 'closedSidebar', function(e) { e.preventDefault(); }, true, true); // keep current focus
				toggleSidebar(null, false, true);
			}
		}
	}, 100);
};

this.setAutoClose = function(remove) {
	if(!remove
	&& (	(prefAid.renderabove && prefAid.undockMode == 'autoclose')
		|| (prefAid.renderaboveTwin && prefAid.undockModeTwin == 'autoclose'))) {
			listenerAid.add(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
			listenerAid.add(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
			listenerAid.add(window, 'SidebarFocused', focusContent);
			listenerAid.add(window, 'focus', autoClose, true);
	}
	else {
			listenerAid.remove(window, 'beginToggleSidebar', autoCloseBeginToggleSidebar, true);
			listenerAid.remove(window, 'endToggleSidebar', autoCloseEndToggleSidebar);
			listenerAid.remove(window, 'SidebarFocused', focusContent);
			listenerAid.remove(window, 'focus', autoClose, true);
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('renderabove', setAutoClose);
	prefAid.listen('renderaboveTwin', setAutoClose);
	prefAid.listen('undockMode', setAutoClose);
	prefAid.listen('undockModeTwin', setAutoClose);
	
	setAutoClose();
	
	// Autoclose feature: we can't have the sidebars open when we restart
	if(STARTED == APP_STARTUP) {
		if(mainSidebar.box && !mainSidebar.box.hidden && prefAid.renderabove && prefAid.undockMode == 'autoclose') {
			toggleSidebar();
		}
		if(twinSidebar.box && !twinSidebar.box.hidden && prefAid.renderaboveTwin && prefAid.undockModeTwin == 'autoclose') {
			toggleSidebar(null, false, true);
		}
	}
};

moduleAid.UNLOADMODULE = function() {
	setAutoClose(true);
	
	prefAid.unlisten('renderabove', setAutoClose);
	prefAid.unlisten('renderaboveTwin', setAutoClose);
	prefAid.unlisten('undockMode', setAutoClose);
	prefAid.unlisten('undockModeTwin', setAutoClose);
	
	if(UNLOADED == APP_SHUTDOWN) {
		// Autoclose feature: we can't have the sidebars open when we restart
		if(mainSidebar.box && !mainSidebar.box.hidden && prefAid.renderabove && prefAid.undockMode == 'autoclose') { toggleSidebar(); }
		if(twinSidebar.box && !twinSidebar.box.hidden && prefAid.renderaboveTwin && prefAid.undockModeTwin == 'autoclose') { toggleSidebar(null, false, true); }
	}
};
