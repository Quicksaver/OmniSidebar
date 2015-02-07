Modules.VERSION = '1.1.0';

this.__defineGetter__('EdgeWiseOV', function() { return window.EdgeWiseOV; });

this.ewLoad = function(e) {
	if(!e || e.type == 'SidebarsMoved' || e.target == leftSidebar.box) {
		// first make sure we're not following the other sidebar's switcher anymore
		Listeners.remove(rightSidebar.switcher, 'mousedown', ewMouseDown);
		Listeners.remove(rightSidebar.switcher, 'mouseout', ewMouseOut);
		Listeners.remove(rightSidebar.switcher, 'mouseover', ewMouseOver);
		Listeners.remove(rightSidebar.switcher, 'mouseup', ewMouseUp);
		
		// now apply the listeners to the left sidebar's switcher if necessary, so the events are carried over to EW's clicker
		if(leftSidebar.loaded && e !== false) {
			Listeners.add(leftSidebar.switcher, 'mousedown', ewMouseDown);
			Listeners.add(leftSidebar.switcher, 'mouseout', ewMouseOut);
			Listeners.add(leftSidebar.switcher, 'mouseover', ewMouseOver);
			Listeners.add(leftSidebar.switcher, 'mouseup', ewMouseUp);
		} else {
			Listeners.remove(leftSidebar.switcher, 'mousedown', ewMouseDown);
			Listeners.remove(leftSidebar.switcher, 'mouseout', ewMouseOut);
			Listeners.remove(leftSidebar.switcher, 'mouseover', ewMouseOver);
			Listeners.remove(leftSidebar.switcher, 'mouseup', ewMouseUp);
		}
	}
};

this.ewClick = function(e) {
	if(e.detail.bar != leftSidebar) { return; }
	if(e.detail.clickEvent.shiftKey) { return; }
	e.preventDefault();
	e.stopPropagation();
	EdgeWiseOV.onClick(e.detail.clickEvent);
};

this.ewMouseDown = function(e) {
	if(e.shiftKey) { return; }
	EdgeWiseOV.onMouseDown();
};

this.ewMouseOut = function() {
	EdgeWiseOV.onMouseOut();
};

this.ewMouseOver = function() {
	EdgeWiseOV.onMouseOver();
};

this.ewMouseUp = function(e) {
	if(e.shiftKey) { return; }
	EdgeWiseOV.onMouseUp();
};

this.ewWheel = function(e) {
	if(e.detail.bar != leftSidebar) { return; }
	e.preventDefault();
	e.stopPropagation();
	EdgeWiseOV.onScroll({ detail: e.detail.scrollEvent.deltaY });
};

// we need to make sure the margin switch is visible for this, otherwise the sidebar occludes EW's clicker
this.ewSwitch = function() {
	leftSidebar.needSwitch.EW = true;
	delete rightSidebar.needSwitch.EW;
	
	leftSidebar.toggleSwitcher();
	rightSidebar.toggleSwitcher();
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'clickedSwitcher', ewClick, true);
	Listeners.add(window, 'scrolledSwitcher', ewWheel, true);
	Listeners.add(window, 'SidebarsMoved', ewLoad);
	Listeners.add(window, 'LoadedSidebar', ewLoad);
	Prefs.listen('moveSidebars', ewSwitch);
	
	ewLoad();
	ewSwitch();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'clickedSwitcher', ewClick, true);
	Listeners.remove(window, 'scrolledSwitcher', ewWheel, true);
	Listeners.remove(window, 'SidebarsMoved', ewLoad);
	Listeners.remove(window, 'LoadedSidebar', ewLoad);
	Prefs.unlisten('moveSidebars', ewSwitch);
	
	ewLoad(false);
	delete leftSidebar.needSwitch.EW;
	delete rightSidebar.needSwitch.EW;
};
