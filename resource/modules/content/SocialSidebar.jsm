Modules.VERSION = '1.0.0';

this.unloadSocialBrowser = function() {
	docShell.createAboutBlankContentViewer(null);
};

Modules.LOADMODULE = function() {
	listen('unloadSocialBrowser', unloadSocialBrowser);
};

Modules.UNLOADMODULE = function() {
	unlisten('unloadSocialBrowser', unloadSocialBrowser);
};
