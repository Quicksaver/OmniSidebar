moduleAid.VERSION = '2.0.4';
moduleAid.LAZY = true;

// listenerAid - Object to aid in setting and removing all kinds of event listeners to an object;
// add(obj, type, aListener, capture, maxTriggers) - attaches aListener to obj
//	obj - (object) to attach the listener to
//	type - (string) event type to listen for
//	aListener - (function) method to be called when event is dispatched, by default this will be bound to self
//	(optional) capture - (bool) true or false, defaults to false
//	(optional) maxTriggers -
//		(int) maximum number of times to fire aListener,
//		(bool) true is equivalent to (int) 1,
//		(bool) false aListener is not bound to self,
//		defaults to undefined
// remove(obj, type, aListener, capture, maxTriggers) - removes aListener from obj
//	see add()
this.listenerAid = {
	handlers: [],
	
	// if maxTriggers is set to the boolean false, it acts as a switch to not bind the function to our object
	// but if it's set to anything else it will bind the function,
	// thus I can't have an unbound function with maxTriggers
	add: function(obj, type, aListener, capture, maxTriggers) {
		if(!obj || !obj.addEventListener) { return false; }
		
		var unboundListener = this.modifyListener(aListener, maxTriggers, true);
		var listener = this.modifyListener(aListener, maxTriggers);
		
		if(this.listening(obj, type, capture, unboundListener) !== false) {
			return true;
		}
		
		if(maxTriggers === true) {
			maxTriggers = 1;
		}
		
		var newHandler = {
			obj: obj,
			objID: obj.id,
			type: type,
			unboundListener: unboundListener,
			listener: listener,
			capture: capture,
			maxTriggers: (maxTriggers) ? maxTriggers : null,
			triggerCount: (maxTriggers) ? 0 : null
		};
		this.handlers.push(newHandler);
		var i = this.handlers.length -1;
		
		this.handlers[i].obj.addEventListener(this.handlers[i].type, this.handlers[i].listener, this.handlers[i].capture);
		return true;
	},
	
	remove: function(obj, type, aListener, capture, maxTriggers) {
		try {
			if(!obj || !obj.removeEventListener) { return false; }
		}
		catch(ex) {
			handleDeadObject(ex); /* prevents some can't access dead objects */
			return false;
		}
		
		var unboundListener = this.modifyListener(aListener, maxTriggers, true);
			
		var i = this.listening(obj, type, capture, unboundListener);
		if(i !== false) {
			this.handlers[i].obj.removeEventListener(this.handlers[i].type, this.handlers[i].listener, this.handlers[i].capture);
			this.handlers.splice(i, 1);
			return true;
		}
		return false;
	},
	
	listening: function(obj, type, capture, unboundListener) {
		for(var i=0; i<this.handlers.length; i++) {
			if(!this.handlers[i].obj && this.handlers[i].objID) {
				this.handlers[i].obj = $(this.handlers[i].objID);
			}
			if(this.handlers[i].obj == obj && this.handlers[i].type == type && this.handlers[i].capture == capture && compareFunction(this.handlers[i].unboundListener, unboundListener)) {
				return i;
			}
		}
		return false;
	},
	
	/* I'm not sure if clean is currently working...
	OmniSidebar - Started browser and opened new window then closed it, it would not remove the switchers listeners, I don't know in which window,
	or it would but it would still leave a ZC somehow. Removing them manually in UNLOADMODULE fixed the ZC but they should have been taken care of here */
	clean: function() {
		var i = 0;
		while(i < this.handlers.length) {
			if(!this.handlers[i].obj && this.handlers[i].objID) {
				this.handlers[i].obj = $(this.handlers[i].objID);
			}
			try {
				if(this.handlers[i].obj && this.handlers[i].obj.removeEventListener) {
					this.handlers[i].obj.removeEventListener(this.handlers[i].type, this.handlers[i].listener, this.handlers[i].capture);
				}
			}
			catch(ex) { handleDeadObject(ex); /* Prevents can't access dead object sometimes */ }
			this.handlers.splice(i, 1);
		}
		return true;
	},
	
	compareListener: function(a, b) {
		if(a == b || a.toSource() == b.toSource()) {
			return true;
		}
		return false;
	},
	
	modifyListener: function(listener, maxTriggers, forceUnbound) {
		var newListener = listener;
		
		if(maxTriggers) {
			newListener = modifyFunction(listener, [
				['{',
				<![CDATA[
				{
					// This still happens sometimes and I can't figure out why, it's mainly when I turn off the add-on, so it should be irrelevant
					if(this.listenerAid) {
						var targets = ['target', 'originalTarget', 'currentTarget'];
						
						mainRemoveListenerLoop:
						for(var a = 0; a < targets.length; a++) {
							for(var i = 0; i < this.listenerAid.handlers.length; i++) {
								if(this.listenerAid.handlers[i].obj == arguments[0][targets[a]]
								&& this.listenerAid.handlers[i].type == arguments[0].type
									&& ((this.listenerAid.handlers[i].capture && arguments[0].eventPhase == arguments[0].CAPTURING_PHASE)
									|| (!this.listenerAid.handlers[i].capture && arguments[0].eventPhase != arguments[0].CAPTURING_PHASE))
								&& this.listenerAid.compareListener(this.listenerAid.handlers[i].unboundListener, arguments.callee)) {
									this.listenerAid.handlers[i].triggerCount++;
									if(this.listenerAid.handlers[i].triggerCount == this.listenerAid.handlers[i].maxTriggers) {
										this.listenerAid.remove(arguments[0][targets[a]], this.listenerAid.handlers[i].type, this.listenerAid.handlers[i].unboundListener, this.listenerAid.handlers[i].capture);
										break mainRemoveListenerLoop;
									}
								}
							}
						}
					}
				]]>
				],
				
				// This is just so my editor correctly assumes the pairs of {}, it has nothing to do with the add-on itself
				['}',
				<![CDATA[
				}
				]]>
				]
			]);
		}
		
		if(maxTriggers !== false && !forceUnbound) {
			newListener = newListener.bind(self);
		}
		return newListener;
	}
};
