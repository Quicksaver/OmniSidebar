moduleAid.VERSION = '1.0.0';

// SimilarWeb is the most aweful add-on I've seen in terms of controlling the sidebar and imposing itself on the browser layout... it's just aweful.
// Why it even resizes the sidebar on startup is beyond comprehension!

this.__defineGetter__('similarweb', function() { return window.similarweb; });

this.swToggleSidebar = function(e) {
	hideIt(mainSidebar.splitter, (!mainSidebar.box.hidden && !prefAid.renderabove));
	aSync(function() { try { toggleHeaders(); } catch(ex) {} });
};

// SimilarWeb add-on: Do not auto-hide if the 'add site' dialog is opened
this.swPopupShowing = function() {
	if(mainSidebar.box
	&& !mainSidebar.box.hidden
	&& mainSidebar.box.getAttribute('sidebarcommand') == 'viewSimilarWebSidebar'
	&& mainSidebar.above
	&& mainSidebar.undockMode == 'autohide') {
		setHover(mainSidebar, true);
	}
	else if(twinSidebar.box
	&& !twinSidebar.box.hidden
	&& twinSidebar.box.getAttribute('sidebarcommand') == 'viewSimilarWebSidebar'
	&& twinSidebar.above
	&& twinSidebar.undockMode == 'autohide') {
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

moduleAid.LOADMODULE = function() {
	styleAid.load('similarwebFix', 'similarweb');
	
	this.backups = {
		checkRtlBrowser: similarweb.overlay.checkRtlBrowser,
		initSidebarAppearance: similarweb.overlay.initSidebarAppearance,
		moveToLeft: similarweb.overlay.moveToLeft,
		moveToRight: similarweb.overlay.moveToRight,
		undoSidebarAppearance: similarweb.sidebar.undoSidebarAppearance,
		setSidebarWidth: similarweb.sidebar.setSidebarWidth
	};
	
	prefAid.setDefaults({ prevWidth: '8' }, 'similarweb');
	
	// Bugfix: incompatibility with the SimilarWeb add-on, it has its own sidebar handling mechanism which I have to override
	// I'm trying a radical approach, substituting all SimilarWeb functions related only to this subject with dummy functions, it doesn't break add-on functionality
	similarweb.overlay.checkRtlBrowser = function() {
		similarweb.overlay.strDirection = 'ltr';
		window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); 
	};
	similarweb.overlay.initSidebarAppearance = function() { similarweb.overlay.m_blnSidebarInitialized = true; };
	similarweb.overlay.moveToLeft = function() { window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); };
	similarweb.overlay.moveToRight = function() { window.top.document.getElementById("main-window").setAttribute("sw_dir", "ltr"); };
	similarweb.sidebar.undoSidebarAppearance = function() {};
	similarweb.sidebar.setSidebarWidth = function() {};
	
	listenerAid.add(window, 'endToggleSidebar', swToggleSidebar);
	listenerAid.add(mainSidebar.box, 'sidebarWidthChanged', swWatchWidth);
	
	// Do not auto-hide if the 'add site' dialog is opened
	listenerAid.add($('pnlSimilarWebAddSite'), 'popupshowing', swPopupShowing);
	listenerAid.add($('pnlSimilarWebAddSite'), 'popuphiding', swPopupHiding);
	listenerAid.add($('pnlSimilarWebThankYou'), 'popupshowing', swPopupShowing);
	listenerAid.add($('pnlSimilarWebThankYou'), 'popuphiding', swPopupHiding);
	
	listenerAid.add(window, 'willCloseSidebar', swCloseSidebarListen, true);
	
	// Try to fix the damage already done
	$('browser').style.direction = '';
	$('appcontent').style.direction = '';
	
	mainSidebar.sidebar.style.maxWidth = '';
	mainSidebar.sidebar.style.minWidth = prefAid.minSidebarWidth+'px';
	mainSidebar.sidebar.style.overflowX = '';
	mainSidebar.sidebar.style.width = '';
	mainSidebar.box.style.maxWidth = '';
	mainSidebar.box.style.minWidth = '';
	mainSidebar.box.style.overflowX = '';
	mainSidebar.box.style.width = '';
	mainSidebar.box.style.borderLeft = '';
	mainSidebar.box.style.borderRight = '';
	
	hideIt(mainSidebar.splitter, (!mainSidebar.box.hidden && !prefAid.renderabove));
	try { toggleHeaders(); } catch(ex) {}
	
	if(prefAid.prevWidth > prefAid.minSidebarWidth) {
		mainSidebar.box.setAttribute('width', prefAid.prevWidth);
	}
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove($('pnlSimilarWebAddSite'), 'popupshowing', swPopupShowing);
	listenerAid.remove($('pnlSimilarWebAddSite'), 'popuphiding', swPopupHiding);
	listenerAid.remove($('pnlSimilarWebThankYou'), 'popupshowing', swPopupShowing);
	listenerAid.remove($('pnlSimilarWebThankYou'), 'popuphiding', swPopupHiding);
	
	listenerAid.remove(window, 'willCloseSidebar', swCloseSidebarListen, true);
	
	listenerAid.remove(window, 'endToggleSidebar', swToggleSidebar);
	listenerAid.remove(mainSidebar.box, 'sidebarWidthChanged', swWatchWidth);
	
	if(this.backups) {
		similarweb.overlay.checkRtlBrowser = this.backups.checkRtlBrowser;
		similarweb.overlay.initSidebarAppearance = this.backups.initSidebarAppearance;
		similarweb.overlay.moveToLeft = this.backups.moveToLeft;
		similarweb.overlay.moveToRight = this.backups.moveToRight;
		similarweb.sidebar.undoSidebarAppearance = this.backups.undoSidebarAppearance;
		similarweb.sidebar.setSidebarWidth = this.backups.setSidebarWidth;
		delete this.backups;
	}
	
	if(UNLOADED) {
		styleAid.unload('similarwebFix', 'similarweb');
	}
};
