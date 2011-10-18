Ext.ns('Ext.ux.form');

Ext.override(Ext.Interaction, {controller: 'Main'});

var ExpandableGroupedList = Ext.extend(Ext.List, {
	grouped: true,
	cls: 'expandable',
	onRender: function() {
		ExpandableGroupedList.superclass.onRender.apply(this, arguments);
		this.mon(this.el, 'tap', this.onListHeaderTap, this, {
			delegate: '.x-list-header'
		});
		this.el.addCls ('expandable');
	},
	onListHeaderTap: function(e, t) {
		
		var headerEl = Ext.get(t),
		    el = headerEl.next(),
			list = this
		;
		
		if (headerEl.hasCls('x-list-header-swap')) {
			el = el.down('.x-group-' + headerEl.dom.innerText.toLowerCase() + ' .x-list-group-items');
		}
		
		var dv = 30 * el.dom.children.length;
		
		if (dv < 150) {
			dv = 150;
		} else if (dv > 500) {
			dv = 500;
		}
		
		el.toggleCls('expanded');
		
		Ext.defer ( function() {
			list.updateOffsets();
			list.scroller.updateBoundary();
		},50);
		
		if (el.hasCls ('expanded')) {
			
			Ext.defer ( function() {
				list.scroller.scrollTo({
					y: headerEl.getOffsetsTo( list.scrollEl )[1]
				}, 300 );
				
				Ext.defer ( function() { list.disableSwipe = false; }, 400);
			}, 100);
		}

	}
});
Ext.reg('expandableGroupedList', ExpandableGroupedList);

Ext.override(Ext.List, {
	listeners: {
/*		selectionchange: function(selModel, selections) {
			Ext.dispatch({action: 'onListSelectionChange', list: this, selModel: selModel, selections: selections});
		},*/
		itemtap: function(list, idx, item, e) {
			Ext.dispatch({action: 'onListItemTap', list: list, idx: idx, item: item, event: e});
		},
		disclose: function(rec, item, idx, e) {
			Ext.dispatch({action: 'onListItemDisclosure', list: this, idx: idx, item: item, event: e});
		}
	},


	onUpdate : function(store, record) {
		this.itemRefresh = true;
        Ext.List.superclass.onUpdate.apply(this, arguments);
		this.itemRefresh = false;
    },

    bufferRender : function(records, index){
        var div = document.createElement('div');
		
		if (this.grouped && this.itemRefresh && records.length == 1) {
			this.listItemTpl.overwrite (div, Ext.List.superclass.collectData.call(this, records, index))
		}
		else {
	        this.tpl.overwrite(div, this.collectData(records, index));
		}
		
        return Ext.query(this.itemSelector, div);
    }

});

/**
 * Scope указывает на панель, в которой лежит кнопка
 */
Ext.override(Ext.Button, {
	handler: function(btn, e) {

		Ext.dispatch({action: 'onButtonTap', view: this, btn: btn, event: e});
	}
});

Ext.override(Ext.form.Select, {

	onListSelect: function(selModel, selected) {
        if (selected) {
            this.setValue(selected.get(this.valueField));
            this.fireEvent('change', this, this.getValue());
        }
        
        this.listPanel.hide({
            type: 'fade',
            out: true,
            scope: this
        });
        
        Ext.dispatch({
        	action: 'onSelectFieldValueChange',
        	field: this,
        	selected: selected,
        	filter: true
        });
    },

	onRender: function(){
        Ext.form.Select.superclass.onRender.apply(this, arguments);
        
        var name = this.hiddenName;
        if (name) {
            this.hiddenField = this.el.insertSibling({
                name: name,
                tag: 'input',
                type: 'hidden'
            }, 'after');
        }
        
        this.onFieldLabelTap && this.labelEl.on('tap', function(evt, el, o) {
        	Ext.dispatch({
        		action: 'onFieldLabelTap',
        		field: this
        	});
        }, this);
    },

    onMaskTap: function() {
        if (this.onFieldInputTap && this.disabled) {
        	Ext.dispatch({
        		action: 'onFieldInputTap',
        		field: this
        	});
            return;
        }
        
        this.showComponent();
    }
});

