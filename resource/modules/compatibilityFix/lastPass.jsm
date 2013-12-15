moduleAid.VERSION = '1.0.0';

this.__defineGetter__('lastPassMenu', function() { return $('lpt_lastpass-compact-menu'); });

this.lastPassMenuShown = function() {
	var bar = (isAncestor(lastPassMenu, mainSidebar.toolbar)) ? mainSidebar : (isAncestor(lastPassMenu, twinSidebar.toolbar)) ? twinSidebar : null;
	if(bar && bar.above && bar.autoHide) {
		setHover(bar, true);
	}
};

this.lastPassMenuHidden = function() {
	var bar = (isAncestor(lastPassMenu, mainSidebar.toolbar)) ? mainSidebar : (isAncestor(lastPassMenu, twinSidebar.toolbar)) ? twinSidebar : null;
	if(bar && bar.above && bar.autoHide) {
		setHover(bar, false);
	}
};

this.setupLastPass = function() {
	listenerAid.add(lastPassMenu, 'popupshown', lastPassMenuShown);
	listenerAid.add(lastPassMenu, 'popuphidden', lastPassMenuHidden);
};

this.unsetLastPass = function() {
	listenerAid.remove(lastPassMenu, 'popupshown', lastPassMenuShown);
	listenerAid.remove(lastPassMenu, 'popuphidden', lastPassMenuHidden);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'beforecustomization', unsetLastPass);
	listenerAid.add(window, 'aftercustomization', setupLastPass);
	
	setupLastPass();
};

moduleAid.UNLOADMODULE = function() {
	unsetLastPass();
	
	listenerAid.remove(window, 'beforecustomization', unsetLastPass);
	listenerAid.remove(window, 'aftercustomization', setupLastPass);
};
