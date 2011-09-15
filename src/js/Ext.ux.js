Ext.ns('Ext.ux');

Ext.ux.List = Ext.extend(Ext.List, {
	initComponent: function() {
		this.listeners = {
			itemtap: function(list, idx, item) {
				Ext.dispatch({
					controller: 'Main',
					action: 'onListItemTap',
					list: list,
					idx: idx,
					item: item
				});
			}	
		};
		Ext.ux.List.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('ux.list', Ext.ux.List);