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
		
		this.xi = new Ext.data.XmlInterface({
			username: 'preorderer',
			password: '123',
			view: 'iorders',
			noServer: true
		});
		
		this.dbeng = new Ext.data.Engine({
			listeners: {
				dbstart: function(db) {
					console.log('Database started: version=' + db.version);
					//IOrders.xi.download(IOrders.dbeng, IOrders.dbeng.processDowloadData);
				}
			}
		});
		
		this.getMetadata = {
			success: function() {
				var me=this;
				
				me.request({
					command: 'metadata',
					success: function(response) {
						var m = response.responseXML;
						
						console.log(m);
						
						var metadata = me.xml2obj(m).metadata;
						composeMainMenu(metadata.tables);
						
						IOrders.dbeng.startDatabase(metadata);
						
						var proxyData = { tables: metadata.tables };
						
						Ext.each (metadata.views, function (view) {
							proxyData.tables.push (Ext.apply(view, {type: 'view'}))
						});
						
						tStore.getProxy().data = proxyData;
						
						tStore.load();
						IOrders.init();
					}
				});
			}
		};

		this.xi.reconnect(this.getMetadata);
	}
});