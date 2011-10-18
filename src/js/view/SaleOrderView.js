var SaleOrderView = Ext.extend(AbstractView, {
	/**
	 * Config
	 */
	layout: {type: 'hbox', pack: 'justify', align: 'stretch'},
	/**
	 * Own
	 */
	createItems: function() {
		
		this.offerCategoryStore = createStore('OfferCategory',{
			remoteFilter: true,
			getGroupString: function(rec) {
				return rec.get('ShopDepartment_name');
			},
			filters:[{
				property: 'customer',
				value: this.saleOrder.get('customer')
			}]
		});
		
		this.productCategoryList = Ext.create({
			xtype: 'expandableGroupedList',
			cls: 'x-product-category-list', allowDeselect: false, flex: 1,
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
		
		this.dockedItems.push({
			id: 'bottomToolbar', xtype: 'toolbar', dock: 'bottom',
			titleTpl: new Ext.XTemplate(
							'<p style="text-align: right">'
							+'<tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>'
							+ 'Сумма заказа: {totalCost} руб.</p>'
			)
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