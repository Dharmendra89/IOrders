Ext.ns('Ext.ux');

Ext.Interaction.prototype.controller = 'Main';

Ext.List.prototype.listeners = {
	itemtap: function(list, idx, item, e) {
		Ext.dispatch({
			action: 'onListItemTap',
			list: list,
			idx: idx,
			item: item,
			event: e
		});
	}
};

/**
 * Scope указывает на панель, в которой лежит кнопка
 */
Ext.Button.prototype.handler = function(btn, e) {
	Ext.dispatch({
		action: 'onButtonTap',
		view: this,
		btn: btn,
		event: e
	});
};

Ext.form.Select.prototype.onMaskTap = function() {
    if (this.disabled || this.disablePicker) {
        return;
    }
    this.showComponent();
};