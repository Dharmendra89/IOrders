var NavigatorView = Ext.extend(AbstractView, {
	objectRecord: undefined,
	tableRecord: undefined,
	/**
	 * Own
	 */
	createItems: function() {
		var store = Ext.getStore('tables');
		var table = store.getById(this.objectRecord.modelName);
		var formItems = [];
		if(table && !this.tableRecord) {
			var columnsStore = table.columns();
			var depsStore = table.deps();
			
			var fsItems = [];
			columnsStore.each(function(column) {
				if(column.get('name')) {
					var field = {name: column.get('id'), label: column.get('name')};
					Ext.apply(field, column.get('parent') 
						? {xtype: 'selectfield', store: Ext.get('parent')}
						: {xtype: 'textfield'});
					fsItems.push(field);
				}
			});
			formItems.push({xtype: 'panel', cls: 'x-title-panel', html: '<div>' + table.get('name') + '</div>'});
			formItems.push({
				xtype: 'fieldset',
				items: fsItems
			});
			
			var listData = [];
			depsStore.each(function(column) {
				var depTable = store.getById(column.get('table_id'));
				listData.push({name: depTable.get('nameSet'), table_id: depTable.get('id'), expandable: depTable.get('expandable')});
			});
			var btnsStore = new Ext.data.Store({
				model: 'Button'
			});
			btnsStore.loadData(listData);
			
			formItems.push({
				xtype: 'ux.list',
				cls: 'x-buttons-list',
				scroll: false,
				disableSelection: true,
				itemTpl: getItemTpl('Button'),
				store: btnsStore
			});
		} else {
			formItems.push({xtype: 'panel', cls: 'x-title-panel', html: '<div>' + store.getById(this.tableRecord).get('nameSet') + '</div>'});
			formItems.push({
				xtype: 'ux.list',
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