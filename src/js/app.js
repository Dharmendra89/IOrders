Ext.regModel('Warehouse', {
	modelName: 'Warehouse',
	fields: [
		{name: 'id', type: 'int'},
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
            type: 'int'
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
            type: 'int'
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