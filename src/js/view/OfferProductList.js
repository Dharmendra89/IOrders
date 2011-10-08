var offerProductList = Ext.extend(Ext.List, {
	/**
	 * Config
	 */
	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	grouped: true,
	disableSelection: true,
	
	/**
	 * Overridden
	 */
	initComponent: function() {

		this.listeners = {
			itemswipe: function(list, idx, item, event) {

				Ext.dispatch({
					controller: 'Main', action: 'onListItemSwipe',
					list: list, idx: idx, item: item, event: event
				});
			}
		};

		offerProductList.superclass.initComponent.apply(this, arguments);
		this.scroll.threshold = 80;
	},
	onUpdate : function(store, record) {
        offerProductList.superclass.onUpdate.apply(this, arguments);
    }
});

Ext.reg('offerproductlist', offerProductList);