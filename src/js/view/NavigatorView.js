var NavigatorView = Ext.extend(AbstractView, {
	objectRecord: undefined,
	tableRecord: undefined,
	/**
	 * Own
	 */
	createItems: function() {
		var fieldset = {
			xtype: 'fieldset',
			items: [
				
			]
		};
		var list = {
			xtype: 'list',
			itemTpl: '',
			store: this.objectRecord.modelName,
			listeners: {
				itemtap: function(list, idx, item) {
					Ext.dispatch({
						action: 'onListItemTap',
						list: list,
						idx: idx
					});
				}
			}
		};
		
		this.form = new Ext.form.FormPanel({
			items: [
				fieldset,
				list
			]			
		});
	},
	/**
	 * Overridden
	 */
	initComponent: function() {
		NavigatorView.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('navigatorview', NavigatorView);