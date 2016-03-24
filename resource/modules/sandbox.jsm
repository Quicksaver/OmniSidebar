// VERSION 1.2.0

this.setSwitcherWidth = function() {
	var width = (WINNT) ? 3 : (DARWIN) ? 8 : 4;
	width += Prefs.switcherAdjust;

	let sscode = '\
		@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
		@-moz-document url("chrome://browser/content/browser.xul") {\n\
			.omnisidebar_switch { width: '+width+'px; }\n\
		}';

	Styles.load('switcherWidth', sscode, true);
};

this.sessionStore = {
	backstage: null,

	init: function() {
		this.backstage = Cu.import("resource:///modules/sessionstore/SessionStore.jsm");

		// We're handling the sidebar saved state ourselves, so make sure that SessionStore doesn't open the sidebar by itself,
		// if it initializes before we do the next time Firefox is started.
		Piggyback.add(objName, this.backstage.SessionStoreInternal, '_updateWindowFeatures', function(aWindow) {
			let winData = this._windows[aWindow.__SSi];
			if(winData.sidebar) {
				delete winData.sidebar;
			}
		}, Piggyback.MODE_AFTER);
	},

	uninit: function() {
		Piggyback.revert(objName, this.backstage.SessionStoreInternal, '_updateWindowFeatures');
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('switcherAdjust', setSwitcherWidth);
	setSwitcherWidth();

	sessionStore.init();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('switcherAdjust', setSwitcherWidth);
	Styles.unload('switcherWidth');

	sessionStore.uninit();
};
