Modules.VERSION = '2.0.0';

this.__defineGetter__('EdgeWiseOV', function() { return window.EdgeWiseOV; });

this.EW = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'SidebarsMoved':
				this.load();
				break;
			
			case 'LoadedSidebar':
				if(e.target == leftSidebar.box) {
					this.load();
				}
				break;
			
			case 'clickedSwitcher':
				if(e.detail.bar != leftSidebar) { return; }
				if(e.detail.clickEvent.shiftKey) { return; }
				e.preventDefault();
				e.stopPropagation();
				EdgeWiseOV.onClick(e.detail.clickEvent);
				break;
			
			case 'mousedown':
				if(e.shiftKey) { return; }
				EdgeWiseOV.onMouseDown();
				break;
			
			case 'mouseout':
				EdgeWiseOV.onMouseOut();
				break;
			
			case 'mouseover':
				EdgeWiseOV.onMouseOver();
				break;
			
			case 'mouseup':
				if(e.shiftKey) { return; }
				EdgeWiseOV.onMouseUp();
				break;
			
			case 'scrolledSwitcher':
				if(e.detail.bar != leftSidebar) { return; }
				e.preventDefault();
				e.stopPropagation();
				EdgeWiseOV.onScroll({ detail: e.detail.scrollEvent.deltaY });
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'moveSidebars':
				this.switcher();
				break;
		}
	},
	
	load: function() {
		// first make sure we're not following the other sidebar's switcher anymore
		Listeners.remove(rightSidebar.switcher, 'mousedown', EW);
		Listeners.remove(rightSidebar.switcher, 'mouseout', EW);
		Listeners.remove(rightSidebar.switcher, 'mouseover', EW);
		Listeners.remove(rightSidebar.switcher, 'mouseup', EW);
		
		// now apply the listeners to the left sidebar's switcher if necessary, so the events are carried over to EW's clicker
		if(leftSidebar.loaded) {
			this.init();
		} else {
			this.deinit();
		}
	},
	
	init: function() {
		Listeners.add(leftSidebar.switcher, 'mousedown', EW);
		Listeners.add(leftSidebar.switcher, 'mouseout', EW);
		Listeners.add(leftSidebar.switcher, 'mouseover', EW);
		Listeners.add(leftSidebar.switcher, 'mouseup', EW);
	},
	
	deinit: function() {
		Listeners.remove(leftSidebar.switcher, 'mousedown', EW);
		Listeners.remove(leftSidebar.switcher, 'mouseout', EW);
		Listeners.remove(leftSidebar.switcher, 'mouseover', EW);
		Listeners.remove(leftSidebar.switcher, 'mouseup', EW);
	},
	
	// we need to make sure the margin switch is visible for this, otherwise the sidebar occludes EW's clicker
	switcher: function() {
		leftSidebar.needSwitch.add('EW');
		rightSidebar.needSwitch.delete('EW');
		
		leftSidebar.toggleSwitcher();
		rightSidebar.toggleSwitcher();
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'clickedSwitcher', EW, true);
	Listeners.add(window, 'scrolledSwitcher', EW, true);
	Listeners.add(window, 'SidebarsMoved', EW);
	Listeners.add(window, 'LoadedSidebar', EW);
	Prefs.listen('moveSidebars', EW);
	
	EW.load();
	EW.witcher();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'clickedSwitcher', EW, true);
	Listeners.remove(window, 'scrolledSwitcher', EW, true);
	Listeners.remove(window, 'SidebarsMoved', EW);
	Listeners.remove(window, 'LoadedSidebar', EW);
	Prefs.unlisten('moveSidebars', EW);
	
	EW.deinit();
	leftSidebar.needSwitch.delete('EW');
	rightSidebar.needSwitch.delete('EW');
};
