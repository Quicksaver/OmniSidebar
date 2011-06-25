var omnisidebar = {
	init: function() {
		window.removeEventListener("load", omnisidebar.init, false);
		
		//Show/hide the buttons
		omnisidebar.twinSidebar = Application.prefs.get('extensions.omnisidebar.twinSidebar');
		omnisidebar.stylish = Application.prefs.get('extensions.omnisidebar.stylish');
		omnisidebar.mainSidebar = Application.prefs.get('extensions.omnisidebar.mainSidebar');
		
		omnisidebar.getStrings();
		
		if(document.getElementById('stylish_sidebar_button') != null) {
			omnisidebar.hideIt(document.getElementById('stylish_sidebar_button'), omnisidebar.stylish.value);
		}
	},
	
	// Remove checked states and display correct labels
	onLoad: function(twin) {
		if(!twin) {
			omnisidebar.button = document.getElementById('omnisidebar_button');
			omnisidebar.wrapper = document.getElementById('wrapper-omnisidebar_button');
			
			omnisidebar.button.removeAttribute('checked');
			omnisidebar.button.setAttribute('label', omnisidebar.buttonlabel);
			omnisidebar.button.setAttribute('tooltiptext', omnisidebar.buttontooltip);
			omnisidebar.wrapper.setAttribute('title', omnisidebar.buttonlabel);
			
			if(omnisidebar.mainSidebar.value == 'right') {
				omnisidebar.button.setAttribute('movetoright', 'true');
			} else {
				omnisidebar.button.removeAttribute('movetoright');
			}
		} 
		else {
			omnisidebar.button_twin = document.getElementById('omnisidebar_button-twin');
			omnisidebar.wrapper_twin = document.getElementById('wrapper-omnisidebar_button-twin');
			
			omnisidebar.button_twin.removeAttribute('checked');
			omnisidebar.button_twin.setAttribute('label', omnisidebar.buttontwinlabel);
			omnisidebar.button_twin.setAttribute('tooltiptext', omnisidebar.buttontwintooltip);
			omnisidebar.wrapper_twin.setAttribute('title', omnisidebar.buttontwinlabel);
			
			omnisidebar.hideIt(omnisidebar.button_twin, omnisidebar.twinSidebar.value);
			omnisidebar.hideIt(omnisidebar.wrapper_twin, omnisidebar.twinSidebar.value);
			
			if(omnisidebar.mainSidebar.value == 'right') {
				omnisidebar.button_twin.setAttribute('movetoleft', 'true');
			} else {
				omnisidebar.button_twin.removeAttribute('movetoleft');
			}
		}
	},
	
	getStrings: function() {
		omnisidebar.strings = document.getElementById("omnisidebar-customize-strings");
		
		omnisidebar.buttontwinlabel = omnisidebar.strings.getString('omnisidebarButtonTwinLabel');
		omnisidebar.buttontwintooltip = omnisidebar.strings.getString('omnisidebarButtonTwinTooltip');
		if(omnisidebar.twinSidebar.value) {
			omnisidebar.buttonlabel = omnisidebar.strings.getString('omnisidebarButtonMainLabel');
			omnisidebar.buttontooltip = omnisidebar.strings.getString('omnisidebarButtonMainTooltip');
		}
		else {
			omnisidebar.buttonlabel = omnisidebar.strings.getString('omnisidebarButtonlabel');
			omnisidebar.buttontooltip = omnisidebar.strings.getString('omnisidebarButtonTooltip');
		}
	},
	
	hideIt: function(el, show) {
		if(typeof(el) == 'string') {
			var el = document.getElementById(el);
		}
		if(el == null || typeof(el) != 'object' || el != '[object XULElement]') { return; }
		
		if(!show) {
			el.setAttribute('collapsed', 'true');
		}
		else {
			el.removeAttribute('collapsed');
		}
	}
};

window.addEventListener("load", omnisidebar.init, false);