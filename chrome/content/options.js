var omnisidebarOptions = {
	init: function() {
		omnisidebarOptions.prefAid.init('omnisidebar', ['keysets0', 'keysets1', 'keysets2', 'keysets3', 'keysets4', 'keysets5', 'keysets6']);
		
		for(var i=0; i<omnisidebarOptions.prefAid.length; i++) {
			if(!omnisidebarOptions.prefAid['keysets'+i]) {
				document.getElementById('keysetItem'+i).setAttribute('hidden', 'true');
			}
		}
		
		omnisidebarOptions.toggleTwin();
		omnisidebarOptions.toggleTitle();
		omnisidebarOptions.toggleTitleTwin();
		omnisidebarOptions.toggleAbove();
		omnisidebarOptions.toggleGlass();
	},
	
	toggleTwin: function() {
		var twin = document.getElementById('twinCheckbox').checked;
		var nodes = document.getElementsByClassName('toggleTwin');
		for(var i=0; i<nodes.length; i++) {
			if(twin) {
				if(nodes[i].id != 'titleButtonTwinCheckbox' || !document.getElementById('hideTitleTwinCheckbox').checked) {
					nodes[i].removeAttribute('disabled');
				}
			} else {
				nodes[i].setAttribute('disabled', 'true');
			}
		}
		omnisidebarOptions.toggleAboveTwin();
	},
	
	toggleTitle: function() {
		if(document.getElementById('hideTitleCheckbox').checked) {
			document.getElementById('titleButtonCheckbox').setAttribute('disabled', 'true');
		} else {
			document.getElementById('titleButtonCheckbox').removeAttribute('disabled');
		}
	},
	
	toggleTitleTwin: function() {
		if(document.getElementById('hideTitleTwinCheckbox').checked || !document.getElementById('twinCheckbox').checked) {
			document.getElementById('titleButtonTwinCheckbox').setAttribute('disabled', 'true');
		} else {
			document.getElementById('titleButtonTwinCheckbox').removeAttribute('disabled');
		}
	},
	
	toggleAbove: function() {
		var checked = document.getElementById('aboveCheckbox').checked;
		var els = document.getElementsByClassName('aboveCheckbox');
		for(var i=0; i<els.length; i++) {
			if(checked) {
				els[i].removeAttribute('disabled');
			} else {
				els[i].setAttribute('disabled', 'true');
			}
		}
	},
	
	toggleAboveTwin: function() {
		var enable = (document.getElementById('twinCheckbox').checked && document.getElementById('aboveTwinCheckbox').checked);
		var els = document.getElementsByClassName('aboveTwinCheckbox');
		for(var i=0; i<els.length; i++) {
			if(enable) {
				els[i].removeAttribute('disabled');
			} else {
				els[i].setAttribute('disabled', 'true');
			}
		}
	},
	
	toggleGlass: function() {
		var checked = document.getElementById('glassCheckbox').checked;
		if(checked) {
			document.getElementById('transparencyCheckbox').removeAttribute('disabled');
		} else {
			document.getElementById('transparencyCheckbox').setAttribute('disabled', true);
		}
	},
	
	onlyNumbers: function(v) {
		return Math.max(parseInt(v || 0), 0);
	}
}

omnisidebarOptions.mozIJSSubScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
omnisidebarOptions.mozIJSSubScriptLoader.loadSubScript("chrome://omnisidebar/content/utils.jsm", omnisidebarOptions);
omnisidebarOptions.listenerAid.add(window, "load", omnisidebarOptions.init, false, true);
