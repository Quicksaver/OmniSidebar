moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('MX3', 'mx3');
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('MX3');
};
