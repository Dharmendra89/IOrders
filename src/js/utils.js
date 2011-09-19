var getItemTpl = function(modelName) {
	switch(modelName) {
		case 'Button' : {
			return '<div>{name}</div>';
		}
		case 'Warehouse' : {
			return '<div>{name}</div>';
		}
	}
};

var createFieldSet = function(columnsStore) {
	var fsItems = [];
	columnsStore.each(function(column) {
		if(column.get('name')) {
			var field = {name: column.get('id'), label: column.get('name')};
			Ext.apply(field, column.get('parent') 
				? {xtype: 'selectfield', store: Ext.get('parent')}
				: {xtype: 'textfield'});
			fsItems.push(field);
		}
	});
	return {xtype: 'fieldset', items: fsItems};
};

var createButtonsList = function(depsStore, tablesStore) {
	
	var data = [];
	depsStore.each(function(column) {
		var depTable = tablesStore.getById(column.get('table_id'));
		data.push({name: depTable.get('nameSet'), table_id: depTable.get('id'), expandable: depTable.get('expandable')});
	});
	
	var btnsStore = new Ext.data.Store({
		model: 'Button'
	});
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