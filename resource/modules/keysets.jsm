moduleAid.VERSION = '1.0.3';

this.mainKey = {
	id: objName+'-key_mainSidebar',
	command: objName+'-cmd_keyset_mainSidebar',
	get keycode () { return prefAid.mainKeysetKeycode; },
	get accel () { return prefAid.mainKeysetAccel; },
	get shift () { return prefAid.mainKeysetShift; },
	get alt () { return prefAid.mainKeysetAlt; }
};

this.twinKey = {
	id: objName+'-key_twinSidebar',
	command: objName+'-cmd_keyset_twinSidebar',
	get keycode () { return prefAid.twinKeysetKeycode; },
	get accel () { return prefAid.twinKeysetAccel; },
	get shift () { return prefAid.twinKeysetShift; },
	get alt () { return prefAid.twinKeysetAlt; }
};

this.setKeys = function() {
	if(mainKey.keycode != 'none') { keysetAid.register(mainKey); }
	else { keysetAid.unregister(mainKey); }
	if(prefAid.twinSidebar && twinKey.keycode != 'none') { keysetAid.register(twinKey); }
	else { keysetAid.unregister(twinKey); }
};

moduleAid.LOADMODULE = function() {
	setKeys();
	
	prefAid.listen('mainKeysetKeycode', setKeys);
	prefAid.listen('mainKeysetAccel', setKeys);
	prefAid.listen('mainKeysetShift', setKeys);
	prefAid.listen('mainKeysetAlt', setKeys);
	prefAid.listen('twinKeysetKeycode', setKeys);
	prefAid.listen('twinKeysetAccel', setKeys);
	prefAid.listen('twinKeysetShift', setKeys);
	prefAid.listen('twinKeysetAlt', setKeys);
	prefAid.listen('twinSidebar', setKeys);
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('mainKeysetKeycode', setKeys);
	prefAid.unlisten('mainKeysetAccel', setKeys);
	prefAid.unlisten('mainKeysetShift', setKeys);
	prefAid.unlisten('mainKeysetAlt', setKeys);
	prefAid.unlisten('twinKeysetKeycode', setKeys);
	prefAid.unlisten('twinKeysetAccel', setKeys);
	prefAid.unlisten('twinKeysetShift', setKeys);
	prefAid.unlisten('twinKeysetAlt', setKeys);
	prefAid.unlisten('twinSidebar', setKeys);
	
	keysetAid.unregister(mainKey);
	keysetAid.unregister(twinKey);
};
