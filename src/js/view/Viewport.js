var Viewport = Ext.extend(Ext.Panel , {
	layout: 'card',
	fullscreen: true,
	anims: {
		back: {type: 'slide', duration: 500, direction: 'right'}
	},
	cardSwitchAnimation: {type: 'slide', duration: 500, direction: 'left'},
	onCardSwitch: function(newC, oldC, newIndex, animated) {
		Viewport.superclass.onCardSwitch.apply(this, arguments);
		if(oldC) {
			this.remove(oldC);
			oldC.destroy();
		}
	}
});
Ext.reg('viewport', Viewport);