var composeMainMenu = function(tables) {
	var deps = [];
	var mainMenu = {
		id: 'MainMenu',
		name: 'Главное меню',
		columns: [{
			id: 'id',
			type: 'int'
		}],
		deps: deps
	};
	Ext.each(tables, function(item, idx, arr) {
		item.deps && deps.push({
			id: item.id + 'id',
			table_id: item.id
		});
	});
	tables.push(mainMenu);
};
Ext.regModel('Table', {
	fields: [{
		name: 'id',
		type: 'string'
	}, {
		name: 'name',
		type: 'string'
	}, {
		name: 'nameSet',
		type: 'string'
	}, {
		name: 'expandable',
		type: 'boolean'
	}],
	associations: [{
		type: 'hasMany',
		model: 'Column',
		name: 'columns'
	}, {
		type: 'hasMany',
		model: 'Column',
		foreignKey: 'parent',
		name: 'deps'
	}],
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'tables'
		}
	}
});

Ext.regModel('Column', {
	fields: [{
		name: 'id',
		type: 'string'
	}, {
		name: 'name',
		type: 'string'
	}, {
		name: 'label',
		type: 'string'
	}, {
		name: 'type',
		type: 'string'
	}, {
		name: 'table_id',
		type: 'string'
	}, {
		name: 'parent',
		type: 'string'
	}],
	associations: [{
		type: 'belongsTo',
		model: 'Table',
		foreignKey: 'parent'
	}]
});

Ext.regStore('tables', {
	model: 'Table'
});