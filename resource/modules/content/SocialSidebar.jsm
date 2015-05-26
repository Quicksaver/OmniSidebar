Modules.VERSION = '1.0.1';

this.unloadSocialBrowser = function() {
	if(docShell) {
		docShell.createAboutBlankContentViewer(null);
	}
};

Modules.LOADMODULE = function() {
	listen('unloadSocialBrowser', unloadSocialBrowser);
};

Modules.UNLOADMODULE = function() {
	unlisten('unloadSocialBrowser', unloadSocialBrowser);
};
