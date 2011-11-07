var NewNavigatorView = Ext.extend(AbstractView, {
	layout: {type: 'hbox', pack: 'justify', align: 'stretch'},
	
	objectRecord: undefined,
	
	createForm: function() {
		var tableStore = Ext.getStore('tables'),
			objectTable = tableStore.getById(this.objectRecord.modelName),
			objectColumnStore = objectTable.columns(),
			formItems = [],
			view = this
		;
		
		objectColumnStore.sort('parent', 'ASC');
	
		objectColumnStore.each(function(objectColumn) {
	
			if (objectColumn.get('label')) {
				var field = {
					name: objectColumn.get('name'),
					label: objectColumn.get('label')
				};
	
				var fieldConfig;
				switch(objectColumn.get('type')) {
					case 'boolean' : {
						fieldConfig = {xtype: 'togglefield'};
						break;
					}
					case 'date' : {
						fieldConfig = {
							xtype: 'datepickerfield',
							picker: {
								yearFrom: 2011,
								yearTo  : 2012,
								slotOrder: ['day', 'month', 'year']
							}
						};
						break;
					}
					default : {
						fieldConfig = {xtype: 'textfield'};
						break;
					}
				}
	
				Ext.apply(field, objectColumn.get('parent') 
						? {xtype: 'selectfield', store: Ext.getStore(objectColumn.get('parent')), valueField: 'id', displayField: 'name', onFieldLabelTap: true, onFieldInputTap: true}
						: fieldConfig
				);
	
				if(objectColumn.get('parent')) {
	
					var parentName = objectColumn.get('parent'),
						parentTable = tableStore.getById(parentName),
						parentDepStore = parentTable.deps()
					;
	
					var data = [];
					parentDepStore.each(function(parentDep) {
	
						if(parentDep.get('table_id') != view.objectRecord.modelName) {
							var depTable = tableStore.getById(parentDep.get('table_id'));
	
							var depRec = Ext.ModelMgr.create({
								name: depTable.get('nameSet'),
								table_id: depTable.get('id'),
								extendable: depTable.get('extendable'),
								contains: parentDep.get('contains'),
								editing: view.editing
							}, 'Dep');

							var filters = [];
							view.objectRecord.modelName != 'MainMenu' && filters.push({property: parentName.toLowerCase(), value: view.objectRecord.get(parentName[0].toLowerCase() + parentName.substring(1))});
	
							loadDepData(depRec, depTable, filters, 
								function(operation, aggResults, aggDepResult) {
									operation.depRec.set('aggregates', aggDepResult);

									var count = aggResults.cnt;
									if(count > 0) {
										operation.depRec.set('count', count);
									}
								}
							);
	
							data.push(depRec);
						}
					}); 
	
					var depList = {
						xtype: 'list',
						cls: 'x-parent-deps-list',
						scroll: false,
						disableSelection: true,
						itemTpl: getItemTpl('Dep'),
						store: new Ext.data.Store({model: 'Dep', data: data, parentModel: parentName})
					};
	
					formItems.push({xtype: 'panel', items: [field, depList]});
	
				} else {
					formItems.push(field);
				}
			}
		});
	
		formItems.push(this.depsList = Ext.create(createDepsList(objectTable.deps(), tableStore, this)));
	
		var filters = [];
		this.ownerViewConfig.objectRecord.modelName !== 'MainMenu' && filters.push({
			property: this.ownerViewConfig.objectRecord.modelName,
			value: this.ownerViewConfig.objectRecord.getId()
		});
	
		this.objectRecordStore = createStore(this.objectRecord.modelName, {filters: filters});
		this.objectRecordStore.load({limit: 0});
	
		this.objectRecordList = Ext.create({
			xtype: 'list',
			cls: 'x-object-record-list', allowDeselect: false, flex: 1,
			store: this.objectRecordStore,
			itemTpl: getItemTplMeta(this.objectRecord.modelName, undefined, undefined, undefined, true).itemTpl
		});
	
		return Ext.create({xtype: 'form', cls: 'x-navigator-form', flex: 2, items: formItems});
	},

	createItems: function() {

		var tablesStore = Ext.getStore('tables'),
	    	table = tablesStore.getById(this.objectRecord.modelName)
	    ;

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

		this.form = this.createForm();
		this.items = [this.objectRecordList, this.form];
	},

	initComponent: function() {

		this.addEvents('updateform');

		NewNavigatorView.superclass.initComponent.apply(this, arguments);

		this.on('show', this.loadData);
		this.on('updateform', this.updateForm);
	},

	updateForm: function(record) {

		this.form.loadRecord(record);

		var depLists = this.form.query('list'),
			view = this,
			tableStore = Ext.getStore('tables')
		;

		Ext.each(depLists, function(depList) {

			depList.el.hasCls('x-parent-deps-list') && depList.store.each(function(dep) {

				var filters = [],
					parentName = depList.store.parentModel
				;

				view.objectRecord.modelName != 'MainMenu' 
					&& filters.push({property: parentName.toLowerCase(), value: view.objectRecord.get(parentName[0].toLowerCase() + parentName.substring(1))});

				loadDepData(dep, tableStore.getById(dep.get('table_id')), filters,
					function(operation, aggResults, aggDepResult) {
						operation.depRec.set('aggregates', aggDepResult);
	
						var count = aggResults.cnt;
						operation.depRec.set('count', count);
					}
				);
			});
		});
		
		this.depsList.store.removeAll();
		this.depsList.store.loadData(getDepsData(tableStore.getById(this.objectRecord.modelName).deps(), tableStore, this));
	},

	loadData: function() {
		
		this.fireEvent('updateform', this.objectRecord);
		this.setFieldsDisabled(!this.editing);
	},

	setFieldsDisabled: function(disable) {

		var table = Ext.getStore('tables').getById(this.objectRecord.modelName),
			columnStore = table.columns(),
			fields = this.form.getFields()
		;

		Ext.iterate(fields, function(fieldName, field) {

			var column = columnStore.getById(table.getId() + fieldName);

			field.setDisabled(!column.get('editable') || disable);
		});
	}
});
Ext.reg('newnavigatorview', NewNavigatorView);