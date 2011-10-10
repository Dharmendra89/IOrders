Ext.regController('SaleOrder', {
	
	onBackButtonTap: function(options) {
		Ext.Msg.confirm (
			'Вопрос',
			'Действительно нужно вернуться назад? Несохраненные данные будут потеряны',
			function(b) {
				if (b=='yes')
					IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
			}
		);
	},
	
	onSaveButtonTap: function(options) {
		
		var view = options.view;
		var offerStore = view.productStore;
		var saleOrderPosStore = Ext.getStore('SaleOrderPosition');
		
		offerStore.clearFilter(true);
		var offerProducts = offerStore.getUpdatedRecords();
		
		Ext.each(offerProducts, function(product) {
			saleOrderPosStore.add(Ext.ModelMgr.create(Ext.apply({
				saleorder: view.saleOrder.getId()
				}, product.data), 'SaleOrderPosition'
			));
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
		
		if(view.isShowSaleOrder) {
			
			view.productStore.filtersSnapshot = view.productStore.filters.items;
			view.productStore.clearFilter(true);
			view.productStore.filter(view.productStore.volumeFilter);
			
			view.productCategoryList.deselect(
				view.productCategoryList.selectionSnaphot = view.productCategoryList.getSelectedRecords()
			);
			
			view.offerCategoryStore.remoteFilter = false;
			view.offerCategoryStore.filter(new Ext.util.Filter({
			    filterFn: function(item) {
			    	return view.productStore.findExact('category', item.get('category')) > -1 ? true : false;
			    }
			}));
			
		} else {
			
			view.offerCategoryStore.clearFilter();
			
			view.productCategoryList.getSelectionModel().select(
				view.productCategoryList.selectionSnaphot
			);
			
			view.productStore.clearFilter(true);
			view.productStore.filter(view.productStore.filtersSnapshot);
			view.productStore.filtersSnapshot = false;
			
		}
		
		view.productCategoryList.scroller.scrollTo({y: 0});
		view.productList.scroller.scrollTo ({y:0});
		
		view.setLoading(false);
		
	},
	
	onListItemTap: function(options) {
		
		var listEl = options.list.getEl();
		
		if(listEl.hasCls('x-product-category-list')) {
			
			Ext.dispatch(Ext.apply(options, {action: 'onProductCategoryListItemTap'}));
			
		} else if(listEl.hasCls('x-deps-list')) {
			
			var oldCard = IOrders.viewport.getActiveItem();
			
			var newCard = Ext.create({
				xtype: 'saleorderview',
				saleOrder: options.saleOrder,
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
				filters: [{property: 'customer', value: options.saleOrder.get('customer')}],
				volumeFilter: new Ext.util.Filter({
					filterFn: function(item) {
						return item.get('volume') > 0;
				    }
				})
			});
			
			var saleOrderPositionStore = createStore('SaleOrderPosition', {
				remoteFilter: true,
				filters: [{property: 'saleorder', value: options.saleOrder.getId()}]
			});
			
			
			newCard.productList = newCard.productPanel.add({
				xtype: 'offerproductlist', store: newCard.productStore
			});
			
			newCard.productPanel.doLayout();
			
			newCard.productStore.load({
				limit: 0,
				callback: function(r, o, s) {
					
					if (s) {
						
						newCard.productStore.remoteFilter = false;
						
						saleOrderPositionStore.load({
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
									
									newCard.productStore.filter(newCard.productStore.volumeFilter);
									oldCard.setLoading(false);
									IOrders.viewport.setActiveItem(newCard);
									
								}
							}
						});
					}
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
		
		options.list.scroller.disable();
		
		!oldVolume && (oldVolume = 0);
		options.event.direction === 'left' && (sign = -1);
		
		newVolume = oldVolume + sign * factor;
		newVolume < 0 && (newVolume = 0);
		
		var newCost = newVolume * parseInt(rec.get('rel')) * parseFloat(rec.get('price'));
		
		rec.editing=true;
		
		rec.set('volume', newVolume);		
		rec.set('cost', newCost.toFixed(2));
		
		rec.editing=false;
		
		Ext.dispatch(Ext.apply(options, {
			action: 'calculateTotalCost',
			record: rec,
			priceDifference: newCost - oldCost
		}));
		
		Ext.defer (function (idx)
			{
				this.refreshNode(idx);
				this.scroller.enable();
			},
			150, options.list, [options.idx]
		);
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
		
		view.setLoading(true);
		
		Ext.apply(options, {action: 'addOfferProductList', view: view, categoryRec: rec});
		
		Ext.defer(Ext.dispatch, 100, this, [options]);
	},

	addOfferProductList: function(options) {
		
		var rec = options.categoryRec,
			view = options.view,
		    productStore = view.productStore,
		    filters = []
		;
		
		productStore.clearFilter(true);
		
		rec && filters.push({
			property: 'category',
			value: rec.get('category')
		});
		
		view.isShowSaleOrder && filters.push(productStore.volumeFilter);
		
		productStore.filter(filters);
		
		view.productList.scroller.scrollTo ({y:0});
		
		view.setLoading(false);
		
		//view.productList.mon(view.productList.el, 'tap', view.onListHeaderTap, view, {
		//	delegate: '.x-list-header'
		//});
	}
});