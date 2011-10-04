//TODO
var getValueFromParent = function(field, value) {
	var parentStore = Ext.getStore(field[0].toUpperCase() + field.substring(1));
	var rec = parentStore.getById(value);
	return rec ? rec.get('name') : value;
};

function getItemTpl (modelName) {

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
		case 'PartnerPriceList': {
			return '<div><span>{[getValueFromParent("pricelistSet",values.pricelistSet)]}: {[getValueFromParent("pricelist",values.pricelist)]}</span><tpl if="discount"><span>-{discount} %</span></tpl></div>'
				+'<small><span>Партнер: {[getValueFromParent("partner", values.partner)]}</span></small>';
		}
		case 'Debt': {
			return '<div><span>{remSumm} руб.</span><tpl if="isWhite"><span>Чек</span></tpl></div>'
				+'<small><span>Полная сумма: {fullSumm}</span><span>Дата: {ddate}</span><span>№: {ndoc}</span></small>';
		}
		case 'Price': {
			return '<div>{price} руб.</div>'
				+'<small><span>Ценовая категория: {[getValueFromParent("pricelistSet",values.pricelistSet)]}</span><span>Прайс-лист: {[getValueFromParent("pricelist",values.pricelist)]}</span><span>Товар: {[getValueFromParent("product", values.product)]}</span></small>';
		}
		case 'Customer': {
			//TODO
			return '<div>{name}</div><small><span>Адрес: {address}</span><span>Партнер: {[getValueFromParent("partner", values.partner)]}</span></small>';
		}
		case 'SaleOrder': {
			return '<div><span>Клиент: {[getValueFromParent("customer", values.customer)]}</span></div>'
				+'<small><span>На дату: {date}</span><span>Сумма: {totalCost}</span><span>Обновлено: {ts}</span></small>';
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
		case 'SaleOrderPosition': {
			return '<div class="hbox">'
		       +'<div class="info {cls} data">'
			     + '<p>{[getValueFromParent("product", values.product)]}</p>'
			     + '<small><span>Стоимость: {cost} руб. </span>'
			     + '</small>'
			   + '</div>'
			   + '<div class="volume">{volume}</div>'
			 + '</div>';
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

function createDepsList(depsStore, tablesStore, objectRecord, editable) {

	var data = [];

	depsStore.each(function(dep) {

		var depTable = tablesStore.getById( dep.get('table_id') );
		
		(depTable.get('id') != 'SaleOrderPosition' || objectRecord.modelName == 'SaleOrder')
			&& data.push({
				name: depTable.get('nameSet'),
				table_id: depTable.get('id'),
				extendable: depTable.get('extendable') && (objectRecord.modelName != 'SaleOrder' || editable)
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