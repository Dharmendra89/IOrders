var EncashmentView = Ext.extend(AbstractView, {

	/**
	 * Config
	 */
	layout: {type: 'vbox', pack: 'justify', align: 'stretch'},

	/**
	 * Inherited
	 */
	
	createItems: function() {

		var store = createStore('Debt', Ext.apply({
			filters: [{property: 'partner', value: this.partnerRecord.getId()}]
		}, getSortersConfig('Debt', {})));

		store.load({limit: 0});
		
		var debtTable = Ext.getStore('tables').getById('Debt');
		
		this.debtList = Ext.create({
			xtype: 'list',
			flex: 2,
			itemTpl: getItemTpl('Debt'),
			emptyText: '<div class="emptyListText">' + debtTable.get('nameSet') + ' отсутствуют</div>',
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
						var	encashSumm = rec.get('encashSumm');
						
						Ext.get(item).addCls('editing');

						this.keyboard = this.keyboard || Ext.create({
							xtype: 'numkeyboard',
							view: this.up('encashmentview'),
							onConfirmButtonTap: function(button, value) {

								Ext.get(item).removeCls('editing');

								if (button == 'ok') {
									Ext.dispatch (Ext.apply({
										controller: 'Navigator',
										action: 'setEncashSumm',
										encashSumm: value || 0,
										view: this.view
									}, this.options));
								};
								this.hide();
							}
						});this.keyboard.show();

						this.keyboard.setValue(encashSumm);
						this.keyboard.options = {item: item, list: list, rec: rec};
					}
				}
				
			}
		});
		
		var selectStore = createStore('Customer', getSortersConfig('Customer', {}));

		this.setLoading(true);
		selectStore.load({
			filters: [{property: 'partner', value: this.partnerRecord.getId()}],
			callback: function(recs) {
				this.setLoading(false);
				this.customerSelect.setValue(recs[0].getId());
				this.customerRecord = recs[0];
			},
			scope: this
		});
		
		this.customerSelect = Ext.create({
			xtype: 'selectfield',
			name: 'customer',
			store: selectStore,
			valueField: 'id', displayField: 'name'
		});
		
		this.form = Ext.create({
			xtype: 'form',
			height: 100,
			items: [
				this.customerSelect
			]
		});
		
		this.items = [this.form, this.debtList];
		
		this.dockedItems[0].items.push({name: 'SaveEncash', text: 'Сохранить', scope: this});
	}

});

Ext.reg('encashmentview', EncashmentView);