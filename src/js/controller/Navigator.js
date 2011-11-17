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
			objectRecord: IOrders.mainMenuRecord
		}), IOrders.viewport.anims.home);
	},
	
	onSaveButtonTap: function(options) {
		
		var view = options.view,
		    form = view.form,
		    rec = form.getRecord()
		;
		
		form.updateRecord(rec);
		
		var errors = rec.validate();
		
		if(errors.isValid()) {
			
			var btn = options.btn;
			
			if (btn) {
				btn.setText('Редактировать');
				
				Ext.apply(btn, {name: 'Edit'});
				
				options.view.depStore.each(function(rec) {
					rec.set('editing', false);
				});
				
				var toolbar = btn.up('toolbar');
				
				toolbar.getComponent('Cancel').hide();
				Ext.dispatch(Ext.apply(options, {action: 'setEditing', editing: false}));
			}
			
			rec.save();
			
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
		options.view.setFieldsDisabled(!options.editing);
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
		if(rec.modelName === 'Uncashment') {

			Ext.dispatch(Ext.apply(options, {action: 'createUncashmentView'}));
		} else {
			IOrders.viewport.setActiveItem(Ext.create(createNavigatorView(rec, oldCard, false, true)));
		}
		
		
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

		view.lastSelectedRecord = tappedRec;

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
					
					if(createdRecordModelName === 'Encashment') {
						var customerRecord = undefined;
						var partnerRecord = undefined;
						switch(objectRecord.modelName) {
							case 'Debt' : {
								partnerRecord = Ext.getStore('Partner').getById(objectRecord.get('partner'));
								break;
							}
							case 'Customer' : {
								customerRecord = objectRecord;
								break;
							}
						}
						
						Ext.dispatch(Ext.apply(options, {
							action: 'createEncashmentView',
							partnerRecord: partnerRecord,
							customerRecord: customerRecord
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
			
			tappedRec.get('count') && Ext.dispatch(Ext.apply(options, {
				action: 'createAndActivateView'
			}));
			
		} else if (isTableList && target.up('.dep')) {
			
			var dep = target.up('.dep');
			var count = dep.down('.count').dom.innerText;
			
			count && Ext.dispatch(Ext.apply(options, {
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

			var table = Ext.getStore('tables').getById(tappedRec.modelName),
				depStore = table.deps()
			;

			if(depStore.getCount() !== 1 || table.hasExtendableDep())
				Ext.defer ( function() {

					Ext.dispatch(Ext.apply(options, {
						controller: 'Navigator',
						action: 'onListSelectionChange',
						view: view,
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
				isWhite: debt.get('isWhite'), datetime: new Date().format('Y-m-d H:i:s'),
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

		var uploadProxy = createStore('ToUpload').getProxy();

		var operCount = new Ext.data.Operation({
			filters: [{property: 'table_name', value: 'Encashment'}]
		});

		uploadProxy.count(operCount, function(operation) {

			if(operation.result === 0) {

				var view = options.view,
					encashStore = view.encashStore,
					debtStore = view.debtStore,
					formRecord = view.form.getRecord()
				;

				formRecord.save({callback: function(createdUncash) {
					
					encashStore.each(function(rec) {
						rec.set('uncashment', createdUncash.getId());
					});

					encashStore.sync();
					debtStore.sync();

					Ext.dispatch(Ext.apply(options, {action: 'goBack'}));

				}});
			} else {

				Ext.Msg.alert('Ошибка', 'Для того чтобы сдать выручку, требуется сперва передать данные об инкассациях на сервер');
				IOrders.viewport.getActiveItem().setLoading(false);
			}
		});
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
			newEncashSumm = oldRemSumm + oldEncashSumm - parseFloat(options.encashSumm) >= 0 ? options.encashSumm : oldRemSumm + oldEncashSumm
		;
		
		rec.set('encashSumm', newEncashSumm);
		rec.set('remSumm', oldRemSumm + oldEncashSumm - options.encashSumm >= 0 
				? oldRemSumm - (newEncashSumm - oldEncashSumm) 
				: 0);
	},

	updateEncashment: function(options) {

		var rec = options.rec,
			encashSumm = options.encashSumm,
			view = options.view,
			encashDebtRec = view.debtStore.getById(rec.get('debt')),
			oldEncashSumm = rec.get('summ'),
			debtRemSumm = encashDebtRec.get('remSumm')
		;

		encashSumm = oldEncashSumm + debtRemSumm >= encashSumm ? encashSumm : oldEncashSumm + debtRemSumm;
		rec.set('summ', encashSumm);

		encashDebtRec.set('encashSumm', encashSumm);
		encashDebtRec.set('remSumm', oldEncashSumm + debtRemSumm - encashSumm);

		var totalSumm = 0;
		var totalSummWhite = 0;
		
		view.encashStore.each(function(rec) {
			var encashSumm = rec.get('summ');
			totalSumm += encashSumm;
			rec.get('isWhite') && (totalSummWhite += encashSumm);
		});

		var formRecord = view.form.getRecord();
		formRecord.set('totalSumm', totalSumm);
		formRecord.set('totalSummWhite', totalSummWhite);
		
		view.form.loadRecord(formRecord);
	},

	createUncashmentView: function(options) {
		
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
			
			var uncashRec = Ext.ModelMgr.create({
					totalSumm: totalSumm.toFixed(2),
					totalSummWhite: totalSummWhite.toFixed(2),
					datetime: new Date().format('Y-m-d H:i:s')
				}, 'Uncashment'
			);
			
			newCard.form.loadRecord(uncashRec);
			
			IOrders.viewport.setActiveItem(newCard);
		}});
	},
	
	createEncashmentView: function(options) {

		var oldView = IOrders.viewport.getActiveItem();
		var customerRecord = options.customerRecord;
		var partnerRecord = options.partnerRecord ? options.partnerRecord : Ext.getStore('Partner').getById(customerRecord.get('partner'));
		
		var newCard = Ext.create(Ext.apply({
				xtype: 'encashmentview', partnerRecord: partnerRecord, customerRecord: customerRecord
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
		    store = newCard.setViewStore,
		    storeLimit = newCard.storeLimit,
		    storePage = newCard.storePage
		;
		
		oldCard.setLoading(true);
		
		store.currentPage = 1;
		store.clearFilter(true);
		
		var storeLoadCallback = function() {
			storePage && (store.currentPage = storePage);
			oldCard.setLoading(false);
			IOrders.viewport.setActiveItem(newCard, options.anim);
			newCard.lastSelectedRecord && Ext.dispatch(Ext.apply(options, {
				action: 'scrollToLastSelectedRecord',
				view: newCard,
				lastSelectedRecord: newCard.lastSelectedRecord
			}));
		};
		
		if (newCard.objectRecord.modelName != 'MainMenu') {
			
			if (newCard.objectRecord.modelName) {
				
				store.filters.add({property: newCard.objectRecord.modelName.toLowerCase(), value: newCard.objectRecord.getId()});
				store.load({
					limit: storeLimit,
					callback: storeLoadCallback
				});

			} else {

				store.load({
					limit: storeLimit,
					callback: storeLoadCallback
				});
				
			}
		} else {
			
			store.load({
				limit: storeLimit,
				callback: storeLoadCallback
			});
			
		}
	},
	
	scrollToLastSelectedRecord: function(options) {
		
		var lastSelectedRecord = options.lastSelectedRecord,
			view = options.view,
			list = view.down('list'),
			item = Ext.get(list.getNode(list.store.findExact('id', lastSelectedRecord.getId())))
		;
		
		item && view.form.scroller.scrollTo({
			y: item.getOffsetsTo(view.form.scrollEl)[1]
		});
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
	
	onEncashCustomerValueChange: function(options) {
		
		var view = options.view,
			selected = options.selected
		;
		
		view.customerRecord = selected;
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

		var view = options.view,
			record = options.selected,
			tableStore = Ext.getStore('tables')
		;

		view.objectRecord = record;
		view.form.loadRecord(record);

		view.depStore.loadData(getDepsData(tableStore.getById(view.objectRecord.modelName).deps(), tableStore, view));
	},

	onSyncButtonTap: function(options) {
		options.btn.disable();
		
		IOrders.xi.upload ({
			engine: IOrders.dbeng,
			/*success: function(s) {
				Ext.Msg.alert('Загрузка завершена', 'Передано записей: '+s.getCount(),
				  function() { if (!IOrders.xi.isBusy()) options.btn.enable();}
				);
			},
			failure: function(s,e) {
				var sb = IOrders.viewport.getActiveItem().syncButton;
				sb.setBadge('!');
			},*/
			recordSuccess: function(s) {
				var sb = IOrders.viewport.getActiveItem().syncButton,
					cnt = sb.cnt > 0 ? --sb.cnt : sb.cnt = null;
				
				sb.setBadge(cnt);
			}
		});
	},
	
	onPrefsButtonTap: function(options) {
		
		if (!IOrders.prefSheet)  {
			IOrders.prefSheet = Ext.create({
				xtype: 'actionsheet',
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
					{ xtype: 'segmentedbutton', layout: {align: 'none'}, items: [
						{text: 'Enable logging', name: 'EnableLog', pressed: DEBUG},
						{text: 'Disable logging', name: 'DisableLog', pressed: !DEBUG},
					]},
					{ text: 'Сервер-логин', name: 'XiLogin'},
					{ text: 'Сервер-логоф', name: 'XiLogoff'},
					{ text: 'Включить Heartbeat', name: 'HeartbeatOn'},
					{ text: 'Обновить кэш', name: 'CacheRefresh'},
					{ text: 'Перезапустить', name: 'Reload'}
				],
				setDisabled: function(state) {
					var disableXi = state == true || IOrders.xi.isBusy();
					
					this.items.each (function(b) {
						if (b.name && b.name.slice(0,2) == 'Xi')
							b.setDisabled (disableXi)
					});
				}
			});
			IOrders.prefSheet.mon (
				IOrders.xi.connection,
				'beforerequest',
				function () {
					IOrders.prefSheet.setDisabled(true)
				},
				IOrders.prefSheet
			);
			IOrders.prefSheet.mon (
				IOrders.xi.connection,
				'requestcomplete',
				IOrders.prefSheet.setDisabled,
				IOrders.prefSheet, {delay: 1000}
			);
			IOrders.prefSheet.mon (
				IOrders.xi.connection,
				'requestexception',
				IOrders.prefSheet.setDisabled,
				IOrders.prefSheet, {delay: 1000}
			);
		};
		
		IOrders.prefSheet.setDisabled();
		IOrders.prefSheet.show();
		
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
								contains: dep.get('contains'),
								editing: false
							},
						    modelProxy = Ext.ModelMgr.getModel(depTable.get('id')).prototype.getProxy(),
							filters = []
						;
						
						recordForDeps = list.modelForDeps && !hasIdColumn 
								? Ext.getStore(list.modelForDeps).getById(record.get(list.modelForDeps[0].toLowerCase() + list.modelForDeps.substring(1))) 
								: record;
						
						recordForDeps.modelName != 'MainMenu'
							&& filters.push({
								property: recordForDeps.modelName.toLowerCase(),
								value: recordForDeps.getId()
							})
						;	
						
						if(depTable.hasAggregates()) {
						
							var aggCols = depTable.getAggregates();
							var aggOperation = new Ext.data.Operation({filters: filters});

							modelProxy.aggregate(aggOperation, function(operation) {
								
								var aggDepResult = '';
								var aggDepTpl = new Ext.XTemplate('<tpl if="value &gt; 0"><tpl if="name">{name} : </tpl>{[values.value.toFixed(2)]} </tpl>');
								var aggResults = operation.resultSet.records[0].data;
								
								aggCols.each(function(aggCol) {
									aggDepResult += aggDepTpl.apply({name: aggCol.get('label') != depTable.get('nameSet') ? aggCol.get('label') : '', value: aggResults[aggCol.get('name')]});
								});
								
								depRec.aggregates = aggDepResult;
								depRec.count = aggResults.cnt;
								
								record.data.deps = data;
								list.store && list.refreshNode(list.indexOf(record));
								
								list.doComponentLayout();
							});
						} else {
							var operCount = new Ext.data.Operation ({
								filters: filters
							});
							
							modelProxy.count(operCount, function(operation) {
								depRec.count = operation.result;
								record.data.deps = data;
								list.store && list.refreshNode(list.indexOf(record));
								
								list.doComponentLayout();
							});
						}
						
						data.push(depRec);
					}
				});
			}
		});
	}
});