Ext.regApplication({
	name: 'IOrders',
	
	beforeLauch: function() {

		this.viewport = Ext.create({xtype: 'viewport'});
	},
	
	init: function() {
		
		var store = Ext.getStore('tables');
		
		createModels(store);
		createStores(store);
		
		this.viewport.setActiveItem(new NavigatorView({
			isObjectView: true,
			objectRecord: Ext.ModelMgr.create({id: 1}, 'MainMenu')
		}));
	},
	
	launch: function() {
		this.beforeLauch();
		
		var tStore = Ext.getStore('tables');
		
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

		
		var metadata = Ext.decode(localStorage.getItem('metadata'));
		if(!metadata) {
			
			var asheet = new Ext.ActionSheet({
			    items: [
			        {xtype: 'fieldset', 
			        	items: [
	                    	{xtype: 'textfield', id: 'login', name: 'login', label: 'Логин'},
	                    	{xtype: 'passwordfield', id: 'password', name: 'password', label: 'Пароль'}
                    	]
			        },
			        {text: 'Логин', name: 'Login'}
			    ]
			});
			asheet.show();
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