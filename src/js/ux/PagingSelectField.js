var PagingSelectField = Ext.extend(Ext.form.Select, {

	getListPanel: function() {
/*	    if (!this.listPanel) {
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
        */
		var panel = PagingSelectField.superclass.getListPanel.apply(this, arguments),
			list = panel.getComponent('list'),
			table = Ext.getStore('tables').getById(this.store.model.prototype.modelName),
			titleColumns = table.getTitleColumns()
		;

		list.itemTpl = ['<div class="x-list-label">{' + this.displayField + '}</div>'];
		titleColumns.each(function(col) {list.itemTpl.push('<div>{' + col.get('name') + '}</div>');});
		list.itemTpl.push('<span class="x-list-selected"></span>');

		list.tpl = '<tpl for="."><div class="x-list-item ' + list.itemCls + '"><div class="x-list-item-body">' + list.itemTpl.join('') + '</div>';
		list.tpl += '</div></tpl>';
		list.tpl = new Ext.XTemplate(list.tpl);

		list.initPlugin(new Ext.plugins.ListPagingPlugin({autoPaging: true}));

		return panel;
	}
});
Ext.reg('pagingselectfield', PagingSelectField);