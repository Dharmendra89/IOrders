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
		rec.modelName === 'SaleOrder' && rec.set('date', getNextWorkDay());
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, false, true));

		IOrders.viewport.setActiveItem(newCard);
	},
	onListItemTap: function(options) {

		var target = Ext.get(options.event.target);
		var rec = undefined;
		var editable = false;

		if (target.hasCls('x-button')) {
			if (target.hasCls('extend')) {

				var view = options.list.up('navigatorview');
				options.isSetView = false;
				editable = true;

				rec = Ext.ModelMgr.create({}, options.list.getRecord(options.item).get('table_id'));				
				rec.set(view.objectRecord.modelName.toLowerCase(), view.objectRecord.getId());
				if(rec.modelName === 'SaleOrder') {
					rec.set('totalCost', '0');
					rec.set('date', getNextWorkDay());
				}
			} else {
				return;
			}
		} else {
			rec = options.list.getRecord(options.item);
			if(rec.get('count') == 0) {
				return;
			}
		}		

		var newCard = Ext.create(createNavigatorView(rec, IOrders.viewport.getActiveItem(), options.isSetView, editable));
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
		IOrders.xi.upload ({
			engine: IOrders.dbeng,
			success: function(s) {
				Ext.Msg.alert('Загрузка завершена', 'Передано записей: '+s.getCount());
			},
			failure: function(s,e) {
				Ext.Msg.alert('Загрузка не удалась', e);
			},
			recordSuccess: function(s) {
				var cnt = parseInt(options.btn.getBadgeText());
				
				options.btn.setBadge(--cnt);
			}
		});
	},
	

});