var HorizontalIndexBar = Ext.extend(Ext.DataView, {

	tpl: new Ext.XTemplate(
			'<div class="x-hindex-body">',
				'<tpl for=".">',
						'<div class="x-hindex-item x-button">',
							'{value}',
						'</div>',
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

		this.updateScroller();
	},

	initComponent : function() {

		this.addEvents('index');
		this.store = new Ext.data.Store({model: 'IndexBarModel'});

		HorizontalIndexBar.superclass.initComponent.call(this);

		this.list.mon(this, {
			index: this.list.onIndex,
			scope: this.list
		});

		this.on('show', this.updateScroller, this);
	},

	updateScroller: function() {

		this.scroller.updateBoundary();
		this.scroller.scrollTo({y: 0});
	},

	onItemTap: function(item , idx, e) {

		this.fireEvent('index', this.getRecord(item), item, idx);

		return HorizontalIndexBar.superclass.onItemTap.apply(this, arguments);
	}
});