// VERSION 2.0.1

// By using a JSM, we can initialize each individual tab (frame) with our scripts without having to instanciate the same objects with each one.
(function(frame) {
	let targetScope = {};
	Components.utils.import("resource://omnisidebar/modules/content/utils/ModuleInSandbox.jsm", targetScope);
	targetScope.ModuleInSandbox.init('omnisidebar', frame);
})(this);
