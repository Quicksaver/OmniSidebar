Modules.VERSION = '1.1.0';

this.setSwitcherWidth = function() {
	var width = (WINNT) ? 3 : (DARWIN) ? 8 : 4;
	width += Prefs.switcherAdjust;
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	sscode += '	.omnisidebar_switch { width: '+width+'px; }\n';
	sscode += '}';
	
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
