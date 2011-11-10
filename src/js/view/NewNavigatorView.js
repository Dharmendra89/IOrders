var NewNavigatorView = Ext.extend(AbstractView, {

	layout: {type: 'hbox', pack: 'justify', align: 'stretch'},

	objectRecord: undefined,

	initCompConfig: function() {

		this.components = {
			objreclist: {
				flex: 1,
				itemTpl: getItemTplMeta(this.objectRecord.modelName, undefined, undefined, undefined, true).itemTpl,
				view: this
			},
			form: {
				itemId: 'form',
				cls: 'x-navigator-form',
				flex: 2,
				components: {
					fieldsMetadata: {
						parentDepList: true,
						view: this 
					},
					deplist: {
						itemId: 'depsList',
						cls: 'x-deps-list',
						objectRecord: this.objectRecord,
						editing: this.editing,
						modelForDeps: this.objectRecord.modelName,
						depFilter: this.objectRecord.modelName != 'MainMenu'
							? {property: this.objectRecord.modelName, value: this.objectRecord.getId()}
							: undefined
					}
				}
			}
		}; 
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

		this.items = ComponentCreator.createComponents(this.components);
	},

	initComponent: function() {

		this.initCompConfig();
		this.addEvents('updateform');

		NewNavigatorView.superclass.initComponent.apply(this, arguments);

		this.on('show', this.loadData);
		this.on('updateform', this.updateForm);
	},

	updateForm: function(record) {

		this.getComponent('form').loadRecord(record);

		var depLists = this.query('deplist');
		Ext.each(depLists, function(depList) {

			depList.reloadList({
				objectRecord: record,
				editing: false,
				depFilter: depList.modelForDeps != 'MainMenu'
					? {property: depList.modelForDeps, value: record.modelName === depList.modelForDeps ? record.getId() :record.get(getColumnNameFromModelName(depList.modelForDeps))}
					: undefined 
			});
		});
	},

	loadData: function() {
		
		this.getComponent('form').loadRecord(this.objectRecord);
		this.setFieldsDisabled(!this.editing);
	},

	setFieldsDisabled: function(disable) {

		var table = Ext.getStore('tables').getById(this.objectRecord.modelName),
			columnStore = table.columns(),
			fields = this.getComponent('form').getFields()
		;

		Ext.iterate(fields, function(fieldName, field) {

			var column = columnStore.getById(table.getId() + fieldName);

			field.setDisabled(!column.get('editable') || disable);
		});
	}
});
Ext.reg('newnavigatorview', NewNavigatorView);