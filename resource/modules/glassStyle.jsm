moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('glassStyle', 'glass/glass');
	styleAid.load('glassStyleFF', 'glass/glass-ff5');
	styleAid.load('glassStyleGeneral', 'glass/glass-general');
	styleAid.load('glassStyleNative', 'glass/glass-nativeSidebars');
	styleAid.load('glassStyleFeed', 'glass/glass-feedbar');
	styleAid.load('glassStyleUpdScanner', 'glass/glass-updscanner');
	styleAid.load('glassStyleSimilarWeb', 'glass/glass-similarweb');
	styleAid.load('glassStyleDelicious', 'glass/glass-delicious');
	styleAid.load('glassStyleConsole', 'glass/glass-console');
	styleAid.load('glassStyleDMT', 'glass/glass-dmt');
	styleAid.load('glassStyleAddons', 'glass/glass-addons');
	styleAid.load('glassStyleStylish', 'glass/glass-stylish');
	styleAid.load('glassStyleDOMInspector', 'glass/glass-domi');
	styleAid.load('glassStylePocket', 'glass/glass-pocket');
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('glassStyle');
	styleAid.unload('glassStyleFF');
	styleAid.unload('glassStyleGeneral');
	styleAid.unload('glassStyleNative');
	styleAid.unload('glassStyleFeed');
	styleAid.unload('glassStyleUpdScanner');
	styleAid.unload('glassStyleSimilarWeb');
	styleAid.unload('glassStyleDelicious');
	styleAid.unload('glassStyleConsole');
	styleAid.unload('glassStyleDMT');
	styleAid.unload('glassStyleAddons');
	styleAid.unload('glassStyleStylish');
	styleAid.unload('glassStyleDOMInspector');
	styleAid.unload('glassStylePocket');
};
