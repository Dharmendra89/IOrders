Ext.regModel('Warehouse', {
	modelName: 'Warehouse',
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'}
	]
});

var data = {
	wars: [
		{id: 1, name: 'Север'},
		{id: 2, name: 'Юг'},
		{id: 3, name: 'Восток'}
	]
};

Ext.regStore('Warehouse', {
	model: 'Warehouse',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});

Ext.regModel('Customer', {
	modelName: 'Customer',
	fields: [
		{           
			name: 'id',
            type: 'string'
        },
        {           
        	name: 'name',
            type: 'string'
        },
        {           
        	name: 'address',
            type: 'string'
        },
        {           
        	name: 'warehouse',
            type: 'string'
        },
        {           
            name: 'partner',
            type: 'string'
        }
	]
});

var data = {
	wars: [
		{id: 1, name: 'ИП', address: 'Москва', warehouse: 1, partner: 'вфыв'}
	]
};

Ext.regStore('Customer', {
	model: 'Customer',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});

Ext.regModel('SaleOrder', {
	modelName: 'SaleOrder',
	fields: [
		{
			name: 'id',
			type: 'string'
		},
		{
			name: 'toDate',
			type: 'string'
		},
		{
			name: 'isCredit',
			type: 'boolean'
		},
		{
			name: 'isDocuments',
			type: 'boolean'
		},
		{
			name: 'customer',
			type: 'string'
		},
		{
			name: 'totalPrice',
			type: 'string'
		}
	]
});

var data = {
	wars: [
		{id: 1, toDate: '20.09.2011', isCredit: true, isDocuments: true, customer: 1, totalPrice: '0'}
	]
};

Ext.regStore('SaleOrder', {
	model: 'SaleOrder',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});

Ext.regModel('ProductCategory', {
	modelName: 'ProductCategory',
	fields: [
		{
			name: 'id',
			type: 'string'
		},
		{
			name: 'name',
			type: 'string'
		},
		{
			name: 'ord',
			type: 'int'
		},
		{
			name: 'packageName',
			type: 'string'
		},
		{
			name: 'totalPrice',
			type: 'string'
		}
	]
});

var data = {
	wars: [
		{id: 1, name: 'Консервы', ord: 1, packageName: 'Коробка', totalPrice: '0'},
		{id: 2, name: 'Консервы2', ord: 1, packageName: 'Коробка', totalPrice: '0'}
	]
};

Ext.regStore('ProductCategory', {
	model: 'ProductCategory',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});

Ext.regModel('Product', {
	modelName: 'Product',
	fields: [
		{
			name: 'id',
			type: 'string'
		},
		{
			name: 'name',
			type: 'string'
		},
		{
			name: 'firstName',
			type: 'string'
		},
		{
			name: 'factor',
			type: 'int'
		},
		{
			name: 'rel',
			type: 'int'
		},
		{
			name: 'category',
			type: 'string',
			parent: 'Category'
		},
		{
			name: 'price',
			type: 'float'	
		},
		{
			name: 'customer',
			type: 'string'
		},
		{
			name: 'volume',
			type: 'int'
		}
	]
});

var data = {
	wars: [
		{id: 1, name: 'Мясные консервы. Говядина', firstName: 'Мясные', factor: 2, rel: 12, category: 1, price: 22.22, customer: 1},
		{id: 2, name: 'Говядина', firstName: 'Мясные', factor: 2, rel: 12, category: 2, price: 22.22, customer: 1}
	]
};

Ext.regStore('Product', {
	model: 'Product',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});
/*
Ext.regModel('Customer', {
	modelName: 'Customer',
	fields: [
		{           
			name: 'id',
            type: 'string'
        },
        {           
        	name: 'name',
            type: 'string'
        },
        {           
        	name: 'address',
            type: 'string'
        },
        {           
        	name: 'warehouse',
            type: 'string'
        },
        {           
            name: 'partner',
            type: 'int'
        }
	]
});

var data = {
	wars: [
		{id: 1, name: 'ИП', address: 'Москва', warehouse: 1, partner: 'вфыв'}
	]
};

Ext.regStore('Customer', {
	model: 'Customer',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});
*/
Ext.regApplication({
	name: 'IOrders',
	beforeLauch: function() {
		this.viewport = Ext.create({xtype: 'viewport'});
	},
	launch: function() {
		this.beforeLauch();
		
		this.viewport.setActiveItem(new NavigatorView({
			isObjectView: true,
			objectRecord: Ext.ModelMgr.create({id: 1, name: 'Север'}, 'Warehouse')
		}));
	}
});