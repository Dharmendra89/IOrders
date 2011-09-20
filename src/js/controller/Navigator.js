Ext.regController('Navigator', {
	onBackTap: function(options) {
		var view = options.view;
		IOrders.viewport.setActiveItem(Ext.create(view.ownerViewConfig));
	},
	onButtonListItemTap: function(options) {
		var rec = options.list.getRecord(options.item);
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create({
			xtype: 'navigatorview', isSetView: true,
			objectRecord: oldCard.objectRecord,
			tableRecord: rec.get('table_id'),
			ownerViewConfig: {
				xtype: 'navigatorview',
				isObjectView: oldCard.isObjectView,
				isSetView: oldCard.isSetView,
				objectRecord: oldCard.objectRecord,
				tableRecord: oldCard.tableRecord,
				ownerViewConfig: oldCard.ownerViewConfig
			}
		});
		IOrders.viewport.setActiveItem(newCard);
	},
	onTableListItemTap: function(options) {
		var rec = options.list.getRecord(options.item);
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create({
			xtype: 'navigatorview', isObjectView: true,
			objectRecord: rec,
			ownerViewConfig: {
				xtype: 'navigatorview',
				isObjectView: oldCard.isObjectView,
				isSetView: oldCard.isSetView,
				objectRecord: oldCard.objectRecord,
				tableRecord: oldCard.tableRecord,
				ownerViewConfig: oldCard.ownerViewConfig
			}
		});
		IOrders.viewport.setActiveItem(newCard);
	}
});