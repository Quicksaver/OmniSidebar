moduleAid.VERSION = '1.0.0';

this.__defineGetter__('devToolsBox', function() { return $('devtools-sidebar-box'); });

this.devToolsMove = function(obj, prop) {
	if(devToolsBox.getAttribute('hidden') == 'true') {
		delete moveRightBy.devTools;
	} else {
		moveRightBy.devTools = devToolsBox.clientWidth;
	}
	if(!prop || prop == 'hidden') { // width will be taken care of in bar.box width handler
		dispatch(window, { type: 'sidebarWidthChanged', cancelable: false, detail: { bar: rightSidebar } });
	}
};

this.devToolsHover = function() {
	if(rightSidebar.above && rightSidebar.autoHide) {
		setAttribute(rightSidebar.box, 'dontReHover', 'true');
	}
};

moduleAid.LOADMODULE = function() {
	if(typeof(moveRightBy) == 'undefined') { self.moveRightBy = {}; }
	
	objectWatcher.addAttributeWatcher(devToolsBox, 'hidden', devToolsMove, false, false);
	objectWatcher.addAttributeWatcher(devToolsBox, 'width', devToolsMove, false, true);
	
	listenerAid.add(devToolsBox, 'mouseover', devToolsHover);
	
	devToolsMove();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(devToolsBox, 'mouseover', devToolsHover);
	
	objectWatcher.removeAttributeWatcher(devToolsBox, 'hidden', devToolsMove, false, false);
	objectWatcher.removeAttributeWatcher(devToolsBox, 'width', devToolsMove, false, true);
};
