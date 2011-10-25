Ext.util.Format.defaultDateFormat = 'd/m/Y';
Date.monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

var getValueFromParent = function(field, value) {
	var parentStore = Ext.getStore(field[0].toUpperCase() + field.substring(1));
	var rec = parentStore.getById(value);
	return rec ? rec.get('name') : value;
};

var getItemTplMeta = function(modelName, table, filterObject, groupField) {

	var tableStore = Ext.getStore('tables');
	var tableRecord = tableStore.getById(modelName);
	var columnStore = tableRecord.columns();
	
	var templateString = '<div class="hbox">'
				+		'<div>'
				+			'<tpl if="hasName">'
				+				'<p class="name">\\{name\\}</p>'
				+			'</tpl>'
				+			'<tpl if="!hasName && keyColumnsLength &gt; 0">'
				+				'<p class="key">'
				+					'<tpl for="keyColumns">'
				+						'<tpl if="parent">'
				+							'<span>\\{[getValueFromParent("{name}", values.{name})]\\}<tpl if="!end"> : </tpl></span>&nbsp;'
				+						'</tpl>'
				+						'<tpl if="!parent">'
				+							'<span>\\{{name}\\}<tpl if="!end"> : </tpl></span>&nbsp;'
				+						'</tpl>'
				+					'</tpl>'
				+				'</p>'
				+			'</tpl>'
				+			'<div class="{[values.keyColumnsLength > 0 ? "other" : ""]}">'
				+				'<tpl if="otherColumnsLength &gt; 0">'
				+					'<small class="other-fields">'
				+						'<tpl for="otherColumns">'
				+							'<tpl if="parent">'
				+								'<tpl if="label || name">'
				+									'<div>'
				+										'<span class="label-parent">'
				+											'<input type="hidden" property="{name}" value="\\{{name}\\}" />'
				+											'{label}'
				+										'</span>'
				+										'<tpl if="name">: \\{[getValueFromParent("{name}", values.{name})]\\}</tpl>'
				+									'</div>'
				+								'</tpl>'
				+							'</tpl>'
				+							'<tpl if="!parent">'
				+								'<tpl if="label || name">'
				+									'<div>{label}<tpl if="name">: {name}</tpl></div>'
				+								'</tpl>'
				+							'</tpl>'
				+						'</tpl>'
				+					'</small>'
				+				'</tpl>'
				+				'{buttons}'
				+			'</div>'
				+		'</div>'	
				+	'</div>';
	
	var buttons = 
		'<div class="buttons">' 
			+ '<tpl for="deps">'
				+'<div class="hbox dep">'
				+ '<input type="hidden" value="{table_id}" />'
				+ '<div class="count"><tpl if="count &gt; 0">{count}</tpl></div>'
				+ '<div class="data">{name}</div>'
				+ '<tpl if="extendable"><div class="x-button extend add">+</div></tpl>'
	 			+ '</div>'
 			+ '</tpl>'
 		+ '</div>';
	
	var templateData = {
		hasName: false,
		keyColumnsLength: 0,
		keyColumns: [],
		otherColumnsLength: 0,
		otherColumns: [],
		buttons: buttons
	};
	
	var idColExist = columnStore.findExact('name', 'id') === -1 ? false : true;
	var queryValue = idColExist ? 'parent' : 'key';
	
	if(columnStore.findExact('name', 'name') != -1) {

		templateData.hasName = true;
		queryValue = 'key';
	} else {

		var keyColumns = columnStore.queryBy(function(rec) {
			return rec.get(queryValue)
				&& filterObject.modelName.toLowerCase() != rec.get('name').toLowerCase()
				&& groupField !== rec.get('name') ? true : false;
		});
		
		templateData.keyColumnsLength = keyColumns.getCount(); 
		
		if(keyColumns.getCount() > 0) {
			
			var length = keyColumns.getCount(); 

			keyColumns.each(function(col) {

				templateData.keyColumns.push({
					parent: col.get('parent') ? true: false,
					name: col.get('name'),
					end: keyColumns.indexOf(col) + 1 >= length
				});
			});
		}
	}

	var otherColumns = columnStore.queryBy(function(rec) {
		var colName = rec.get('name');
		return !rec.get(queryValue)
			&& ( !groupField || (groupField !== colName
					&& groupField[0].toLowerCase() + groupField.replace('_name', '').substring(1) !== colName)
			)
			&& filterObject.modelName.toLowerCase() != rec.get('name').toLowerCase()
			&& colName !== 'id' && colName !== 'name' && rec.get('label') ? true : false;
	});
	
	templateData.otherColumnsLength = otherColumns.getCount(); 
	if(otherColumns.getCount() > 0) {

		otherColumns.each(function(col) {
			
			var label = undefined, name = undefined;

			var colName = col.get('name');
			switch(col.get('type')) {
 				case 'boolean' : {
					label = '{[values.' + colName + ' == true ? "' + col.get('label') + '" : ""]}';
					break;
				}
				case 'date' : {
					label = col.get('label');
					name = '{[Ext.util.Format.date(values.' + colName + ')]}';
					break;
				}
				default : {
					label = col.get('label');
					name = col.get('parent') ? colName : '{' + colName + '}';
					break;
				}
			}
			
			templateData.otherColumns.push({
				parent: col.get('parent') ? true : false,
				label: label,
				name: name
			});
			
		});
	}
	
	return new Ext.XTemplate(templateString).apply(templateData);
};

