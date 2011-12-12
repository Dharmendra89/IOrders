var HorizontalIndexBar = Ext.extend(Ext.IndexBar, {
	renderTpl : ['<div></div>'],
	tpl: '<tpl for="."><tpl if="(xindex - 1) % 10 == 0"><div class="x-indexbar-body"></tpl>'
		+ '<div class="x-indexbar-item">{value}</div><tpl if="xindex % 10 == 0"></div></tpl></tpl>',
	direction: 'horizontal', alphabet: false,
	loadIndex: function(store) {

		if(store) {

			var groups = store.getGroups();

			this.store.removeAll();
			Ext.each(groups, function(group) {

				this.store.add({key: group.name, value: group.name});
			}, this);
		}
	},
	initComponent : function() {
        // No docking and no sizing of body!
        this.componentLayout = this.getComponentLayout();

        if (!this.store) {
            this.store = new Ext.data.Store({
                model: 'IndexBarModel'
            });
        }

        if (this.alphabet == true) {
            this.ui = this.ui || 'alphabet';
        }

        if (this.direction == 'horizontal') {
            this.horizontal = true;
        }
        else {
            this.vertical = true;
        }

        this.addEvents(
          /**
           * @event index
           * Fires when an item in the index bar display has been tapped
           * @param {Ext.data.Model} record The record tapped on the indexbar
           * @param {HTMLElement} target The node on the indexbar that has been tapped
           * @param {Number} index The index of the record tapped on the indexbar
           */
          'index'
        );

        Ext.apply(this.renderData, {
            componentCls: this.componentCls
        });
        
        Ext.apply(this.renderSelectors, {
            body: '.' + this.componentCls + ' div'
        });
        
        Ext.IndexBar.superclass.initComponent.call(this);
    },
    onTouchMove : function(e) {
        e.stopPropagation();

        var point = Ext.util.Point.fromEvent(e),
            target,
            record,
            pageBox = this.pageBox;

        if (!pageBox) {
            pageBox = this.pageBox = this.el.getPageBox();
        }

        if (this.vertical) {
            if (point.y > pageBox.bottom || point.y < pageBox.top) {
                return;
            }
            target = Ext.Element.fromPoint(pageBox.left + (pageBox.width / 2), point.y);
        }
        else if (this.horizontal) {
            if (point.x > pageBox.right || point.x < pageBox.left) {
                return;
            }
            target = Ext.Element.fromPoint(point.x, point.y);
        }

        if (target) {
            record = this.getRecord(target.dom);
            if (record) {
                this.fireEvent('index', record, target, this.indexOf(target));
            }
        }
    }
});