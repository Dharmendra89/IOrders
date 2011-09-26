var SaleOrderView = Ext.extend(AbstractView, {
	layout: {
		type: 'hbox',
		pack: 'justify',
		align: 'stretch'
	},
	/**
	 * Own
	 */
	createItems: function() {
		this.productCategoryList = Ext.create({
			xtype: 'list',
			cls: 'x-product-category-list',
			allowDeselect: false,
			flex: 1,
			store: Ext.getStore('Category'),
			itemTpl: getItemTpl('Category')
		});
		this.productCategoryBtn = Ext.create({
			xtype: 'button',
			hidden: Ext.is.Phone || Ext.Viewport.orientation == 'landscape',
			defaultText: 'Группы продуктов',
			text: 'Группы продуктов',
			handler: this.onProdCatButtonTap,
			scope: this
		});

		this.productPanel = Ext.create({
			xtype: 'panel',
			layout: 'fit',
			flex: 3
		});

		this.items = [this.productCategoryList, this.productPanel];

		this.dockedItems.push({
			id: 'bottomToolbar',
			xtype: 'toolbar',
			dock: 'bottom',
			titleTpl: new Ext.XTemplate(getItemTpl('SaleOrderBottomToolbar'))
		});

		this.dockedItems[0].items.push(this.productCategoryBtn);
	},
	onListHeaderTap: function(e, t) {
		var headerEl = Ext.get(t);
		var groupListItemsEl = headerEl.next();

		if (headerEl.hasCls('x-list-header-swap')) {
			groupListItemsEl = groupListItemsEl.down('.x-group-' + headerEl.dom.innerText.toLowerCase() + ' .x-list-group-items');
		}

		var durationValue = 30 * groupListItemsEl.dom.children.length;

		if (durationValue < 200) {
			durationValue = 200;
		} else if (durationValue > 500) {
			durationValue = 500;
		}

		if (groupListItemsEl.hasCls('x-hidden-display')) {
			var grpName = headerEl.getHTML();
			var closest = this.productList.getTargetEl().down('.x-group-' + grpName.toLowerCase());

			Ext.Anim.run(groupListItemsEl, new Ext.Anim({
				pList: this.productList,
				closest: closest,
				duration: durationValue,
				autoClear: true,
				from: {
					height: '0px'
				},
				before: function(el, c) {
					el.show();
					var targetHeight = el.getHeight(), parentHeight = c.pList.getHeight();
					if (targetHeight > parentHeight) {
						targetHeight = parentHeight;
					}
					this.to = {
						height: targetHeight + 'px'
					};
				},
				after: function(el, c) {
					c.closest && c.pList.scroller.scrollTo({
						x: 0,
						y: c.closest.getOffsetsTo(c.pList.scrollEl)[1]
					}, 1000);
					c.pList.updateOffsets();
				}
			}));

		} else if (groupListItemsEl.hasCls('x-list-group-items')) {
			Ext.Anim.run(groupListItemsEl, new Ext.Anim({
				headerEl: headerEl,
				pList: this.productList,
				duration: durationValue,
				to: {
					height: '0px'
				},
				autoClear: true,
				before: function(el, c) {
					var targetHeight = el.getHeight(), parentHeight = c.pList.getHeight();
					if (targetHeight > parentHeight) {
						targetHeight = parentHeight;
					}
					this.from = {
						height: targetHeight + 'px'
					};
				},
				after: function(el, c) {
					el.hide();
					if (c.headerEl.hasCls('x-list-header-swap')) {
						c.headerEl.hide();
					};
					c.pList.updateOffsets();
					c.pList.scroller.updateBoundary();
				}
			}));
		}

	},
	/**
	 * Handlers
	 */
	onProdCatButtonTap: function() {
		this.productCategoryList.showBy(this.productCategoryBtn, 'fade');
	},
	/**
	 * Overridden
	 */
	initComponent: function() {
		SaleOrderView.superclass.initComponent.apply(this, arguments);
	},
	layoutOrientation: function(orientation, w, h) {
		if (!Ext.is.Phone) {
			if (orientation == 'portrait') {
				this.productCategoryList.hide(false);
				this.productCategoryList.setFloating(true);
				this.productCategoryList.setHeight(400);
				this.productCategoryBtn.show(false);
			} else {
				this.productCategoryList.setFloating(false);
				this.productCategoryBtn.hide(false);
				this.productCategoryList.show(false);
				this.productCategoryList.setPosition(0, 0);
			}
		}
		SaleOrderView.superclass.layoutOrientation.apply(this, arguments);
	}
});
Ext.reg('saleorderview', SaleOrderView);

