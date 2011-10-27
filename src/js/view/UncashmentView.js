var UncashmentView = Ext.extend(AbstractView, {

	/**
	 * Config
	 */
	layout: {type: 'fit'},

	/**
	 * Inherited
	 */
	
	createItems: function() {

		this.encashStore = createStore('Encashment', Ext.apply({
				filters: [{property: 'uncashment', value: null}]
			}, getSortersConfig('Encashment', {})));
		
		var debtTable = Ext.getStore('tables').getById('Cash');
		
		this.debtList = Ext.create({
			xtype: 'list',
			itemTpl: getItemTplMeta('Encashment', '', Ext.ModelMgr.create({}, 'Uncashment'), 'debt').itemTpl,
			emptyText: '<div class="emptyListText">' + debtTable.get('nameSet') + ' отсутствуют</div>',
			store: this.encashStore
		});	

		this.form = Ext.create({
			xtype: 'form',
			items: [
				createFieldSet(Ext.getStore('tables').getById('Uncashment').columns(), 'Uncashment', this),
				this.debtList
			]
		});
		
		this.form.setDisabled(true);
		
		this.items = [this.form];
		
		this.dockedItems[0].items.push({name: 'Uncash', text: 'Сдать', scope: this});
	}

});

Ext.reg('uncashmentview', UncashmentView);