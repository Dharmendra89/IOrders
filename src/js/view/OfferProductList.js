/*
 Ext.Msg.on ('show', function() {
	console.log (this.inputEl);
	var el =  this.inputEl.dom;
	Ext.defer ( function () { el.focus(); }, 1000);
});
*/

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
			},
			itemdoubletap: function (list, idx, item, el) {
				var 
					rec = list.getRecord (item),
					volume = rec.get('volume'),
					msg = new Ext.MessageBox();
					
				Ext.get(item).addCls ('editing');
				
				msg.prompt ('Изменить количество?', rec.get ('name'),
					function(button, value){
						
						Ext.get(item).removeCls ('editing');
						
						if (button == 'ok'){
							Ext.destroy (this);
							Ext.dispatch ({
								controller: 'SaleOrder',
								action: 'setVolume',
								list: list,
								rec: rec,
								volume: value,
								item: item
							})
						}
					},
					msg, false, volume, { type: 'number', autofocus: true }
				);
				
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