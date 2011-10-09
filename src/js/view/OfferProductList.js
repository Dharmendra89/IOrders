var offerProductList = Ext.extend(Ext.List, {
	/**
	 * Config
	 */
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
			}
		};
		
		offerProductList.superclass.initComponent.apply(this, arguments);
		
		this.scroll.threshold = 10;
		
		this.scroll.listeners  = {
			scroll:function(s, o) {
				if (o.y)
					me.disableSwipe = true;
			},
			scrollend: function(s, o){
				me.disableSwipe = false;
			}
		}
		
	},
	
	onUpdate : function(store, record) {
		this.itemRefresh = true;
        Ext.List.superclass.onUpdate.apply(this, arguments);
		this.itemRefresh = false;
    },

    bufferRender : function(records, index){
        var div = document.createElement('div');
		
		if (this.itemRefresh) {
			this.listItemTpl.overwrite (div, Ext.List.superclass.collectData.call(this, records, index))
		}
		else {
	        this.tpl.overwrite(div, this.collectData(records, index));
		}
		
        return Ext.query(this.itemSelector, div);
    }
	
});

Ext.reg('offerproductlist', offerProductList);