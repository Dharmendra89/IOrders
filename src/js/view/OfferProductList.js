/*
 Ext.Msg.on ('show', function() {
	console.log (this.inputEl);
	var el =  this.inputEl.dom;
	Ext.defer ( function () { el.focus(); }, 1000);
});
*/

var offerProductList = {

	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	grouped: true,
	disableSelection: true,
	pinHeaders: false,
	xtype: 'expandableGroupedList',
	
	listeners: {
		itemswipe: function(list, idx, item, event) {
			if (!list.disableSwipe) {
				Ext.dispatch({
					controller: 'Main', action: 'onListItemSwipe',
					list: list, idx: idx, item: item, event: event
				});
			}
		},
		itemdoubletap: function (list, idx, item, el) {
			var rec = list.getRecord (item)
			
			if (rec) {
				var msg = new Ext.MessageBox(),
					volume = rec.get('volume')
				;
				
				Ext.get(item).addCls ('editing');
				
				msg.prompt ('Изменить количество?', rec.get ('name'),
					function(button, value){
						
						Ext.get(item).removeCls ('editing');
						
						if (button == 'ok'){
							Ext.dispatch ({
								controller: 'SaleOrder',
								action: 'setVolume',
								list: list,
								rec: rec,
								volume: value,
								item: item
							});
						};
						
						Ext.defer (function() {Ext.destroy (msg);}, 1000);
					},
					msg, false, volume, { type: 'number', autofocus: true }
				);
			}
		},
		
		scroll: {
			
			direction: 'vertical',
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
			
		}
		
	}	
	
}