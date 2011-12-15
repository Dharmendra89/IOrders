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
	
	onIndex: function(record, target, item) {

		var headerEl = ExpandableGroupedList.superclass.onIndex.apply(this, arguments).down('.x-list-header'),
			groupEl = this.getGroupEl(headerEl)
		;

		var headerElArray = this.getExpandedElHeaders();
		headerElArray.removeByKey(headerEl.id);
		this.setGroupExpanded(headerElArray, false);

		this.setGroupExpanded(groupEl, true, headerEl);
	},

	onListHeaderTap: function(e, t) {

		var tapedHeaderEl = Ext.get(t),
			tapedGroupEl = this.getGroupEl(tapedHeaderEl),
			expanded = tapedGroupEl.hasCls('expanded')
		;

		this.setGroupExpanded(tapedGroupEl, !expanded, tapedHeaderEl);

		if(!expanded) {
			var headerElArray = this.getExpandedElHeaders();
			headerElArray.removeByKey(tapedHeaderEl.id);
			this.setGroupExpanded(headerElArray, false);
		}
	},

	getExpandedElHeaders: function() {

		var expanded = new Ext.util.MixedCollection(),
			headerElList = this.getEl().query('.x-list-header')
		;

		Ext.each(headerElList, function(hEl) {
			var hElem = Ext.get(hEl),
				el = this.getGroupEl(hElem)
			;
			el && el.hasCls('expanded') && expanded.add(hElem);
		}, this);

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

		if(Ext.isObject(el) && el instanceof Ext.util.MixedCollection) {

			el.each(function(hEl) {
				var e = this.getGroupEl(hEl);
				this.setGroupExpanded(e, expanded, hEl);
			}, this);

		} else {

			var dv = 30 * el.dom.children.length;

			if (dv < 150) {
				dv = 150;
			} else if (dv > 500) {
				dv = 500;
			}

			el[expanded ? 'addCls' : 'removeCls']('expanded');

			Ext.defer(function() {
				this.updateOffsets();
				this.scroller && this.scroller.updateBoundary();
			}, 50, this);

			if(expanded) {

				Ext.defer(function() {
					this.scroller && this.scroller.scrollTo({
						y: headerEl.getOffsetsTo(this.scrollEl)[1]
					}, 400, this);

					Ext.defer(function() {this.disableSwipe = false;}, 300, this);
				}, 100, this);
			}
		}
	},

	getHeaderEl: function(headerEl, dir) {

		var nextGroup = headerEl.parent()[dir]();
		return nextGroup ? nextGroup.first() : null;
	}
});
Ext.reg('expandableGroupedList', ExpandableGroupedList);