Ext.regController('Navigator', {
	onBackButtonTap: function(options) {
		var view = options.view;
		IOrders.viewport.setActiveItem(Ext.create(view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onSaveButtonTap: function(options) {
		Ext.dispatch(Ext.apply(options, {action: 'saveObjectRecord'}));
		IOrders.viewport.setActiveItem(Ext.create(options.view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	saveObjectRecord: function(options) {
		var view = options.view;
		var form = view.form;
		var formRec = form.getRecord();
		form.updateRecord(formRec);
		var store = Ext.getStore(formRec.modelName);
		if(formRec.phantom) {
			formRec.setId(uuid());
			store.add(formRec);
		}
		store.sync();
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
		if(target.hasCls('x-button')) {
			if(target.hasCls('add')) {
				options.isSetView = false;
				editable = true;
				rec = Ext.ModelMgr.create({}, options.list.getRecord(options.item).get('table_id'));
			}
		} else {
			rec = options.list.getRecord(options.item);
		}
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, options.isSetView, editable));
		IOrders.viewport.setActiveItem(newCard);
	}
});