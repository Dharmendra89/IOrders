var AbstractView = Ext.extend(Ext.Panel, {
	/**
	 * Own
	 */
	createDockedItmes: function() {
		this.dockedItems || (this.dockedItems = []);
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			title: this.title,
			items: [{
				ui: 'back',
				scope: this,
				handler: function(btn, e) {
					Ext.dispatch({
						action: 'onBackTap',
						view: this,
						btn: btn,
						event: e
					});
				}
			}]
		}].concat(this.dockedItems);
	},
	createItems: Ext.EmptyFn,
	/**
	 * Handlers
	 */
	
	/**
	 * Overriden
	 */
	initComponent: function() {
		this.createDockedItmes();
		this.createItems();
		AbstractView.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('abstractview', AbstractView);