var offerProductList = {

	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	grouped: true,
	disableSelection: true,
	pinHeaders: false,
	xtype: 'expandableGroupedList',
	
	onItemTap: Ext.emptyFn,
	
	listeners: {
		
		itemswipe: function(list, idx, item, event) {
			if (!list.disableSwipe) {
				Ext.dispatch({
					controller: 'Main', action: 'onListItemSwipe',
					list: list, idx: idx, item: item, event: event
				});
			}
		},
		
//		itemTap: Ext.emptyFn,
		
		itemdoubletap: function (list, idx, item, el) {
			var rec = list.getRecord (item);
			
			if (rec) {
				var volume = rec.get('volume');

				Ext.get(item).addCls('editing');
				var keyboard = Ext.create({
					xtype: 'numkeyboard',
					value: volume,
					onConfirmButtonTap: function(button, value) {

						Ext.get(item).removeCls('editing');

						if (button == 'ok') {
							Ext.dispatch ({
								controller: 'SaleOrder',
								action: 'setVolume',
								list: list,
								rec: rec,
								volume: value || 0,
								item: item
							});
						};
						this.hide();

						Ext.defer(function() {this.destroy();}, 1000, this);
					}
				});
				keyboard.show();
			}
		}
		
	},
	
	scroll: {
		
		direction: 'vertical',
		threshold: 35 /*,
		
		listeners: {
			scroll:function(s, o) {
				if (o.y)
					me.disableSwipe = true;
			},
			scrollend: function(s, o){
				me.disableSwipe = false;
			}
		}*/
		
	}
};