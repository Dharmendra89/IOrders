var Viewport = Ext.extend(Ext.Panel , {
	/**
	 * Config
	 */
	layout: 'card', fullscreen: true,
	anims: {
		back: {type: 'slide', duration: 500, direction: 'right'},
		home: {type: 'flip', duration: 500, direction: 'right'}
	},
	cardSwitchAnimation: {type: 'slide', duration: 500, direction: 'left'},
	/**
	 * Overridden
	 */
	onCardSwitch: function(newC, oldC, newIndex, animated) {

		Viewport.superclass.onCardSwitch.apply(this, arguments);

		if(oldC) {
			this.remove(oldC);
			oldC.destroy();
		}
	}/*,
	layoutOrientation: function(orientation, w, h) {		

		Viewport.superclass.layoutOrientation.apply(this, arguments);

		var card = this.getActiveItem();
		card && card.layoutOrientation.apply(card, arguments);
	}*/
});
Ext.reg('viewport', Viewport);