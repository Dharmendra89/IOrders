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
	beforeLauch: function() {
		this.viewport = Ext.create({xtype: 'viewport'});
	},
	launch: function() {
		this.beforeLauch();
		
		this.viewport.setActiveItem(new NavigatorView({
			//fullscreen: true,
			objectView: true,
			objectRecord: Ext.ModelMgr.create({id: 1, name: 'Север'}, 'Warehouse')
		}));
	}
});