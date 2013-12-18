moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('disconnectFix', 'disconnect');
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('disconnectFix');
};
