Ext.regController('Main', {
	onButtonTap: function(options) {
		var view = options.view;
		if(view.isXType('navigatorview')) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('Button', options.btn.name + 'Button')}));
		}
		
	},
	onListItemTap: function(options) {
		var list = options.list;
		var isNavView = list.up('navigatorview');
		var listEl = list.getEl();
		if(isNavView) {
			Ext.dispatch(Ext.apply(options, {
				controller: 'Navigator',
				isSetView: listEl.hasCls('x-buttons-list')
			}));
		}
	}
});