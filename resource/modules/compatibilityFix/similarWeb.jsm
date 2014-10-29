Modules.VERSION = '1.1.0';

// SimilarWeb is the most aweful add-on I've seen in terms of controlling the sidebar and imposing itself on the browser layout... it's just aweful.
// Why it even resizes the sidebar on startup is beyond comprehension!

this.__defineGetter__('similarweb', function() { return window.similarweb; });

this.swToggleSidebar = function(e) {
	hideIt(mainSidebar.splitter, (!mainSidebar.box.hidden && !Prefs.renderabove));
	aSync(function() { try { toggleHeaders(); } catch(ex) {} });
};

// SimilarWeb add-on: Do not auto-hide if the 'add site' dialog is opened
this.swPopupShowing = function() {
	if(mainSidebar.box
	&& !mainSidebar.box.hidden
	&& mainSidebar.box.getAttribute('sidebarcommand') == 'viewSimilarWebSidebar'
	&& mainSidebar.above
	&& mainSidebar.autoHide) {
		setHover(mainSidebar, true);
	}
	else if(twinSidebar.box
	&& !twinSidebar.box.hidden
	&& twinSidebar.box.getAttribute('sidebarcommand') == 'viewSimilarWebSidebar'
	&& twinSidebar.above
	&& twinSidebar.autoHide) {
		setHover(twinSidebar, true);
	}
};

this.swPopupHiding = function() {
	try { setBothHovers(false); } catch(ex) {}
};

// even though I already replace the resizing methods in similarweb, 
// it still screws up the sidebar size sometimes when starting up so I'm hoping this fixes everything
this.swWatchWidth = function() {
	similarweb.general.prefManager.setIntPref(similarweb.consts.PREF_SIDEBAR_WIDTH, mainSidebar.width);
	similarweb.general.prefManager.setCharPref(similarweb.consts.PREF_PREV_WIDTH, mainSidebar.width.toString());
};

this.swCloseSidebarListen = function(e) {
	if(e.detail.bar.box.getAttribute('sidebarcommand') == 'viewSimilarWebSidebar' && isAncestor(e.detail.focusedNode, $('boxSimilarWebFloatingPanels'))) {
		e.preventDefault();
	}
};

Modules.LOADMODULE = function() {
	Styles.load('similarwebFix', 'similarweb');
	
	prefAid.setDefaults({ prevWidth: '8' }, 'similarweb');
	
	// Bugfix: incompatibility with the SimilarWeb add-on, it has its own sidebar handling mechanism which I have to override
	// I'm trying a radical approach, substituting all SimilarWeb functions related only to this subject with dummy functions, it doesn't break add-on functionality
	Piggyback.add('similarWeb', similarweb.overlay, 'checkRtlBrowser', function() {
		similarweb.overlay.strDirection = 'ltr';
		window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); 
	});
	Piggyback.add('similarWeb', similarweb.overlay, 'initSidebarAppearance', function() { similarweb.overlay.m_blnSidebarInitialized = true; });
	Piggyback.add('similarWeb', similarweb.overlay, 'moveToLeft', function() { window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); });
	Piggyback.add('similarWeb', similarweb.overlay, 'moveToRight', function() { window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); });
	Piggyback.add('similarWeb', similarweb.sidebar, 'undoSidebarAppearance', function() {});
	Piggyback.add('similarWeb', similarweb.sidebar, 'setSidebarWidth', function() {});
	
	Listeners.add(window, 'endToggleSidebar', swToggleSidebar);
	Listeners.add(mainSidebar.box, 'sidebarWidthChanged', swWatchWidth);
	
	// Do not auto-hide if the 'add site' dialog is opened
	Listeners.add($('pnlSimilarWebAddSite'), 'popupshowing', swPopupShowing);
	Listeners.add($('pnlSimilarWebAddSite'), 'popuphiding', swPopupHiding);
	Listeners.add($('pnlSimilarWebThankYou'), 'popupshowing', swPopupShowing);
	Listeners.add($('pnlSimilarWebThankYou'), 'popuphiding', swPopupHiding);
	
	Listeners.add(window, 'willCloseSidebar', swCloseSidebarListen, true);
	
	// Try to fix the damage already done
	$('browser').style.direction = '';
	$('appcontent').style.direction = '';
	
	mainSidebar.sidebar.style.maxWidth = '';
	mainSidebar.sidebar.style.minWidth = Prefs.minSidebarWidth+'px';
	mainSidebar.sidebar.style.overflowX = '';
	mainSidebar.sidebar.style.width = '';
	mainSidebar.box.style.maxWidth = '';
	mainSidebar.box.style.minWidth = '';
	mainSidebar.box.style.overflowX = '';
	mainSidebar.box.style.width = '';
	mainSidebar.box.style.borderLeft = '';
	mainSidebar.box.style.borderRight = '';
	
	hideIt(mainSidebar.splitter, (!mainSidebar.box.hidden && !Prefs.renderabove));
	try { toggleHeaders(); } catch(ex) {}
	
	if(Prefs.prevWidth > Prefs.minSidebarWidth) {
		mainSidebar.box.setAttribute('width', Prefs.prevWidth);
	}
};

Modules.UNLOADMODULE = function() {
	Listeners.remove($('pnlSimilarWebAddSite'), 'popupshowing', swPopupShowing);
	Listeners.remove($('pnlSimilarWebAddSite'), 'popuphiding', swPopupHiding);
	Listeners.remove($('pnlSimilarWebThankYou'), 'popupshowing', swPopupShowing);
	Listeners.remove($('pnlSimilarWebThankYou'), 'popuphiding', swPopupHiding);
	Listeners.remove(window, 'willCloseSidebar', swCloseSidebarListen, true);
	Listeners.remove(window, 'endToggleSidebar', swToggleSidebar);
	Listeners.remove(mainSidebar.box, 'sidebarWidthChanged', swWatchWidth);
	
	Piggyback.revert('similarWeb', similarweb.overlay, 'checkRtlBrowser');
	Piggyback.revert('similarWeb', similarweb.overlay, 'initSidebarAppearance');
	Piggyback.revert('similarWeb', similarweb.overlay, 'moveToLeft');
	Piggyback.revert('similarWeb', similarweb.overlay, 'moveToRight');
	Piggyback.revert('similarWeb', similarweb.sidebar, 'undoSidebarAppearance');
	Piggyback.revert('similarWeb', similarweb.sidebar, 'setSidebarWidth');
	
	if(UNLOADED) {
		Styles.unload('similarwebFix', 'similarweb');
	}
};
