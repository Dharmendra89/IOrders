Ext.regController('SaleOrder', {
	onBackButtonTap: function(options) {
		IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onSaveButtonTap: function(options) {

		var view = options.view;
		var offerStore = view.productStore;
		var saleOrderPosStore = Ext.getStore('SaleOrderPosition');
		
		offerStore.clearFilter(true);
		var offerProducts = offerStore.getUpdatedRecords();
		
		Ext.each(offerProducts, function(product) {
			saleOrderPosStore.add(Ext.ModelMgr.create(Ext.apply({
				saleorder: view.saleOrder.getId(), 
				}, product.data), 'SaleOrderPosition'));
		});
		
		view.saleOrder.save();

		saleOrderPosStore.sync();
		saleOrderPosStore.removeAll();

		offerStore.removeAll();

		Ext.dispatch(Ext.apply(options, {action: 'onBackButtonTap'}));
	},
	onShowSaleOrderButtonTap: function(options) {
		
		var view = options.view;
		view.setLoading(true);
		view.isShowSaleOrder = view.isShowSaleOrder ? false : true;
		view.showSaleOrderBtn.setText(view.isShowSaleOrder ? 'Показать все товары' : 'Показать заказ');

		view.productCategoryList.deselect(view.productCategoryList.getSelectedRecords());
		
		view.productStore.clearFilter(true);
		view.productCategoryList.scroller.scrollTo({x: 0, y: 0});
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
			
			Ext.dispatch(Ext.apply(options, {action: 'addOfferProductList', view: view}));
		} else {

			view.offerCategoryStore.remoteFilter = true;
			view.offerCategoryStore.clearFilter();

			view.productPanel.removeAll(true);
			view.productPanel.doLayout();
		}
		view.setLoading(false);
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
				remoteFilter: true,
				remoteSort: true,
				getGroupString: function(rec) {
					return rec.get('firstName');
				},
				sorters: [{property: 'firstName', direction: 'ASC'}],
				filters: [{property: 'customer', value: options.saleOrder.get('customer')}]
			});
			
			var saleOrderPositionStore = createStore('SaleOrderPosition', {
				remoteFilter: true,
				filters: [{property: 'saleorder', value: options.saleOrder.getId()}]
			});

			newCard.productStore.load({
				limit: 0,
				callback: function(r, o, s) {

					s && saleOrderPositionStore.load({
						limit: 0,
						callback: function(records, operation, s) {

							if(s) {
								Ext.each(records, function(rec, idx, all) {
									var offerRec = newCard.productStore.findRecord('product', rec.get('product'));
									if (offerRec) {
										offerRec.set('volume', rec.get('volume'));
										offerRec.set('cost', rec.get('cost'));
										Ext.dispatch({
											controller: 'SaleOrder',
											action: 'calculateTotalCost',
											view: newCard,
											record: offerRec,
											priceDifference: offerRec.get('cost')
										});
									}
								});

								oldCard.setLoading(false);
								IOrders.viewport.setActiveItem(newCard);
							}
						}
					});
				}
			});
		};
	},
	
	onListItemSwipe: function(options) {

		var rec = options.list.getRecord(options.item);
		var oldVolume = parseInt(rec.get('volume') ? rec.get('volume') : '0');
		var oldCost = parseFloat(rec.get('cost') ? rec.get('cost') : '0');
		var newVolume = 0;
		var factor = parseInt(rec.get('factor'));
		var sign = 1;
		
		!oldVolume && (oldVolume = 0);
		options.event.direction === 'left' && (sign = -1);
		newVolume = oldVolume + sign * factor;
		newVolume < 0 && (newVolume = 0);
		
		rec.set('volume', newVolume);
		
		var newCost = newVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price'));
		rec.set('cost', newCost.toFixed(2));
		
		options.list.refreshNode(options.idx);
		
		Ext.dispatch(Ext.apply(options, {
			action: 'calculateTotalCost',
			record: rec,
			priceDifference: newCost - oldCost
		}));
	},
	
	calculateTotalCost: function(options) {

		var view = options.list ? options.list.up('saleorderview') : options.view;
		var bottomToolbar = view.getDockedComponent('bottomToolbar');
		var newtotalCost = parseFloat(view.saleOrder.get('totalCost')) + options.priceDifference;

		bottomToolbar.setTitle(bottomToolbar.titleTpl.apply({totalCost: newtotalCost.toFixed(2)}));
		view.saleOrder.set('totalCost', newtotalCost.toFixed(2));
		//TODO
		var productCategoryRecord = view.offerCategoryStore.findRecord('category', options.record.get('category'));
		productCategoryRecord.set('totalCost', (parseFloat(productCategoryRecord.get('totalCost')) + options.priceDifference).toFixed(2));
	},
	
	onProductCategoryListItemTap: function(options) {

		var list = options.list;
		var rec = list.getRecord(options.item);
		var view = list.up('saleorderview');
		
		Ext.dispatch(Ext.apply(options, {action: 'addOfferProductList', view: view, categoryRec: rec}));
	},

	addOfferProductList: function(options) {

		var rec = options.categoryRec;
		var view = options.view;
		var productStore = view.productStore;
		view.productPanel.setLoading(true);
		productStore.remoteFilter = false;
		productStore.clearFilter(true);
		
		var filters = [];
		rec && filters.push({property: 'category', value: rec.get('category')});
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
		view.productPanel.setLoading(false);
		view.productPanel.doLayout();

		view.productList.mon(view.productList.el, 'tap', view.onListHeaderTap, view, {
			delegate: '.x-list-header'
		});
	}
});