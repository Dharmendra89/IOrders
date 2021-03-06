Ext.regController('Main', {
	
	onButtonTap: function(options) {
		
		var view = options.view,
			redirectTo = this,
			action = options.action.replace('Button', options.btn.name + 'Button')
			;
		
		if ( view.isXType('navigatorview') || view.isXType('encashmentview') || view.isXType('uncashmentview')) {
			redirectTo = 'Navigator';
		} else if ( view.isXType('saleorderview') ) {
			redirectTo = 'SaleOrder';
		} else {
			var sb = view.up('segmentedbutton');
			if (sb && sb.name) {
				action = 'statusChange';
				if (options.btn.wasPressed) action = false;
			}
		}
		;
		
		if (action) Ext.dispatch(Ext.apply(options, {
			controller: redirectTo,
			action: action
		}));
		
	},

	onLoginButtonTap: function(options) {

		options.btn.up('form').submit();
	},
	
	onCacheRefreshButtonTap: function(options) {
		var queue = function() {
			Ext.Msg.alert('refresh end');
		};
		
		Ext.StoreMgr.each( function(store) {
			if (store.autoLoad) {
				queue = Ext.util.Functions.createDelegate(store.load, store, [{
					callback: queue
				}]);
				store.currentPage = 1;
			}
		});
		
		queue();
	},
	
	onListItemTap: function(options) {
		
		var list = options.list,
			rec = options.list.getRecord(options.item),
		    navView = list.up('navigatorview'),
		    saleOrderView = list.up('saleorderview'),
		    listEl = list.getEl()
		;
		
		if(navView) {
			switch(rec.get('table_id')) {
				case 'SaleOrderPosition' : {
					
					var target = Ext.get(options.event.target);
					
					if(target.hasCls('x-button')) {
						
						if(target.hasCls('extend')) {
							var form = navView.form;
							var formRec = form.getRecord();
							
							form.updateRecord(formRec);
							
							var errors = formRec.validate();
							if(errors.isValid()) {
								formRec.save({success: function() {
									Ext.dispatch(Ext.apply(options, {
										controller: 'SaleOrder',
										saleOrder: navView.objectRecord
									}));
								}})
							} else {
								var msg = '';
								errors.each(function(err) {
									msg += 'Поле ' + err.field + ' ' + err.message;
								});
								Ext.Msg.alert('Ошибка валидации', msg, Ext.emptyFn);
							}
						}
						
					} else {
						
						Ext.dispatch(Ext.apply(options, {
							controller: 'Navigator',
							isSetView: listEl.hasCls('x-deps-list')
						}));
						
					}
					break;
				}
				default : {
					Ext.dispatch(Ext.apply(options, {
						controller: 'Navigator',
						isSetView: listEl.hasCls('x-deps-list')
					}));
				}
			};
		} else if(saleOrderView) {
			Ext.dispatch(Ext.apply(options, {controller: 'SaleOrder'}));
		}
	},
	
	onListItemDisclosure: function(options) {

		var list = options.list,
	    	navView = list.up('navigatorview'),
	    	listEl = list.getEl(),
	    	tappedRec = list.getRecord(options.item)
		;
	
		if(navView) {

			var tableStore = Ext.getStore('tables'),
				table = tableStore.getById(tappedRec.modelName),
				depStore = table.deps()
			;

			Ext.dispatch(Ext.apply(options, {
				controller: 'Navigator',
				action: 'createAndActivateView',
				isSetView: listEl.hasCls('x-deps-list'),
				editable: false
			}));
		}
	},
	
	onListItemSwipe: function(options) {
		
		var list = options.list;
		var listEl = list.getEl();
		
		if(listEl.hasCls('x-product-list')) {
			Ext.dispatch(Ext.apply(options, {controller: 'SaleOrder'}));
		}
	},

	onDatePickerTap: function(options) {

		var datePicker = new Ext.ux.DatePicker({
            floating: true, hidden: true, width: 300,
            dateField: options.dateField,
            listeners: {
                change: function(dp, date) {
                	dp.dateField.setValue(date.format('d.m.Y')); 
                }
            }
        });
        datePicker.showBy(options.img);
        datePicker.setValue(new Date().add(Date.DAY, 1));
	},

	onFieldLabelTap: function(options) {

		var field = options.field;
		var navView = field.up('navigatorview');
		if(navView) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('Field', 'selectfield'), view: navView}));
		}
	},

	onFieldInputTap: function(options) {

		var field = options.field;
		var navView = field.up('navigatorview');
		if(navView) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('Field', field.xtype), view: navView}));
		}
	},

	onSelectFieldValueChange: function(options) {

		var field = options.field;
		var navView = field.up('navigatorview');
		var encashView = field.up('encashmentview');
		
		if(navView && field.xtype == 'filterfield') {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('SelectField', 'Filter'), view: navView}));
		} else if(encashView && field.name === 'customer') {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('SelectField', 'EncashCustomer'), view: encashView}));
		} else if(field.name === 'id') {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('SelectField', 'NameSelectField'), view: navView}));
		}
	},

	onBeforeSubmitForm: function(options) {

		Ext.dispatch(Ext.apply(options, {action: options.action.replace('Form', options.form.name + 'Form')}));
	},

	onBeforeSubmitLoginForm: function(options) {

		var formData = options.values;
		var login = formData.login;
		var password = formData.password;
		
		if(login && password) {
			
			localStorage.setItem('login', login);
			localStorage.setItem('password', password);
			
			IOrders.xi.username = login;
			IOrders.xi.password = password;
			
			IOrders.xi.reconnect(IOrders.getMetadata);
		} else {
			Ext.Msg.alert('Авторизация', 'Введите логин и пароль');
		}
	},
	
	prefsCb : {
		success: function(r,o) {
			Ext.Msg.alert(o.command, 'Получилось');
		},
		failure: function(r,o) {
			Ext.Msg.alert(o.command, 'Не получилось: ' + r.responseText);
		}
	},
	
	onXiDownloadButtonTap: function(options) {
		IOrders.xi.download ( IOrders.dbeng );
	},

	onXiDownloadButtonTap: function(options) {
		IOrders.xi.download ( IOrders.dbeng );
	},

	onXiLoginButtonTap: function(options) {
		IOrders.xi.login ( this.prefsCb );
	},

	onXiLogoffButtonTap: function(options) {
		IOrders.xi.request ( Ext.apply ({
				command: 'logoff'
			},
			this.prefsCb
		));
	},

	onPrefsCloseButtonTap: function(options) {
		options.btn.up('actionsheet').hide();
	},

	onXiMetaButtonTap: function(options) {
		IOrders.xi.request( Ext.applyIf ({
			command: 'metadata',
			success: function(response) {
				var m = response.responseXML;
				
				console.log(m);
				
				var metadata = this.xml2obj(m).metadata;
				
				if ( metadata.version > IOrders.dbeng.db.version )
					Ext.Msg.confirm(
						'Требуется пересоздать БД',
						'Текущая версия: '+IOrders.dbeng.db.version + '<br/>' +
						'Новая версия: '+metadata.version + '<br/><br/>' +
						'Стереть все данные и загрузить то, что лежит на сервере?',
						function (yn) {
							if (yn == 'yes'){
								localStorage.setItem('metadata', Ext.encode(metadata));				
								location.reload();
							}
						}
					);
				else if (!options.silent) {
					localStorage.setItem('metadata', Ext.encode(metadata));
					Ext.Msg.alert('Метаданные в норме', 'Версия: ' + metadata.version);
				}
				
			}},
			this.prefsCb
		));
	},

	onClearLocalStorageButtonTap: function(options) {
		Ext.Msg.confirm('Внимание', 'Действительно нужно все стереть?', function(yn){
			if (yn == 'yes'){
				localStorage.clear();
				Ext.defer (function() {
					Ext.Msg.alert('Все стерто', 'Необходим перезапуск', function() {
						location.reload();
					});
				}, 500);
			}
		});
	},

	onDbRebuildButtonTap: function(options) {
		
		Ext.Msg.confirm('Внимание', 'Действительно нужно безвозвратно стереть данные из всех таблиц ?', function(yn){
			if (yn == 'yes'){
				IOrders.dbeng.clearListeners();
				
				IOrders.dbeng.startDatabase (
					Ext.decode(localStorage.getItem('metadata')),
					true
				);
			}
		});
	},

	onReloadButtonTap: function(options) {
		location.reload();
	},

	onHeartbeatOnButtonTap: function(options) {
		if (!window.xmlhttp) {
		  window.xmlhttp = new XMLHttpRequest();
		  window.xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
			   if(xmlhttp.status == 200) {
				var url = location.href+'?username='+IOrders.xi.username+'&ts='+new Date().format('YmdHis');
				window.xmlhttp.open ('GET', url, true);
				window.nextHeartBeat = setTimeout (function() { window.xmlhttp.send(null) }, 10000);
			   }
			}
		  };
		}
		var url = location.href+'?username='+IOrders.xi.username+'&ts='+new Date().format('YmdHis');
		window.xmlhttp.open ('GET', url, true);
		window.xmlhttp.send(null) ;
	},
	
	onXiNoServerButtonTap: function(options) {
		IOrders.xi.noServer = true;
		localStorage.setItem('realServer', false);
	},

	onXiYesServerButtonTap: function(options) {
		IOrders.xi.noServer = false;
		localStorage.setItem('realServer', true);
	},

	onEnableLogButtonTap: function(options) {
		DEBUG = true;
		localStorage.setItem('DEBUG', true);
	},

	onDisableLogButtonTap: function(options) {
		DEBUG = false;
		localStorage.setItem('DEBUG', false);
	},

	onNewDesignButtonTap: function(options) {
		IOrders.newDesign = true;
		localStorage.setItem('newDesign', true);
	},

	onOldDesignButtonTap: function(options) {
		IOrders.newDesign = false;
		localStorage.setItem('newDesign', false);
	},

	onListSelectionChange: function(options) {
		
		var navView = options.list.up('navigatorview');
		
		if(navView) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', view: navView}));
		}
		
	},

	statusChange: function (options) {
		
		var btn = options.btn,
			bar = btn.up('segmentedbutton'),
			view = bar.up('navigatorview'),
			rec = view.form.getRecord(),
			field = view.form.getFields(bar.name)
		;
		field.setValue( btn.name );
		rec.set( bar.name, btn.name );
		rec.save();
		
		view.fireEvent ('saved', rec);

		rec.fields.getByKey('processing') && this.controlButtonsVisibilities(view, !view.editing && rec.get('processing') != 'draft');
	},

	controlButtonsVisibilities: function(view, hide) {

		var topBar = view.getDockedComponent('top'),
			delBtn = topBar.getComponent('Delete'),
			editBtn = topBar.getComponent('SaveEdit')
		;
	
		delBtn && delBtn[hide ? 'hide' : 'show']();
	
		editBtn && editBtn[hide ? 'hide' : 'show']();
	}
});