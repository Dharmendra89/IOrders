var NavigatorView = Ext.extend(AbstractView, {
	objectRecord: undefined,
	tableRecord: undefined,
	layout: 'fit',
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

			this.objectRecord.modelName === 'MainMenu' && this.dockedItems[0].items.splice(0, 1);

			this.editable && this.objectRecord.modelName !== 'SaleOrder' || formItems.push(createButtonsList(table.deps(), tablesStore, this.objectRecord));
			this.editable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Save',
				iconCls: 'compose', scope: this
			});
		} else if (this.isSetView) {
			formItems.push(createTitlePanel(tablesStore.getById(this.tableRecord).get('nameSet')));
			if(this.objectRecord.modelName != 'MainMenu') {
				formItems.push(createFilterField(this.objectRecord));
				Ext.getStore(this.tableRecord).clearFilter(true);
				if(this.objectRecord.modelName) {
					Ext.getStore(this.tableRecord).filter([
						{property: this.objectRecord.modelName.toLowerCase(), value: this.objectRecord.getId()}
					]);
				} else {
					Ext.getStore(this.tableRecord).load();
				}
			} else {
				Ext.getStore(this.tableRecord).load();
			}
			formItems.push({
				xtype: 'list',
				scroll: false,
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
			this.form = new Ext.form.FormPanel({
				scroll: true,
				items: formItems
			})
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
		console.log(this.objectRecord.data);
	}
});
Ext.reg('navigatorview', NavigatorView);