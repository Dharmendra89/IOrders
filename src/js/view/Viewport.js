var Viewport = Ext.extend(Ext.Panel , {
	layout: 'card',
	fullscreen: true,
	cardSwitchAnimation: {type: 'slide', duration: 500},
	setActiveItem: function(comp, anim) {
		Viewport.superclass.setActiveItem.apply(this, arguments);
	},
	initComponent: function() {
		Ext.apply(this.listeners, {
			cardswitch: function(panel, newC, oldC) {
				oldC.destroy();
			}
		}); 
		Viewport.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('viewport', Viewport);