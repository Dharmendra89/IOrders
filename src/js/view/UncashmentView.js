var UncashmentView = Ext.extend(AbstractView, {

	/**
	 * Config
	 */
	layout: {type: 'vbox', pack: 'justify', align: 'stretch'},

	/**
	 * Inherited
	 */
	
	createItems: function() {

		this.encashStore = createStore('Encashment', Ext.apply({
				filters: [{property: 'uncashment', value: null}]
			}, getSortersConfig('Encashment', {})));
		
		this.debtStore = createStore('Debt');
		this.debtStore.load({limit: 0});
		
		var debtTable = Ext.getStore('tables').getById('Cash');
		
		this.debtList = Ext.create({
			xtype: 'list',
			flex: 2,
			itemTpl: getItemTplMeta('Encashment', {filterObject: Ext.ModelMgr.create({}, 'Uncashment'), groupField: 'debt'}).itemTpl,
			emptyText: '<div class="emptyListText">' + debtTable.get('nameSet') + ' отсутствуют</div>',
			store: this.encashStore,
			listeners: {
				itemdoubletap: function (list, idx, item, el) {
					var rec = list.getRecord(item);
					
					if (rec) {
						var encashSumm = rec.get('summ');
						
						this.keyboard = this.keyboard || Ext.create({
							xtype: 'numkeyboard',
							view: this.up('uncashmentview'),
							onConfirmButtonTap: function(button, value) {
								
								this.iel.removeCls('editing');
								
								if (button == 'ok') {
									Ext.dispatch (Ext.apply({
										controller: 'Navigator',
										action: 'updateEncashment',
										encashSumm: value || 0,
										view: this.view
									}, this.options));
								};
								this.hide();
							}
						});
						
						this.keyboard.iel = Ext.get(item);
						
						this.keyboard.showBy(this.keyboard.iel.down ('.summ'), false, false);

						this.keyboard.setValue(encashSumm);
						this.keyboard.options = {item: item, list: list, rec: rec};

						Ext.get(item).addCls('editing');
					}
				}
			}
		});	

		this.form = Ext.create({
			xtype: 'form',
			height: 200,
			items: [
				createFieldSet(Ext.getStore('tables').getById('Uncashment').columns(), 'Uncashment', this)
			]
		});
		
		this.form.setDisabled(true);
		
		this.items = [this.form, this.debtList];
		
		this.dockedItems[0].items.push({name: 'Uncash', text: 'Сдать', scope: this});
	}

});

Ext.reg('uncashmentview', UncashmentView);