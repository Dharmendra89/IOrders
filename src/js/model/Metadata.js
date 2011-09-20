var data = {
	tables: [
		{
			id: 'Warehouse',
    		nameSet: 'Склады',
    		name: 'Склад',
            columns: [
                {
	                id: 'id',
	                type: 'int'
                },
                {           
	                id: 'name',
	                name: 'Склад',
	                type: 'string'
                }
            ],
            deps: [
				{
				    id: 'warehouse',
				    name: 'Склад',
				    type: 'int',
				    table_id: 'Customer'
				}
            ]
        },
        {
        	id: 'Customer',
    		nameSet: 'Клиенты',
    		name: 'Клиент',
            columns: [
                {           
	                id: 'id',
	                type: 'int'
                },
                {           
	                id: 'name',
	                name: 'Наименование',
	                type: 'string'
                },
                {           
	                id: 'address',
	                name: 'Адрес',
	                type: 'string'
                },
                {           
	                id: 'warehouse',
	                name: 'Склад',
	                type: 'int',
	                parent: 'Warehouse'
                },
                {           
	                id: 'partner',
	                name: 'Патнер',
	                type: 'int'
                }
            ]
        }
]};
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
		{name: 'type', type: 'string'},
		{name: 'table_id', type: 'string'},
		{name: 'parent', type: 'string'}
	],
	associations: [
		{type: 'belongsTo', model: 'Table', foreignKey: 'parent'}
	]
});

Ext.regStore('tables', {
	model: 'Table',
});

var tStore = Ext.getStore('tables');
tStore.getProxy().data = data;
tStore.load();