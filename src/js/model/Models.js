var createModels = function(tablesStore) {
	
	tablesStore.each(function(table) {
		var fields = [];
		table.columns().each(function(column) {
			fields.push({name: column.get('name'), type: column.get('type')});
		});
		modelConfig = {
			modelName: table.getId(),
			fields: fields
		};
		Ext.regModel(table.getId(), Ext.apply(modelConfig, {modelConfig: modelConfig}));
		createStore(table.getId());
	});
};

var createExtandableModels = function() {
	/**
	 * Offer
	 */
	Ext.regModel('Offer', {
		extend: 'Product',
		modelname: 'Offer',
		fields: [
			{name: 'price', type: 'float'},
			{name: 'customer', type: 'string'}
		]
	});
	createStore('Offer', {
		getGroupString: function(rec) {
			return rec.get('firstName');
		}
	});
	/**
	 * New ProductCategory
	 */
	Ext.regModel('Category', {
		extend: 'Category',
		modelname: 'Category',
		fields: [
			{name: 'totalPrice', type: 'string'}
		]
	});
	/**
	 * New SaleOrder
	 */
	Ext.regModel('SaleOrder', {
		extend: 'SaleOrder',
		modelname: 'SaleOrder',
		fields: [
			{name: 'totalPrice', type: 'string'}
		]
	});
};

var createStores = function(tablesStore) {
	tablesStore.each(function(table) {
		createStore(table.getId());
	});
};

var createStore = function(name, config) {
	Ext.regStore(name, Ext.apply({
		remoteFilter: true,
		model: name,
		proxy: {
			type: 'sql',
			engine: IOrders.dbeng
		}
	}, config));
};