moduleAid.VERSION = '1.0.0';

this.notifyMovedSidebars = function(window) {
	dispatch(window, { type: 'SidebarsMoved', cancelable: false });
};

this.movedMainWhere = null;
this.movedTwinWhere = null;

// I could just overlay every URI that changes the UI so the changes in this one supersedes them, but I'd rather have the script figure out which is the best to overlay.
this.moveSidebars = function() {
	var mainWhereTo = null;
	var twinWhereTo = null;
	
	if(UNLOADED || !prefAid.moveSidebars) {
		mainWhereTo = null;
		twinWhereTo = null;
	} else {
		if(prefAid.renderabove) {
			mainWhereTo = (prefAid.undockMode == 'autohide') ? 'autoHide' : 'renderAbove';
		} else {
			mainWhereTo = 'mainSidebar';
		}
		
		if(prefAid.twinSidebar) {
			if(prefAid.renderaboveTwin) {
				twinWhereTo = (prefAid.undockModeTwin == 'autohide') ? 'autoHideTwin' : 'renderAboveTwin';
			} else {
				twinWhereTo = 'twin';
			}
		} else {
			twinWhereTo = null;
		}
	}
	
	if(mainWhereTo != movedMainWhere) {
		if(movedMainWhere) {
			overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/'+movedMainWhere+'.xul', 'moveSidebarMain');
			notifyMovedSidebars();
		}
		movedMainWhere = mainWhereTo;
		if(movedMainWhere) {
			overlayAid.overlayURI('chrome://'+objPathString+'/content/'+movedMainWhere+'.xul', 'moveSidebarMain', null, notifyMovedSidebars);
		}
	}
	
	if(twinWhereTo != movedTwinWhere) {
		if(movedTwinWhere) {
			overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/'+movedTwinWhere+'.xul', 'moveSidebarTwin');
			notifyMovedSidebars();
		}
		movedTwinWhere = twinWhereTo;
		if(movedTwinWhere) {
			overlayAid.overlayURI('chrome://'+objPathString+'/content/'+movedTwinWhere+'.xul', 'moveSidebarTwin', null, notifyMovedSidebars);
		}
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('twinSidebar', moveSidebars);
	prefAid.listen('renderabove', moveSidebars);
	prefAid.listen('undockMode', moveSidebars);
	prefAid.listen('renderaboveTwin', moveSidebars);
	prefAid.listen('undockModeTwin', moveSidebars);
	
	moveSidebars();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('twinSidebar', moveSidebars);
	prefAid.unlisten('renderabove', moveSidebars);
	prefAid.unlisten('undockMode', moveSidebars);
	prefAid.unlisten('renderaboveTwin', moveSidebars);
	prefAid.unlisten('undockModeTwin', moveSidebars);
	
	moveSidebars();
};
