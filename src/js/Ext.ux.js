Ext.ns('Ext.ux.form');

Ext.override(Ext.Interaction, {controller: 'Main'});

Ext.override(Ext.List, {
	listeners: {
		itemtap: function(list, idx, item, e) {
			Ext.dispatch({action: 'onListItemTap', list: list, idx: idx, item: item, event: e});
		}
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
        	controller: 'Main',
        	action: 'onSelectFieldValueChange',
        	field: this
        });
    },

    onMaskTap: function() {

		if(this.disabled || this.disablePicker) {
			return;
		}

		this.showComponent();
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
        
        this.labelEl.on('tap', function(evt, el, o) {
        	Ext.dispatch({
        		controller: 'Main',
        		action: 'onFieldLabelTap',
        		field: this
        	});
        }, this);
    },

    onMaskTap: function() {
        if (this.disabled) {
        	Ext.dispatch({
        		controller: 'Main',
        		action: 'onFieldInputTap',
        		field: this
        	});
            return;
        }
        
        this.showComponent();
    }
});

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
		
		var store = this.list.store;
		
		if( !this.rendered) {
			this.render();
		}
		
		if (!(store.pageSize && store.data.items.length % store.pageSize))
			this.el.appendTo(this.list.getTargetEl());
		else
			this.el.remove();
		
		if(!this.autoPaging) {
			this.el.removeCls('x-loading');
		}
		
		this.el.hide();
		this.loading = false;
	},
	
	onScrollEnd: function(scroller, pos) {
		if(pos.y >= Math.abs(scroller.offsetBoundary.top)) {
			this.loading = true;
			this.list.store.nextPage();
			this.el.show();
		}
	}
	
});