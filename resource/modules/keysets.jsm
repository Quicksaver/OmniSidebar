// VERSION 1.1.0

this.mainKey = {
	id: objName+'-key_mainSidebar',
	command: objName+'-cmd_keyset_mainSidebar',
	get keycode () { return Prefs.mainKeysetKeycode; },
	get accel () { return Prefs.mainKeysetAccel; },
	get shift () { return Prefs.mainKeysetShift; },
	get alt () { return Prefs.mainKeysetAlt; }
};

this.twinKey = {
	id: objName+'-key_twinSidebar',
	command: objName+'-cmd_keyset_twinSidebar',
	get keycode () { return Prefs.twinKeysetKeycode; },
	get accel () { return Prefs.twinKeysetAccel; },
	get shift () { return Prefs.twinKeysetShift; },
	get alt () { return Prefs.twinKeysetAlt; }
};

this.setKeys = function() {
	if(mainKey.keycode != 'none') { Keysets.register(mainKey); }
	else { Keysets.unregister(mainKey); }
	if(Prefs.twinSidebar && twinKey.keycode != 'none') { Keysets.register(twinKey); }
	else { Keysets.unregister(twinKey); }
};

Modules.LOADMODULE = function() {
	setKeys();

	Prefs.listen('mainKeysetKeycode', setKeys);
	Prefs.listen('mainKeysetAccel', setKeys);
	Prefs.listen('mainKeysetShift', setKeys);
	Prefs.listen('mainKeysetAlt', setKeys);
	Prefs.listen('twinKeysetKeycode', setKeys);
	Prefs.listen('twinKeysetAccel', setKeys);
	Prefs.listen('twinKeysetShift', setKeys);
	Prefs.listen('twinKeysetAlt', setKeys);
	Prefs.listen('twinSidebar', setKeys);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('mainKeysetKeycode', setKeys);
	Prefs.unlisten('mainKeysetAccel', setKeys);
	Prefs.unlisten('mainKeysetShift', setKeys);
	Prefs.unlisten('mainKeysetAlt', setKeys);
	Prefs.unlisten('twinKeysetKeycode', setKeys);
	Prefs.unlisten('twinKeysetAccel', setKeys);
	Prefs.unlisten('twinKeysetShift', setKeys);
	Prefs.unlisten('twinKeysetAlt', setKeys);
	Prefs.unlisten('twinSidebar', setKeys);

	Keysets.unregister(mainKey);
	Keysets.unregister(twinKey);
};
