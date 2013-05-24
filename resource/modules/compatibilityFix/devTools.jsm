moduleAid.VERSION = '1.0.2';

this.__defineGetter__('devToolsBox', function() { return $('devtools-sidebar-box'); });
this.__defineGetter__('devToolsSplitter', function() { return $('devtools-side-splitter'); });

this.devToolsMove = function() {
	if(devToolsBox.getAttribute('hidden') == 'true') {
		delete moveRightBy.devTools;
	} else {
		moveRightBy.__defineGetter__('devTools', function() { return devToolsBox.clientWidth; });
	}
	dispatch(window, { type: 'sidebarWidthChanged', cancelable: false, detail: { bar: rightSidebar } });
};

this.devToolsHover = function() {
	if(rightSidebar.above && rightSidebar.autoHide) {
		setAttribute(rightSidebar.box, 'dontReHover', 'true');
	}
};

moduleAid.LOADMODULE = function() {
	if(typeof(moveRightBy) == 'undefined') { self.moveRightBy = {}; }
	
	objectWatcher.addAttributeWatcher(devToolsBox, 'hidden', devToolsMove, false, false);
	
	listenerAid.add(devToolsBox, 'mouseover', devToolsHover);
	listenerAid.add(devToolsSplitter, 'mouseover', devToolsHover);
	
	devToolsMove();
};

moduleAid.UNLOADMODULE = function() {
	delete moveRightBy.devTools;
	
	listenerAid.remove(devToolsBox, 'mouseover', devToolsHover);
	listenerAid.remove(devToolsSplitter, 'mouseover', devToolsHover);
	
	objectWatcher.removeAttributeWatcher(devToolsBox, 'hidden', devToolsMove, false, false);
};
