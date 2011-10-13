Ext.regController('Navigator', {
	onBackButtonTap: function(options) {

		var view = options.view;
		var newCard = Ext.create(view.ownerViewConfig);
		if (newCard.isSetView) {
			Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard, anim: IOrders.viewport.anims.back}));
		} else {
			IOrders.viewport.setActiveItem(newCard, IOrders.viewport.anims.back);
		}
	},
	onHomeButtonTap: function(options) {

		IOrders.viewport.setActiveItem(new NavigatorView({
			isObjectView: true,
			objectRecord: Ext.ModelMgr.create({id: 1}, 'MainMenu')
		}), IOrders.viewport.anims.home);
	},
	onSaveButtonTap: function(options) {

		var view = options.view;
		var form = view.form;
		var formRec = form.getRecord();
		
		form.updateRecord(formRec);

		var errors = formRec.validate();
		if(errors.isValid()) {
			var btn = options.btn;
			btn.setText('Редактировать');
			Ext.apply(btn, {name: 'Edit'});
	
			options.view.depStore.each(function(rec) {
				rec.set('editable', false);
			});
			
			var toolbar = btn.up('toolbar');
			toolbar.getComponent('Cancel').hide();
	
			formRec.save();
			Ext.dispatch(Ext.apply(options, {action: 'setEditable', editable: false}));
		} else {
			var msg = '';
			errors.each(function(err) {
				msg += 'Поле ' + err.field + ' ' + err.message;
			});
			Ext.Msg.alert('Ошибка валидации', msg, Ext.emptyFn);
		}
	},
	onEditButtonTap: function(options) {
		
		var btn = options.btn;
		btn.setText('Сохранить');
		Ext.apply(btn, {name: 'Save'});
		
		options.view.depStore.each(function(rec) {
			rec.set('editable', true);
		});

		var toolbar = btn.up('toolbar');
		toolbar.getComponent('Cancel').show();

		Ext.dispatch(Ext.apply(options, {action: 'setEditable', editable: true}));
	},
	onCancelButtonTap: function(options) {

		options.view.form.load(options.view.form.getRecord());

		var toolbar = options.btn.up('toolbar');
		toolbar.getComponent('Cancel').hide();
		
		var saveEditBtn = toolbar.getComponent('SaveEdit');
		
		options.view.depStore.each(function(rec) {
			rec.set('editable', false);
		});
		
		saveEditBtn.setText('Редактировать');
		Ext.apply(saveEditBtn, {name: 'Edit'});

		Ext.dispatch(Ext.apply(options, {action: 'setEditable', editable: false}));
	},
	setEditable: function(options) {
		options.view.form.setDisabled(!options.editable);
	},
	onAddButtonTap: function(options) {

		var rec = Ext.ModelMgr.create({}, options.view.tableRecord);
		rec.set(options.view.objectRecord.modelName.toLowerCase(), options.view.objectRecord.getId());
		if(rec.modelName === 'SaleOrder') {
			rec.set('totalCost', '0');
			rec.set('date', getNextWorkDay());
		}
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, false, true));

		IOrders.viewport.setActiveItem(newCard);
	},
	onListItemTap: function(options) {

		var target = Ext.get(options.event.target);
		var rec = undefined;
		var list = options.list;
		var item = options.item;
		var view = list.up('navigatorview');
		
		view.setLoading(true);
		
		var isTableList = list.getEl().hasCls('x-table-list') ? true : false;

		if (target.hasCls('x-button')) {
			if (target.hasCls('extend')) {

				options.isSetView = false;
				editable = true;

				var createdRecordModelName = isTableList ? target.up('.dep').down('input').dom.value : list.getRecord(item).get('table_id'); 
				
				rec = Ext.ModelMgr.create({}, createdRecordModelName);
				
				var objectRecord = isTableList ? list.getRecord(item) : view.objectRecord;
				
				rec.set(objectRecord.modelName.toLowerCase(), objectRecord.getId());
				if(rec.modelName === 'SaleOrder') {
					rec.set('totalCost', '0');
					rec.set('date', getNextWorkDay());
				}
				
				Ext.dispatch(Ext.apply(options, {
					action: 'createAndActivateView',
					record: rec,
					editable: true
				}));
			} else {
				view.setLoading(false);
			}

		} else if(isTableList && target.up('.dep')) {

			var dep = target.up('.dep');
		
			Ext.dispatch(Ext.apply(options, {
				controller: 'Navigator',
				action: 'createAndActivateView',
				record: list.getRecord(item),
				tableRecord: dep.down('input').dom.value,
				isSetView: true,
				editable: false
			}));
			return;
		} else {
			view.setLoading(false);
		}
		
		if(options.isSetView) {
			Ext.dispatch(Ext.apply(options, {
				action: 'createAndActivateView'
			}));
		}
	},

	createAndActivateView: function(options) {
		
		var objectRecord = options.record || options.list.getRecord(options.item);
		
		var config = {};
		options.tableRecord && Ext.apply(config, {tableRecord: options.tableRecord, objectRecord: objectRecord});

		var newCard = Ext.create(createNavigatorView(objectRecord, IOrders.viewport.getActiveItem(), options.isSetView, options.editable, config));
		if (newCard.isSetView) {
			Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard}));
		} else {
			IOrders.viewport.setActiveItem(newCard);
		}
	},
	
	loadSetViewStore: function(options) {
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = options.newCard;
		oldCard.setLoading(true);
		var store = newCard.setViewStore;
		store.currentPage = 1;
		store.clearFilter(true);

		if (newCard.objectRecord.modelName != 'MainMenu') {
			if (newCard.objectRecord.modelName) {

				store.filter([{
					property: newCard.objectRecord.modelName.toLowerCase(),
					value: newCard.objectRecord.getId()
				}]);
				
				oldCard.setLoading(false);
				IOrders.viewport.setActiveItem(newCard, options.anim);
			} else {

				store.load({
					callback: function() {
						oldCard.setLoading(false);
						IOrders.viewport.setActiveItem(newCard, options.anim);
					}
				});
			}
		} else {

			store.load({
				callback: function() {
					oldCard.setLoading(false);
					IOrders.viewport.setActiveItem(newCard, options.anim);
				}
			});
		}
	},
	
	onselectfieldLabelTap: function(options) {

		var field = options.field;
		var view = options.view;
		var tableRecord = view.isSetView ? view.objectRecord.modelName : field.name[0].toUpperCase() + field.name.substring(1);

		var newCard = Ext.create(createNavigatorView(view.objectRecord, IOrders.viewport.getActiveItem(),
				true, false, 
				{objectRecord: Ext.ModelMgr.create({id: 1}, 'MainMenu'), tableRecord: tableRecord}
		));
		Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard}));
	},

	onselectfieldInputTap: function(options) {

		var field = options.field;
		var record = Ext.getStore(field.name[0].toUpperCase() + field.name.substring(1)).getById(field.getValue());

		var newCard = Ext.create(createNavigatorView(record, IOrders.viewport.getActiveItem(), false, false, {}));
		IOrders.viewport.setActiveItem(newCard);
	},

	onFilterValueChange: function(options) {

		var field = options.field;
		var view = options.view;
		var filterRecord = view.objectRecord;
		var store = view.setViewStore;
		
		store.clearFilter(true);
		store.currentPage = 1;

		var filters = [];
		options.filter && filters.push({property: filterRecord.modelName.toLowerCase(), value: field.getValue()});

		options.removeFilter && view.form.remove(0);
		store.filter(filters);
	},
	
	onSyncButtonTap: function(options) {
		options.btn.disable();
		
		IOrders.xi.upload ({
			engine: IOrders.dbeng,
			success: function(s) {
				Ext.Msg.alert('Загрузка завершена', 'Передано записей: '+s.getCount(),
							  function() {options.btn.enable()}
				);
			},
			failure: function(s,e) {
				Ext.Msg.alert('Загрузка не удалась', e,
							  function() {options.btn.enable()}
				);
			},
			recordSuccess: function(s) {
				var cnt = parseInt(options.btn.getBadgeText());
				
				options.btn.setBadge(--cnt);
			}
		});
	},
	
	onPrefsButtonTap: function(options) {
		
		new Ext.ActionSheet ({
			items: [
				{ text: 'Закрыть панель настроек', name: 'PrefsClose'},
				{ text: 'Запросить данные', name: 'XiDownload'},
				{ text: 'Запросить метаданные', name: 'XiMeta'},
				{ text: 'Пересоздать БД', name: 'DbRebuild'},
				{ xtype: 'segmentedbutton', items: [
					{text: 'Статический сервер', name: 'XiNoServer', pressed: IOrders.xi.noServer},
					{text: 'Настоящий сервер', name: 'XiYesServer', pressed: !IOrders.xi.noServer},
				]},
				{ text: 'Сервер-логин', name: 'XiLogin'},
				{ text: 'Сервер-логоф', name: 'XiLogoff'},
				{ text: 'Перезапустить', name: 'Reload'}
			],
			listeners: {
				hide: function() {
					this.destroy();
				}
			}
		}).show();
		
	},

	onListSelectionChange: function(options) {

		var list = options.list;
		
		var tableRecord, depStore;
		var tableStore = Ext.getStore('tables');
		
		Ext.each(options.selections, function(record) {
			if(!record.data.deps) {
				tableRecord || (tableRecord = Ext.getStore('tables').getById(record.modelName));
				depStore || (depStore = tableRecord.deps());
				
				var data = [];
		
				depStore.each(function(dep) {
		
					var depTable = tableStore.getById(dep.get('table_id'));
		
					if(depTable.get('id') != 'SaleOrderPosition' || record.modelName == 'SaleOrder') {
						var depRec = {
							name: depTable.get('nameSet'),
							table_id: depTable.get('id'),
							extendable: depTable.get('extendable'),
							editable: false || record.modelName == 'MainMenu'
						};
		
						var modelProxy = Ext.ModelMgr.getModel(depTable.get('id')).prototype.getProxy();
		
						var filters = [];
						record.modelName != 'MainMenu' && filters.push({property: record.modelName.toLowerCase(), value: record.getId()});
		
						var operCount = new Ext.data.Operation({
							list: list,
							listRecord: record,
							depRec: depRec,
							filters: filters
						});
		
						modelProxy.count(operCount, function(operation) {
							operation.depRec.count = operation.result;
							operation.listRecord.data.deps = data;
							operation.list.getSelectionModel().select(record, true, false);
							operation.list.refreshNode(list.indexOf(record));
						});
		
						data.push(depRec);
					}
				});
			}
		});
	}
});