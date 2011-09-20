var getItemTpl = function(modelName) {
	switch(modelName) {
		case 'Button' : {
			return '<div>{name}</div>';
		}
		case 'Warehouse' : {
			return '<div>{name}</div>';
		}
		case 'Customer' : {
			return '<div>{name} {address}</div>';
		}
	}
};

var createFieldSet = function(columnsStore) {
	var fsItems = [];
	columnsStore.each(function(column) {
		if(column.get('name')) {
			var field = {name: column.get('id'), label: column.get('name')};
			Ext.apply(field, column.get('parent') 
				? {xtype: 'selectfield', store: Ext.getStore(column.get('parent')), valueField: 'id', displayField: 'name'}
				: {xtype: 'textfield'});
			fsItems.push(field);
		}
	});
	return {xtype: 'fieldset', items: fsItems};
};

var createFilterField = function(objectRecord) {
	var modelName = objectRecord.modelName;
	return {xtype: 'fieldset', items: {
		xtype: 'selectfield',
		store: modelName,
		name: modelName.toLowerCase(),
		label: Ext.getStore('tables').getById(modelName).get('name'),
		valueField: 'id', displayField: 'name'
	}};
};

var createButtonsList = function(depsStore, tablesStore) {
	
	var data = [];
	depsStore.each(function(column) {
		var depTable = tablesStore.getById(column.get('table_id'));
		data.push({name: depTable.get('nameSet'), table_id: depTable.get('id'), expandable: depTable.get('expandable')});
	});
	
	var btnsStore = new Ext.data.Store({model: 'Button'});
	btnsStore.loadData(data);
	
	return {
		xtype: 'list',
		name: 'buttonList',
		cls: 'x-buttons-list',
		scroll: false,
		disableSelection: true,
		itemTpl: getItemTpl('Button'),
		store: btnsStore
	};
};

var createTitlePanel = function(t) {
	var htmlTpl = new Ext.XTemplate('<div>{title}</div>');
	return {xtype: 'panel', cls: 'x-title-panel', html: htmlTpl.apply({title: t})};
};