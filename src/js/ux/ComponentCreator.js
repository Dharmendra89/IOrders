var CompCreator = function() {};

Ext.apply(CompCreator.prototype, {

	createComponents: function(config) {

		var items = [];

		Ext.iterate(config, function(compName, compConfig) {

			var component = this.createComponent(compName, compConfig);

			if(compConfig.components) {

				component.items = [].concat(this.createComponents(compConfig.components));
			}

			items = items.concat(component);
		}, this);

		return items;
	},

	createComponent: function(componentName, componentConfig) {

		var component = Ext.apply({}, componentConfig);

		switch(componentName) {
			case 'form' : {
				Ext.apply(component, {xtype: 'form'});
				break;
			}
			case 'fieldsMetadata' : {
				component = this.createMetadataFields(componentConfig);
				break;
			}
			case 'deplist' : {
				Ext.apply(component, {xtype: 'deplist'});
				break;
			}
			case 'objreclist' : {
				var store = createStore(componentConfig.view.objectRecord.modelName);
				store.load({limit: 0});

				Ext.apply(component, {
					xtype: 'list',
					cls: 'x-object-record-list',
					allowDeselect: false,
					store: store
				});
			}
		}

		return component;
	},

	createMetadataField: function(column, parentDepListConfig) {

		var field = {
			name: column.get('name'),
			label: column.get('label')
		};

		var fieldConfig;
		switch(column.get('type')) {
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

		Ext.apply(field, column.get('parent') 
				? {xtype: 'selectfield', store: Ext.getStore(column.get('parent')), valueField: 'id', displayField: 'name', onFieldLabelTap: true, onFieldInputTap: true}
				: fieldConfig
		);

		if(column.get('parent') && Ext.isObject(parentDepListConfig)) {

			var depList = {
				xtype: 'deplist',
				cls: 'x-parent-deps-list',
				objectRecord: parentDepListConfig.objectRecord,
				editing: parentDepListConfig.editing,
				modelForDeps: column.get('parent'),
				depFilter: parentDepListConfig.objectRecord.modelName != 'MainMenu'
					? {property: column.get('parent'), value: parentDepListConfig.objectRecord.get(getColumnNameFromModelName(column.get('parent')))}
					: undefined
			};

			return {xtype: 'panel', items: [field, depList]};

		} else {
			return field;
		}
	},

	createMetadataFields: function(config) {

		var view = config.view,
			objectRecord = view.objectRecord,
			table = Ext.getStore('tables').getById(objectRecord.modelName),
			columnStore = table.columns(),
			fields = []
		;

		columnStore.sort('parent', 'ASC');
	
		columnStore.each(function(column) {
	
			if (column.get('label')) {
				fields.push(this.createMetadataField(column, config.parentDepList ? {objectRecord: objectRecord, editing: view.editing} : false));
			}
		}, this);

		return fields;
	}
});

var ComponentCreator = new CompCreator();