function getItemTpl (modelName) {

	switch(modelName) {
		case 'Dep': {
			return '<div class="hbox dep">'
					+ '<div class="count"><tpl if="count &gt; 0">{count}</tpl></div>'
					+ '<div class="data">{name}</div>' 
					+ '<tpl if="extendable && editable"><div class="x-button extend add">+</div></tpl>'
				 + '</div>';
		}
		case 'Debt' : {
			return '<div class="hbox dep">'
					+ '<div class="data">'
					+	'<div>Дата: {[Ext.util.Format.date(values.ddate)]} Документ№: {ndoc} <tpl if="isWhite>Нужен чек</tpl></div>'
					+	'<div>Общая сумма задолжности: {[values.fullSumm]} руб. из нее должен {[parseFloat(values.remSumm).toFixed(2)]} руб.</div>'
					+ '</div>'
					+ '<div class="encashSumm"><tpl if="encashSumm &gt; 0">{[parseFloat(values.encashSumm).toFixed(2)]} руб.</tpl></div>'
				 + '</div>';
		}
		case 'OfferCategory': {
			return '<div>{name}</div><div class="price">'
				 //  + '<small> {totalCost} руб.</small>'
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

var createFieldSet = function(columnsStore, modelName, view) {

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
					if(column.get('name') == 'name') {
						var selectStore = createStore(modelName, getSortersConfig(modelName, {}));
						selectStore.load();
						selectStore.add(view.objectRecord);

						fieldConfig = {xtype: 'pagingselectfield', name: 'id', store: selectStore, valueField: 'id', displayField: 'name'};
					} else {
						fieldConfig = {xtype: 'textfield'};
					}
					break;
				}
			}
			
			Ext.apply(field, column.get('parent') 
					? {xtype: 'selectfield', store: Ext.getStore(column.get('parent')), valueField: 'id', displayField: 'name', onFieldLabelTap: true, onFieldInputTap: true}
					: fieldConfig
			);
			fsItems.push(field);
		}
	});

	return { xtype: 'fieldset', items: fsItems };
};

var createFilterField = function(objectRecord) {

	var modelName = objectRecord.modelName;	
	var selectStore = createStore(modelName, getSortersConfig(modelName, {}));
	selectStore.load();
	selectStore.add(objectRecord);

	return {
		xtype: 'fieldset',
		items: {
			xtype: 'filterfield',
			useClearIcon: true,
			id: 'Filter',
			store: selectStore,
			onFieldLabelTap: true,
			onFieldInputTap: true,
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
				editable: view.editing || view.objectRecord.modelName == 'MainMenu'
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

var createNavigatorView = function(rec, oldCard, isSetView, editing, config) {

	var view = Ext.apply({
			xtype: 'navigatorview',
			isObjectView: isSetView ? undefined : true,
			isSetView: isSetView ? true : undefined,
			objectRecord: isSetView ? oldCard.objectRecord : rec,
			tableRecord: isSetView ? rec.get('table_id') : undefined,
			editing: editing,
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
				field: 'firstName'
			};
		}
		case 'Category' : {
			return {
				getGroupString: function(rec) {
					return rec.get('ShopDepartment_name');
				},
				sorters: [
					{property: 'ShopDepartment_name', direction: 'ASC'}
				],
				field: 'ShopDepartment_name'
			};
		}
		default : {
			return {};
		}
	}
};

var getSortersConfig = function(model, storeConfig) {

	var table = Ext.getStore('tables').getById(model),
		sortConfig = {sorters: storeConfig.sorters ? storeConfig.sorters : []},
		columns = table.columns()
	;
	
	var parentSort = true;
	
	if (columns.getById(table.getId() + 'ord')) {
		sortConfig.sorters.push ({ property: 'ord' });
		parentSort = false;
	}
	
	if (columns.getById(table.getId() + 'name')) {
		sortConfig.sorters.push ({ property: 'name' });
		parentSort = false;
	}
	
	if (parentSort) {
		
		var parentColumns = columns.queryBy(function(rec) {
			return rec.get('parent') ? true : false;
		});
		
		parentColumns.each (function(col) {
			columns.findExact('name', col.get('parent') + '_name') != -1
				&& sortConfig.sorters.push({property: col.get('name') + '_name'});
		});
		
	}
	
	return sortConfig;
};

var getNextWorkDay = function() {
	var today = new Date();
	var todayWeekDay = today.getDay();
	
	var addDays = todayWeekDay >= 5 && todayWeekDay <= 6 ? 7 + 1 - todayWeekDay : 1;
	return today.add(Date.DAY, addDays);
};

var getOwnerViewConfig = function(view) {
	return {ownerViewConfig: {
        xtype: view.xtype,
        extendable: view.extendable,
        isObjectView: view.isObjectView,
        isSetView: view.isSetView,
        objectRecord: view.objectRecord,
        tableRecord: view.tableRecord,
        ownerViewConfig: view.ownerViewConfig
    }};
};;