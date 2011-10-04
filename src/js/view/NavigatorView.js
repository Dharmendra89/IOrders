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
			
			formItems.push(createTitlePanel(table.get('name')));
			formItems.push(createFieldSet(table.columns(), this.editable));
			
			this.dockedItems[0].items.push(
					{xtype: 'spacer'},
					{id: 'Cancel', name: 'Cancel', text: 'Отменить', hidden: true, scope: this},
					{id: 'SaveEdit', name: this.editable ? 'Save' : 'Edit', text: this.editable ? 'Сохранить' : 'Редактировать', scope: this}
			);
			
			this.objectRecord.modelName === 'MainMenu' && (this.dockedItems[0].items = []);
			
			if (!this.editable || this.objectRecord.modelName == 'SaleOrder')
				formItems.push(createDepsList(table.deps(), tablesStore, this.objectRecord));
			
		} else if (this.isSetView) {
			
			formItems.push(createTitlePanel(tablesStore.getById(this.tableRecord).get('nameSet')));
			
			if(this.objectRecord.modelName != 'MainMenu') {
				formItems.push(createFilterField(this.objectRecord));
			}
			
			this.setViewStore = createStore(this.tableRecord);
			
			formItems.push({
				xtype: 'list',
				plugins: new Ext.plugins.ListPagingPlugin({autoPaging: true}),
				scroll: false,
				cls: 'x-table-list',
				allowDeselect: false,
				itemTpl: getItemTpl(this.tableRecord),
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
		this.form.setDisabled(!this.editable);
	}
	
});

Ext.reg('navigatorview', NavigatorView);