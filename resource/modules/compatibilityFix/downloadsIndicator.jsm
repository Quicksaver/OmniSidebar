Modules.VERSION = '1.0.0';

this.__defineGetter__('DownloadsIndicatorView', function() { return window.DownloadsIndicatorView; });
this.__defineGetter__('DownloadsCommon', function() { return window.DownloadsCommon; });

this.reDoDownloadsNotifications = null;

this.downloadsFinishedWidth = function() {
	if(reDoDownloadsNotifications) {
		DownloadsIndicatorView._showEventNotification(reDoDownloadsNotifications);
		reDoDownloadsNotifications = null;
	}
};

this.setupHoldDownloadsPanel = function(e) {
	if(e.target.id == 'downloadsPanel') {
		Listeners.remove(window, 'popupshowing', setupHoldDownloadsPanel);
		Listeners.add(e.target, 'AskingForNodeOwner', holdDownloadsPanel);
	}
};

this.holdDownloadsPanel = function(e) {
	e.detail = 'downloads-button';
	e.stopPropagation();
};

Modules.LOADMODULE = function() {
	Piggyback.add('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification', function(aType) {
		// we're already opening to animate, so don't animate again, just replace the previous animation type
		if(reDoDownloadsNotifications) {
			reDoDownloadsNotifications = aType;
			return false;
		}
		
		// only pause animation if the button is in our toolbars
		for(var b in sidebars) {
			if(!sidebars[b].resizeBox || sidebars[b].closed || !sidebars[b].above || !sidebars[b].autoHide) { continue; }
			
			if(this._initialized && DownloadsCommon.animateNotifications && isAncestor($('downloads-button'), sidebars[b])) {
				// if toolbar is hidden, pause until it is shown
				if(!trueAttribute(sidebars[b].resizeBox, 'hover') && !$$('#'+sidebars[b].box.id+':hover')[0]) {
					reDoDownloadsNotifications = aType;
					initialShowBar(sidebars[b], 1500);
					return false;
				}
				
				// toolbar is not hidden, so keep showing it until animation is done at least
				initialShowBar(sidebars[b], 1500);
			}
		}
		
		return true;
	}, Piggyback.MODE_BEFORE);
	
	// the downloadsPanel is only created when first called
	if($('downloadsPanel')) {
		Listeners.add($('downloadsPanel'), 'AskingForNodeOwner', holdDownloadsPanel);
	} else {
		Listeners.add(window, 'popupshowing', setupHoldDownloadsPanel);
	}
	
	Listeners.add(window, 'FinishedSlimChromeWidth', downloadsFinishedWidth);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'FinishedSlimChromeWidth', downloadsFinishedWidth);
	Listeners.remove($('downloadsPanel'), 'AskingForNodeOwner', holdDownloadsPanel);
	Listeners.remove(window, 'popupshowing', setupHoldDownloadsPanel);
	
	Piggyback.revert('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification');
};
