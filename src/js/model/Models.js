var createModels = function(tablesStore) {

	tablesStore.each(function(table) {
		var fields = [];
		table.columns().each(function(column) {
			fields.push({
				name: column.get('name'),
				type: column.get('type')
			});
		});
		modelConfig = {
			modelName: table.getId(),
			fields: fields
		};
		Ext.regModel(table.getId(), Ext.apply(modelConfig, {
			modelConfig: modelConfig
		}));
		createStore(table.getId());
	});
};

var createExtandableModels = function() {
	/**
	 * New ProductCategory
	 */
	Ext.regModel('Category', {
		extend: 'Category',
		modelname: 'Category',
		fields: [{
			name: 'totalPrice',
			type: 'string'
		}]
	});
	/**
	 * New SaleOrder
	 */
	Ext.regModel('SaleOrder', {
		extend: 'SaleOrder',
		modelname: 'SaleOrder',
		fields: [{
			name: 'totalPrice',
			type: 'string'
		}]
	});
};

var createStores = function(tablesStore) {
	tablesStore.each(function(table) {
		createStore(table.getId());
	});
	Ext.apply(Ext.getStore('Offer'), {
		getGroupString: function(rec) {
			return rec.get('firstName');
		}
	});
	Ext.getStore('Offer').sort('firstName', 'DESC');
};

var createStore = function(name, config) {
	Ext.regStore(name, Ext.apply({
		remoteFilter: true,
		clearOnPageLoad: false,
		model: name,
		proxy: {
			type: 'sql',
			engine: IOrders.dbeng
		}
	}, config));
};