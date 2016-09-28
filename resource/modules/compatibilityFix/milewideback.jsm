/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.0

this.__defineGetter__('MileWideBack', function() { return window.MileWideBack; });

this.MWB = {
	get strip () { return $('back-strip'); },

	handleEvent: function(e) {
		switch(e.type) {
			case 'mouseover':
				// keep the sidebar visible when hovering the strip if it's opened and auto-hiding
				var bar = leftSidebar;
				if(bar.box && !bar.closed && bar.above && bar.autoHide) {
					Timers.init('mwbHover', function() {
						autoHide.setHover(bar, true);
					}, Prefs.showDelay);
				}
				break;

			case 'mouseout':
				Timers.cancel('mwbHover');

				var bar = leftSidebar;
				if(bar.box && !bar.closed && bar.above && bar.autoHide) {
					autoHide.setHover(bar, false);
				}
				break;

			case 'clickedSwitcher':
				if(e.detail.bar != leftSidebar) { return; }
				if(e.detail.clickEvent.shiftKey) { return; }
				e.preventDefault();
				e.stopPropagation();
				MileWideBack.onClick(e.detail.clickEvent);
				break;

			case 'scrolledSwitcher':
				if(e.detail.bar != leftSidebar) { return; }
				e.preventDefault();
				e.stopPropagation();
				MileWideBack.onScroll({ detail: e.detail.scrollEvent.deltaY });
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

	// we need to make sure the margin switch is visible for this, otherwise the sidebar occludes MWB's clicker
	switcher: function() {
		leftSidebar.needSwitch.add('MWB');
		rightSidebar.needSwitch.delete('MWB');

		leftSidebar.toggleSwitcher();
		rightSidebar.toggleSwitcher();
	}
};

Modules.LOADMODULE = function() {
	Styles.load('milewideback', 'milewideback');

	Listeners.add(MWB.strip, 'mouseover', MWB);
	Listeners.add(MWB.strip, 'mouseout', MWB);
	Listeners.add(window, 'clickedSwitcher', MWB, true);
	Listeners.add(window, 'scrolledSwitcher', MWB, true);
	Prefs.listen('moveSidebars', MWB);

	MWB.switcher();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(MWB.strip, 'mouseover', MWB);
	Listeners.remove(MWB.strip, 'mouseout', MWB);
	Listeners.remove(window, 'clickedSwitcher', MWB, true);
	Listeners.remove(window, 'scrolledSwitcher', MWB, true);
	Prefs.unlisten('moveSidebars', MWB);

	leftSidebar.needSwitch.delete('MWB');
	rightSidebar.needSwitch.delete('MWB');

	if(UNLOADED) {
		Styles.unload('milewideback');
	}
};
