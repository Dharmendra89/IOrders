var ProductList = Ext.extend(Ext.List, {
	/**
	 * Config
	 */
	cls: 'x-product-list',
	itemTpl: getItemTpl('Product'),
	grouped: true,
	/**
	 * Overridden
	 */
	initComponent: function() {
		this.listeners = {
			itemswipe: function(list, idx, item, event) {
				Ext.dispatch({
					controller: 'Main',
					action: 'onListItemSwipe',
					list: list,
					idx: idx,
					item: item,
					event: event
				});
			}
		};
		ProductList.superclass.initComponent.apply(this, arguments);
		this.scroll.threshold = 80;
	}
});
Ext.reg('productlist', ProductList);