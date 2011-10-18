var offerProductList = Ext.extend(ExpandableGroupedList, {

	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	grouped: true,
	disableSelection: true,
	pinHeaders: false,
	
	/**
	 * Overridden
	 */
	
	initComponent: function() {
		
		var me = this;
		
		Ext.apply(this.listeners, {
			itemswipe: function(list, idx, item, event) {
				if (!list.disableSwipe) {
					Ext.dispatch({
						controller: 'Main', action: 'onListItemSwipe',
						list: list, idx: idx, item: item, event: event
					});
				}
			}
		});
		
		offerProductList.superclass.initComponent.apply(this, arguments);
		
		Ext.apply(this.scroll,{
			
			threshold: 25,
			
			listeners: {
				scroll:function(s, o) {
					if (o.y)
						me.disableSwipe = true;
				},
				scrollend: function(s, o){
					me.disableSwipe = false;
				}
			}
			
		});
		
	}	
	
});

Ext.reg('offerproductlist', offerProductList);