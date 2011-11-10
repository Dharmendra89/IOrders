var DEBUG = localStorage.getItem('DEBUG') || true; // set to false to disable debugging
var oldConsoLog = console.log;
console.log = function() {
	if (DEBUG) {
		oldConsoLog.apply(this, arguments);
	}
};

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
		
		IOrders.mainMenuRecord = Ext.ModelMgr.create({id: localStorage.getItem('login')}, 'MainMenu');
		
		this.viewport.setActiveItem(new NavigatorView({
			isObjectView: true,
			objectRecord: IOrders.mainMenuRecord
		}));
		
		this.viewport.getActiveItem().loadData();
		
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
			noServer: ! (location.protocol == 'https:' || localStorage.getItem('realServer') == 'true')
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
			
			if (!this.xi.noServer){
				var r = function(db) {
					if (!db.clean) {
						IOrders.xi.login ({
							success: function() {
								p = new Ext.data.SQLiteProxy({engine: IOrders.dbeng, model: 'ToUpload'});
								
								p.count(new Ext.data.Operation(),
									function(o) {
										if (o.result == 0)
											Ext.dispatch ({controller: 'Main', action: 'onXiMetaButtonTap', silent: true});
										else
											console.log ('There are unuploaded data');
									}
								);
							}
						})
					}
				}, f = function() {
					IOrders.xi.reconnect({
						success: function() {
							p = new Ext.data.SQLiteProxy({engine: IOrders.dbeng, model: 'ToUpload'});
							
							Ext.Msg.confirm ('Не удалось обновить БД', 'Проверим метаданные?', function (b) {
								if (b == 'yes')
									Ext.dispatch ({controller: 'Main', action: 'onXiMetaButtonTap'});
							});
						}
				})};

					
				this.dbeng.on ('dbstart', r);
				this.dbeng.on ('upgradefail', f);
			}
			
			this.dbeng.startDatabase(metadata);
			
		}
	}
});