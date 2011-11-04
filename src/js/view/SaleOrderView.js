var SaleOrderView = Ext.extend(AbstractView, {
	/**
	 * Config
	 */
	layout: {type: 'hbox', pack: 'justify', align: 'stretch'},
	/**
	 * Own
	 */
	createItems: function() {
		
		Ext.ModelMgr.getModel('Customer').load(this.saleOrder.get('customer'), {
			scope: this,
			success: function(customer) {
				this.customerRecord = customer;
			}
		});
		
		this.offerCategoryStore = createStore('OfferCategory', Ext.apply({
			remoteFilter: true,
			filters:[{
				property: 'customer',
				value: this.saleOrder.get('customer')
			}]
		}, getGroupConfig('Category')));
		
		this.productCategoryList = Ext.create({
			xtype: 'expandableGroupedList',
			cls: 'x-product-category-list', allowDeselect: false, flex: 1,
			scroll: false,
			store: this.offerCategoryStore,
			itemTpl: getItemTpl('OfferCategory')
		});
		
		this.offerCategoryStore.load({limit: 0});
		
		/*this.productCategoryBtn = Ext.create({
			xtype: 'button', hidden: Ext.is.Phone || Ext.Viewport.orientation == 'landscape',
			defaultText: 'Группы продуктов', text: 'Группы продуктов',
			handler: this.onProdCatButtonTap, scope: this
		});*/
		
		this.productPanel = Ext.create({xtype: 'panel', layout: 'fit', flex: 3});
		
		this.items = [this.productCategoryList, this.productPanel];
		
		var summTpl = new Ext.XTemplate(
				'<p>'
			+	'<tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>'
			+	'Сумма заказа: {totalCost}'
			+	'<tpl if="bonusRemains"> Остаток бонуса: {bonusRemains}</tpl>'
			+	'</p>'
		);
		
		this.dockedItems.push({
			id: 'bottomToolbar', xtype: 'toolbar', dock: 'bottom',
			items: [{xtype: 'spacer'}, {
				text: summTpl.apply({totalCost: 0}), itemId: 'ShowCustomer', name: 'ShowCustomer', scope: this}],
			titleTpl: summTpl
		});

		this.dockedItems[0].items.push(
			//this.productCategoryBtn,
			{xtype: 'spacer'},
			this.showSaleOrderBtn = new Ext.Button({name: 'ShowSaleOrder', text: 'Показать заказ', scope: this}),
			{ui: 'save', name: 'Save', text: 'Сохранить', scope: this}
		);
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
	}/*,
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
	}*/
});
Ext.reg('saleorderview', SaleOrderView);