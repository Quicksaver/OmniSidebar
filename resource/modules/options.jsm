moduleAid.VERSION = '1.0.0';

this.aSyncOnlyNumbers = function(box) {
	aSync(function () { box.value = onlyNumbers(box.value); });
};

this.onlyNumbers = function(v) {
	return Math.max(parseInt(v || 0), 0);
};

moduleAid.LOADMODULE = function() {
	if(Services.appinfo.OS == 'WINNT' || Services.appinfo.OS == 'Darwin') {
		$('omnisidebar_coloroption').removeAttribute('hidden');
		$('omnisidebar_coloroptionTwin').removeAttribute('hidden');
	}
};
