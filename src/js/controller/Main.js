Ext.regController('Main', {
	onBackTap: function(options) {
		var view = options.view;
		if(view.isXType('navigatorview')) {
			Ext.dispatch({
				controller: 'Navigator',
				action: 'onBackTap',
				view: view
			});
		}
	},
	onListItemTap: function(options) {
		var list = options.list;
		switch(list.name) {
			case 'buttonList' : {
				Ext.dispatch({
					controller: 'Navigator',
					action: 'onButtonListItemTap',
					list: list,
					idx: options.idx,
					item: options.item
				});
				break;
			}
			case 'tableList' : {
				Ext.dispatch({
					controller: 'Navigator',
					action: 'onTableListItemTap',
					list: list,
					idx: options.idx,
					item: options.item
				});
				break;
			}
		};
	}
});