var offerProductList = Ext.extend(Ext.List, {
	/**
	 * Config
	 */
	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	grouped: true,
	disableSelection: true,
	pinHeaders: false,
	
	groupTpl : [
        '<tpl for=".">',
            '<div class="x-list-group x-group-{id}">',
                '<h3 class="x-list-header">{group}</h3>',
                '<div class="x-list-group-items x-hidden-display',
//				      '<tpl if="this.groupsHide() == true">x-hidden-display</tpl>',
				'">',
                    '{items}',
                '</div>',
            '</div>',
        '</tpl>'
    ],
	
	/**
	 * Overridden
	 */
	
	showAllGroups: function() {
		Ext.each (Ext.DomQuery.select ('.x-list-group-items', this.el.dom), function(e) {
			Ext.get(e).toggleCls('x-hidden-display');
		});
		this.updateOffsets();
		this.scroller.updateBoundary();
	},
	
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
			}
		};
		
		offerProductList.superclass.initComponent.apply(this, arguments);
		
		this.scroll.threshold = 25;
		
		this.scroll.listeners  = {
			scroll:function(s, o) {
				if (o.y)
					me.disableSwipe = true;
			},
			scrollend: function(s, o){
				me.disableSwipe = false;
			}
		};
		
	}	
	
});

Ext.reg('offerproductlist', offerProductList);