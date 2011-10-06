var createModels = function(tablesStore) {

	tablesStore.each(function(table) {
		var fields = [], tableName = table.getId();
		
		table.columns().each(function(column) {
			fields.push({
				name: column.get('name'),
				type: column.get('type')
			});
		});	
		
		Ext.regModel(tableName, {
			fields: fields,
			modelName: tableName,
			proxy: {
				type: 'sql',
				engine: IOrders.dbeng
			}
		});
		
		regStore(tableName);
	});

};

var createStores = function(tablesStore) {
	
	tablesStore.each(function(table) {
		if (!(table.get('type') == 'view') && table.columns().data.map[table.getId() + 'name'] && table.deps().data.length) {
			regStore(table.getId(), {
				autoLoad:true,
				pageSize: 0,
				listeners: {
					load: function(store,r,s){
						if (s)
							console.log ('Store '+store.storeId+' load success: '+r.length);
						else
							console.log ('Store '+store.storeId+' load failure');
					}
				}
			});
		}
	});
	
};

var regStore = function(name, config) {
	
	Ext.regStore(name, Ext.apply({
		model: name,
		remoteFilter: true,
		remoteSort: true, 
		proxy: {
			type: 'sql',
			engine: IOrders.dbeng
		}
	}, config));
	
};

var createStore = function(name, config) {
	return new Ext.data.Store(
		Ext.apply({remoteFilter: true, remoteSort: true, clearOnPageLoad: false, model: name, proxy: {type: 'sql', engine: IOrders.dbeng}}, config)
	);
}