var PagingSelectField = Ext.extend(Ext.form.Select, {
	
	getListPanel: function() {
        if (!this.listPanel) {
            this.listPanel = new Ext.Panel({
                floating         : true,
                stopMaskTapEvent : false,
                hideOnMaskTap    : true,
                cls              : 'x-select-overlay',
                scroll           : 'vertical',
                items: {
                    xtype: 'list',
                    store: this.store,
                    itemId: 'list',
                    plugins: new Ext.plugins.ListPagingPlugin({autoPaging: true}),
                    scroll: false,
                    itemTpl : [
                        '<span class="x-list-label">{' + this.displayField + '}</span>',
                        '<span class="x-list-selected"></span>'
                    ],
                    listeners: {
                        select : this.onListSelect,
                        scope  : this
                    }
                }
            });
        }

        return this.listPanel;
    }
});
Ext.reg('pagingselectfield', PagingSelectField);

var FilterField = Ext.extend(PagingSelectField, {
	onRender: function() {

		FilterField.superclass.onRender.apply(this, arguments);
		this.removeFilterBtn = this.labelEl.insertHtml('beforeBegin', '<div class="x-button remove-filter">X</div>', true);
		this.removeFilterBtn.on('tap', function(evt, el, o) {
        	Ext.dispatch({
        		action: 'onSelectFieldValueChange',
        		field: this,
        		removeFilter: true
        	});
        }, this);
	}
});
Ext.reg('filterfield', FilterField);

Ext.override(Ext.form.Toggle, {
	setValue: function(value) {
	
		value = (value === true || value === 1 ? 1 : 0);
		Ext.form.Toggle.superclass.setValue.call(this, value, this.animationDuration);
	
		var fieldEl = this.fieldEl;
	
		if(this.constrain(value) === this.minValue) {
			fieldEl.addCls(this.minValueCls);
			fieldEl.removeCls(this.maxValueCls);
		} else {
			fieldEl.addCls(this.maxValueCls);
			fieldEl.removeCls(this.minValueCls);
		}
	}
});


Ext.override(Ext.plugins.ListPagingPlugin, {
	
	onListUpdate: function() {
		
		var store = this.list.store,
			scroller = this.list.ownerCt.scroller;
		
		if (scroller)
			scroller.noMorePages = (!store.proxy.lastRowCount || store.proxy.lastRowCount < store.pageSize);
		
		
		if( !this.rendered) {
			this.render();
		}
		
		this.loading = false;
		
		if (scroller.noMorePages)
			this.el.remove();
		else {
			this.el.dom && this.el.appendTo(this.list.getTargetEl());
			this.el.hide();
			if(!this.autoPaging) {
				this.el.removeCls('x-loading');
			}
		}
		
		
	},
	
	onScrollEnd: function(scroller, pos) {
		if( !(scroller.noMorePages || this.loading) && scroller.containerBox.height >= Math.abs(pos.y + scroller.offsetBoundary.top)/2) {
			this.loading = true;
			this.list.store.nextPage();
			this.el.show();
		}
	}
	
});

Ext.override(Ext.form.FormPanel, {
	getElConfig: function() {
		return Ext.apply(Ext.form.FormPanel.superclass.getElConfig.call(this), {
			tag: 'div'
		});
	},
	listeners: {
		beforesubmit: function(form, values, options) {
			
			if(form.ownSubmit) {
				Ext.dispatch({
					action: 'onBeforeSubmitForm',
					form: form,
					values: values,
					opt: options
				});
				return false;
			}
			return true;
		}
	}
});


Ext.MessageBox.YESNO[1].text = 'Да';
Ext.MessageBox.YESNO[0].text = 'Нет';
Ext.Picker.prototype.doneButton = 'OK';
Ext.Picker.prototype.cancelButton = 'Отмена';