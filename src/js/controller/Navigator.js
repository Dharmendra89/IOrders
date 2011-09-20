Ext.regController('Navigator', {
	onBackButtonTap: function(options) {
		var view = options.view;
		IOrders.viewport.setActiveItem(Ext.create(view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onSaveButtonTap: function(options) {
		var view = options.view;
		var form = view.form;
		var formRec = form.getRecord();
		form.updateRecord(formRec);
		var store = Ext.getStore(formRec.modelName);
		formRec.setId(uuid());
		store.add(formRec);
		store.sync();
		IOrders.viewport.setActiveItem(Ext.create(view.ownerViewConfig), IOrders.viewport.anims.back);
	},
	onAddButtonTap: function(options) {
		var rec = Ext.ModelMgr.create({}, options.view.tableRecord);
		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, false, true));
		IOrders.viewport.setActiveItem(newCard);
	},
	onListItemTap: function(options) {
		var target = Ext.get(options.event.target);
		var rec;
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