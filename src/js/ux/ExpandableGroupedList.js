var ExpandableGroupedList = Ext.extend(Ext.List, {
	
	grouped: true,
	
	initComponent: function() {
		var scroll = this.scroll;
		ExpandableGroupedList.superclass.initComponent.apply(this, arguments);
		if (typeof scroll == 'object')
			this.scroll = scroll;
	},
	
	onRender: function() {
		ExpandableGroupedList.superclass.onRender.apply(this, arguments);
		this.mon(this.el, 'tap', this.onListHeaderTap, this, {
			delegate: '.x-list-header'
		});
		this.el.addCls ('expandable');
	},
	
	onListHeaderTap: function(e, t) {
		
		var tapedHeaderEl = Ext.get(t),
			tapedGroupEl = this.getGroupEl(tapedHeaderEl),
			list = this;
		;
		
		var expanded = tapedGroupEl.hasCls('expanded');
		
		this.setGroupExpanded(tapedGroupEl, !expanded, tapedHeaderEl);
		
		if(!expanded) {
			var headerElArray = list.getExpandedElHeaders();
			headerElArray.removeByKey(tapedHeaderEl.id);
			list.setGroupExpanded(headerElArray, false);
		}
	},
	
	getExpandedElHeaders: function() {
		
		var list = this;
		
		var expanded = new Ext.util.MixedCollection();
		var headerElList = list.getEl().query('.x-list-header');

		Ext.each(headerElList, function(hEl) {
			var el = list.getGroupEl(Ext.get(hEl));
			el && el.hasCls('expanded') && expanded.add(Ext.get(hEl));
		});
		
		return expanded;
	},
	
	getGroupEl: function(headerEl) {

		var el = headerEl.next();
		if (headerEl.hasCls('x-list-header-swap')) {
			return el.down('.x-group-' + headerEl.dom.innerText.toLowerCase() + ' .x-list-group-items');
		} else {
			return el;
		}
	},
	
	setGroupExpanded: function(el, expanded, headerEl) {
		
		var list = this;
		
		if(Ext.isObject(el) && el instanceof Ext.util.MixedCollection) {

			el.each(function(hEl) {
				var e = list.getGroupEl(hEl);
				list.setGroupExpanded(e, expanded, hEl);
			});

		} else {

			var dv = 30 * el.dom.children.length,
				list = this
			;
			
			if (dv < 150) {
				dv = 150;
			} else if (dv > 500) {
				dv = 500;
			}
			
			el[expanded ? 'addCls' : 'removeCls']('expanded');
			
			Ext.defer( function() {
				list.updateOffsets();
				list.scroller && list.scroller.updateBoundary();
			}, 50);
			
			if(expanded) {
				
				Ext.defer ( function() {
					list.scroller && list.scroller.scrollTo({
						y: headerEl.getOffsetsTo( list.scrollEl )[1]
					}, 300);
					
					Ext.defer ( function() { list.disableSwipe = false; }, 400);
				}, 100);
			}
		}
	}
});
Ext.reg('expandableGroupedList', ExpandableGroupedList);