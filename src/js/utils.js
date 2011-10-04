var getItemTpl = function(modelName) {

	switch(modelName) {
		case 'Dep': {
			return '<div class="hbox dep">'
					+ '<div class="data">{name}</div>'
					+ '<tpl if="extendable"><div class="x-button extend add">+</div></tpl>'
				 + '</div>';
		}
		case 'Warehouse': {
			return '<div>{name}</div>';
		}
		case 'Price': {
			return '<div>{price} руб.</div>'
				+'<small><span>Ценовая категория: {pricelistSet}</span><span>Прайс-лист: {pricelist}</span><span>Товар: {product}</span></small>';
		}
		case 'Customer': {
			return '<div>{name}</div><small><span>Адрес: {address}</span><span>Партнер: {partner}</span></small>';
		}
		case 'SaleOrder': {
			return '<div>{id} {xid} {date}</div>';
		}
		case 'OfferCategory': {
			return '<div>{name}</div><div class="price">'
				   + '<small> {totalCost} руб.</small>'
				 + '</div>';
		}
		case 'OfferProduct': {
			return '<div class="hbox">'
			       +'<div class="info {cls} data">'
				     + '<p>{name}</p>'
				     + '<small><span>Цена: {price} руб. </span>'
					   + '<tpl if="rel &gt; 1"><span>Вложение: {rel}; </span></tpl>' + '<span>Кратность: {factor} </span>'
				     + '</small>'
				   + '</div>'
				   + '<div class="volume">{volume}</div>'
				 + '</div>';
		}
		case 'Product': {
			return '<div>'
				     + '<p>{name}</p>'
				     + '<small>'
					   + '<span>Вложение: {rel};</span> <span>Кратность: {factor} </span>'
				     + '</small>'
				   + '</div>';

		}
		case 'SaleOrderBottomToolbar': {
			return '<p style="text-align: right">'
			       +'<tpl if="packageName"><small>Упаковка: {packageName}</small></tpl>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
				 + 'Сумма заказа: {totalCost} руб.</p>';
		}
		default: {
			return '{name}';
		}
	}
};

var createFieldSet = function(columnsStore) {

	var fsItems = [];

	columnsStore.each(function(column) {
		if (column.get('label')) {
			var field = {
				name: column.get('name'),
				label: column.get('label')
			};
			
			Ext.apply(field, column.get('parent') 
					? {
						xtype: 'selectfield',
						store: Ext.getStore(column.get('parent')),
						valueField: 'id',
						displayField: 'name'
					} 
					: (column.get('type') === 'boolean' ? {xtype: 'togglefield'} : {xtype: 'textfield'})
			);
			fsItems.push(field);
		}
	});

	return { xtype: 'fieldset', items: fsItems };
};

var createFilterField = function(objectRecord) {

	var modelName = objectRecord.modelName;

	return {
		xtype: 'fieldset',
		items: {
			xtype: 'selectfield',
			store: modelName,
			name: 'id',
			label: Ext.getStore('tables').getById(modelName).get('name'),
			valueField: 'id',
			displayField: 'name'
		}
	};
};

function createDepsList (depsStore, tablesStore, objectRecord) {

	var data = [];

	depsStore.each(function(dep) {

		var depTable = tablesStore.getById( dep.get('table_id') );
		
		(depTable.get('id') != 'SaleOrderPosition' || objectRecord.modelName == 'SaleOrder')
			&& data.push({
				name: depTable.get('nameSet'),
				table_id: depTable.get('id'),
				extendable: depTable.get('extendable')
			});
	});

	return {
		xtype: 'list',
		cls: 'x-deps-list',
		scroll: false,
		disableSelection: true,
		itemTpl: getItemTpl('Dep'),
		store: new Ext.data.Store({
			model: 'Dep',
			data: data
		})
	};
};

var createTitlePanel = function(t) {

	var htmlTpl = new Ext.XTemplate('<div>{title}</div>');
	
	return {
			xtype: 'panel',
			cls: 'x-title-panel',
			html: htmlTpl.apply({title: t})
	}
};

var createNavigatorView = function(rec, oldCard, isSetView, editable) {

	var view = {
			xtype: 'navigatorview',
			isObjectView: isSetView ? undefined : true,
			isSetView: isSetView ? true : undefined,
			objectRecord: isSetView ? oldCard.objectRecord : rec,
			tableRecord: isSetView ? rec.get('table_id') : undefined,
			editable: editable,
			extendable: rec.get('extendable'),
			ownerViewConfig: {
				xtype: 'navigatorview',
				extendable: oldCard.extendable,
				isObjectView: oldCard.isObjectView,
				isSetView: oldCard.isSetView,
				objectRecord: oldCard.objectRecord,
				tableRecord: oldCard.tableRecord,
				ownerViewConfig: oldCard.ownerViewConfig
			}
		};
		
	return view;
};