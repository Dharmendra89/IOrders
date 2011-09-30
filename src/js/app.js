Ext.regApplication({
	name: 'IOrders',
	beforeLauch: function() {

		this.viewport = Ext.create({xtype: 'viewport'});
	},
	init: function() {

		var store = Ext.getStore('tables');

		createModels(store);
		createExtandableModels();
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

				IOrders.xi.request({
					command: 'metadata',
					success: function(response) {

						var m = response.responseXML;

						console.log(m);

						var metadata = IOrders.xi.xml2obj(m).metadata;
						composeMainMenu(metadata.tables);
						composeOffer(metadata.tables);

						IOrders.dbeng.startDatabase(tStore.getProxy().data = metadata);

						tStore.load();
						IOrders.init();
					}
				});
			}
		};

		this.xi.reconnect(this.getMetadata);
	}
});