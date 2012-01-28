if(!top.omnisidebar.DMT) {
	var omnisidebarUtils = {};
	var mozIJSSubScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
	mozIJSSubScriptLoader.loadSubScript("chrome://omnisidebar/content/utils.jsm", omnisidebarUtils);
	var Startup = omnisidebarUtils.modifyFunction(Startup, [
		['if (window.arguments[1] == Ci.nsIDownloadManagerUI.REASON_USER_INTERACTED)',
		<![CDATA[
		if (!window.arguments || typeof(window.arguments[1]) == 'undefined' || window.arguments[1] == Ci.nsIDownloadManagerUI.REASON_USER_INTERACTED)
		]]>
		]
	]);
}