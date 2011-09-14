Ext.regModel('Table', {
	idProperty: 'name',
	fields: [
		{name: 'name', type: 'string'}
	],
	associations: [
		{type: 'hasMany', model: 'Column', primaryKey: 'name', foreignKey: 'column_name', name: 'columns'},
	]
});

Ext.regModel('Column', {
	idProperty: 'name',
	fields: [
		{name: 'name', type: 'string'},
		{name: 'type', type: 'string'},
		{name: 'label', type: 'string'},
		{name: 'table_name', type: 'string'},
		{name: 'formField', type: 'boolean'},
		{name: 'parent', type: 'string'},
		{name: 'child', type: 'string'}
	],
	associations: [
		{type: 'belongsTo', model: 'Table', primaryKey: 'name', foreignKey: 'table_name', name: 'columns'}
	]
});

Ext.regModel('Label', {
	fields: [
		{name: 'id', type: 'string'},
		{name: 'labelSingle', type: 'string'},
		{name: 'labelMultiple', type: 'string'}
	]
});