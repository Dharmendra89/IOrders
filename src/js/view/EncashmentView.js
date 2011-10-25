var EncashmentView = Ext.extend(AbstractView, {

	/**
	 * Config
	 */
	layout: {type: 'fit'},

	/**
	 * Inherited
	 */
	
	createItems: function() {

		var store = createStore('Debt', Ext.apply({
			filters: [{property: 'partner', value: this.partnerRecord.getId()}]
		}, getSortersConfig('Debt', {})));

		store.load({limit: 0});
		
		this.debtList = Ext.create({
			xtype: 'list',
			itemTpl: getItemTpl('Debt'),
			emptyText: '<div class="emptyListText">Задолжности отсутствуют</div>',
			store: store,
			scroll: {
				direction: 'vertical',
				threshold: 35
			},
			initComponent: function() {
				var scroll = this.scroll;
				Ext.List.prototype.initComponent.apply(this, arguments);
				if (typeof scroll == 'object')
					this.scroll = scroll;
			},
			listeners: {
				
				itemswipe: function(list, idx, item, event) {
					if (!list.disableSwipe) {
						Ext.dispatch({
							controller: 'Navigator',
							action: 'onDebtListItemSwipe',
							list: list, idx: idx, item: item, event: event
						});
					}
				},
				
				itemdoubletap: function (list, idx, item, el) {
					var rec = list.getRecord (item);
					
					if (rec) {
						var msg = new Ext.MessageBox(),
							encashSumm = rec.get('encashSumm')
						;
						
						Ext.get(item).addCls('editing');
						
						msg.prompt('Изменить сумму?', rec.get ('name'),
							function(button, value) {
								
								Ext.get(item).removeCls ('editing');
								
								if (button == 'ok'){
									Ext.dispatch ({
										controller: 'Navigator',
										action: 'setEncashSumm',
										list: list,
										rec: rec,
										encashSumm: value,
										item: item
									});
								};
								
								Ext.defer (function() {Ext.destroy(msg);}, 1000);
							},
							msg, false, encashSumm, { type: 'number', autofocus: true }
						);
					}
				}
				
			},
		});				
		
		this.items = [this.debtList];
		
		this.dockedItems[0].items.push({name: 'SaveEncash', text: 'Сохранить', scope: this});
	}

});

Ext.reg('encashmentview', EncashmentView);