Ext.define('Metric.store.DataDefinitions', {
	extend: 'Ext.data.Store',
	storeId: 'DataDefinitions',
	model: 'Metric.model.DataDefinition',
	autoSync: true,
	autoLoad: true
});