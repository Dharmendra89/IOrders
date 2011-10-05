Ext.regController('SaleOrder', {
	onBackButtonTap: function(options) {

		IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onSaveButtonTap: function(options) {

		var view = options.view;
		var offerStore = view.productStore;
		var saleOrderPosStore = Ext.getStore('SaleOrderPosition');
		var offerProducts = offerStore.getUpdatedRecords();
		
		offerStore.clearFilter(true);
		
		Ext.each(offerProducts, function(product) {
			saleOrderPosStore.add(Ext.ModelMgr.create(Ext.apply({saleorder: view.saleOrder.getId()}, product.data), 'SaleOrderPosition'));
		});

		saleOrderPosStore.sync();
		saleOrderPosStore.removeAll();

		offerStore.removeAll();

		Ext.dispatch(Ext.apply(options, {action: 'onBackButtonTap'}));
	},
	onShowSaleOrderButtonTap: function(options) {
		
		var view = options.view;
		view.isShowSaleOrder = view.isShowSaleOrder ? false : true;
		view.showSaleOrderBtn.setText(view.isShowSaleOrder ? 'Показать все товары' : 'Показать заказ');

		view.productCategoryList.deselect(view.productCategoryList.getSelectedRecords());
		
		view.productStore.clearFilter(true);
		if(view.isShowSaleOrder) {

			view.productStore.filter(new Ext.util.Filter({
			    filterFn: function(item) {
			        return item.get('volume') > 0;
			    }
			}));

			view.offerCategoryStore.remoteFilter = false;
			view.offerCategoryStore.filter(new Ext.util.Filter({
			    filterFn: function(item) {
			    	return view.productStore.findExact('category', item.get('category')) > -1 ? true : false;
			    }
			}));
		} else {

			view.offerCategoryStore.remoteFilter = true;
			view.offerCategoryStore.clearFilter();
			//view.offerCategoryStore.load({limit: 0, filters: [{property: 'customer', value: view.saleOrder.get('customer')}]});
		}

		view.productPanel.removeAll(true);
		view.productPanel.doLayout();
	},
	onListItemTap: function(options) {
		
		var listEl = options.list.getEl();
		
		if(listEl.hasCls('x-product-category-list')) {
		
			Ext.dispatch(Ext.apply(options, {action: 'onProductCategoryListItemTap'}));
			
		} else if(listEl.hasCls('x-deps-list')) {

			var oldCard = IOrders.viewport.getActiveItem();
			var newCard = Ext.create({
				xtype: 'saleorderview', saleOrder: options.saleOrder,
				ownerViewConfig: {
					xtype: 'navigatorview',
					extendable: oldCard.extendable,
					isObjectView: oldCard.isObjectView,
					isSetView: oldCard.isSetView,
					objectRecord: oldCard.objectRecord,
					tableRecord: oldCard.tableRecord,
					ownerViewConfig: oldCard.ownerViewConfig
				}
			});
			
			oldCard.setLoading(true);
			newCard.productStore = createStore('Offer', {
				remoteFilter: false,
				getGroupString: function(rec) {
					return rec.get('firstName');
				},
				sorters: [{property: 'firstName', direction: 'ASC'}],
				filters: [{property: 'customer', value: options.saleOrder.get('customer')}]
			});
			newCard.productStore.load({limit: 0, callback: function() {oldCard.setLoading(false);IOrders.viewport.setActiveItem(newCard);}});
		};
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
			action: 'calculateTotalCost',
			record: rec,
			priceDifference: newVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price')) 
					- oldVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price'))
		}));
	},
	
	calculateTotalCost: function(options) {

		var view = options.list.up('saleorderview');
		var bottomToolbar = view.getDockedComponent('bottomToolbar');
		var newtotalCost = parseFloat(view.saleOrder.get('totalCost')) + options.priceDifference;

		bottomToolbar.setTitle(bottomToolbar.titleTpl.apply({totalCost: newtotalCost.toFixed(2)}));
		view.saleOrder.set('totalCost', newtotalCost.toFixed(2));
		//TODO
		var productCategoryRecord = view.offerCategoryStore.findRecord('category',options.record.get('category'));
		productCategoryRecord.set('totalCost', (parseFloat(productCategoryRecord.get('totalCost')) + options.priceDifference).toFixed(2));
	},
	
	onProductCategoryListItemTap: function(options) {

		var list = options.list;
		var rec = list.getRecord(options.item);
		var view = list.up('saleorderview');
		var productStore = view.productStore;

		productStore.clearFilter(true);
		
		var filters = [{property: 'category', value: rec.get('category')}];
		view.isShowSaleOrder && filters.push(new Ext.util.Filter({
		    filterFn: function(item) {
		        return item.get('volume') > 0;
		    }
		}));
		productStore.filter(filters);

		view.productPanel.removeAll(true);
		view.productList = view.productPanel.add({
			xtype: 'offerproductlist', store: productStore
		});
		view.productPanel.doLayout();

		view.productList.mon(view.productList.el, 'tap', view.onListHeaderTap, view, {
			delegate: '.x-list-header'
		});
	}
});