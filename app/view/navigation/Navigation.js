Ext.define('Metric.view.navigation.Navigation', {
	extend: 'Ext.container.Container',
	alias: 'widget.navigationcontainer',
	requires: ['Metric.view.navigation.Header', 'Metric.view.navigation.Selector', 'Metric.view.navigation.Instructions'],	
	layout: 'border',
	initComponent: function () {
		Ext.apply(this, {
			items: [{
				xtype: 'navigationheader',				
				region: 'north'
			}, {
				xtype: 'navigationselector',
				region: 'west',
				padding: '2 5 5 5',
				style: 'background-color: #f3f3f3;',
				width: 250
			}, {
				xtype: 'panel',
				itemId: 'mainContainer',
				region: 'center',
				layout: 'fit',
				items: [{
					xtype: 'instructions'
				}]
			}]
		});
		this.callParent();
	}
});