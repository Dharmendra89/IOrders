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

		var toolbar = btn.up('toolbar');
		toolbar.getComponent('Cancel').show();

		Ext.dispatch(Ext.apply(options, {action: 'setEditable', editable: true}));
	},
	onCancelButtonTap: function(options) {

		options.view.form.load(options.view.form.getRecord());

		var toolbar = options.btn.up('toolbar');
		toolbar.getComponent('Cancel').hide();
		
		var saveEditBtn = toolbar.getComponent('SaveEdit');
		
		saveEditBtn.setText('Редактировать');
		Ext.apply(saveEditBtn, {name: 'Edit'});

		Ext.dispatch(Ext.apply(options, {action: 'setEditable', editable: false}));
	},
	setEditable: function(options) {
		options.view.form.setDisabled(!options.editable);
	},
	onAddButtonTap: function(options) {

		var rec = Ext.ModelMgr.create({}, options.view.tableRecord);
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
				rec.set('totalCost', '0');
			}
		} else {
			rec = options.list.getRecord(options.item);
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

		var newCard = Ext.create(createNavigatorView(view.objectRecord, IOrders.viewport.getActiveItem(),
				true, false, 
				{objectRecord: Ext.ModelMgr.create({id: 1}, 'MainMenu'), tableRecord: field.name[0].toUpperCase() + field.name.substring(1)}
		));
		Ext.dispatch(Ext.apply(options, {action: 'loadSetViewStore', newCard: newCard}));
	},

	onselectfieldInputTap: function(options) {

		var field = options.field;
		var record = Ext.getStore(field.name[0].toUpperCase() + field.name.substring(1)).getById(field.getValue());

		var newCard = Ext.create(createNavigatorView(record, IOrders.viewport.getActiveItem(), false, false, {}));
		IOrders.viewport.setActiveItem(newCard);
	}
});