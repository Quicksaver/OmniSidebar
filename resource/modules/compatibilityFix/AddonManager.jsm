// VERSION 1.0.0

// So many loops we have to go through just to get the Discovery pane in the add-ons manager to work in the sidebar...
// Clicking "Add to Firefox" button in the discovery pane in the add-ons sidebar won't simply work,
// http://mxr.mozilla.org/mozilla-central/source/browser/base/content/browser-addons.js gXPInstallObserver.observe expects aBrowser to be a tab,
// and ignores any install requests when it isn't one.
// We need to "fool" it into thinking we're installing from the current webpage, so that the add-on installation panel is shown to the user.

this.AddonManagerBackstage = null;

Modules.LOADMODULE = function() {
	// AddonManagerInternal isn't exported, so we need to access it through the module's backstage pass
	AddonManagerBackstage = Cu.import("resource://gre/modules/AddonManager.jsm", {});
	AddonManagerBackstage.__AddonManagerInternal = AddonManagerBackstage.AddonManagerInternal;

	// AddonManagerInternal is frozen, so replace it with another one we can modify
	let InternalNew = {};
	for(let p in AddonManagerBackstage.AddonManagerInternal) {
		if(AddonManagerBackstage.AddonManagerInternal.hasOwnProperty(p)) {
			let propGetter = AddonManagerBackstage.AddonManagerInternal.__lookupGetter__(p);
			let propSetter = AddonManagerBackstage.AddonManagerInternal.__lookupSetter__(p);
			if(propGetter || propSetter) {
				if(propGetter) {
					InternalNew.__defineGetter__(p, propGetter.bind(AddonManagerBackstage.__AddonManagerInternal));
				}
				if(propSetter) {
					InternalNew.__defineSetter__(p, propSetter.bind(AddonManagerBackstage.__AddonManagerInternal));
				}
			} else if(typeof(AddonManagerBackstage.AddonManagerInternal[p]) == 'function') {
				InternalNew[p] = AddonManagerBackstage.AddonManagerInternal[p].bind(AddonManagerBackstage.__AddonManagerInternal);
			} else {
				InternalNew[p] = AddonManagerBackstage.AddonManagerInternal[p];
			}
		}
	}
	AddonManagerBackstage.AddonManagerInternal = InternalNew;

	// this is the same code that can be found in the original (http://mxr.mozilla.org/mozilla-central/source/toolkit/mozapps/extensions/AddonManager.jsm)
	// except where noted by |OSB CODE|; in this instance this was actually easier than using toCode (eval)
	AddonManagerBackstage.AddonManagerInternal.installAddonsFromWebpage = function AMI_installAddonsFromWebpage(aMimetype, aBrowser, aInstallingPrincipal, aInstalls) {
		if(!AddonManagerBackstage.gStarted)
			throw Components.Exception("AddonManager is not initialized", Cr.NS_ERROR_NOT_INITIALIZED);

		if(!aMimetype || typeof aMimetype != "string")
			throw Components.Exception("aMimetype must be a non-empty string", Cr.NS_ERROR_INVALID_ARG);

		if(aBrowser && !(aBrowser instanceof Ci.nsIDOMElement))
			throw Components.Exception("aSource must be a nsIDOMElement, or null", Cr.NS_ERROR_INVALID_ARG);

		if(!aInstallingPrincipal || !(aInstallingPrincipal instanceof Ci.nsIPrincipal))
			throw Components.Exception("aInstallingPrincipal must be a nsIPrincipal", Cr.NS_ERROR_INVALID_ARG);

		if(!Array.isArray(aInstalls))
			throw Components.Exception("aInstalls must be an array", Cr.NS_ERROR_INVALID_ARG);

		if(!("@mozilla.org/addons/web-install-listener;1" in Cc)) {
			AddonManagerBackstage.logger.warn("No web installer available, cancelling all installs");
			for(let install of aInstalls) {
				install.cancel();
			}
			return;
		}

		// When a chrome in-content UI has loaded a <browser> inside to host a website we want to do our security checks on the inner-browser but
		// notify front-end that install events came from the outer-browser (the main tab's browser). Check this by seeing if the browser we've been
		// passed is in a content type docshell and if so get the outer-browser.
		let topBrowser = aBrowser;
		let docShell = aBrowser.ownerDocument.defaultView.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDocShell).QueryInterface(Ci.nsIDocShellTreeItem);
		if(docShell.itemType == Ci.nsIDocShellTreeItem.typeContent) {
			topBrowser = docShell.chromeEventHandler;
		}

		// OSB CODE begin
		try {
			if(topBrowser.id == "discover-browser") {
				let browserWindow = topBrowser.ownerGlobal;
				let ownerWindow = browserWindow.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIWebNavigation)
					.QueryInterface(Ci.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Ci.nsIInterfaceRequestor)
					.getInterface(Ci.nsIDOMWindow);

				if(ownerWindow && ownerWindow[objName]) {
					for(let bar of ownerWindow[objName].sidebars) {
						if(browserWindow == bar.sidebar.contentWindow) {
							topBrowser = ownerWindow.gBrowser.mCurrentBrowser;
						}
					}
				}
			}
		}
		catch(ex) { /* we don't care, just proceed normally */ }
		// OSB CODE end

		try {
			let weblistener = Cc["@mozilla.org/addons/web-install-listener;1"].getService(Ci.amIWebInstallListener);

			if(!this.isInstallEnabled(aMimetype)) {
				for(let install of aInstalls) {
					install.cancel();
				}

				weblistener.onWebInstallDisabled(topBrowser, aInstallingPrincipal.URI, aInstalls, aInstalls.length);
				return;
			}
			else if(!aBrowser.contentPrincipal || !aInstallingPrincipal.subsumes(aBrowser.contentPrincipal)) {
				for(let install of aInstalls) {
					install.cancel();
				}

				if(weblistener instanceof Ci.amIWebInstallListener2) {
					weblistener.onWebInstallOriginBlocked(topBrowser, aInstallingPrincipal.URI, aInstalls, aInstalls.length);
				}
				return;
			}

			// The installs may start now depending on the web install listener, listen for the browser navigating to a new origin and cancel the installs in that case.
			new AddonManagerBackstage.BrowserListener(aBrowser, aInstallingPrincipal, aInstalls);

			if(!this.isInstallAllowed(aMimetype, aInstallingPrincipal)) {
				if(weblistener.onWebInstallBlocked(topBrowser, aInstallingPrincipal.URI, aInstalls, aInstalls.length)) {
					for(let install of aInstalls) {
						install.install();
					}
				}
			}
			else if(weblistener.onWebInstallRequested(topBrowser, aInstallingPrincipal.URI, aInstalls, aInstalls.length)) {
				for(let install of aInstalls) {
					install.install();
				}
			}
		}
		catch(ex) {
			// In the event that the weblistener throws during instantiation or when calling onWebInstallBlocked or onWebInstallRequested
			// all of the installs should get cancelled.
			AddonManagerBackstage.logger.warn("Failure calling web installer", ex);
			for(let install of aInstalls) {
				install.cancel();
			}
		}
	};
};

Modules.UNLOADMODULE = function() {
	AddonManagerBackstage.AddonManagerInternal = AddonManagerBackstage.__AddonManagerInternal;
	delete AddonManagerBackstage.__AddonManagerInternal;
};
