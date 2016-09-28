/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.1

this.mainKey = {
	id: objName+'-key_mainSidebar',
	command: objName+'-cmd_keyset_mainSidebar',
	get keycode () { return Prefs.mainKeysetKeycode; },
	get accel () { return Prefs.mainKeysetAccel; },
	get shift () { return Prefs.mainKeysetShift; },
	get alt () { return Prefs.mainKeysetAlt; },
	get ctrl () { return Prefs.mainKeysetCtrl; }
};

this.twinKey = {
	id: objName+'-key_twinSidebar',
	command: objName+'-cmd_keyset_twinSidebar',
	get keycode () { return Prefs.twinKeysetKeycode; },
	get accel () { return Prefs.twinKeysetAccel; },
	get shift () { return Prefs.twinKeysetShift; },
	get alt () { return Prefs.twinKeysetAlt; },
	get ctrl () { return Prefs.twinKeysetCtrl; }
};

this.setKeys = function() {
	if(mainKey.keycode != 'none') { Keysets.register(mainKey); }
	else { Keysets.unregister(mainKey); }
	if(Prefs.twinSidebar && twinKey.keycode != 'none') { Keysets.register(twinKey); }
	else { Keysets.unregister(twinKey); }
};

Modules.LOADMODULE = function() {
	// this is to migrate to the new Keysets object, it can probably be removed once most users have updated to the latest version
	if(!Prefs.migratedKeysets) {
		Prefs.migratedKeysets = true;
		Prefs.mainKeysetKeycode = Keysets.translateFromConstantCode(Prefs.mainKeysetKeycode);
		Prefs.twinKeysetKeycode = Keysets.translateFromConstantCode(Prefs.twinKeysetKeycode);
	}

	setKeys();

	Prefs.listen('mainKeysetKeycode', setKeys);
	Prefs.listen('mainKeysetAccel', setKeys);
	Prefs.listen('mainKeysetShift', setKeys);
	Prefs.listen('mainKeysetAlt', setKeys);
	Prefs.listen('mainKeysetCtrl', setKeys);
	Prefs.listen('twinKeysetKeycode', setKeys);
	Prefs.listen('twinKeysetAccel', setKeys);
	Prefs.listen('twinKeysetShift', setKeys);
	Prefs.listen('twinKeysetAlt', setKeys);
	Prefs.listen('twinKeysetCtrl', setKeys);
	Prefs.listen('twinSidebar', setKeys);
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('mainKeysetKeycode', setKeys);
	Prefs.unlisten('mainKeysetAccel', setKeys);
	Prefs.unlisten('mainKeysetShift', setKeys);
	Prefs.unlisten('mainKeysetAlt', setKeys);
	Prefs.unlisten('mainKeysetCtrl', setKeys);
	Prefs.unlisten('twinKeysetKeycode', setKeys);
	Prefs.unlisten('twinKeysetAccel', setKeys);
	Prefs.unlisten('twinKeysetShift', setKeys);
	Prefs.unlisten('twinKeysetAlt', setKeys);
	Prefs.unlisten('twinKeysetCtrl', setKeys);
	Prefs.unlisten('twinSidebar', setKeys);

	Keysets.unregister(mainKey);
	Keysets.unregister(twinKey);
};
