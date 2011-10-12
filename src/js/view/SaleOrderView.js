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
			filters:[{
				property: 'customer',
				value: this.saleOrder.get('customer')
			}]
		});
		
		this.offerCategoryStore.load({limit: 0});
		
		this.productCategoryList = Ext.create({
			xtype: 'list', cls: 'x-product-category-list', allowDeselect: false, flex: 1,
			store: this.offerCategoryStore,
			itemTpl: getItemTpl('OfferCategory')
		});
		/*this.productCategoryBtn = Ext.create({
			xtype: 'button', hidden: Ext.is.Phone || Ext.Viewport.orientation == 'landscape',
			defaultText: 'Группы продуктов', text: 'Группы продуктов',
			handler: this.onProdCatButtonTap, scope: this
		});*/
		this.productPanel = Ext.create({xtype: 'panel', layout: 'fit', flex: 3});

		this.items = [this.productCategoryList, this.productPanel];

		this.dockedItems.push({
			id: 'bottomToolbar', xtype: 'toolbar', dock: 'bottom',
			titleTpl: new Ext.XTemplate('<p style="text-align: right">'
						+'<tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
						+ 'Сумма заказа: {totalCost} руб.</p>')
		});

		this.dockedItems[0].items.push(
			//this.productCategoryBtn,
			{xtype: 'spacer'},
			this.showSaleOrderBtn = new Ext.Button({name: 'ShowSaleOrder', text: 'Показать заказ', scope: this}),
			{ui: 'save', name: 'Save', text: 'Сохранить', scope: this}
		);
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
		
		if (!this.productList.disableHeaderTap){
			this.productList.disableHeaderTap = true;
		if (groupListItemsEl.hasCls('x-hidden-display')) {

			var closest = headerEl; //this.productList.getTargetEl().down('.x-group-' + grpName.toLowerCase());

			Ext.Anim.run(groupListItemsEl, new Ext.Anim({
				pList: this.productList,
				closest: closest,
				duration: durationValue,
				autoClear: true,
				from: {height: '0px'},
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
					c.pList.updateOffsets();
					c.pList.scroller.updateBoundary();
					c.closest && c.pList.scroller.scrollTo({x: 0, y: c.closest.getOffsetsTo(c.pList.scrollEl)[1]});
					c.pList.disableHeaderTap = false;
					Ext.defer(function(){
						c.pList.disableSwipe = false
					}, 500);
				}
			}));

		} else if (groupListItemsEl.hasCls('x-list-group-items')) {

			Ext.Anim.run(groupListItemsEl, new Ext.Anim({
				headerEl: headerEl,
				pList: this.productList,
				duration: durationValue,
				to: {height: '0px'},
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
					c.pList.disableHeaderTap = false;
				}
			}));
		}}

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