var NavigatorView = Ext.extend(AbstractView, {
	
	objectRecord: undefined,
	tableRecord: undefined,
	
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

		this.items = [];

		this.dockedItems[0].title = table.get('name');

		var sb = this.syncButton = new Ext.Button ({
			
			iconMask: true,
			name: 'Sync',
			iconCls: 'action',
			scope: this,
			
			checkDisabled: function(){
				this.setDisabled(IOrders.xi.isBusy())
			},
			
			rebadge: function(){
				var me = sb,
					p = new Ext.data.SQLiteProxy({
						engine: IOrders.dbeng,
						model: 'ToUpload'
					})
				;
				
				p.count(new Ext.data.Operation(), function(o) {
					if (o.wasSuccessful())
						me.setBadge(me.cnt = o.result);
				});
			}
			
		});
		
		sb.checkDisabled();
		
		sb.mon (
			this,
			'saved',
			sb.rebadge,
			sb
		);
		
		sb.mon (
			IOrders.xi.connection,
			'beforerequest',
			sb.setDisabled,
			sb
		);
		sb.mon (
			IOrders.xi.connection,
			'requestcomplete',
			function () {
				sb.checkDisabled();
				if (sb.getBadgeText() == '!!')
					sb.setBadge(sb.cnt);
			},
			sb, {delay: 1000}
		);
		sb.mon (
			IOrders.xi.connection,
			'requestexception',
			function () {
				sb.checkDisabled();
				sb.setBadge('!!');
			},
			sb, {delay: 1000}
		);
		
		
		this.dockedItems[0].items.push (this.syncButton);
		
		if(this.isObjectView) {
			
			table.columns().each( function (c) {
				var cName = c.get('name');
				
				if (String.right(cName, 10) == 'processing') {
					var statusButtons = [],
						state = me.objectRecord.get(cName) || 'draft'
					;
					
					statusButtons =  [
						{text: 'Черновик', name: 'draft', enable: function(s) { return s == 'upload'; }},
						{text: 'В работу', name: 'upload', enable: function(s) { return s == 'draft'; } },
						{text: 'Проверка', name: 'processing'},
						{text: 'На складе', name: 'done'}
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
					});
				}
			});
		
			this.cls = 'objectView';

			formItems.push(createFieldSet(table.columns(), this.objectRecord.modelName, this));

			var spacerExist = false;
			if(table.get('deletable')) {
				this.dockedItems[0].items.push(
					{xtype: 'spacer'},
					{
						itemId: 'Delete',
						name: 'Delete',
						text: 'Удалить',
						scope: this,
						hidden: this.objectRecord.fields.getByKey('processing') && this.objectRecord.get('processing') !== 'draft'
					}
				);
				spacerExist = true;
			}

			if(table.get('editable') || (this.editing && table.get('extendable'))) {

				spacerExist || this.dockedItems[0].items.push({xtype: 'spacer'});
				this.dockedItems[0].items.push(
					{itemId: 'Cancel', name: 'Cancel', text: 'Отменить', hidden: true, scope: this},
					{
						itemId: 'SaveEdit',
						name: this.editing ? 'Save' : 'Edit',
						text: this.editing ? 'Сохранить' : 'Редактировать',
						hidden: this.objectRecord.fields.getByKey('processing') && this.objectRecord.get('processing') !== 'draft',
						scope: this
					}
				);
			}
			
			table.get('extendable') && !table.get('belongs') && this.dockedItems[0].items.push({
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

			if(IOrders.newDesign && table.hasNameColumn()) {

				var store = createStore(this.objectRecord.modelName, getSortersConfig(this.objectRecord.modelName, getSortersConfig(this.objectRecord.modelName, {})));

				var limit = 0, curPage = 1;
				if(me.ownerViewConfig.tableRecord.modelName === me.objectRecord.modelName) {

					limit = me.ownerViewConfig.storeLimit;
					curPage = me.ownerViewConfig.storePage;
				}
				store.load({limit:  limit});
				store.currentPage = curPage;

				this.items.push(me.objectList = Ext.create({
					xtype: 'list',
					flex: 1,
					plugins: limit !== 0 ? new Ext.plugins.ListPagingPlugin({autoPaging: true}) : undefined, 
					itemTpl: getItemTplMeta(this.objectRecord.modelName, {useDeps: false, onlyKey: true}).itemTpl,
					store: store,
					initComponent: function() {
						var scroll = this.scroll;
						Ext.List.prototype.initComponent.apply(this, arguments);
						if (typeof scroll == 'object')
							this.scroll = scroll;
					},
					listeners: {
						scope: this,
						refresh: function(list) {

							if(list.store.getCount() > 1) {

								var idx = list.store.findExact('id', this.objectRecord.getId());
								list.selModel.select(idx);

								item = Ext.fly(list.getNode(idx));

								item && list.scroller.setOffset({
									y: -item.getOffsetsTo(list.scrollEl)[1]
								});
							}
						},
						selectionchange: function(selModel, recs) {

							if(recs.length) {

								Ext.dispatch({
									controller: 'Navigator',
									action: 'onObjectListItemSelect',
									selected: recs[0],
									view: me
								});
							}
						}
					}
				}));
			}

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
			
			var table = tablesStore.getById(this.tableRecord);
			
			table.get('extendable') && !table.get('belongs') && this.dockedItems[0].items.push({xtype: 'spacer'}, {
				ui: 'plain', iconMask: true, name: 'Add', iconCls: 'add', scope: this
			});
		}
		
		this.mon (this, 'activate', this.syncButton.rebadge);
		
		this.items.push(this.form = new Ext.form.FormPanel(Ext.apply({
				flex: 2,
				cls: 'x-navigator-form ' + this.cls,
				scroll: true,
				items: formItems
			}, formConfig))
		);
	},
	
	/**
	 * Overridden
	 */
	
	initComponent: function() {

		NavigatorView.superclass.initComponent.apply(this, arguments);
		this.mon (this,'show', this.loadData);
		this.addEvents ('saved');
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