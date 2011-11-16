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
				this.keyboard = this.keyboard || Ext.create({
					xtype: 'numkeyboard',
					value: volume,
					onConfirmButtonTap: function(button, value) {

						Ext.get(item).removeCls('editing');

						if (button == 'ok') {
							Ext.dispatch (Ext.apply({
								controller: 'SaleOrder',
								action: 'setVolume',
								volume: value || 0,
							}, this.options));
						};
						this.hide();
					}
				});
				this.keyboard.show();
				
				this.keyboard.setValue(volume);
				this.keyboard.options = {item: item, list: list, rec: rec};
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