var DepList = Ext.extend(Ext.List, {

	scroll: false,
	disableSelection: true,
	itemTpl: getItemTpl('Dep'),
	objectRecord: undefined,
	modelForDeps: undefined,
	depFilter: undefined,
	editing: undefined,
	

	initComponent: function() {

		this.initStore();
		DepList.superclass.initComponent.apply(this, arguments);
	},

	initStore: function() {

		this.store = new Ext.data.Store({model: 'Dep'});
		this.store.loadData(this.getDepData());
	},

	getDepData: function() {

		var tableStore = Ext.getStore('tables'),
			objectRecord = this.objectRecord,
			modelForDeps = this.modelForDeps,
			depFilter = this.depFilter,
			editing = this.editing,
			tableForDeps = tableStore.getById(modelForDeps),
			depStore = tableForDeps.deps()
		;

		var depListStore = this.store;
		var data = [];
		depStore.each(function(dep) {
	
			if(dep.get('table_id') != objectRecord.modelName) {
				var depTable = tableStore.getById(dep.get('table_id'));
	
				var depRec = Ext.ModelMgr.create({
					name: depTable.get('nameSet'),
					table_id: depTable.get('id'),
					extendable: depTable.get('extendable'),
					contains: dep.get('contains'),
					editing: editing
				}, 'Dep');
	
				var filters = depFilter ? [depFilter] : [];
	
				loadDepData(depRec, depTable, filters, 
					function(operation, aggResults, aggDepResult) {
						operation.depRec.set('aggregates', aggDepResult);
	
						var count = aggResults.cnt;
						if(count > 0) {
							operation.depRec.set('count', count);
						} else if (!depRec.get('extendable')) {
							depListStore.remove(operation.depRec);
						}
					}
				);
	
				data.push(depRec);
			}
		});
		return data;
	},

	reloadList: function(config) {

		Ext.apply(this, config);
		this.store.loadData(this.getDepData(), false);
	}
});
Ext.reg('deplist', DepList);