moduleAid.VERSION = '1.0.1';

this.inCustomize = true;

this.mainSidebar = {
	get button () { return $(objName+'-button'); }
};

this.twinSidebar = {
	get button () { return $(objName+'-button-twin'); }
};

this.buttonLabels = function(btn, onLoad) {
	if(UNLOADED) { return; }
	if(toggleButtons()) { buttonLabels(btn, onLoad); }
};

this.toggleButtons = function() {
	return moduleAid.loadIf('buttons', mainSidebar.button || twinSidebar.button);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('buttons');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('buttons');
};
