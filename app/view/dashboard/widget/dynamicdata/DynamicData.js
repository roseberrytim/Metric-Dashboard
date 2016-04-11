Ext.define('Metric.view.dashboard.widget.dynamicdata.DynamicData', {
	extend: 'Metric.view.dashboard.widget.WidgetBox',
	alias: 'widget.dynamicdatabox',	
	config: {
		loaded: false
	},
	type: 'dynamicdatabox',
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		Ext.apply(this, {			
			items: []
		});	
		this.callParent();
	}
});