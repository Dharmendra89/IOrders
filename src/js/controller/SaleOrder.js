Ext.regController('SaleOrder', {
	onBackButtonTap: function(options) {
		IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onSaveButtonTap: function(options) {
		var view = options.view;
		var offerStore = Ext.getStore('Offer');
		var saleOrderPosStore = Ext.getStore('SaleOrderPosition');
		offerStore.clearFilter(true);
		var offerProducts = offerStore.getUpdatedRecords();
		Ext.each(offerProducts, function(product) {
			saleOrderPosStore.add(Ext.ModelMgr.create(Ext.apply({saleorder: view.saleOrder.getId()}, product.data), 'SaleOrderPosition'));
		});
		saleOrderPosStore.sync();
		saleOrderPosStore.removeAll();
		offerStore.removeAll();
		Ext.dispatch(Ext.apply(options, {
			action: 'onBackButtonTap'
		}));
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
			var oldCard = IOrders.viewport.getActiveItem();
			var newCard = Ext.create({
				xtype: 'saleorderview', saleOrder: options.saleOrder,
				ownerViewConfig: {
					xtype: 'navigatorview',
					expandable: oldCard.expandable,
					isObjectView: oldCard.isObjectView,
					isSetView: oldCard.isSetView,
					objectRecord: oldCard.objectRecord,
					tableRecord: oldCard.tableRecord,
					ownerViewConfig: oldCard.ownerViewConfig
				}
			});
			oldCard.setLoading(true);
			Ext.getStore('Offer').remoteFilter = false;
			Ext.getStore('Offer').load({limit: 0, filters: [{property: 'customer', value: options.saleOrder.get('customer')}], callback: function() {
				oldCard.setLoading(false);
				IOrders.viewport.setActiveItem(newCard);
			}});
		}
	},
	onListItemSwipe: function(options) {
		var rec = options.list.getRecord(options.item);
		var oldVolume = parseInt(rec.get('volume'));
		var newVolume = 0;
		var factor = parseInt(rec.get('factor'));
		var sign = 1;
		!oldVolume && (oldVolume = 0);
		options.event.direction === 'left' && (sign = -1);
		newVolume = oldVolume + sign * factor;
		newVolume < 0 && (newVolume = 0);
		rec.set('volume', newVolume);
		Ext.get(options.item).down('.volume').dom.innerHTML = newVolume;
		Ext.dispatch(Ext.apply(options, {
			action: 'calculateTotalPrice',
			record: rec,
			priceDifference: newVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price')) 
					- oldVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price'))
		}));
	},
	calculateTotalPrice: function(options) {
		var view = options.list.up('saleorderview');
		var bottomToolbar = view.getDockedComponent('bottomToolbar');

		var newTotalPrice = parseFloat(view.saleOrder.get('totalPrice')) + options.priceDifference;
		bottomToolbar.setTitle(bottomToolbar.titleTpl.apply({totalPrice: newTotalPrice.toFixed(2)}));
		view.saleOrder.set('totalPrice', newTotalPrice.toFixed(2));
		//TODO
		var productCategoryRecord = Ext.getStore('Category').getById(options.record.get('category'));
		productCategoryRecord.set('totalPrice', (parseFloat(productCategoryRecord.get('totalPrice')) + options.priceDifference).toFixed(2));
	},
	onProductCategoryListItemTap: function(options) {
		var list = options.list;
		var rec = list.getRecord(options.item);
		var view = list.up('saleorderview');
		var productStore = Ext.getStore('Offer');
		productStore.clearFilter(true);
		console.log(productStore.getCount());
		productStore.filter([
			{property: 'category', value: rec.getId()}
		]);
		console.log(productStore.getCount());
		view.productPanel.removeAll(true);
		view.productList = view.productPanel.add({
			xtype: 'productlist', store: productStore
		});
		view.productPanel.doLayout();
		view.productList.mon(view.productList.el, 'tap', view.onListHeaderTap, view, {
			delegate: '.x-list-header'
		});
	}
});