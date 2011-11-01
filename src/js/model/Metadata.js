var addMainMenu = function(store, tables) {

	var mainMenu = Ext.ModelMgr.create({
		id: 'MainMenu',
		name: 'Главное меню'
	}, 'Table');

	mainMenu.columns().add (
		{id: 'MainMenuid', type: 'string', name: 'id', label: 'Логин', table_id: 'MainMenu'}
	)

	var mmDeps = mainMenu.deps();
	
	Ext.each(tables, function(table) {
		if(table.deps().getCount() > 0) {
			mmDeps.add({
				id: table.getId() + 'id',
				table_id: table.getId()
			});
		}
	});
	
	store.add(mainMenu);
};


Ext.regModel('Table', {
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'type', type: 'string'}, // view or table
		{name: 'nameSet', type: 'string'},
		{name: 'extendable', type: 'boolean'},
		{name: 'editable', type: 'boolean'},
		{name: 'belongs', type: 'string'},
	],
 	associations: [
		{type: 'hasMany', model: 'Column', name: 'columns'},
		{type: 'hasMany', model: 'Column', name: 'deps', foreignKey: 'parent'}
	],
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'tables'
		}
	},
	hasIdColumn: function() {
		return this.columns().findExact('name', 'id') !== -1 ? true : false;
	},
	hasAggregates: function() {
		return this.getAggregates().getCount() > 0 ? true : false;
	},
	getAggregates: function() {
		return this.columns().queryBy(function(rec) {return rec.get('aggregable') ? true : false;});
	}
});

Ext.regModel('Column', {
	fields: [
			{name: 'id', type: 'string'},
			{name: 'name', type: 'string'},
			{name: 'label', type: 'string'},
			{name: 'type', type: 'string'},
			{name: 'table_id', type: 'string'},
			{name: 'key', type: 'boolean'},
			{name: 'aggregable', type: 'string'},
			{name: 'parent', type: 'string'},
			{name: 'contains', type: 'boolean'}
	],
	associations: [
		{type: 'belongsTo', model: 'Table'}
	]
});

Ext.regModel('Dep', {
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'parent', type: 'string'},
		{name: 'table_id', type: 'string'},
		{name: 'extendable', type: 'boolean'},
		{name: 'editing', type: 'boolean'},
		{name: 'count', type: 'int'},
		{name: 'contains', type: 'boolean'},
		{name: 'aggregates', type: 'string'}
	]
});

Ext.regStore('tables', {
	model: 'Table',
	listeners: {
		load: function(store, records, s) {
			addMainMenu(store, records);
		}
	}
});