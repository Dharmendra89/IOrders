var offerProductList = Ext.extend(Ext.List, {

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
		
		this.listeners = {
			itemswipe: function(list, idx, item, event) {
				if (!list.disableSwipe) {
					Ext.dispatch({
						controller: 'Main', action: 'onListItemSwipe',
						list: list, idx: idx, item: item, event: event
					});
				}
			},
			afterrender: function(){
				this.mon(this.el, 'tap', this.ownerCt.ownerCt.onListHeaderTap, this.ownerCt.ownerCt, {
					delegate: '.x-list-header'
				});
				this.el.addCls ('expandable');
			}
		};
		
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