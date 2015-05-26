Modules.VERSION = '1.1.1';

//Error: win[objectName].xulId(...).contentWindow is undefined
//Source file: file:///C:/Users/Quicksaver/AppData/Roaming/Mozilla/Firefox/Profiles/c0wgkj18.Nightly/extensions/isreaditlater@ideashower.com/components/RILdelegate.js
//Line: 860

//Error: this.xulId(...).contentWindow is undefined
//Source file: chrome://isreaditlater/content/RIL.js
//Line: 350

// These are probably caused by sidebar jumping around and Pocket trying to access just afterwards, when the browser elements haven't finished loading/being re-created.
// A fix is easy, just add a check for .contentWindow and skip that part of the code if it is undefined. It will not break Pocket functionality.

Modules.LOADMODULE = function() {
	toCode.modify(window.RIL, 'window.RIL.listIsOpen', [
		["&& this.xulId('sidebar', true).contentWindow", "&& this.xulId('sidebar', true) && this.xulId('sidebar', true).contentWindow"]
	]);
	toCode.modify(window.RIL.APP, 'window.RIL.APP.commandInAllOpenWindows', [
		["&& win[objectName].xulId('sidebar', true)", "&& win[objectName].xulId('sidebar', true) && win[objectName].xulId('sidebar', true).contentWindow"]
	]);
};

Modules.UNLOADMODULE = function() {
	toCode.revert(window.RIL, 'window.RIL.listIsOpen');
	toCode.revert(window.RIL.APP, 'window.RIL.APP.commandInAllOpenWindows');
};
