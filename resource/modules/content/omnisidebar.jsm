Modules.VERSION = '1.0.0';

this.handleFullScreen = function() {
	message('DOMFullScreen', !!document.mozFullScreenElement);
};

Modules.LOADMODULE = function() {
	Listeners.add(Scope, 'mozfullscreenchange', handleFullScreen);
	handleFullScreen();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(Scope, 'mozfullscreenchange', handleFullScreen);
};
