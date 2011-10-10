Ext.regController('Main', {
	
	onButtonTap: function(options) {
		
		var view = options.view;
		
		if(view.isXType('navigatorview')) {
			Ext.dispatch(Ext.apply(options, {controller: 'Navigator', action: options.action.replace('Button', options.btn.name + 'Button')}));
		} else if(view.isXType('saleorderview')) {
			Ext.dispatch(Ext.apply(options, {controller: 'SaleOrder', action: options.action.replace('Button', options.btn.name + 'Button')}));
		} else {
			Ext.dispatch(Ext.apply(options, {action: options.action.replace('Button', options.btn.name + 'Button')}));
		}
		
	},
	
	onLoginButtonTap: function(options) {

		var btn = options.btn;
		var form = btn.up('form');
		
		var formData = form.getValues();
		var login = formData.login;
		var password = formData.password;

		localStorage.setItem('login', login);
		localStorage.setItem('password', password);

		IOrders.xi = new Ext.data.XmlInterface({
			username: login,
			password: password,
			view: 'iorders',
			noServer: true
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
						composeMainMenu(metadata.tables);
						
						localStorage.setItem('metadata', Ext.encode(metadata));
						
						IOrders.dbeng.startDatabase(metadata);
						
					}
				});
			}
		};

		IOrders.xi.reconnect(IOrders.getMetadata);
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
	}
});