Ext.regController('Main', {
	
	onButtonTap: function(options) {
		
		var view = options.view,
			redirectTo = this;
		
		if ( view.isXType('navigatorview') ) {
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
		if(navView) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('SelectField', field.id), view: navView}));
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
			Ext.Msg.alert(o.command, 'Success')
		},
		failure: function(r,o) {
			Ext.Msg.alert(o.command, 'Failed: '+r.responseText)
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
		))
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
				
				composeMainMenu(metadata.tables);
				
				localStorage.setItem('metadata', Ext.encode(metadata));
				
				if ( metadata.version != IOrders.dbeng.db.version )
					Ext.Msg.alert(
						'Необходим перезапуск',
						'Текущая версия: '+IOrders.dbeng.db.version+ ' '+
						'Полуена версия: '+metadata.version,
						function () { location.replace(location.href) }
					);
				else
					Ext.Msg.alert('Метаданные в норме', 'Версия: ' + metadata.version);
				
			}},
			this.prefsCb
		))
	},

	onDbRebuildButtonTap: function(options) {
		
		IOrders.dbeng.clearListeners();
		
		IOrders.dbeng.startDatabase (
			Ext.decode(localStorage.getItem('metadata')),
			true
		)
	},

	onReloadButtonTap: function(options) {
		location.replace(location.href)
	}


});