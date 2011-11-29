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