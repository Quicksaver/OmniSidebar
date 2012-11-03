moduleAid.VERSION = '2.0.1';
moduleAid.LAZY = true;

// modifyFunction(aOriginal, aArray) - allows me to modify a function quickly from within my scripts
//	aOriginal - (function) function to be modified
//	aArray - (array) [ [original, new] x n ], where new replaces original in the modified function
// Note to self, by using the Function() method to create functions I'm priving them from their original context,
// that is, while inside a function created by that method in a module loaded by moduleAid I can't call 'subObj' (as in 'mainObj.subObj') by itself as I normally do,
// I have to either use 'mainObj.subObj' or 'this.subObj'; I try to avoid this as that is how I'm building my modularized add-ons, 
// so I'm using eval, at least for now until I find a better way to implement this functionality.
// Don't forget that in bootstraped add-ons, these modified functions take the context of the modifier (sandboxed).
this.modifyFunction = function(aOriginal, aArray) {
	var newCode = aOriginal.toString();
	for(var i=0; i < aArray.length; i++) {
		newCode = newCode.replace(aArray[i][0], aArray[i][1].replace("{([objName])}", objName));
	}
	
	try {
		eval('var ret = ' + newCode + ';');
		return ret;
	}
	catch(ex) {
		Cu.reportError(ex);
		return null;
	}
};

// aSync(aFunc, aDelay) - lets me run aFunc asynchronously, basically it's a one shot timer with a delay of aDelay msec
//	aFunc - (function) to be called asynchronously
//	(optional) aDelay - (int) msec to set the timer, defaults to 0msec
this.aSync = function(aFunc, aDelay) {
	return timerAid.create(aFunc, (!aDelay) ? 0 : aDelay);
};
