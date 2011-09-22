Ext.regController('SaleOrder', {
	onBackButtonTap: function(options) {
		var view = options.view;
		IOrders.viewport.setActiveItem(Ext.create(view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onListItemTap: function(options) {
		var listEl = options.list.getEl();
		if(listEl.hasCls('x-product-category-list')) {
			Ext.dispatch(Ext.apply(options, {action: 'onProductCategoryListItemTap'}));
		} else if(listEl.hasCls('x-buttons-list')) {
			var target = Ext.get(options.event.target);
			if(target.hasCls('x-button')) {
				/*
				 * Создание нового заказа. Добавление позиций в заказ
				 */
				if(target.hasCls('add')) {
				}
				/*
				 * Просмотр заказа. Просмотр позиций в заказе
				 */
			} else {
				rec = options.list.getRecord(options.item);
				/*
				 * Сохранить заказ
				 */
				
			}
			//var oldCard = IOrders.viewport.getActiveItem();
			var newCard = Ext.create({xtype: 'saleorderview', saleOrder: options.saleOrder});
			IOrders.viewport.setActiveItem(newCard);
		}
	},
	onProductCategoryListItemTap: function(options) {
		var list = options.list;
		var rec = list.getRecord(options.item);
		var view = list.up('saleorderview');
		var productStore = Ext.getStore('Product');
		productStore.clearFilter(true);
		productStore.filter([
			{property: 'category', value: rec.getId()},
			{property: 'customer', value: Ext.getStore('SaleOrder').getById(view.saleOrder.getId()).get('customer')}
		]);
		view.productPanel.removeAll(true);
		view.productPanel.add({xtype: 'list', store: productStore, itemTpl: '{name}', ownerConfig: {}});
		view.productPanel.doLayout();
	}
});