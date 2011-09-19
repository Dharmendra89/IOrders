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
		if(this.objectView) {
			formItems.push(createTitlePanel(table.get('name')));
			formItems.push(createFieldSet(table.columns()));
			formItems.push(createButtonsList(table.deps(), tablesStore));
		} else if (this.setView) {
			formItems.push(createTitlePanel(tablesStore.getById(this.tableRecord).get('nameSet')));
			formItems.push({
				xtype: 'list',
				cls: 'x-table-list',
				name: 'tableList',
				allowDeselect: false,
				itemTpl: getItemTpl(this.tableRecord),
				store: !this.objectRecord.modelName
					? Ext.getStore(this.tableRecord)
					: Ext.getStore(this.tableRecord).filter([
						{property: this.objectRecord.modelName.toLowerCase(), value: this.objectRecord.getId()}
					])
			});
		}
		
		this.items = [
			this.form = new Ext.form.FormPanel({items: formItems})
		];
		this.form.loadRecord(this.objectRecord);
	},
	/**
	 * Overridden
	 */
	initComponent: function() {
		this.createItems();
		NavigatorView.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('navigatorview', NavigatorView);