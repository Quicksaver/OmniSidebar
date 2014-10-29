Modules.VERSION = '1.1.0';

this.__defineGetter__('bookmarksBroadcaster', function() { return $('viewBookmarksSidebar'); });

this.bookmarksLabel = null;

Modules.LOADMODULE = function() {
	Overlays.overlayWindow(window, 'australis',
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
			setAttribute(bookmarksBroadcaster, 'label', bookmarksLabel);
			removeAttribute(bookmarksBroadcaster, 'sidebartitle');
			
			removeAttribute(mainSidebar.button, 'loaded');
			removeAttribute(twinSidebar.button, 'loaded');
		}
	);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'australis');
};
