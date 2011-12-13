var SaleOrderView = Ext.extend(AbstractView, {
	/**
	 * Config
	 */
	layout: {type: 'hbox', pack: 'justify', align: 'stretch'},
	/**
	 * Own
	 */
	createItems: function() {
		
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
		
		this.productPanel = Ext.create({xtype: 'panel', layout: 'fit', flex: 3});
		
		this.items = [this.productCategoryList, this.productPanel];
		
		var summTpl = new Ext.XTemplate(
				'<p>'
			+	'<tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>'
			+	'Сумма заказа: {totalCost}'
			+	'<tpl if="bonusRemains"> Остаток бонуса: <span <tpl if="bonusRemains &lt; 0">class="negative"</tpl> >{bonusRemains}</span></tpl>'
			+	'</p>'
		);
		
		this.dockedItems.push({
			id: 'bottomToolbar', xtype: 'toolbar', dock: 'bottom',
			items: [{xtype: 'spacer'}, {
				text: summTpl.apply({totalCost: 0}), itemId: 'ShowCustomer', name: 'ShowCustomer', scope: this}],
			titleTpl: summTpl
		});

		this.dockedItems[0].items.push(
			{xtype: 'spacer'},
			{xtype: 'segmentedbutton', allowMultiple: true, itemId: 'ModeChanger',
				items: [
					{itemId: 'Bonus', text: 'По акциям', altText: 'Все', handler: Ext.emptyFn},
					{itemId: 'Active', text: 'Показать актив', altText: 'Скрыть актив', handler: Ext.emptyFn},
					{itemId: 'ShowSaleOrder', text: 'Показать заказ', altText: 'Показать все', handler: Ext.emptyFn}
				],
				listeners: {
					toggle: function(segBtn, btn, pressed) {

						Ext.dispatch({
							controller: 'SaleOrder',
							action: 'onModeButtonTap',
							view: segBtn.up('saleorderview'),
							segBtn: segBtn,
							btn: btn,
							pressed: pressed
						});
					}
				}
			},
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
	}
});
Ext.reg('saleorderview', SaleOrderView);