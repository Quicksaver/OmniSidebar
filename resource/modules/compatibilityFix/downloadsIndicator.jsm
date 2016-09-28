/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.0

this.__defineGetter__('DownloadsIndicatorView', function() { return window.DownloadsIndicatorView; });
this.__defineGetter__('DownloadsCommon', function() { return window.DownloadsCommon; });

this.downloadsIndicator = {
	notification: null,

	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				if(e.target.id == 'downloadsPanel') {
					Listeners.remove(window, 'popupshowing', this);
					Listeners.add(e.target, 'AskingForNodeOwner', this);
				}
				break;

			case 'AskingForNodeOwner':
				e.detail = 'downloads-button';
				e.stopPropagation();
				break;

			case 'transitionend':
				if(this.notification) {
					DownloadsIndicatorView._showEventNotification(this.notification);
					this.notification = null;
				}
				break;
		}
	},

	init: function() {
		Piggyback.add('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification', (aType) => {
			// we're already opening to animate, so don't animate again, just replace the previous animation type
			if(this.notification) {
				this.notification = aType;
				return false;
			}

			// only pause animation if the button is in our toolbars
			for(let bar of sidebars) {
				if(!bar.resizeBox || bar.closed || !bar.above || !bar.autoHide) { continue; }

				if(DownloadsIndicatorView._initialized && DownloadsCommon.animateNotifications
				&& isAncestor($('downloads-button'), bar.resizeBox)) {
					// if toolbar is hidden, pause until it is shown
					if(!trueAttribute(bar.resizeBox, 'hover') && !$$('#'+bar.box.id+':hover')[0]) {
						var selfRemove = (e) => {
							bar._autohide.remove(selfRemove);
							this.handleEvent(e);
						};
						bar._autohide.add(selfRemove);

						this.notification = aType;
						autoHide.initialShow(bar, 1500);
						return false;
					}

					// toolbar is not hidden, so keep showing it until animation is done at least
					autoHide.initialShow(bar, 1500);

					break;
				}
			}

			return true;
		}, Piggyback.MODE_BEFORE);

		// the downloadsPanel is only created when first called
		if($('downloadsPanel')) {
			Listeners.add($('downloadsPanel'), 'AskingForNodeOwner', this);
		} else {
			Listeners.add(window, 'popupshowing', this);
		}
	},

	uninit: function() {
		Listeners.remove($('downloadsPanel'), 'AskingForNodeOwner', this);
		Listeners.remove(window, 'popupshowing', this);

		Piggyback.revert('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification');
	}
};

Modules.LOADMODULE = function() {
	downloadsIndicator.init();
};

Modules.UNLOADMODULE = function() {
	downloadsIndicator.uninit();
};
