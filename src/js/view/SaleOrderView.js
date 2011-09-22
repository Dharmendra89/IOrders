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
			store: Ext.getStore('ProductCategory'),
			itemTpl: getItemTpl('ProductCategory')
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

		this.items = [
			this.productCategoryList,
			this.productPanel
		];

		this.dockedItems[0].items.push(this.productCategoryBtn);
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
	fullscreen: true,
	hidden: true,
	layout: {
		type: 'fit',
		pack: 'center',
		align: 'center'
	},
	showAnimation: 'slide',
	loadProductCatStore: function() {
		IOrders.stores.productCatStore = new Ext.data.Store({
			model: 'ProductCategory',
			sorters: ['ord'],
			direction: 'ASC'
		});
		IOrders.stores.productCatStore.load({
			filter: {
				customer: this.clientRecord.getId()
			},
			callback: function(recs, operation, success) {
				IOrders.stores.productCatStore.each(function(rec) {
					rec.products().load({
						filter: {
							loadForCreate: true,
							customer: operation.filter.customer,
							category: rec.getId()
						}
					});
				});
			}
		});
	},
	calculateTotalPrice: function(updRec, oldVolumeValue) {
		var category = IOrders.stores.productCatStore.getById(updRec.get('productcategory_id'));
		var oldCatPrice = new Number(category.get('totalPrice'));
		category.set('totalPrice', new Number(oldCatPrice - oldVolumeValue * updRec.get('rel') * updRec.get('price') + updRec.get('volume') * updRec.get('rel')
				* updRec.get('price')).toFixed(2));
		this.totalPrice = new Number(new Number(this.totalPrice) - oldCatPrice + new Number(category.get('totalPrice'))).toFixed(2);
		this.orderBar.setTitle(this.orderBar.titleTpl.apply({
			packageName: category.get('packageName'),
			totalPrice: this.totalPrice
		}));
	},
	onListHeaderTap: function(e, t) {
		var headerEl = Ext.get(t);
		var groupListItemsEl = headerEl.next();

		if (headerEl.hasCls('x-list-header-swap')) {
			groupListItemsEl = groupListItemsEl.down('.x-group-' + headerEl.dom.innerText.toLowerCase() + ' .x-list-group-items');
		}

		var durationValue = 30 * groupListItemsEl.dom.children.length;

		if (durationValue < 200)
			durationValue = 200
		else if (durationValue > 500)
			durationValue = 500;

		if (groupListItemsEl.hasCls('x-hidden-display')) {
			var grpName = headerEl.getHTML();
			var curGroup = {
				name: grpName,
				children: IOrders.stores.productStore.queryBy(function(record) {
					return record.get('firstName') === grpName;
				}).getRange()
			};
			var closest = this.productList.getTargetEl().down('.x-group-' + grpName.toLowerCase());

			//this.renderFieldsForProductList(curGroup, true);

			Ext.Anim.run(groupListItemsEl, new Ext.Anim({

				"pList": this.productList,
				"closest": closest,
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
					}
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

				"headerEl": headerEl,
				"pList": this.productList,
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
	renderFieldsForProductList: function(curGroup, isForce) {
		var grpChildren = curGroup.children;
		var isExpanded = false;
		if (!isForce) {
			for ( var i = 0; i < grpChildren.length; i++) {
				isExpanded = isExpanded ? isExpanded : grpChildren[i].get('isActive');
			}
		}
		if (!(isForce || isExpanded)) {
			this.productList.getTargetEl().down('.x-group-' + curGroup.name.toLowerCase() + ' .x-list-group-items').hide();
		}
	},
	createProductList: function(categoryId) {
		this.setLoading({
			msg: 'Подождите...'
		}, true);
		this.productList && this.productList.destroy();
		IOrders.stores.productStore = IOrders.stores.productCatStore.getById(categoryId).products();
		this.productList = this.add(new Ext.List({
			cls: 'productList',
			renderedGroups: {},
			store: IOrders.stores.productStore,
			grouped: true,
			blockRefresh: true,
			disableSelection: true,
			itemTpl: '<div class="info {cls}">' + '<p>{name}</p>' + '<small><span>Цена: {price}</span>'
					+ '<tpl if="rel &gt; 1"><span>Вложение: {rel}</span></tpl>' + '<span>Кратность: {factor}</span></small>' + '</div>'
					+ '<div class="volume">{volume}</div>',
			onUpdate: function(store, record) {
				return false;
			}
		}));
		this.doLayout();
		this.productList.refresh();
		var allGroups = IOrders.stores.productStore.getGroups();
		for ( var i = 0; i < allGroups.length; i++) {
			this.renderFieldsForProductList(allGroups[i]);
		}
		this.productList.mon(this.productList, 'itemswipe', this.onItemSwipe, this);
		this.productList.mon(this.productList.el, 'tap', this.onListHeaderTap, this, {
			delegate: '.x-list-header'
		});
		this.setLoading(false);
		this.productList.updateOffsets();
		this.productList.scroller.updateBoundary();
	},
	onItemSwipe: function(dataView, index, item, e) {
		var rec = dataView.getStore().getAt(index), value = parseInt(rec.get('volume')), factor = parseInt(rec.get('factor')), sign = 1

		if (!value)
			value = 0;
		if (e.direction == 'left')
			sign = -1;

		value += sign * factor;

		if (value < 0)
			value = 0;
		Ext.get(item).down('.volume').dom.innerHTML = value;
		this.processVolumeChange(rec, value);
	},
	onSpinnerValueChange: function(spinner, value) {
		this.processVolumeChange(spinner.record, value);
	},
	processVolumeChange: function(rec, value) {
		var oldVolumeValue = rec.get('volume');
		rec.set('isActive', true);
		rec.set('volume', value);
		this.calculateTotalPrice(rec, oldVolumeValue);
	},
	onProdCatButtonTap: function() {
		this.productCatPanel.showBy(this.productCatButton, 'fade');
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
	onBackButtonTap: function() {
		this.hide();
		this.shower.show(true);
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
				rec.products().clearFilter()
			});
		}
		btn.setText(btn.pressed ? 'Показать все товары' : 'Показать заказ');
		this.productList && this.productList.destroy();
		this.productCatList.deselect(this.productCatList.getSelectedRecords());
		this.productCatList.bindStore(IOrders.stores.productCatStore);
	},
	initComponent: function() {

		this.loadProductCatStore();

		this.productCatButton = new Ext.Button({
			hidden: Ext.is.Phone || Ext.Viewport.orientation == 'landscape',
			text: 'Группы продуктов',
			handler: this.onProdCatButtonTap,
			scope: this
		});

		var btns = [this.productCatButton, {
			text: 'Назад',
			ui: 'back',
			handler: this.onBackButtonTap,
			scope: this
		}];

		this.productCatBar = new Ext.Toolbar({
			dock: 'top',
			titleTpl: new Ext.XTemplate('Новый заказ {name}'),
			items: btns.concat(this.buttons || [])
		});

		this.saveOrderBtn = new Ext.Button({
			hidden: true,
			text: 'Сохранить',
			handler: this.onSaveOrderBtnTap,
			scope: this
		});
		this.showOrderBtn = new Ext.Button({
			text: 'Показать заказ',
			pressed: false,
			handler: this.onShowOrderBtnTap,
			scope: this
		});
		this.orderBar = new Ext.Toolbar({
			dock: 'bottom',
			titleTpl: new Ext.XTemplate(
					'<p style="text-align: right"><tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
							+ 'Сумма заказа: {totalPrice} руб.</p>'),
			items: [this.saveOrderBtn, this.showOrderBtn]
		});

		this.orderBar.setTitle(this.orderBar.titleTpl.apply({
			totalPrice: 0
		}));

		this.productCatList = new Ext.List({
			store: IOrders.stores.productCatStore,
			cls: 'product-category-list',
			itemTpl: '<div class="{cls}">{name}</div><div class="price"><tpl if="totalPrice &gt; 0"><small> {totalPrice} руб.</small></tpl></div>',
			listeners: {
				selectionchange: this.onProdCatItemTap,
				scope: this
			}
		});

		this.productCatPanel = new Ext.Panel({
			dock: 'left',
			width: 200,
			layout: {
				type: 'fit',
				pack: 'center',
				align: 'center'
			},
			dockedItems: {
				dock: 'top',
				xtype: 'toolbar'
			},
			hidden: !Ext.is.Phone && Ext.Viewport.orientation == 'portrait',
			items: this.productCatList
		});

		this.dockedItems = [this.productCatBar, this.orderBar];

		if (!Ext.is.Phone && Ext.Viewport.orientation == 'landscape') {
			this.dockedItems.unshift(this.productCatPanel);
		} else if (Ext.is.Phone) {
			this.items = this.items || [];
			this.items.unshift(this.productCatPanel);
		}

		this.totalPrice = 0;
		this.newOrder = null;

		OrderCreatePanel.superclass.initComponent.apply(this, arguments);
	},
	onHide: function() {
		this.productList && this.productList.destroy();
		this.actionSave && this.actionSave.destroy();
		this.orderBar.setTitle(this.orderBar.titleTpl.apply({
			totalPrice: 0
		}));
		this.totalPrice = 0;
		this.newOrder = null;
		this.productCatList.deselect(this.productCatList.getSelectedRecords());
		this.saveOrderBtn.hide();
		this.showOrderBtn.setText('Показать заказ');
		OrderCreatePanel.superclass.onHide.apply(this, arguments);
	},
	onShow: function() {
		OrderCreatePanel.superclass.onShow.apply(this, arguments);
		this.productCatBar.setTitle(this.productCatBar.titleTpl.apply({
			name: this.clientRecord.get('name')
		}));
		this.loadProductCatStore();
		this.productCatList.bindStore(IOrders.stores.productCatStore);
	},
	layoutOrientation: function(orientation, w, h) {
		if (!Ext.is.Phone) {
			if (orientation == 'portrait') {
				this.productCatPanel.hide(false);
				this.removeDocked(this.productCatPanel, false);
				if (this.productCatPanel.rendered) {
					this.productCatPanel.el.appendTo(document.body);
				}
				this.productCatPanel.getDockedItems()[0].hide()
				this.productCatPanel.setFloating(true);
				this.productCatPanel.setHeight(400);
				this.productCatButton.show(false);
			} else {
				this.productCatPanel.getDockedItems()[0].show()
				this.productCatPanel.setFloating(false);
				this.productCatPanel.show(false);
				this.productCatButton.hide(false);
				this.insertDocked(0, this.productCatPanel);
			}
			this.productCatBar.doComponentLayout();
		}

		OrderCreatePanel.superclass.layoutOrientation.call(this, orientation, w, h);
	}
});