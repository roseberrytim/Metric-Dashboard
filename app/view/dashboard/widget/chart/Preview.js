Ext.define('Metric.view.dashboard.widget.chart.Preview', {
	extend: 'Ext.window.Window',
	alias: 'widget.preview',
	width: 500,
	height: 500,
	layout: 'fit',
	modal: true,
	autoShow: true,
	config: {
		widgetSettings: false,
		type: 'chartbox',
		loaded: false
	},
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		Ext.apply(this, {
			buttons:[{
				text: 'Cancel',
				scope: this,
				handler: function() {
					this.close();
				}
			}]
		});
		this.callParent(arguments);
	}
});