Ext.define('Metric.view.dashboard.widget.chart.Gauge', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.gaugechart',
	initComponent: function () {
		var settings = this.getWidgetSettings(),
			axes, series, custom;
		if (settings) {			
			custom = this.buildAxesSeriesFromSettings(settings);
			axes = custom[0];
			series = custom[1];
			
			Ext.apply(this, {				
				title: settings.chartTitle || false,
				titleLocation: settings.titleLocation || 'top',
				titleFont: settings.titleFont || 'bold 12px Helvetica, sans-serif',
				titlePadding: settings.titlePadding || 5,
				titleMargin: settings.titleMargin || 0,
				legend: false,
				axes: axes,
				series: series,
				style: 'background:transparent;'
			});
		} else {
			this.html = 'Chart Widget is not configured'
		}
		this.callParent(arguments);
	},
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			dataColumn = this.getDataColumns(),
			axisMinimum = settings.axisMinimum || 0,
			axisMaximum = settings.axisMaximum || NaN,
			majorTickSteps = settings.majorSteps || 10,
			margin = settings.margin || 10,
			donut = settings.donut || false,
			needle = settings.needle || false,
			seriesCfg = {},
			axes = [],
			series = [];
		
		
		// Gauge
		axes.push({
			type: 'gauge',
			position: 'gauge',
			minimum: axisMinimum,
			maximum: axisMaximum,
			steps: majorTickSteps,
			margin: margin
		});
				
		Ext.apply(seriesCfg, {
			type: 'gauge',
            field: dataColumn,
            donut: donut,
			needle: needle
		});
		series.push(seriesCfg);
		
		return [axes, series];
	}
});