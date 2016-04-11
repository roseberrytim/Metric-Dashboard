Ext.define('Metric.view.navigation.AbstractListView', {
	extend: 'Ext.view.View',
	cls: 'selector-listview',
	autoScroll: true,
	store: '',
	selModel: {
		enableKeyNav: false
	},
	tpl:[],
	overItemCls: 'selector-button-over',
	overItemCls: 'selector-button-over',
	selectedItemCls: 'selector-button-pressed',
	itemSelector: 'div.selector-button',			
	emptyText: 'No Records Available'
});