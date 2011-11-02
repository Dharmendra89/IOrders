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
			
			this.cls = 'objectView';
			this.dockedItems[0].title = table.get('name');
			
			//if (this.objectRecord.modelName != 'MainMenu')
				formItems.push(createFieldSet(table.columns(), this.objectRecord.modelName, this));
			
			if(table.get('editable') || (this.editing && table.get('extendable'))) {
				this.dockedItems[0].items.push(
					{xtype: 'spacer'},
					{id: 'Cancel', name: 'Cancel', text: 'Отменить', hidden: true, scope: this},
					{
						id: 'SaveEdit',
						name: this.editing ? 'Save' : 'Edit',
						text: this.editing ? 'Сохранить' : 'Редактировать',
						scope: this
					}
				);
			}
			
			table.get('extendable') && this.dockedItems[0].items.push({
				id: 'Add', ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this, hidden: this.editing
			});
			
			if (this.objectRecord.modelName === 'MainMenu') {
				
				this.syncButton = new Ext.Button ({
					iconMask: true,
					name: 'Sync',
					iconCls: 'action',
					scope: this
				});
				
				this.dockedItems[0].items = [
					{xtype: 'spacer'},
					this.syncButton,
					{
						iconMask: true,
						name: 'Prefs',
						iconCls: 'settings',
						scope: this
					}
				];
				
				this.on ('activate', function(){
					var me = this.syncButton,
						p = new Ext.data.SQLiteProxy({
							engine: IOrders.dbeng,
							model: 'ToUpload'
						})
					;
					
					p.count(new Ext.data.Operation(), function(o) {
						if (o.wasSuccessful())
							me.setBadge(o.result);
					});
				});
				
			}
			
			if (!this.editable || this.objectRecord.modelName == 'SaleOrder')
				formItems.push(createDepsList(table.deps(), tablesStore, this));
			
		} else if (this.isSetView) {
			
			this.cls = 'setView';
			this.dockedItems[0].title = tablesStore.getById(this.tableRecord).get('nameSet');
			
			if(this.objectRecord.modelName != 'MainMenu') {
				formItems.push(createFilterField(this.objectRecord));
			}
			
			var listGroupedConfig = getGroupConfig(this.tableRecord);
			var sortersConfig = getSortersConfig(this.tableRecord, listGroupedConfig);
			
			this.setViewStore = createStore(this.tableRecord, Ext.apply(listGroupedConfig, sortersConfig));

			formItems.push(Ext.apply({
				xtype: 'list',
				plugins: new Ext.plugins.ListPagingPlugin({autoPaging: true}),
				scroll: false,
				cls: 'x-table-list',
				grouped: listGroupedConfig.field ? true : false,
				disableSelection: true,
				onItemDisclosure: true,
				store: this.setViewStore
			}, getItemTplMeta(this.tableRecord, table, this.objectRecord, listGroupedConfig.field)));
			
			this.extendable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this
			});
		}
		
		this.items = [
			this.form = new Ext.form.FormPanel({
				cls: 'x-navigator-form ' + this.cls,
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
		this.on ('show', this.loadData);
	},
	
	loadData: function() {
		this.form.loadRecord(this.objectRecord);
		this.isObjectView && this.setFieldsDisabled(!this.editing);
	},
	
	setFieldsDisabled: function(disable) {

		if(this.isObjectView) {

			var table = Ext.getStore('tables').getById(this.objectRecord.modelName),
				columnStore = table.columns(),
				fields = this.form.getFields()
			;

			Ext.iterate(fields, function(fieldName, field) {

				var column = columnStore.getById(table.getId() + fieldName);

				field.setDisabled(!column.get('editable') || disable);
			});
		}
	}
	
});

Ext.reg('navigatorview', NavigatorView);