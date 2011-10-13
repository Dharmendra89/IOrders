//TODO
Ext.util.Format.defaultDateFormat = 'd/m/Y';
Date.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

var getValueFromParent = function(field, value) {
	
	var modelName = field[0].toUpperCase() + field.substring(1);
	var parentStore = Ext.getStore(modelName);
	var rec = parentStore.getById(value);
	
	var tableStore = Ext.getStore('tables');
	var tableRecord = tableStore.getById(modelName);
	var columnStore = tableRecord.columns();
	
	var tpl = '';
	columnStore.each(function(rec) {
		rec.get('label') && (tpl += (rec.data.name === 'name' ? '' : rec.get('label') + ': ') + '{' + rec.get('name') +'} ');
	});
	
	var xtpl = new Ext.XTemplate(tpl);
	
	
	return rec ? xtpl.apply(rec.data) : value;
};

var getItemTplMeta = function(modelName, table, filterObject, groupField) {

	var tableStore = Ext.getStore('tables');
	var tableRecord = tableStore.getById(modelName);
	var template = new Ext.XTemplate('<div class="hbox">{columns}</div>');
	var columnStore = tableRecord.columns();
	
	/**
	 * BEGIN.
	 * Сборка темплейта для полей сущности
	 */
	var columns = '<div>';

	var idColExist = columnStore.findExact('name', 'id') === -1 ? false : true;
	var queryValue = idColExist ? 'parent' : 'key';
	
	if(columnStore.findExact('name', 'name') != -1) {
		columns += '<p class="name">{name}</p>';
		queryValue = 'key';
	} else {
		
		var mainColumns = columnStore.queryBy(function(rec) {
			return rec.get(queryValue)  && filterObject.modelName.toLowerCase() != rec.get('name').toLowerCase() && groupField !== rec.get('name') ? true : false;
		});
		
		if(mainColumns.getCount() > 0) {
			columns += '<p class="key">';

			var parentTpl = new Ext.XTemplate('<span>\\{[getValueFromParent("{name}", values.{name})]\\}<tpl if="!end"> : </tpl></span>&nbsp;');
			var commonTpl = new Ext.XTemplate('<span>\\{{name}\\} : </span>&nbsp;');
			
			var length = mainColumns.getCount();
			
			mainColumns.each(function(col) {

				if(col.get('parent')) {
					columns += parentTpl.apply({name: col.data.name, end: mainColumns.indexOf(col) + 1 >= length});
				} else {
					columns += commonTpl.apply({name: col.data.name, end: mainColumns.indexOf(col) + 1 >= length});
				}
			});

			columns += '</p>';
		}
	}

	var otherColumns = columnStore.queryBy(function(rec) {
		var colName = rec.get('name');
		return !rec.get(queryValue) && groupField !== colName && filterObject.modelName.toLowerCase() != rec.get('name').toLowerCase()
			&& colName !== 'id' && colName !== 'name' && rec.get('label') ? true : false;
	});
	
	columns += '<div class="other">';
	console.log(otherColumns);
	if(otherColumns.getCount() > 0) {
		columns += '<small class="other-fields">';

		var othersTpl = new Ext.XTemplate('<tpl if="label || name"><div>{label}<tpl if="name">: {name}</tpl></div></tpl>');
		var othersParentTpl = new Ext.XTemplate('<tpl if="label || name"><div>{label}<tpl if="name">: \\{[getValueFromParent("{name}", values.{name})]\\}</tpl></div></tpl>');

		otherColumns.each(function(col) {
			var colName = col.get('name');
				
			var tplValue;
			switch(col.get('type')) {
				case 'boolean' : {
					tplValue = othersTpl.apply({label: '{[values.' + colName + ' == true ? "' + col.get('label') + '" : ""]}'});
					break;
				}
				case 'date' : {
					tplValue = othersTpl.apply({label: col.get('label'), name: '{[Ext.util.Format.date(values.' + colName + ')]}'});
					break;
				}
				default : {
					
					tplValue = col.get('parent')
								? othersParentTpl.apply({label: col.get('label'), name: col.data.name})
								: othersTpl.apply({label: col.get('label'), name: '{' + colName + '}'});
				}
			}
			
			columns += tplValue;
		});

		columns += '</small>';
	}
	/**
	 * END.
	 * Сборка темплейта для полей сущности
	 */
	
	/**
	 * BEGIN.
	 * Сборка темплейта для deps
	 */
	columns += 
			'<div class="buttons">' 
				+ '<tpl for="deps">'
					+'<div class="hbox dep">'
					+ '<input type="hidden" value="{table_id}" />'
					+ '<div class="count"><tpl if="count &gt; 0">{count}</tpl></div>'
					+ '<div class="data">{name}</div>'
					+ '<tpl if="extendable && editable || table_id == \'SaleOrder\'"><div class="x-button extend add">+</div></tpl>'
		 			+ '</div>'
	 			+ '</tpl>'
	 		+ '</div>';
	/**
	 * END.
	 * Сборка темплейта для deps
	 */
	columns += '</div>';
	
	columns += '</div>';

	console.log(template.apply({columns: columns}));
	return template.apply({columns: columns});
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
					   + '<span>Стоимость: <span class="cost">{cost}</span></span>'
				     + '</small>'
				   + '</div>'
				   + '<div class="volume">{volume}</div>'
				 + '</div>';
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