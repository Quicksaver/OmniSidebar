// VERSION 1.1.2

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

Modules.LOADMODULE = function() {
	Prefs.listen('switcherAdjust', setSwitcherWidth);
	setSwitcherWidth();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('switcherAdjust', setSwitcherWidth);
	Styles.unload('switcherWidth');
};
