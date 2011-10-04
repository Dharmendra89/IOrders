var composeMainMenu = function(tables) {

	var mainMenu = {
		id: 'MainMenu',
		name: 'Главное меню',
		columns: [{id: 'id', type: 'int'}],
		deps: []
	};

	Ext.each(tables, function(item, idx, arr) {
		item.deps && mainMenu.deps.push({
			id: item.id + 'id',
			table_id: item.id
		});
	});
	
	tables.push(mainMenu);
};


Ext.regModel('Table', {
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'type', type: 'string'}, // view or table
		{name: 'nameSet', type: 'string'},
		{name: 'extendable', type: 'boolean'}
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
	}
});

Ext.regModel('Column', {
	fields: [
			{name: 'id', type: 'string'},
			{name: 'name', type: 'string'},
			{name: 'label', type: 'string'},
			{name: 'type', type: 'string'},
			{name: 'table_id', type: 'string'},
			{name: 'parent', type: 'string'}
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
		{name: 'count', type: 'int'}
	]
});

Ext.regStore('tables', {
	model: 'Table'
});