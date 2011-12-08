Ext.regController('SaleOrder', {
	
	onBackButtonTap: function(options) {
		var s = options.view.productStore,
			back = function () {
				IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
			}
		;
		
		if (s && (s.snapshot && s.snapshot.filterBy(s.filterDirty).items.length || options.view.saleOrder.dirty)) Ext.Msg.confirm (
			'Внимание, вопрос',
			'Действительно нужно вернуться назад? Если да, то несохраненные данные будут потеряны',
			function(b) {
				if (b=='yes'){
					back();
				}
			}
		); else back();
	},
	
	onShowCustomerButtonTap: function(options) {
		
		var customer = options.view.customerRecord;

		Ext.Msg.alert('', 'Клиент: ' + customer.get('name').replace(/"/g, '') + '<br/>' +'Адрес: ' + customer.get('address'));
	},
	
	onSaveButtonTap: function(options) {
		
		Ext.dispatch(Ext.apply(options, {
			action: 'saveOffer'
		}));
		
		Ext.dispatch(Ext.apply(options, {
			action: 'onBackButtonTap'
		}));
	},
		
	saveOffer: function(options) {
		var view = options.view,
		    offerStore = view.productStore,
		    saleOrderPosStore = view.saleOrderPositionStore
		;
		
		//offerStore.clearFilter(true);
		
		Ext.each(offerStore.getUpdatedRecords(), function(rec) {
			var posRec = saleOrderPosStore.getAt(saleOrderPosStore.findExact('product', rec.get('product')));
			
			if (!posRec) {
				saleOrderPosStore.add (Ext.ModelMgr.create(Ext.apply({
							saleorder: view.saleOrder.getId()
						}, rec.data
					), 'SaleOrderPosition'
				));
			} else {
				posRec.editing = true;
				posRec.set('volume', rec.get('volume'));
				posRec.set('cost', rec.get('cost'));
				posRec.editing = false;
			}
			
			rec.commit(true);
			
		});
		
		var tc = saleOrderPosStore.sum('cost').toFixed(2);
		
		view.saleOrder.set ('totalCost', tc);
		saleOrderPosStore.sync();
		
		view.saleOrder.save();
		view.saleOrder.commit(true);
		
		if (view.bonusCost){
			view.customerRecord.set (
				'bonusCost',
				(view.bonusCost - tc).toFixed(2)
			);
			view.customerRecord.save();
			view.customerRecord.commit();
		}

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
			
		}
		
		view.productCategoryList.scroller && view.productCategoryList.scroller.scrollTo({y: 0});
		view.productList.scroller.scrollTo ({y:0});
		view.productList.el.toggleCls('expandable');
		view.productCategoryList.el.toggleCls('expandable');
		
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
                    layout: IOrders.newDesign ? {type: 'hbox', pack: 'justify', align: 'stretch'} : 'fit',
                    extendable: oldCard.extendable,
                    isObjectView: oldCard.isObjectView,
                    isSetView: oldCard.isSetView,
                    objectRecord: oldCard.objectRecord,
                    tableRecord: oldCard.tableRecord,
                    ownerViewConfig: oldCard.ownerViewConfig
                }
			});
			
			var failureCb = function (n) {
				Ext.Msg.alert ('Ошибка', 'Не получилось загрузить список '+n, function() {
					oldCard.setLoading(false);
				});
			};
			
			oldCard.setLoading(true);
			
			newCard.offerCategoryStore.load({
				limit: 0,
				callback: function(r, o, s){
					
					if (!s) failureCb('категорий'); else {
						
						newCard.productStore = createStore('Offer', {
							remoteFilter: true,
							remoteSort: true,
							getGroupString: function(rec) {
								return rec.get('firstName');
							},
							sorters: [{property: 'firstName', direction: 'ASC'}, {property: 'name', direction: 'ASC'}],
							filters: [{property: 'customer', value: options.saleOrder.get('customer')}],
							volumeFilter: new Ext.util.Filter({
								filterFn: function(item) {
									return item.get('volume') > 0;
								}
							})
						});
						
						var saleOrderPositionStore = newCard.saleOrderPositionStore = createStore('SaleOrderPosition', {
							remoteFilter: true,
							filters: [{
								property: 'saleorder',
								value: options.saleOrder.getId()
							}]
						});

						newCard.productList = newCard.productPanel.add(Ext.apply(offerProductList, {store: newCard.productStore}));

						newCard.productStore.load({
							limit: 0,
							callback: function(r, o, s) {
								
								if (s) {
									
									newCard.productPanel.doLayout(); 	
									newCard.productStore.remoteFilter = false;
									
									saleOrderPositionStore.load({
										limit: 0,
										callback: function(records, operation, s) {
											if(s) {
												
												Ext.each(records, function(rec, idx, all) {
													var offerRec = newCard.productStore.findRecord('product', rec.get('product'));
													
													if (offerRec) {
														
														offerRec.editing = true;
														offerRec.set('volume', rec.get('volume'));
														offerRec.set('cost', rec.get('cost'));
														offerRec.commit(true);
														
													}
													
												});
												
												var customer = newCard.saleOrder.get('customer');
												
												if (customer) {
													Ext.ModelMgr.getModel('Customer').load(customer, {
														success: function(rec) {
															newCard.customerRecord = rec;
															if (newCard.saleOrder.get('isBonus')){
																newCard.bonusCost = rec.get('bonusCost') + newCard.saleOrder.get('totalCost');
															};
															Ext.dispatch({
																controller: 'SaleOrder',
																action: 'calculateTotalCost',
																view: newCard
															});
														}
													});
												} else {
													console.log ('SaleOrder: empty customer');
												}
												
												newCard.productStore.filter(newCard.productStore.volumeFilter);
												oldCard.setLoading(false);
												IOrders.viewport.setActiveItem(newCard);
												
											} else failureCb('товаров');
										}
									});
								} else failureCb('остатков');
							}
						});
					}
				}
			});
			
		};
	},
	
	onListItemSwipe: function(options) {

		var rec = options.list.store.getAt(options.idx),
			volume = parseInt(rec.get('volume') ? rec.get('volume') : '0'),
			factor = parseInt(rec.get('factor')),
			sign = options.event.direction === 'left' ? -1 : 1
		;

		!volume && (volume = 0);

		Ext.dispatch (Ext.apply(options, {
			action: 'setVolume',
			volume: volume + sign * factor,
			rec: rec
		}));

	},
	
	setVolume: function (options) {
		var volume = options.volume;
		
		var rec = options.rec,
			oldCost = rec.get('cost'),
		    view = options.list.up('saleorderview')
		;
		
		oldCost > 0 || (oldCost = 0);
		
//		options.list.scroller.disable();
		
		volume < 0 && (volume = 0);
		
		var cost = volume * parseInt(rec.get('rel')) * parseFloat(rec.get('price'));
		
		rec.editing=true;
		rec.set('volume', volume);		
		rec.set('cost', cost.toFixed(2));
		rec.editing = false;
		
		Ext.dispatch(Ext.apply(options, {
			action: 'saveOffer',
			view: view
		}));
		
		Ext.dispatch(Ext.apply(options, {
			action: 'calculateTotalCost'
		}));
		
		var iel = Ext.get(options.item); 
		iel.down('.cost').dom.innerHTML = rec.get('cost');
		iel.down('.volume').dom.innerHTML = rec.get('volume');
		
//		options.list.scroller.enable();
		
	},
	
	calculateTotalCost: function(options) {
		
		var view = options.view,
			btb = view.getDockedComponent('bottomToolbar'),
			tc = view.saleOrder.get('totalCost') || 0
		;
		
		btb.getComponent('ShowCustomer').setText( btb.titleTpl.apply ({
			totalCost: tc.toFixed(2),
			bonusRemains: view.saleOrder.get('isBonus') ? (view.bonusCost - tc).toFixed(2): undefined
		}));
	},
	
	onProductCategoryListItemTap: function(options) {
		
		var list = options.list,
		    rec = list.getRecord(options.item),
		    view = list.up('saleorderview')
		;
		
		view.setLoading(true);
		
		Ext.apply(options, {action: 'addOfferProductList', view: view, categoryRec: rec});
		
		Ext.defer(Ext.dispatch, 100, this, [options]);
	},

	onProductListItemLongTap: function(options) {

		var list = options.list,
			item = options.item,
			iel = Ext.get(item),
			productRec = list.getRecord(item)
		;

		iel.addCls('editing');

		this.pricePanel = this.pricePanel || Ext.create({
			xtype: 'panel',
			centered: true,
			floating: true,
			layout: 'fit',
			width: list.getWidth() / 2,
			height: list.getHeight() / 2,
			items: [{
				xtype: 'list',
				itemId: 'priceList',
				itemTpl: getItemTplMeta('Price', {useDeps: false, groupField: 'category', filterObject: {modelName: 'Product'}}).itemTpl,
				store: createStore('Price', Ext.apply(getSortersConfig('Price', {})))
			}],
			listeners: {
				hide: function() {
					this.iel.removeCls('editing');
				}
			}
		});

		this.pricePanel.iel = iel;

		this.pricePanel.getComponent('priceList').store.load({
			filters: [{property: 'product', value: productRec.get('product')}],
			callback: function() {
				this.pricePanel.show();
			},
			scope: this
		});
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
		
		if (view.modeActive)
			Ext.dispatch (Ext.apply (options, {action: 'toggleActiveOn'}));
		
		view.setLoading(false);
		
	},
	
	onToggleActiveButtonTap: function( options ) {
		var view = options.view,
			btn = options.btn,
			t = btn.text
		;
		
		view.modeActive = view.modeActive ? false : true;
		
		btn.setText( btn.text2 );
		btn.text2 = t;
		
		Ext.dispatch ({
			controller: 'SaleOrder',
			action: 'toggleActive' + (view.modeActive ? 'On' : 'Off'),
			view: view
		});
	},
	
	toggleActiveOn: function( options ) {
		var view = options.view,
			doms = view.productList.getEl().query('.x-list-item .active')
		;
		
		Ext.each (doms, function(dom) {
			var el = Ext.get(dom);
			
			el.up('.x-list-item').addCls('active').up('.x-list-group-items').addCls('hasActive');
		});
	},
	
	toggleActiveOff: function( options ) {
		var view = options.view,
			doms = view.productList.getEl().query('.x-list-group-items')
		;
		
		Ext.each (doms, function(dom) {
			var el = Ext.get(dom);
			
			el.removeCls('hasActive');
		});
	}
	
});