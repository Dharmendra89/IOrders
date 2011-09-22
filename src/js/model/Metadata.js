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
    		expandable: true,
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
            ],
            deps: [
            	{
        			id: 'customer',
        			type: 'string',
        			table_id: 'SaleOrder'
        		}
           	]
        },
        {
        	id: 'SaleOrder',
        	nameSet: 'Заказы',
        	name: 'Заказ',
        	expandable: true,
        	columns: [
        		{
        			id: 'id',
        			type: 'string',
        		},
        		{
        			id: 'toDate',
        			name: 'Дата',
        			type: 'string'
        		},
        		{
        			id: 'isCredit',
        			name: 'В кредит',
        			type: 'boolean'
        		},
        		{
        			id: 'isDocuments',
        			name: 'Документы',
        			type: 'boolean'
        		},
        		{
        			id: 'customer',
        			name: 'Клиент',
        			type: 'string',
        			parent: 'Customer'
        		}
        	],
        	deps: [
        		{
        			id: 'product',
        			type: 'string',
        			table_id: 'SaleOrderPosition'
        		}
        	]
        },
        {
        	id: 'SaleOrderPosition',
        	nameSet: 'Позиции заказ',
        	name: 'Позиция заказа',
        	expandable: true,
        	columns: [
        		{
        			id: 'id',
        			type: 'string',
        		},
        		{
        			id: 'saleOrder',
        			type: 'string'
        		},
        		{
        			id: 'price',
        			type: 'float'
        		},
        		{
        			id: 'volume',
        			type: 'int'
        		},
        		{
        			id: 'product',
        			type: 'string'
        		},
        		{
        			id: 'rel',
        			type: 'int'
        		}
        	]
        },
        {
        	id: 'Category',
        	name: 'Категория',
        	nameSet: 'Категории',
        	columns: [
        		{
        			id: 'id',
        			type: 'string'
        		},
        		{
        			id: 'name',
        			type: 'string'
        		},
        		{
        			id: 'ord',
        			type: 'int'
        		},
        		{
        			id: 'packageName',
        			type: 'string'
        		}
        	],
        	deps: [
				{
					id: 'category',
					type: 'string',
					table_id: 'Product'
				}
        	]
        },
        {
        	id: 'Product',
        	name: 'Товар',
        	nameSet: 'Товары',
        	columns: [
        		{
        			id: 'id',
        			type: 'string'
        		},
        		{
        			id: 'name',
        			type: 'string'
        		},
        		{
        			id: 'firstName',
        			type: 'string'
        		},
        		{
        			id: 'factor',
        			type: 'int'
        		},
        		{
        			id: 'rel',
        			type: 'int'
        		},
        		{
        			id: 'category',
        			type: 'string',
        			parent: 'Category'
        		},
        		{
        			id: 'price',
        			type: 'float'	
        		},
        		{
        			id: 'customer',
        			type: 'string'
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