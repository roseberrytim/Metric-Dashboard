Ext.define('Metric.view.dashboard.widget.chart.AbstractChart', {
	extend: 'Ext.ux.chart.TitleChart',
	alias: 'widget.abstractchartwidget',
	requires: ['Ext.ux.chart.Chart', 'Ext.chart.axis.Axis', 'Ext.chart.axis.Numeric', 'Ext.chart.axis.Category', 'Ext.chart.axis.Gauge', 'Ext.ux.chart.ThresholdLineRange'],
	config: {
		widgetSettings: false,
		headers: false,
		dataColumns: [],
		tempBBox: false		
	},	
	insetPadding: 35,
	flex: 1,
	animate: false,
	shadow: Ext.isIE ? false : true,
	store: '',
	axes: [],
	series: [],	
	constructor: function(config) {
		this.initConfig(config);
		this.callParent(arguments);
    }
});