applicationCache.addEventListener('updateready', function() {
	location.replace (location.href);
});


Ext.regApplication({
	name: 'IOrders',
    icon: 'src/css/apple-touch-icon.png',

//    phoneStartupScreen: 'phone_startup.png',
	
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
		
		//document.body.addEventListener('touchstart', function(e) {e.preventDefault();}, false);
		
		this.viewport = Ext.create({xtype: 'viewport'});
		
		this.dbeng = new Ext.data.Engine({
			listeners: {
				dbstart: function(db) {
					console.log('Database started: version=' + db.version);
					
					tStore.getProxy().data = this.metadata;
					tStore.load(function() {IOrders.init();});
					
					if (db.clean)
						IOrders.xi.download(IOrders.dbeng);
				},
				fail: function() {
					localStorage.clear();
					location.replace (location.href);
				}
			}
		});
		
		IOrders.xi = new Ext.data.XmlInterface({
			view: 'iorders',
			noServer: (location.protocol == 'http:')
		});
		
		IOrders.getMetadata = {
			success: function() {
				var me=this;
				
				me.request({
					command: 'metadata',
					success: function(response) {
						var m = response.responseXML;
						
						console.log(m);
						
						var metadata = me.xml2obj(m).metadata;
						
						localStorage.setItem('metadata', Ext.encode(metadata));
						
						IOrders.dbeng.startDatabase(metadata);
						
					}
				});
			}
		};
		
		if(!metadata) {
			
			this.viewport.setActiveItem(Ext.create({
				xtype: 'form',
				name: 'Login',
				ownSubmit: true,
				items: [
					{xtype: 'fieldset', 
						items: [
					    	{
								xtype: 'textfield', id: 'login', name: 'login', label: 'Логин',
								autoCorrect: false, autoCapitalize: false
							},
					    	{
								xtype: 'passwordfield', id: 'password', name: 'password', label: 'Пароль'
							}
						]
					},
					{xtype: 'button', text: 'Логин', name: 'Login'}
				]
			}));
			
		} else {
			
			Ext.apply (this.xi, {
				username: localStorage.getItem('login'),
				password: localStorage.getItem('password')
			});
			
			IOrders.dbeng.startDatabase(metadata);
		}
	}
});