var NavigatorView = Ext.extend(AbstractView, {
	objectRecord: undefined,
	tableRecord: undefined,
	/**
	 * Own
	 */
	createItems: function() {
		var tablesStore = Ext.getStore('tables');
		var table = tablesStore.getById(this.objectRecord.modelName);
		var formItems = [];
		if(this.isObjectView) {
			formItems.push(createTitlePanel(table.get('name')));
			formItems.push(createFieldSet(table.columns(), this.editable));
			this.editable && this.objectRecord.modelName !== 'SaleOrder' || formItems.push(createButtonsList(table.deps(), tablesStore));
			this.editable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Save',
				iconCls: 'compose', scope: this
			});
		} else if (this.isSetView) {
			formItems.push(createTitlePanel(tablesStore.getById(this.tableRecord).get('nameSet')));
			formItems.push(createFilterField(this.objectRecord));
			Ext.getStore(this.tableRecord).clearFilter(true); //TODO
			this.objectRecord.modelName &&
				Ext.getStore(this.tableRecord).filter([
					{property: this.objectRecord.modelName.toLowerCase(), value: this.objectRecord.getId()}
				]);
			formItems.push({
				xtype: 'list',
				cls: 'x-table-list',
				allowDeselect: false,
				itemTpl: getItemTpl(this.tableRecord),
				store: Ext.getStore(this.tableRecord)
			});
			
			this.expandable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Add',
				iconCls: 'add', scope: this
			});
		}
		
		this.items = [
			this.form = new Ext.form.FormPanel({items: formItems})
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
	}
});
Ext.reg('navigatorview', NavigatorView);