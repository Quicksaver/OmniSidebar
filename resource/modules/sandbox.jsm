moduleAid.VERSION = '1.0.0';

this.setSwitcherWidth = function() {
	var width = (Services.appinfo.OS == 'WINNT') ? 3 : (Services.appinfo.OS == 'Darwin') ? 8 : 4;
	width += prefAid.switcherAdjust;
	
	styleAid.unload('switcherWidth');
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	sscode += '	.omnisidebar_switch { width: '+width+'px; }\n';
	sscode += '}';
	
	styleAid.load('switcherWidth', sscode, true);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('switcherAdjust', setSwitcherWidth);
	setSwitcherWidth();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('switcherAdjust', setSwitcherWidth);
	styleAid.unload('switcherWidth');
};
