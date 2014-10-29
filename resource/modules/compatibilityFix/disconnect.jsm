Modules.VERSION = '1.1.0';

Modules.LOADMODULE = function() {
	Styles.load('disconnectFix', 'disconnect');
};

Modules.UNLOADMODULE = function() {
	Styles.unload('disconnectFix');
};
