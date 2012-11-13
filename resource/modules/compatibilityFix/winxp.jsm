moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('winxpSheet', 'winxp');
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('winxp');
};
