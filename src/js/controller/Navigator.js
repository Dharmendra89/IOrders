Ext.regController('Navigator', {
	onBackTap: function(options) {
		var view = options.view;
		IOrders.viewport.setActiveItem(view.ownerViewConfig);
	},
	onButtonListItemTap: function(options) {
		
		IOrders.viewport.setActiveItem(view.ownerViewConfig);
	}
});