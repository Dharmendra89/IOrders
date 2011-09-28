Ext.ns('Ext.ux');

Ext.override(Ext.Interaction, {
	controller: 'Main'
});

Ext.override(Ext.List, {
	listeners: {
		itemtap: function(list, idx, item, e) {
			Ext.dispatch({
				action: 'onListItemTap',
				list: list,
				idx: idx,
				item: item,
				event: e
			});
		}
	}
});

/**
 * Scope указывает на панель, в которой лежит кнопка
 */
Ext.override(Ext.Button, {
	handler: function(btn, e) {
		Ext.dispatch({
			action: 'onButtonTap',
			view: this,
			btn: btn,
			event: e
		});
	}
});

Ext.override(Ext.form.Select, {
	onMaskTap: function() {
		if (this.disabled || this.disablePicker) {
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

		if (this.constrain(value) === this.minValue) {
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
		if (!this.rendered) {
			this.render();
		}

		this.el.appendTo(this.list.getTargetEl());
		if (!this.autoPaging) {
			this.el.removeCls('x-loading');
		}
		this.el.addCls('x-hidden-display');
		this.loading = false;
	},
	onScrollEnd: function(scroller, pos) {
		if (pos.y >= Math.abs(scroller.offsetBoundary.top)) {
			this.loading = true;
			this.list.store.nextPage();
			this.el.removeCls('x-hidden-display');
		}
	}
});