var OrderCreatePanel = Ext.extend(Ext.Panel, {
	createProductList: function(categoryId) {

		this.productList.mon(this.productList.el, 'tap', this.onListHeaderTap, this, {
			delegate: '.x-list-header'
		});
		this.setLoading(false);
		this.productList.updateOffsets();
		this.productList.scroller.updateBoundary();
	},
	onProdCatItemTap: function(selMod, recs) {
		if (recs.length > 0) {
			this.productCatButton.setText(recs[0].get('name'));
			this.productCatPanel.isFloating() && this.productCatPanel.hide();
			this.createProductList(recs[0].getId());
			this.saveOrderBtn.show();
			this.orderBar.setTitle(this.orderBar.titleTpl.apply({
				packageName: recs[0].get('packageName'),
				totalPrice: this.totalPrice
			}));
		} else {
			this.productCatButton.setText('Группы продуктов');
		}
	},
	onChangeDate: function(dp, date) {
		this.dateField.setValue(date.format('d-m-Y'));
	},
	onBtnDateTap: function(e, img) {
		this.saveAction.datePicker = this.saveAction.datePicker || new Ext.ux.DatePicker({
			floating: true,
			hidden: true,
			width: 300,
			height: 295,
			listeners: {
				scope: this,
				change: this.onChangeDate
			}
		});
		this.saveAction.datePicker.showBy(img);
		this.saveAction.datePicker.setValue(new Date().add(Date.DAY, 1));
	},
	onSaveOrderBtnTap: function() {
		if (this.totalPrice > 0) {
			this.dateField = this.dateField || Ext.create({
				xtype: 'Ext.ux.form.textwithbutton',
				btnIconSrc: 'resources/themes/images/default/pictos/locate.png',
				onBtnIconTap: this.onBtnDateTap,
				scope: this,
				name: 'toDate',
				label: 'Дата',
				value: new Date().add(Date.DAY, 1).format('d-m-Y')
			});
			this.saveAction = this.saveAction || new Ext.ActionSheet({
				items: [this.dateField, {
					xtype: 'togglefield',
					name: 'isCredit',
					label: 'В кредит'
				}, {
					xtype: 'togglefield',
					name: 'isDocuments',
					label: 'Нужны документы'
				}, {
					ui: 'comfirm',
					text: 'Сохранить',
					handler: this.saveOrder,
					scope: this
				}, {
					ui: 'comfirm',
					text: 'Отмена',
					handler: this.cancelSaveOrder,
					scope: this
				}, ]
			});
			this.saveAction.show();

		} else {
			Ext.Msg.alert('Не выбраны товары', 'Выберите товары для заказ', Ext.emptyFn);
		}
	},
	cancelSaveOrder: function() {
		this.saveAction.hide();
	},
	saveOrder: function() {
		this.saveAction.hide();
		this.setLoading({
			msg: 'Сохранение...'
		}, true);
		var data = {};
		for ( var i = 0; i < this.saveAction.items.getCount(); i++) {
			var item = this.saveAction.items.getAt(i);
			item.isField && (data[item.name] = item.getValue());
		}
		if (!this.newOrder) {
			this.newOrder = IOrders.stores.clientOrdersStore.add({
				isDocuments: data.isDocuments === 1 ? true : false,
				isCredit: data.isCredit === 1 ? true : false,
				toDate: data.toDate,
				customer: this.clientRecord.getId()
			})[0];
			IOrders.stores.clientOrdersStore.sync();
			IOrders.stores.clientOrdersStore.load({
				filter: {
					client: this.clientRecord.getId()
				},
				callback: this.saveOrderPosition,
				scope: this
			});
		} else {
			this.saveOrderPosition();
		}
	},
	saveOrderPosition: function() {
		var prodCategories = IOrders.stores.productCatStore.snapshot.getRange();
		for ( var i = 0; i < prodCategories.length; i++) {
			var rec = prodCategories[i];
			rec.products().sync({
				saleOrder: this.newOrder.getId()
			});
			rec.products().load({
				filter: {
					loadOne: true,
					customer: this.clientRecord.getId(),
					saleOrder: this.newOrder.getId(),
					category: rec.getId()
				},
				callback: function() {
					this.setLoading(false);
				},
				scope: this
			});
		}
	},
	onShowOrderBtnTap: function(btn) {
		btn.pressed = btn.pressed ? false : true;
		if (btn.pressed) {
			IOrders.stores.productCatStore.filterBy(function(category, id) {
				var products = category.products();
				products.filterBy(function(product) {
					if (product.get('volume') > 0) {
						return true;
					}
					return false;
				});
				if (products.getCount() > 0) {
					return true;
				}
				return false;
			});
			if (IOrders.stores.productCatStore.getCount() === 0) {
				btn.pressed = false;
				Ext.Msg.alert('Не выбраны товары', 'В текущем заказе нет выбранных товаров.', Ext.emptyFn);
				IOrders.stores.productCatStore.clearFilter();
				IOrders.stores.productCatStore.snapshot = IOrders.stores.productCatStore.data.clone();
				IOrders.stores.productCatStore.each(function(rec) {
					rec.products().clearFilter();
				});
			}
		} else {
			IOrders.stores.productCatStore.clearFilter();
			IOrders.stores.productCatStore.snapshot = IOrders.stores.productCatStore.data.clone();
			IOrders.stores.productCatStore.each(function(rec) {
				rec.products().clearFilter();
			});
		}
		btn.setText(btn.pressed ? 'Показать все товары' : 'Показать заказ');
		this.productList && this.productList.destroy();
		this.productCatList.deselect(this.productCatList.getSelectedRecords());
		this.productCatList.bindStore(IOrders.stores.productCatStore);
	}
});