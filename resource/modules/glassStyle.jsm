Modules.VERSION = '1.2.4';

this.setTransparency = function() {
	var alpha = Prefs.transparency /1000;
	var m = 128/0.75;
	var b = 128 -m;
	var color = Math.max(Math.round((alpha *m) +b), 0);
	
	let sscode = '\
		@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
		@-moz-document url("chrome://browser/content/browser.xul") {\n\
			.sidebar-box[renderabove] .omnisidebar_resize_box,\n\
			.sidebar-box:not([renderabove]) {\n\
				background-color: rgba('+color+','+color+','+color+','+alpha+') !important;\n\
			}\n\
		}';
	
	Styles.load('glassStyleTransparency', sscode, true);
};

Modules.LOADMODULE = function() {
	Styles.load('glassStyle', 'glass/glass');
	Styles.load('glassStyleFF', 'glass/glass-ff5');
	Styles.load('glassStyleGeneral', 'glass/glass-general');
	Styles.load('glassStyleScrollbars', 'glass/glass-scrollbars', false, 'agent');
	Styles.load('glassStyleNative', 'glass/glass-nativeSidebars');
	Styles.load('glassStyleFeed', 'glass/glass-feedbar');
	Styles.load('glassStyleUpdScanner', 'glass/glass-updscanner');
	Styles.load('glassStyleBrowserConsole', 'glass/glass-browserConsole');
	Styles.load('glassStyleDMT', 'glass/glass-dmt');
	Styles.load('glassStyleAddons', 'glass/glass-addons');
	Styles.load('glassStyleStylish', 'glass/glass-stylish');
	Styles.load('glassStyleDOMInspector', 'glass/glass-domi');
	Styles.load('glassStylePocket', 'glass/glass-pocket');
	Styles.load('glassStyleScratchpad', 'glass/glass-scratchpad');
	
	Prefs.listen('transparency', setTransparency);
	setTransparency();
	
	Overlays.overlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'glassMain');
	Overlays.overlayURI('chrome://'+objPathString+'/content/twin.xul', 'glassTwin');
};

Modules.UNLOADMODULE = function() {
	Styles.unload('glassStyle');
	Styles.unload('glassStyleFF');
	Styles.unload('glassStyleGeneral');
	Styles.unload('glassStyleScrollbars');
	Styles.unload('glassStyleNative');
	Styles.unload('glassStyleFeed');
	Styles.unload('glassStyleUpdScanner');
	Styles.unload('glassStyleBrowserConsole');
	Styles.unload('glassStyleDMT');
	Styles.unload('glassStyleAddons');
	Styles.unload('glassStyleStylish');
	Styles.unload('glassStyleDOMInspector');
	Styles.unload('glassStylePocket');
	Styles.unload('glassStyleScratchpad');
	
	Styles.unload('glassStyleTransparency');
	Prefs.unlisten('transparency', setTransparency);
	
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/mainSidebar.xul', 'glassMain');
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/twin.xul', 'glassTwin');
};
