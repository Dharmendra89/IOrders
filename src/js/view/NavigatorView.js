var NavigatorView = Ext.extend(AbstractView, {
	
	objectRecord: undefined,
	tableRecord: undefined,
	layout: 'fit',
	
	/**
	 * Own
	 */
	
	createItems: function() {
		
		var tablesStore = Ext.getStore('tables'),
		    table = tablesStore.getById(this.objectRecord.modelName),
		    formItems = [];
		
		if(this.isObjectView) {
			
			this.dockedItems[0].title = table.get('name');
			formItems.push(createFieldSet(table.columns(), this.editable));
			
			this.dockedItems[0].items.push(
					{xtype: 'spacer'},
					{id: 'Cancel', name: 'Cancel', text: 'Отменить', hidden: true, scope: this},
					{id: 'SaveEdit', name: this.editable ? 'Save' : 'Edit', text: this.editable ? 'Сохранить' : 'Редактировать', scope: this}
			);
			
			this.objectRecord.modelName === 'MainMenu' && (this.dockedItems[0].items = []);
			
			if (!this.editable || this.objectRecord.modelName == 'SaleOrder')
				formItems.push(createDepsList(table.deps(), tablesStore, this.objectRecord, this.editable));
			
		} else if (this.isSetView) {
			
			this.dockedItems[0].title = tablesStore.getById(this.tableRecord).get('nameSet');
			
			if(this.objectRecord.modelName != 'MainMenu') {
				formItems.push(createFilterField(this.objectRecord));
			}
			
			var listGroupedConfig = getGroupConfig(this.tableRecord);
			
			this.setViewStore = createStore(this.tableRecord, listGroupedConfig);
			
			formItems.push({
				xtype: 'list',
				plugins: new Ext.plugins.ListPagingPlugin({autoPaging: true}),
				scroll: false,
				cls: 'x-table-list',
				grouped: listGroupedConfig.field ? true : false,
				allowDeselect: false,
				itemTpl: getItemTpl(this.tableRecord, table),
				store: this.setViewStore
			});
			
			this.extendable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this
			});
		}
		
		this.items = [
			this.form = new Ext.form.FormPanel({cls: 'x-navigator-form', scroll: true, items: formItems})
		];
	},
	
	/**
	 * Overridden
	 */
	
	initComponent: function() {
		NavigatorView.superclass.initComponent.apply(this, arguments);
	},
	
	onShow: function() {
		NavigatorView.superclass.onShow.apply(this, arguments);
		this.form.loadRecord(this.objectRecord);
		this.isObjectView && this.form.setDisabled(!this.editable);
	}
	
});

Ext.reg('navigatorview', NavigatorView);