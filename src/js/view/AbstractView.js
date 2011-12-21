var AbstractView = Ext.extend(Ext.Panel, {

	cmpLinkArray: [],
	/**
	 * Own
	 */
	createDockedItmes: function() {
		
		this.dockedItems || (this.dockedItems = []);
		
		this.dockedItems = [{
			xtype: 'toolbar',
			dock: 'top',
			itemId: 'top',
			title: this.title,
			items: [{
				ui: 'back', iconMask: true,
				name: 'Back',
				iconCls: 'reply',
				scope: this
			}]
		}].concat(this.dockedItems);

		if (!this.isXType('saleorderview') && !this.isXType('encashmentview'))
			this.dockedItems[0].items.push ({
				ui: 'home', iconMask: true,
				name: 'Home',
				iconCls: 'home',
				scope: this
			});

	},
	createItems: Ext.EmptyFn,
	/**
	 * Overridden
	 */
	initComponent: function() {

		this.createDockedItmes();
		this.createItems();
		AbstractView.superclass.initComponent.apply(this, arguments);

		this.on('destroy', this.afterDestroy, this);
	},

	afterDestroy: function() {

		Ext.each(this.cmpLinkArray, function(cmpLink) {
			cmpLink.destroy();
		});
	}
});
Ext.reg('abstractview', AbstractView);