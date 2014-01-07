moduleAid.VERSION = '1.0.0';

this.__defineGetter__('bookmarksBroadcaster', function() { return $('viewBookmarksSidebar'); });

this.bookmarksLabel = null;

moduleAid.LOADMODULE = function() {
	setAttribute(document.documentElement, objName+'_Australis', 'true');
	overlayAid.overlayWindow(window, 'buttons', null, null, function() {
		removeAttribute(mainSidebar.button, 'loaded');
		removeAttribute(twinSidebar.button, 'loaded');
	});
	overlayAid.overlayWindow(window, 'australis',
		function() {
			// We want our button to keep its label, as it's different from the broadcaster's label
			bookmarksLabel = bookmarksBroadcaster.getAttribute('label');
			removeAttribute(bookmarksBroadcaster, 'label');
			setAttribute(bookmarksBroadcaster, 'sidebartitle', bookmarksLabel);
			
			var observers = document.getElementsByAttribute('observes', 'viewBookmarksSidebar');
			for(var o=0; o<observers.length; o++) {
				setAttribute(observers[o], 'label', bookmarksLabel);
			}
		},
		null,
		function() {
			setAttribute(bookmarksBroadcaster, bookmarksLabel);
			removeAttribute(bookmarksBroadcaster, 'sidebartitle');
		}
	);
};

moduleAid.UNLOADMODULE = function() {
	removeAttribute(document.documentElement, objName+'_Australis');
	overlayAid.removeOverlayWindow(window, 'australis');
	overlayAid.removeOverlayWindow(window, 'buttons');
};
