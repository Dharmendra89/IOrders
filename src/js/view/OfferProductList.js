var offerProductList = {

	xtype: 'expandableGroupedList',
	cls: 'x-product-list',
	itemTpl: getItemTpl('OfferProduct'),
	disableSelection: true,
	pinHeaders: false,

	indexBar: new HorizontalIndexBar(),

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
				var volume = rec.get('volume'),
					iel = Ext.get(item);
					
				iel.addCls('editing');
				
				this.keyboard = this.keyboard || Ext.create({
					xtype: 'numkeyboard',
					value: volume,
					onConfirmButtonTap: function(button, value) {
						
						if (this.iel) {
							this.iel.removeCls('editing');
							this.iel = false;
						}
						
						if (button == 'ok') {
							Ext.dispatch (Ext.apply({
								controller: 'SaleOrder',
								action: 'setVolume',
								volume: value || 0
							}, this.options));
						};
						//this.hide();
					}
				});
				
				this.keyboard.showBy(iel.down('.volume'), false, false);
				this.keyboard.iel = iel;
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
		
	},

	onRender: function() {

		ExpandableGroupedList.prototype.onRender.apply(this, arguments);

		this.mon(this.el, 'taphold', function(event, item, obj) {

			var list = this,
				idx = list.indexOf(item)
			;

			Ext.dispatch({
				controller: 'SaleOrder', action: 'onProductListItemLongTap',
				list: list, idx: idx, item: item, event: event
			});
		}, this, {delegate: '.x-list-item'});
	}
};