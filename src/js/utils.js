var getItemTpl = function(modelName) {
	switch(modelName) {
		case 'Button' : {
			return '<div class="hbox">' +
					'<div class="data">{name}</div>' +
					'<tpl if="expandable"><div class="x-button add">+</div></tpl>' +
				'</div>';
		}
		case 'Warehouse' : {
			return '<div>{name}</div>';
		}
		case 'Customer' : {
			return '<div>{id} {name} {address}</div>';
		}
		case 'SaleOrder' : {
			return '<div>{id} {toDate}</div>';
		}
		case 'ProductCategory' : {
			return '<div>{name}</div><div class="price"><tpl if="totalPrice &gt; 0"><small> {totalPrice} руб.</small></tpl></div>';
		}
		case 'Product' : {
			return '<div class="info {cls}">' + '<p>{name}</p>' + '<small><span>Цена: {price} руб. </span>'
				+ '<tpl if="rel &gt; 1"><span>Вложение: {rel} </span></tpl>' + '<span>Кратность: {factor} </span></small>' + '</div>'
				+ '<div class="volume">Количество: {volume}</div>';
		}
	}
};

var createFieldSet = function(columnsStore, editable) {
	var fsItems = [];
	columnsStore.each(function(column) {
		if(column.get('name')) {
			var field = {name: column.get('id'), label: column.get('name'), useMask: !editable};
			Ext.apply(field, column.get('parent')
				? {xtype: 'selectfield', store: Ext.getStore(column.get('parent')), valueField: 'id', displayField: 'name', useMask: editable}
				: (column.get('type') === 'boolean' ? {xtype: 'togglefield', useMask: editable} : {xtype: 'textfield'}));
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
		cls: 'x-buttons-list',
		scroll: false,
		disableSelection: true,
		itemTpl: getItemTpl('Button'),
		store: btnsStore
	};
};

var createTitlePanel = function(t) {
	var htmlTpl = new Ext.XTemplate('<div>{title}</div>');
	var panel = {xtype: 'panel', cls: 'x-title-panel', html: htmlTpl.apply({title: t})};
	return panel;
};

var createNavigatorView = function(rec, oldCard, isSetView, editable) {
	var view = {
		xtype: 'navigatorview',
		isObjectView: isSetView ? undefined : true,
		isSetView: isSetView ? true : undefined,
		objectRecord: isSetView ? oldCard.objectRecord : rec,
		tableRecord: isSetView ? rec.get('table_id') : undefined,
		editable: editable,
		expandable: rec.get('expandable'),
		ownerViewConfig: {
			xtype: 'navigatorview',
			expandable: oldCard.expandable,
			isObjectView: oldCard.isObjectView,
			isSetView: oldCard.isSetView,
			objectRecord: oldCard.objectRecord,
			tableRecord: oldCard.tableRecord,
			ownerViewConfig: oldCard.ownerViewConfig
		}
	};
	return view;
};