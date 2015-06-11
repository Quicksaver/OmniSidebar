// VERSION 1.0.0

Services.scriptloader.loadSubScript("resource://omnisidebar/modules/utils/content.js", this);

this.omnisidebar = this.__contentEnvironment;
delete this.__contentEnvironment;

this.omnisidebar.objName = 'omnisidebar';
this.omnisidebar.objPathString = 'omnisidebar';
this.omnisidebar.init();
