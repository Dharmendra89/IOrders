var HorizontalIndexBar = Ext.extend(Ext.DataView, {

	tpl: new Ext.XTemplate(
			'<div class="x-hindex-body">',
				'<tpl for=".">',
//					'<tpl if="(xindex - 1) % 10 == 0">',
//						'<div class="x-hindex-line">',
//					'</tpl>',
						'<div class="x-hindex-item x-button">',
							'{value}',
						'</div>',
//					'<tpl if="xindex % 10 == 0">',
//						'</div>',
//					'</tpl>',
				'</tpl>',
			'</div>'
	),

	itemSelector:'div.x-hindex-item',
	scroll: 'vertical',

	height: 124,

	loadIndex: function() {

		var store = this.list.store;

		var groups = store.getGroups();

		this.store.removeAll();
		Ext.each(groups, function(group) {

			this.store.add({key: group.name, value: group.name});
		}, this);
	},

	initComponent : function() {

		this.addEvents('index');
		this.store = new Ext.data.Store({model: 'IndexBarModel'});

		HorizontalIndexBar.superclass.initComponent.call(this);

		this.list.mon(this, {
			index: this.list.onIndex,
			scope: this.list
		});
	},
/*
	afterRender: function() {

		HorizontalIndexBar.superclass.afterRender.apply(this, arguments);
		this.mon(this.el, {
			touchstart: this.onTouchStart,
			touchend: this.onTouchEnd,
			scope: this
		});
	},

	onTouchStart: function(e, t) {

		e.stopEvent();
		Ext.get(t).addCls('x-button-pressed');
		e.stopPropagation();
	},

	onTouchEnd: function(e, t) {

		e.stopEvent();
		Ext.get(t).removeCls('x-button-pressed');
	},
*/
	onItemTap: function(item , idx, e) {

		this.fireEvent('index', this.getRecord(item), item, idx);

		return HorizontalIndexBar.superclass.onItemTap.apply(this, arguments);
	}
});