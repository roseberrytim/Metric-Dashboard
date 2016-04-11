Ext.define('Metric.view.dashboard.widget.chart.AbstractCartesian', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',	
	requires: ['Ext.chart.series.Area', 'Ext.chart.series.Bar', 'Ext.chart.series.Column', 'Ext.chart.series.Line'],
	constructor: function (config) {
		config = config || {}
		var settings = config.widgetSettings;
		if (settings) {
			Ext.apply(config, {
				theme: settings.theme || 'Base'
			});
		}		
		this.callParent(arguments);
	},
	initComponent: function () {
		var settings = this.getWidgetSettings(),
			axes, series, legend, lines, ranges, custom;
		if (settings) {			
			custom = this.buildAxesSeriesFromSettings(settings);
			legend = this.buildLegend(settings);			
			axes = custom[0];
			series = custom[1];
			lines = settings.lines;
			ranges = settings.ranges;
			
			Ext.apply(this, {			
				title: settings.chartTitle || false,
				titleLocation: settings.titleLocation || 'top',
				titleFont: settings.titleFont || 'bold 12px Helvetica, sans-serif',
				titlePadding: settings.titlePadding || 5,
				titleMargin: settings.titleMargin || 0,
				axes: axes,
				series: series,				
				legend: legend,
				plugins: [{
					ptype: 'thresholdlinerange',
					lines: lines || [],
					ranges: ranges || []
				}]
			});
		} else {
			this.html = 'Chart Widget is not configured'
		}	
		
		this.callParent(arguments);
	},
	buildLegend: function (settings) {
		var position = settings.legendPosition || 'right',
			visible = !settings.legendVisible ? false : true;
		return Ext.apply({}, {
			visible: visible,
			position: position
		});
	},
	buildAxesSeriesFromSettings: Ext.emptyFn
});