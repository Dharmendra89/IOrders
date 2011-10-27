var createModels = function(tablesStore) {

	tablesStore.each(function(table) {
		var fields = [], validations = [], tableName = table.getId();
		
		table.columns().each(function(column) {
			fields.push({
				name: column.get('name'),
				type: column.get('type'),
				useNull: true,
				defaultValue: null
			});
			
			column.get('name') == 'date'
				&& validations.push({
					type: 'length', field: column.get('name'), min: 1, message: 'обязательное для заполнения'
				})
			;
		});
		
		Ext.regModel(tableName, {
			fields: fields,
			modelName: tableName,
			proxy: {
				type: 'sql',
				engine: IOrders.dbeng
			},
			validations: validations
		});
		
		regStore(tableName);
	});

};

function continueLoad (store,r,s){
	if (s) {
		console.log ('Store '+store.storeId+' load success: '+r.length);
		
		if (r.length >= store.pageSize) {
			store.currentPage++;
			
			store.load({
				page : store.currentPage,
				start: (store.currentPage - 1) * this.pageSize,
				limit: this.pageSize,
				addRecords: true,
				listeners: {
					load: continueLoad
				}
			});
		}
	}
	else
		console.log ('Store '+store.storeId+' load failure');
}


var createStores = function(tablesStore, config) {
	
	tablesStore.each(function(table) {
		if (!(table.get('type') == 'view') && table.columns().data.map[table.getId() + 'name'] && table.deps().data.length) {
			regStore(table.getId(), Ext.apply({
				autoLoad: true,
				pageSize: 0,
				listeners: {
					load: continueLoad
				}
			}, Ext.apply(getSortersConfig(table.getId(), {}), config)));
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
		Ext.apply({
			remoteFilter: true,
			remoteSort: true,
			clearOnPageLoad: false,
			pageSize: 35,
			model: name,
			proxy: {
				type: 'sql',
				engine: IOrders.dbeng
			}
		}, config)
	);
};