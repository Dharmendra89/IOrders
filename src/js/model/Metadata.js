var data = {
	"tables": [{
		"id": "Warehouse",
		"name": "Склад",
		"nameSet": "Склады",
		"columns": [{
			"id": "id",
			"type": "string"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}],
		"deps": [{
			"table_id": "Customer",
			"id": "warehouse",
		}, {
			"table_id": "Stock",
			"id": "warehouse"
		}]
	}, {
		"id": "Customer",
		"name": "Клиент",
		"nameSet": "Клиенты",
		"columns": [{
			"id": "id",
			"type": "string"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}, {
			"id": "address",
			"name": "Адрес",
			"type": "string"
		}, {
			"id": "warehouse",
			"parent": "Warehouse"
		}, {
			"id": "partner",
			"parent": "Partner"
		}],
		"deps": [{
			"table_id": "SaleOrder",
			"id": "customer"
		}]
	}, {
		"id": "SaleOrder",
		name: 'Заказ',
		nameSet: 'Заказы',
		"columns": [{
			"id": "customer",
			"parent": "Customer"
		}, {
			"id": "id",
			"type": "int"
		}, {
			"id": "xid"
		}, {
			"id": "incassNeeded",
			"name": "Требуется инкассация",
			"type": "boolean"
		}, {
			"id": "isWhite",
			"name": "Нужен счет-фактура",
			"type": "boolean"
		}, {
			"id": "date",
			"name": "Дата",
			"type": "date"
		}],
		"deps": [{
			"table_id": "SaleOrderPosition",
			"id": "saleorder"
		}]
	}, {
		"id": "SaleOrderPosition",
		nameSet: 'Позиции заказа',
		"columns": [{
			"id": "saleorder",
			"parent": "SaleOrder"
		}, {
			"id": "volume",
			"name": "Кол-во",
			"type": "int"
		}, {
			"id": "cost",
			"name": "Стоимость",
			"type": "float"
		}, {
			"id": "xid"
		}, {
			"id": "article",
			"parent": "Product"
		}]
	}, {
		"id": "Stock",
		"name": "Остаток",
		"nameSet": "Остатки",
		"columns": [{
			"id": "warehouse",
			"parent": "Warehouse"
		}, {
			"id": "product",
			"parent": "Product"
		}, {
			"id": "level",
			"type": "int"
		}]
	}, {
		"id": "PricelistSet",
		"columns": [{
			"id": "id",
			"type": "int"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}],
		"deps": [{
			"table_id": "PartnerPriceList",
			"id": "pricelist-set"
		}]
	}, {
		"id": "Pricelist",
		"columns": [{
			"id": "id",
			"type": "int"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}],
		"deps": [{
			"table_id": "PartnerPriceList",
			"id": "pricelist"
		}, {
			"table_id": "Price",
			"id": "pricelist"
		}]
	}, {
		"id": "Category",
		"name": "Категория товаров",
		"nameSet": "Категории товаров",
		"columns": [{
			"id": "id",
			"type": "int"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}, {
			"id": "ord",
			"type": "int"
		}],
		"deps": [{
			"table_id": "Price",
			"id": "category"
		}, {
			"table_id": "Product",
			"id": "category"
		}]
	}, {
		"id": "Price",
		"name": "Цена прайс-листа",
		"nameSet": "Цены прайс-листа",
		"columns": [{
			"id": "category",
			"parent": "Category"
		}, {
			"id": "price",
			"name": "Цена",
			"type": "float"
		}, {
			"id": "pricelist",
			"parent": "Pricelist"
		}, {
			"id": "product",
			"parent": "Product"
		}]
	}, {
		"id": "Product",
		"name": "Товар",
		"nameSet": "Товары",
		"columns": [{
			"id": "category",
			"parent": "Category"
		}, {
			"id": "id",
			"type": "int"
		}, {
			"id": "name",
			"name": "Наименование",
			"type": "string"
		}, {
			"id": "firstName",
			"name": "Преднаименование",
			"type": "string"
		}, {
			"id": "factor",
			"name": "Кратность",
			"type": "int"
		}, {
			"id": "rel",
			"name": "Шт. в упаковке",
			"type": "int"
		}],
		"deps": [{
			"table_id": "Price",
			"id": "product"
		}, {
			"table_id": "SaleOrderPosition",
			"id": "article"
		}, {
			"table_id": "Stock",
			"id": "product"
		}]
	}, {
		"id": "Partner",
		"name": "Партнер",
		"nameSet": "Партнеры",
		"columns": [{
			"id": "id",
			"type": "int"
		}, {
			"id": "name",
			"name": "Название",
			"type": "string"
		}],
		"deps": [{
			"table_id": "PartnerPriceList",
			"id": "partner"
		}, {
			"table_id": "Customer",
			"id": "partner"
		}, {
			"table_id": "Debt",
			"id": "partner"
		}]
	}, {
		"id": "PartnerPriceList",
		"name": "Прайслист партнера",
		"nameSet": "Прайслисты партнера",
		"columns": [{
			"id": "partner",
			"parent": "Partner"
		}, {
			"id": "pricelist",
			"parent": "Pricelist"
		}, {
			"id": "pricelist-set",
			"parent": "PricelistSet"
		}, {
			"id": "discount",
			"name": "% скидки",
			"type": "float"
		}]
	}, {
		"id": "Debt",
		"name": "Задолженность",
		"nameSet": "Задолженность",
		"columns": [{
			"id": "id",
			"type": "int"
		}, {
			"id": "ddate",
			"name": "Дата",
			"type": "date"
		}, {
			"id": "ndoc",
			"name": "Документ№",
			"type": "string"
		}, {
			"id": "fullSumm",
			"name": "Сумма",
			"type": "float"
		}, {
			"id": "isWhite",
			"name": "Нужен чек",
			"type": "boolean"
		}, {
			"id": "remSumm",
			"name": "Задолженность",
			"type": "float"
		}, {
			"id": "partner",
			"parent": "Partner"
		}]
	}]
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
	model: 'Table',
});

var tStore = Ext.getStore('tables');
tStore.getProxy().data = data;
tStore.load();