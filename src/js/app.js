Ext.regApplication({
	name: 'IOrders',
	viewport: {xtype: 'panel', fullscreen: true},
	launch: function() {
		Ext.Interaction.controller = 'Main';
	}
});