moduleAid.VERSION = '1.0.2';

// Bugfix for Tree Style Tabs: pinned tabs hide the top of the sidebar, they have a z-index of 100
this.TSTzIndex = function() {
	styleAid.unload('TSTzIndex');
	
	if(!prefAid.renderabove && !prefAid.renderaboveTwin) { return; }
	
	var sscode = '/*OmniSidebar CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("chrome://browser/content/browser.xul") {\n';
	
	if(prefAid.renderabove) {
		sscode += '	#sidebar-box[renderabove][autohide] #omnisidebar-resizebox:hover,\n';
		sscode += '	#sidebar-box[renderabove][autohide] #omnisidebar-resizebox[hover],\n';
		sscode += '	#sidebar-box[renderabove]:not([autohide]) #omnisidebar-resizebox { z-index: 200 !important; }\n';
	}
	
	if(prefAid.renderaboveTwin) {
		sscode += '	#'+objName+'-sidebar-box-twin[renderabove][autohide] #omnisidebar-resizebox-twin:hover,\n';
		sscode += '	#'+objName+'-sidebar-box-twin[renderabove][autohide] #omnisidebar-resizebox-twin[hover],\n';
		sscode += '	#'+objName+'-sidebar-box-twin[renderabove]:not([autohide]) #omnisidebar-resizebox-twin { z-index: 200 !important; }\n';
	}
	
	sscode += '}';
	
	styleAid.load('TSTzIndex', sscode, true);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('renderabove', TSTzIndex);
	prefAid.listen('renderaboveTwin', TSTzIndex);
	
	TSTzIndex();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('renderabove', TSTzIndex);
	prefAid.unlisten('renderaboveTwin', TSTzIndex);
	styleAid.unload('TSTzIndex');
};
