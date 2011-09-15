Ext.regModel('Warehouse', {
	modelName: 'Warehouse',
	fields: [
		{name: 'id', type: 'string'},
		{name: 'name', type: 'string'}
	]
});

var data = {
	wars: [
		{id: 1, name: 'Север'},
		{id: 2, name: 'Юг'},
		{id: 3, name: 'Восток'}
	]
};

Ext.regStore('Warehouse', {
	model: 'Warehouse',
	data: data,
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			root: 'wars'
		}
	}
});


Ext.regApplication({
	name: 'IOrders',
	viewport: {xtype: 'panel', fullscreen: true},
	beforeLauch: function() {
		Ext.Interaction.controller = 'Main';
	},
	launch: function() {
		this.beforeLauch();
		
		var v = new NavigatorView({
			fullscreen: true,
			objectRecord: Ext.ModelMgr.create({id: 1, name: 'Север'}, 'Warehouse')
		});
		v.show();
	}
});