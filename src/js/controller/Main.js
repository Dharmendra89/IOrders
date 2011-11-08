Ext.regController('Main', {
	
	onButtonTap: function(options) {
		
		var view = options.view,
			redirectTo = this;
		
		if ( view.isXType('navigatorview') || view.isXType('encashmentview') || view.isXType('uncashmentview')) {
			redirectTo = 'Navigator';
		} else if ( view.isXType('saleorderview') ) {
			redirectTo = 'SaleOrder';
		};
		
		Ext.dispatch(Ext.apply(options, {
			controller: redirectTo,
			action: options.action.replace('Button', options.btn.name + 'Button')
		}));
		
	},

	onLoginButtonTap: function(options) {

		options.btn.up('form').submit();
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
								formRec.save();
								Ext.dispatch(Ext.apply(options, {
									controller: 'SaleOrder',
									saleOrder: navView.objectRecord
								}));
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
	    	listEl = list.getEl()
		;
	
		if(navView) {
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
				
				if ( metadata.version != IOrders.dbeng.db.version )
					Ext.Msg.confirm(
						'Требуется пересоздать БД',
						'Текущая версия: '+IOrders.dbeng.db.version + '<br/>' +
						'Новая версия: '+metadata.version + '<br/><br/>' +
						'Стереть все данные и загрузить то, что лежит на сервере?',
						function (yn) {
							if (yn == 'yes'){
								localStorage.setItem('metadata', Ext.encode(metadata));				
								location.replace(location.href);
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
						location.replace(location.href);
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
		})
	},

	onReloadButtonTap: function(options) {
		location.replace(location.href);
	},

	onXiNoServerButtonTap: function(options) {
		IOrders.xi.noServer = true;
		localStorage.setItem('realServer', false);
	},

	onXiYesServerButtonTap: function(options) {
		IOrders.xi.noServer = false;
		localStorage.setItem('realServer', true);
	},

	onListSelectionChange: function(options) {
		
		var navView = options.list.up('navigatorview');
		
		if(navView) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', view: navView}));
		}
		
	}

});