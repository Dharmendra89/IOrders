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
		
		var view = options.view,
		    form = view.form,
		    formRec = form.getRecord()
		;
		
		form.updateRecord(formRec);
		
		var errors = formRec.validate();
		
		if(errors.isValid()) {
			
			var btn = options.btn;
			btn.setText('Редактировать');
			Ext.apply(btn, {name: 'Edit'});
			
			options.view.depStore.each(function(rec) {
				rec.set('editing', false);
			});
			
			var toolbar = btn.up('toolbar');
			toolbar.getComponent('Cancel').hide();
			
			formRec.save();
			Ext.dispatch(Ext.apply(options, {action: 'setEditing', editing: false}));
			
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
			rec.set('editing', true);
		});
		
		var toolbar = btn.up('toolbar');
		toolbar.getComponent('Cancel').show();
		
		Ext.dispatch(Ext.apply(options, {action: 'setEditing', editing: true}));
	},
	
	onCancelButtonTap: function(options) {
		
		options.view.form.load(options.view.form.getRecord());
		
		var toolbar = options.btn.up('toolbar');
		toolbar.getComponent('Cancel').hide();
		
		var saveEditBtn = toolbar.getComponent('SaveEdit');
		
		options.view.depStore.each(function(rec) {
			rec.set('editing', false);
		});
		
		saveEditBtn.setText('Редактировать');
		Ext.apply(saveEditBtn, {name: 'Edit'});
		
		Ext.dispatch(Ext.apply(options, {action: 'setEditing', editing: false}));
	},
	
	setEditing: function(options) {
		options.view.form.setDisabled(!options.editing);
		options.view.editing = options.editing;

		var toolbar = options.btn.up('toolbar');
		toolbar.getComponent('Add')[options.editing ? 'hide' : 'show']();
	},
	
	onAddButtonTap: function(options) {
		
		var rec = undefined;

		if(options.view.isObjectView) {
			rec = Ext.ModelMgr.create({}, options.view.objectRecord.modelName);
			/**
			 * TODO Пока создается пустая сущность.
			 * Возможно нужно проставлять все поля-паренты как у сущности из которой создалась новая
			 */
			
		} else if(options.view.isSetView) {
			rec = Ext.ModelMgr.create({}, options.view.tableRecord);
			
			rec.set (
				options.view.objectRecord.modelName.toLowerCase(),
				options.view.objectRecord.getId()
			);
		}
		
		if(rec.modelName === 'SaleOrder') {
			rec.set('date', getNextWorkDay());
		}
		
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, false, true));
		
		IOrders.viewport.setActiveItem(newCard);
	},
	
	onListItemTap: function(options) {
		
		var target = Ext.get(options.event.target),
		    rec = undefined,
		    list = options.list,
		    item = options.item,
	        view = list.up('navigatorview'),
		    isTableList = list.getEl().hasCls('x-table-list') ? true : false,
		    tappedRec = list.getRecord(item)
		;
		
		if (target.hasCls('x-button')) {
			
			if (target.hasCls('extend')) {
				
				options.isSetView = false;
				
				view.setLoading (true);
				
				var createdRecordModelName = isTableList
						? target.up('.dep').down('input').dom.value
						: list.getRecord(item).get('table_id'),
					objectRecord = isTableList
						? (list.modelForDeps && !Ext.getStore('tables').getById(tappedRec.modelName).hasIdColumn()
								? Ext.getStore(list.modelForDeps).getById(tappedRec.get(list.modelForDeps.toLowerCase())) 
								: tappedRec)
						: view.objectRecord
				;
					
				Ext.defer ( function () {
					
					rec = Ext.ModelMgr.create({}, createdRecordModelName);
					rec.set( objectRecord.modelName.toLowerCase(), objectRecord.getId() );
					
					if (rec.modelName === 'SaleOrder') {
						rec.set('totalCost', '0');
						rec.set('date', getNextWorkDay());
					}
					
					if(objectRecord.modelName === 'Customer' && createdRecordModelName === 'Encashment') {
						Ext.dispatch(Ext.apply(options, {
							action: 'createEncashmentView',
							customerRecord: objectRecord
						}));
					} else if(createdRecordModelName === 'Uncashment') {

						Ext.dispatch(Ext.apply(options, {action: 'createUncashmentView'}));
					} else {
						Ext.dispatch(Ext.apply(options, {
							action: 'createAndActivateView',
							record: rec,
							editing: true
						}));
					}

				}, 100);
			}
			
		} else if (options.isSetView) {
			
			Ext.dispatch(Ext.apply(options, {
				action: 'createAndActivateView'
			}));
			
		} else if (isTableList && target.up('.dep')) {
			
			var dep = target.up('.dep');
			
			Ext.dispatch(Ext.apply(options, {
				controller: 'Navigator',
				action: 'createAndActivateView',
				record: list.modelForDeps && !Ext.getStore('tables').getById(tappedRec.modelName).hasIdColumn()
						? Ext.getStore(list.modelForDeps).getById(tappedRec.get(list.modelForDeps.toLowerCase())) 
						: tappedRec,
				tableRecord: dep.down('input').getAttribute('value'),
				isSetView: true,
				editing: false
			}));
			
		} else if (isTableList && target.hasCls('label-parent')) {
			
			var parentModel = target.down('input').getAttribute('property');
			parentModel = parentModel[0].toUpperCase() + parentModel.substring(1);
			
			Ext.dispatch(Ext.apply(options, {
				controller: 'Navigator',
				action: 'createAndActivateView',
				record: Ext.getStore(parentModel).getById(parseInt(target.down('input').getAttribute('value'))),
				isSetView: false,
				editing: false
			}));
			
		} else {
			
			Ext.defer ( function() {
				Ext.dispatch(Ext.apply(options, {
					controller: 'Navigator',
					action: 'onListSelectionChange',
					selections: [list.getRecord(item)]
				}));
			}, 150);
		}
		
	},
	
	onSaveEncashButtonTap: function(options) {

		var encashStore = createStore('Encashment'),
			debtStore = options.view.debtList.store,
			updDebtArray = debtStore.getUpdatedRecords(),
			view = options.view
		;
		
		Ext.each(updDebtArray, function(debt) {
			debt.get('encashSumm') > 0 && encashStore.add(Ext.ModelMgr.create({
				isWhite: debt.get('isWhite'), datetime: new Date().format('d/m/y H:i:s'),
				customer: view.customerRecord.getId(), debt: debt.getId(),
				summ: parseFloat(debt.get('encashSumm')).toFixed(2),
				uncashment: undefined
			}, 'Encashment'));
		});
		
		
		encashStore.sync();
		debtStore.sync();
		
		Ext.dispatch(Ext.apply(options, {action: 'goBack'}));
	},
	
	goBack: function(options) {

		var view = options.view;
		var newCard = Ext.create(view.ownerViewConfig);
		if (newCard.isSetView) {
			Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard, anim: IOrders.viewport.anims.back}));
		} else {
			IOrders.viewport.setActiveItem(newCard, IOrders.viewport.anims.back);
		}
	},
	
	onUncashButtonTap: function(options) {

		var view = options.view,
			encashStore = view.encashStore,
			formRecord = view.form.getRecord()
		;
		
		formRecord.save({callback: function(createdUncash) {

			encashStore.each(function(rec) {
				rec.set('uncashment', createdUncash.getId());
			});
			
			encashStore.sync();
			
			Ext.dispatch(Ext.apply(options, {action: 'goBack'}));
		}});
	},
	
	onDebtListItemSwipe: function(options) {

		var rec = options.list.getRecord(options.item),
			encashSumm = parseFloat(rec.get('encashSumm') ? rec.get('encashSumm') : '0'),
		    sign = options.event.direction === 'left' ? -1 : 1
		;
		
		Ext.dispatch (Ext.apply(options, {
			action: 'setEncashSumm',
			encashSumm: sign === 1 ? encashSumm + rec.get('remSumm') : (sign === -1 ? 0 : encashSumm),
			rec: rec
		}));
	},
	
	setEncashSumm: function(options) {		

		var rec = options.rec,
			oldRemSumm = rec.get('remSumm'),
			oldEncashSumm = parseFloat(rec.get('encashSumm') ? rec.get('encashSumm') : '0'),
			newEncashSumm = oldRemSumm + oldEncashSumm - options.encashSumm >= 0 ? options.encashSumm : oldRemSumm + oldEncashSumm
		;

		rec.set('encashSumm', newEncashSumm);
		rec.set('remSumm', oldRemSumm + oldEncashSumm - options.encashSumm >= 0 
				? oldRemSumm - (newEncashSumm - oldEncashSumm) 
				: 0);
	},
	
	createUncashmentView: function(options) {
		
		var uploadProxy = createStore('ToUpload').getProxy();

		var operCount = new Ext.data.Operation({
			filters: [{property: 'table_name', value: 'Encashment'}]
		});

		uploadProxy.count(operCount, function(operation) {

			if(operation.result === 0) {

				var oldView = IOrders.viewport.getActiveItem();
				
				var newCard = Ext.create(Ext.apply({xtype: 'uncashmentview'}, getOwnerViewConfig(oldView)));

				newCard.encashStore.load({limit: 0, callback: function(recs, oper) {
					var totalSumm = 0;
					var totalSummWhite = 0;
				
					Ext.each(recs, function(rec) {
						var encashSumm = rec.get('summ');
						totalSumm += encashSumm;
						rec.get('isWhite') && (totalSummWhite += encashSumm);
					});
					
					var uncashRec = Ext.ModelMgr.create({totalSumm: totalSumm.toFixed(2), totalSummWhite: totalSummWhite.toFixed(2), datetime: new Date().format('d/m/y H:i:s')}, 'Uncashment');
					
					newCard.form.loadRecord(uncashRec);
					
					IOrders.viewport.setActiveItem(newCard);
				}});
			} else {
				
				Ext.Msg.alert('Ошибка', 'Для того чтобы добавать сущность данного типа, требуется сделать синхронизацию с сервером');
				IOrders.viewport.getActiveItem().setLoading(false);
			}
		});
	},
	
	createEncashmentView: function(options) {

		var oldView = IOrders.viewport.getActiveItem();
		var customerRecord = options.customerRecord;
		
		var newCard = Ext.create(Ext.apply({
				xtype: 'encashmentview', customerRecord: customerRecord, partnerRecord: Ext.getStore('Partner').getById(customerRecord.get('partner'))
			}, getOwnerViewConfig(oldView)));
		IOrders.viewport.setActiveItem(newCard);
	},

	createAndActivateView: function(options) {
		
		var objectRecord = options.record || options.list.getRecord(options.item),
		    config = {}
		;
		
		options.tableRecord && Ext.apply(config, {
			tableRecord: options.tableRecord,
			objectRecord: objectRecord
		});
		
		var newCard = Ext.create(createNavigatorView(
			objectRecord,
			IOrders.viewport.getActiveItem(),
			options.isSetView,
			options.editing,
			config
		));
		
		if (newCard.isSetView) {
			Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard}));
		} else {
			IOrders.viewport.setActiveItem(newCard);
		}
	},

	loadSetViewStore: function(options) {
		
		var oldCard = IOrders.viewport.getActiveItem(),
		    newCard = options.newCard,
		    store = newCard.setViewStore
		;
		
		oldCard.setLoading(true);
		
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
	
	onNameSelectFieldValueChange: function(options) {

		var view = options.view;
		var record = options.selected;
		
		view.objectRecord = record;
		view.form.loadRecord(record);
		
		view.depStore.each(function(depRec) {
			var modelProxy = Ext.ModelMgr.getModel(depRec.get('table_id')).prototype.getProxy();

			var operCount = new Ext.data.Operation({
				depRec: depRec,
				filters: [{property: view.objectRecord.modelName.toLowerCase(), value: view.objectRecord.getId()}]
			});

			modelProxy.count(operCount, function(operation) {
				operation.depRec.set('count', operation.result);
			});
		});
	},
	
	onSyncButtonTap: function(options) {
		options.btn.disable();
		
		IOrders.xi.upload ({
			engine: IOrders.dbeng,
			success: function(s) {
				Ext.Msg.alert('Загрузка завершена', 'Передано записей: '+s.getCount(),
							  function() {options.btn.enable();}
				);
			},
			failure: function(s,e) {
				Ext.Msg.alert('Загрузка не удалась', e,
							  function() {options.btn.enable();}
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
			enter: 'right',
			items: [
				{ text: 'Закрыть панель настроек', name: 'PrefsClose'},
				{ text: 'Запросить данные', name: 'XiDownload'},
				{ text: 'Запросить метаданные', name: 'XiMeta'},
				{ text: 'Стереть локальные данные', name: 'ClearLocalStorage'},
				{ text: 'Пересоздать БД', name: 'DbRebuild'},
				{ xtype: 'segmentedbutton', layout: {align: 'none'}, items: [
					{text: 'Localdata', name: 'XiNoServer', pressed: IOrders.xi.noServer},
					{text: 'System', name: 'XiYesServer', pressed: !IOrders.xi.noServer},
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
		
		var tableRecord = undefined,
		    depStore = undefined,
		    hasIdColumn = undefined,
		    tableStore = Ext.getStore('tables')
		;
		
		Ext.each(options.selections, function(record) {
			if(!record.data.deps) {
				if(!depStore || !tableRecord) {
					tableRecord = tableStore.getById(record.modelName);
					hasIdColumn = tableRecord.hasIdColumn();
					tableRecord = !hasIdColumn && list.modelForDeps ? tableStore.getById(list.modelForDeps) : tableRecord; 
					depStore = tableRecord.deps();
				}
				
				var data = [];
				
				depStore.each(function(dep) {
					
					var depTable = tableStore.getById(dep.get('table_id'));
					
					if((depTable.get('id') != 'SaleOrderPosition' || record.modelName == 'SaleOrder') && record.modelName !== depTable.get('id')) {
						
						var depRec = {
								name: depTable.get('nameSet'),
								table_id: depTable.get('id'),
								extendable: depTable.get('extendable'),
								editable: depTable.get('editable')
							},
						    modelProxy = Ext.ModelMgr.getModel(depTable.get('id')).prototype.getProxy(),
							filters = []
						;
						
						recordForDeps = list.modelForDeps && !hasIdColumn 
								? Ext.getStore(list.modelForDeps).getById(record.get(list.modelForDeps.toLowerCase())) 
								: record;
						
						recordForDeps.modelName != 'MainMenu'
							&& filters.push({
								property: recordForDeps.modelName.toLowerCase(),
								value: recordForDeps.getId()
							})
						;
						
						var operCount = new Ext.data.Operation ({
							filters: filters
						});
						
						modelProxy.count(operCount, function(operation) {
							depRec.count = operation.result;
							record.data.deps = data;
							list.store && list.refreshNode(list.indexOf(record));
						});
						
						data.push(depRec);
					}
				});
				
//				list.getSelectionModel().select(record, true, false);
			}
		});
	}
});