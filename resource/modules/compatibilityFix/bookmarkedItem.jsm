Modules.VERSION = '1.0.0';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });

this.bookmarkedItemWaitToLoad = function(aArea) {
	if(!$(aArea)) {
		Timers.init('bookmarkedItemWaitToLoad', function() {
			if(typeof(bookmarkedItemWaitToLoad) == 'undefined') { return; }
			
			bookmarkedItemWaitToLoad(aArea);
		}, 250);
		return;
	}
	
	BookmarkingUI._onWidgetWasMoved();
};

this.bookmarkedItemListener = {
	onAreaNodeRegistered: function(aArea) {
		if(mainSidebar.toolbarId != aArea && twinSidebar.toolbarId != aArea) { return; }
		
		var placement = CustomizableUI.getPlacementOfWidget(BookmarkingUI.BOOKMARK_BUTTON_ID);
		if(!placement || placement.area != aArea) { return; }
		
		bookmarkedItemWaitToLoad(aArea);
	}
};

this.setupHoldBookmarkPanel = function(e) {
	if(e.target.id == 'editBookmarkPanel') {
		Listeners.remove(window, 'popupshowing', setupHoldBookmarkPanel);
		Listeners.add(e.target, 'AskingForNodeOwner', holdBookmarkPanel);
	}
};

this.holdBookmarkPanel = function(e) {
	e.detail = 'bookmarks-menu-button';
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(bookmarkedItemListener);
	
	// the editBookmarkPanel is only created when first called
	if($('editBookmarkPanel')) {
		Listeners.add($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	} else {
		Listeners.add(window, 'popupshowing', setupHoldBookmarkPanel);
	}
	
	Piggyback.add('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification', function() {
		// the sidebar should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the toolbar doesn't hide until the animation is finished
		for(var b in sidebars) {
			if(isAncestor($('bookmarks-menu-button'), sidebars[b].box)) {
				initialShowBar(sidebars[b], 1500);
				break;
			}
		}
		return true;
	}, Piggyback.MODE_BEFORE);
	
	// To prevent an issue with the BookarkedItem popup appearing below the browser window, because its anchor is destroyed between the time the popup is opened
	// and the time the chrome expands from mini to full (because the anchor is an anonymous node? I have no idea...), we catch this before the popup is opened, and
	// only continue with the operation after the chrome has expanded.
	// We do the same for when the anchor is the identity box, as in Mac OS X the bookmarked item panel would open outside of the window (no clue why though...)
	Piggyback.add('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel', function(aItemId, aAnchorElement, aPosition) {
		// in case the panel will be attached to the star button, check to see if it's placed in our toolbars
		for(var b in sidebars) {
			if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
			
			if(isAncestor(aAnchorElement, sidebars[b].box) && !trueAttribute(sidebars[b].resizeBox, 'hover') && !$$('#'+sidebars[b].box.id+':hover')[0]) {
				// re-command the panel to open when the chrome finishes expanding
				var starUIListener = function() {
					sidebars[b]._transition.remove(starUIListener);
					
					// unfortunately this won't happen inside popupsFinishedVisible in this case
					if(sidebars[b].resizeBox.hovers === 1 && $$('#'+sidebars[b].box.id+':hover')[0]) {
						setHover(sidebars[b], true);
					}
					
					// get the anchor reference again, in case the previous node was lost
					StarUI._doShowEditBookmarkPanel(aItemId, BookmarkingUI.anchor, aPosition);
				};
				sidebars[b]._transition.add(starUIListener);
				
				// expand the chrome
				initialShowBar(sidebars[b], 1000);
				
				return false;
			}
		}
		
		return true;
	}, Piggyback.MODE_BEFORE);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification');
	Piggyback.revert('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel');
	
	Listeners.remove($('editBookmarkPanel'), 'AskingForNodeOwner', holdBookmarkPanel);
	Listeners.remove(window, 'popupshowing', setupHoldBookmarkPanel);
	
	CustomizableUI.removeListener(bookmarkedItemListener);
};
