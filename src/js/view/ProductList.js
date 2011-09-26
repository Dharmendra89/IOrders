var ProductList = Ext.extend(Ext.List, {
	/**
	 * Config
	 */
	cls: 'x-product-list',
	itemTpl: getItemTpl('Product'),
	/**
	 * Overridden
	 */
	initComponent: function() {
		ProductList.superclass.initComponent.apply(this, arguments);
		this.scroll.threshold = 80;
	}
});
Ext.reg('produxtlist', ProductList);