Ext.plugins.ListPagingPlugin = Ext.extend(Ext.util.Observable, {

	init: function(list) {
		var me = this;

		me.list = list;

		list.onBeforeLoad = Ext.util.Functions.createInterceptor(list.onBeforeLoad, me.onBeforeLoad, me);

		me.mon(list, 'update', me.onListUpdate, me);

		me.mon(list, 'render', function() {
				me.mon(list.getTargetEl().getScrollParent()
				, 'scrollend', me.onScrollEnd, me);
		},me);

	},

	onBeforeLoad : function() {
		if (this.loading && this.list.store.getCount() > 0) {
			this.list.loadMask.disable();
			return false;
		}

		return true;
	},

	onListUpdate : function() {
		
		var store = this.list.store,
			scroller = this.list.ownerCt.scroller;

		if (scroller)
			scroller.noMorePages = (!store.proxy.lastRowCount || store.proxy.lastRowCount < store.pageSize);

		this.loading = false;
		
	},

	onScrollEnd: function(scroller, pos) {
		if( !(scroller.noMorePages || this.loading) &&
			//scroller.containerBox.height >= Math.abs(pos.y + scroller.offsetBoundary.top)/2
			scroller.containerBox.height/4 + pos.y >= Math.abs(scroller.offsetBoundary.top)) {
			this.loading = true;
			this.list.store.nextPage();
		}
	}

});