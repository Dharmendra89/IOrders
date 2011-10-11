//TODO
Ext.util.Format.defaultDateFormat = 'd/m/Y';
Date.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

var getValueFromParent = function(field, value) {
	var parentStore = Ext.getStore(field[0].toUpperCase() + field.substring(1));
	var rec = parentStore.getById(value);
	return rec ? rec.get('name') : value;
};

function getItemTpl (modelName, table) {

	switch(modelName) {
		case 'Dep': {
			return '<div class="hbox dep">'
					+ '<div class="count"><tpl if="count &gt; 0">{count}</tpl></div>'
					+ '<div class="data">{name}</div>' 
					+ '<tpl if="extendable && editable || table_id == \'SaleOrder\'"><div class="x-button extend add">+</div></tpl>'
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
				+'<small><span>Полная сумма: {fullSumm}</span><span>Дата: {[Ext.util.Format.date(values.ddate)]}</span><span>№: {ndoc}</span></small>';
		}
		case 'Price': {
			var tpl = '<div>{price} руб.</div>'
				+'<small>'
					+'<span>Ценовая категория: {[getValueFromParent("pricelistSet",values.pricelistSet)]}</span>'
				    +'<span>Прайс-лист: {[getValueFromParent("pricelist",values.pricelist)]}</span>'
			  	    + (!(table && table.getId()=='Product') ? '<span>Товар: {[getValueFromParent("product", values.product)]}</span>' : '')
				+'</small>';
			return tpl;
		}
		case 'Customer': {
			//TODO
			return '<div>{name}</div><small><span>Адрес: {address}</span><span>Партнер: {[getValueFromParent("partner", values.partner)]}</span></small>';
		}
		case 'SaleOrder': {
			return '<div><span>Клиент: {[getValueFromParent("customer", values.customer)]}</span></div>'
				+'<small><span>На дату: {[Ext.util.Format.date(values.date)]}</span><span>Сумма: {totalCost}</span></small>';
		}
		case 'OfferCategory': {
			return '<div>{name}</div><div class="price">'
				   + '<small> {totalCost} руб.</small>'
				 + '</div>';
		}
		case 'OfferProduct': {
			return '<div class="hbox">'
			       +'<div class="info {cls} data ' + '<tpl if="stockLevel==1">caution</tpl>' + '">'
				     + '<p>{name}</p>'
				     + '<small><span>Цена: {price} руб. </span>'
					   + '<tpl if="rel &gt; 1"><span>Вложение: {rel}; </span></tpl>' + '<span>Кратность: {factor} </span>'
					   + '<tpl if="cost"><span class="cost">Стоимость: {cost}</span></tpl>'
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
			     + '<small><span>Стоимость: {cost} руб.</span>'
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
			
			var fieldConfig;
			switch(column.get('type')) {
				case 'boolean' : {
					fieldConfig = {xtype: 'togglefield'};
					break;
				}
				case 'date' : {
					fieldConfig = {
						xtype: 'datepickerfield',
						picker: {
							yearFrom: 2011,
							yearTo  : 2012,
							slotOrder: ['day', 'month', 'year']
						}
					};
					break;
				}
				default : {
					fieldConfig = {xtype: 'textfield'};
					break;
				}
			}
			
			Ext.apply(field, column.get('parent') 
					? {xtype: 'selectfield', store: Ext.getStore(column.get('parent')), valueField: 'id', displayField: 'name'} 
					: fieldConfig
			);
			fsItems.push(field);
		}
	});

	return { xtype: 'fieldset', items: fsItems };
};

var createFilterField = function(objectRecord) {

	var modelName = objectRecord.modelName;	
	var selectStore = createStore(modelName);
	selectStore.load();
	selectStore.add(objectRecord);

	return {
		xtype: 'fieldset',
		items: {
			xtype: 'filterfield',
			useClearIcon: true,
			id: 'Filter',
			store: selectStore,
			name: 'id',
			label: Ext.getStore('tables').getById(modelName).get('name'),
			valueField: 'id',
			displayField: 'name'
		}
	};
};

function createDepsList(depsStore, tablesStore, view) {

	var data = [];

	depsStore.each(function(dep) {

		var depTable = tablesStore.getById(dep.get('table_id'));

		if(depTable.get('id') != 'SaleOrderPosition' || view.objectRecord.modelName == 'SaleOrder') {
			var depRec = Ext.ModelMgr.create({
				name: depTable.get('nameSet'),
				table_id: depTable.get('id'),
				extendable: depTable.get('extendable'),
				editable: view.editable || view.objectRecord.modelName == 'MainMenu'
			}, 'Dep');

			var modelProxy = Ext.ModelMgr.getModel(depTable.get('id')).prototype.getProxy();

			var filters = [];
			view.objectRecord.modelName != 'MainMenu' && filters.push({property: view.objectRecord.modelName.toLowerCase(), value: view.objectRecord.getId()});

			var operCount = new Ext.data.Operation({
				depRec: depRec,
				filters: filters
			});

			modelProxy.count(operCount, function(operation) {
				operation.depRec.set('count', operation.result);
			});

			data.push(depRec);
		}
	});
	
	view.depStore = new Ext.data.Store({model: 'Dep', data: data}); 

	return {
		xtype: 'list',
		cls: 'x-deps-list',
		scroll: false,
		disableSelection: true,
		itemTpl: getItemTpl('Dep'),
		store: view.depStore
	};
};

var createTitlePanel = function(t) {

	var htmlTpl = new Ext.XTemplate('<div>{title}</div>');
	
	return {
			xtype: 'panel',
			cls: 'x-title-panel',
			html: htmlTpl.apply({title: t})
	};
};

var createNavigatorView = function(rec, oldCard, isSetView, editable, config) {

	var view = Ext.apply({
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
		}, config);
		
	return view;
};

var getGroupConfig = function(model) {
	switch(model) {
		case 'SaleOrder' : {
			return {
				getGroupString: function(rec) {
					return Ext.util.Format.date(rec.get('date'));
				},
				sorters: [{property: 'date', direction: 'DESC'}],
				field: 'date'
			};
		}
		case 'Product' : {
			return {
				getGroupString: function(rec) {
					return rec.get('firstName');
				},
				sorters: [{property: 'firstName', direction: 'ASC'}],
				field: 'firtName'
			};
		}
		default : {
			return {};
		}
	}
};

var getNextWorkDay = function() {
	var today = new Date();
	var todayWeekDay = today.getDay();
	
	var addDays = todayWeekDay >= 5 && todayWeekDay <= 6 ? 7 + 1 - todayWeekDay : 1;
	return today.add(Date.DAY, addDays);
};