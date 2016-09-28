/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.0

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });
this.__defineGetter__('StarUI', function() { return window.StarUI; });

this.bookmarkedItem = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				if(e.target.id == 'editBookmarkPanel') {
					Listeners.remove(window, 'popupshowing', this);
					Listeners.add(e.target, 'AskingForNodeOwner', this);
				}
				break;

			case 'AskingForNodeOwner':
				e.detail = 'bookmarks-menu-button';
				e.stopPropagation();
				break;
		}
	},

	onAreaNodeRegistered: function(aArea) {
		if(mainSidebar.toolbarId != aArea && twinSidebar.toolbarId != aArea) { return; }

		var placement = CustomizableUI.getPlacementOfWidget(BookmarkingUI.BOOKMARK_BUTTON_ID);
		if(!placement || placement.area != aArea) { return; }

		this.waitToLoad(aArea);
	},

	waitToLoad: function(aArea) {
		if(!$(aArea)) {
			Timers.init('bookmarkedItemWaitToLoad', () => {
				if(typeof(bookmarkedItem) == 'undefined') { return; }

				this.waitToLoad(aArea);
			}, 250);
			return;
		}

		BookmarkingUI._onWidgetWasMoved();
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(bookmarkedItem);

	// the editBookmarkPanel is only created when first called
	if($('editBookmarkPanel')) {
		Listeners.add($('editBookmarkPanel'), 'AskingForNodeOwner', bookmarkedItem);
	} else {
		Listeners.add(window, 'popupshowing', bookmarkedItem);
	}

	Piggyback.add('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification', function() {
		// the sidebar should already be opened for this (it's a click on the button), so we don't need to delay or pause this notification,
		// we only need to make sure the toolbar doesn't hide until the animation is finished
		for(let bar of sidebars) {
			if(isAncestor($('bookmarks-menu-button'), bar.box)) {
				autoHide.initialShow(bar, 1500);
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
		for(let bar of sidebars) {
			if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }

			if(isAncestor(aAnchorElement, bar.box) && !trueAttribute(bar.resizeBox, 'hover') && !$$('#'+bar.box.id+':hover')[0]) {
				// re-command the panel to open when the chrome finishes expanding
				var starUIListener = function() {
					bar._autohide.remove(starUIListener);

					// unfortunately this won't happen inside popupsFinishedVisible in this case
					if(bar.resizeBox.hovers === 1 && $$('#'+bar.box.id+':hover')[0]) {
						autoHide.setHover(bar, true);
					}

					// get the anchor reference again, in case the previous node was lost
					StarUI._doShowEditBookmarkPanel(aItemId, BookmarkingUI.anchor, aPosition);
				};
				bar._autohide.add(starUIListener);

				// expand the chrome
				autoHide.initialShow(bar, 1000);

				return false;
			}
		}

		return true;
	}, Piggyback.MODE_BEFORE);
};

Modules.UNLOADMODULE = function() {
	Piggyback.revert('bookmarkedItem', BookmarkingUI, '_showBookmarkedNotification');
	Piggyback.revert('bookmarkedItem', StarUI, '_doShowEditBookmarkPanel');

	Listeners.remove($('editBookmarkPanel'), 'AskingForNodeOwner', bookmarkedItem);
	Listeners.remove(window, 'popupshowing', bookmarkedItem);

	CustomizableUI.removeListener(bookmarkedItem);
};
