var composeMainMenu = function(tables) {

	var deps = [];
	var mainMenu = {
		id: 'MainMenu',
		name: 'Главное меню',
		columns: [{id: 'id', type: 'int'}],
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

var composeOffer = function(tables) {

	var offer = {
		id: 'Offer',
		name: 'Продукт',
		nameSet: 'Предложения продуктов',
		columns: [
				{name: 'product', type: 'int'},
				{name: 'category', type: 'int', parent: 'Category'},
				{name: 'customer', type: 'int', parent: 'Customer'},
				{name: 'price', type: 'float'}, 
				{name: 'isActive', type: 'int'},
				{name: 'stockLevel', type: 'int'},
				{name: 'name', type: 'string'},
				{name: 'firstName', type: 'string'},
				{name: 'factor', type: 'int'},
				{name: 'rel', type: 'int'}
		]
	};

	tables.push(offer);
};

Ext.regModel('Table', {
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'},
		{name: 'nameSet', type: 'string'},
		{name: 'expandable', type: 'boolean'}
	],
 	associations: [
		{type: 'hasMany', model: 'Column', name: 'columns'},
		{type: 'hasMany', model: 'Column', foreignKey: 'parent', name: 'deps'}
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
		{type: 'belongsTo', model: 'Table', foreignKey: 'parent'}
	]
});

Ext.regStore('tables', {
	model: 'Table'
});