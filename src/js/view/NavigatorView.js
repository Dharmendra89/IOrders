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
		    formItems = [],
			me = this,
			statusesStore = Ext.getStore('statuses'),
			formConfig = {}
		;
		
		this.dockedItems[0].title = table.get('name');
		
		this.syncButton = new Ext.Button ({
			iconMask: true,
			name: 'Sync',
			iconCls: 'action',
			scope: this
		});
		
		this.dockedItems[0].items.push (this.syncButton);
		
		if(this.isObjectView) {
			
			table.columns().each( function (c) {
				var cName = c.get('name');
				
				if (String.right(cName, 3) == 'ing') {
					var statusButtons = [],
						state = me.objectRecord.get(cName) || 'draft'
					;
					
					statusButtons =  [
						{text: 'Черновик', name: 'draft', enable: function(s) { return s == 'incomplete' }},
						{text: 'На сервер', name: 'incomplete', enable: function(s) { return s == 'draft' } },
						{text: 'На склад', name: 'processing'},
						{text: 'Готово', name: 'done'}
					];
					
					if (me.objectRecord) Ext.each (statusButtons, function(b) {
						b.pressed = (b.name == state);
						
						b.disabled = true;
						
						if (b.enable) b.disabled = !b.enable(state);
						
						if (b.pressed) b.disabled = false;
					});
					
					formItems.push({
						xtype: 'toolbar',
						dock: 'top',
						ui: 'none',
						items:[
							{	xtype: 'segmentedbutton',
								items: statusButtons,
								name: cName, cls: 'statuses'
							}
						]
					})
				}
			});
		
			this.cls = 'objectView';
			
			formItems.push(createFieldSet(table.columns(), this.objectRecord.modelName, this));
			
			if(table.get('editable') || (this.editing && table.get('extendable'))) {
				this.dockedItems[0].items.push(
					{xtype: 'spacer'},
					{itemId: 'Cancel', name: 'Cancel', text: 'Отменить', hidden: true, scope: this},
					{
						itemId: 'SaveEdit',
						name: this.editing ? 'Save' : 'Edit',
						text: this.editing ? 'Сохранить' : 'Редактировать',
						scope: this
					}
				);
			}
			
			table.get('extendable') && this.dockedItems[0].items.push({
				itemId: 'Add', ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this, hidden: this.editing
			});
			
			if (this.objectRecord.modelName === 'MainMenu') {
				
				this.dockedItems[0].items.push (
					{xtype: 'spacer'}
				);
				
				this.dockedItems[0].items.push ({
						iconMask: true,
						name: 'Prefs',
						iconCls: 'settings',
						scope: this
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
			}, getItemTplMeta(this.tableRecord, {filterObject: this.objectRecord, groupField: listGroupedConfig.field})));
			
			this.extendable && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this
			});
		}
		
		this.mon (this, 'activate', function(){
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
		
		this.items = [
			this.form = new Ext.form.FormPanel(Ext.apply({
				cls: 'x-navigator-form ' + this.cls,
				scroll: true,
				items: formItems
			}, formConfig))
		];
	},
	
	/**
	 * Overridden
	 */
	
	initComponent: function() {
		NavigatorView.superclass.initComponent.apply(this, arguments);
		this.mon (this,'show', this.loadData);
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