Ext.regApplication({
	name: 'IOrders',
	
	init: function() {
		
		var store = Ext.getStore('tables');
		
		createModels(store);
		createStores(store, { pageSize: 400 });
		
		this.viewport.setActiveItem(new NavigatorView({
			isObjectView: true,
			objectRecord: Ext.ModelMgr.create({id: 1}, 'MainMenu')
		}));
	},
	
	launch: function() {
		
		var tStore = Ext.getStore('tables'),
			metadata = Ext.decode(localStorage.getItem('metadata'))
		;
		
		this.viewport = Ext.create({xtype: 'viewport'});
		
		this.dbeng = new Ext.data.Engine({
			listeners: {
				dbstart: function(db) {
					console.log('Database started: version=' + db.version);
					
					tStore.getProxy().data = this.metadata;
					tStore.load();
					IOrders.init();
					
					if (db.clean)
						IOrders.xi.download(IOrders.dbeng, IOrders.dbeng.processDowloadData);
				}
			}
		});
		
		
		if(!metadata) {
			
			this.viewport.setActiveItem(Ext.create({
				xtype: 'form',
				items: [
					{xtype: 'fieldset', 
						items: [
					    	{xtype: 'textfield', id: 'login', name: 'login', label: 'Логин'},
					    	{xtype: 'passwordfield', id: 'password', name: 'password', label: 'Пароль'}
						]
					},
					{xtype: 'button', text: 'Логин', name: 'Login'}
				]
			}));
			
		} else {
			
			this.xi = new Ext.data.XmlInterface({
				username: localStorage.getItem('login'),
				password: localStorage.getItem('password'),
				view: 'iorders',
				noServer: true
			});
			IOrders.dbeng.startDatabase(metadata);
		}
	}
});