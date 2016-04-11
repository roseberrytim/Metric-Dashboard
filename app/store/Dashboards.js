Ext.define('Metric.store.Dashboards', {
	extend: 'Ext.data.Store',
	model: 'Metric.model.Dashboard',
	storeId: 'Dashboards',
	autoSync: true,
	autoLoad: true
});