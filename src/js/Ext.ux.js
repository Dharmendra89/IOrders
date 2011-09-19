Ext.ns('Ext.ux');

Ext.Interaction.prototype.controller = 'Main';

Ext.List.prototype.listeners = {
	itemtap: function(list, idx, item) {
		Ext.dispatch({
			action: 'onListItemTap',
			list: list,
			idx: idx,
			item: item
		});
	}
};