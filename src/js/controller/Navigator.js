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
		var store = Ext.getStore(formRec.modelName);
		
		form.updateRecord(formRec);
		
		if (formRec.phantom) {
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

		if (target.hasCls('x-button')) {
			if (target.hasCls('add')) {

				var view = options.list.up('navigatorview');
				options.isSetView = false;
				editable = true;

				rec = Ext.ModelMgr.create({}, options.list.getRecord(options.item).get('table_id'));				
				rec.set(view.objectRecord.modelName.toLowerCase(), view.objectRecord.getId());
				rec.set('totalPrice', '0');
			}
		} else {
			rec = options.list.getRecord(options.item);
		}		

		var oldCard = IOrders.viewport.getActiveItem();
		var newCard = Ext.create(createNavigatorView(rec, oldCard, options.isSetView, editable));
		if (newCard.isSetView) {

			oldCard.setLoading(true);
			var store = Ext.getStore(newCard.tableRecord);
			store.currentPage = 1;
			store.clearFilter(true);

			if (newCard.objectRecord.modelName != 'MainMenu') {
				if (newCard.objectRecord.modelName) {

					store.filter([{
						property: newCard.objectRecord.modelName.toLowerCase(),
						value: newCard.objectRecord.getId()
					}]);
					
					oldCard.setLoading(false);
					IOrders.viewport.setActiveItem(newCard);
				} else {

					store.load({
						callback: function() {
							oldCard.setLoading(false);
							IOrders.viewport.setActiveItem(newCard);
						}
					});
				}
			} else {

				store.load({
					callback: function() {
						oldCard.setLoading(false);
						IOrders.viewport.setActiveItem(newCard);
					}
				});
			}
		} else {

			IOrders.viewport.setActiveItem(newCard);
		}
	}
});