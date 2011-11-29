var FilterField = Ext.extend(PagingSelectField, {
	onRender: function() {

		FilterField.superclass.onRender.apply(this, arguments);
		this.removeFilterBtn = this.labelEl.insertHtml('beforeBegin', '<div class="x-button remove-filter">X</div>', true);
		this.mon (this.removeFilterBtn, 'tap', function(evt, el, o) {
			Ext.dispatch({
				action: 'onSelectFieldValueChange',
				field: this,
				removeFilter: true
			});
		}, this);
	}
});
Ext.reg('filterfield', FilterField);