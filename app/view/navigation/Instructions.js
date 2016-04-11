Ext.define('Metric.view.navigation.Instructions', {
	extend: 'Ext.container.Container',
	alias: 'widget.instructions',
	layout: 'fit',
	initComponent: function () {
		Ext.apply(this, {
			html: ''
		});
		
		this.callParent();
	}
});