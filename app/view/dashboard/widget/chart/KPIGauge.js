Ext.define('Metric.view.dashboard.widget.chart.KPIGauge', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.kpigaugechart',
	requires: ['Ext.ux.chart.series.KPIGauge', 'Ext.ux.chart.axis.KPIGauge'],
	initComponent: function () {
		var settings = this.getWidgetSettings(),
			axes, series, custom;
		if (settings) {			
			custom = this.buildAxesSeriesFromSettings(settings);
			axes = custom[0];
			series = custom[1];
			
			Ext.apply(this, {
				title: 'KPI Gauge Chart',
				legend: false,
				axes: axes,
				series: series
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
			ranges = settings.ranges || [],
			majorTickSteps = settings.majorSteps || 10,
			margin = settings.margin || 10,
			donut = settings.donut || 30,
			fontColor = settings.fontColor || '#333',
			font = settings.font || '12px Heveltica, sans-serif',
			needleWidth = settings.needleWidth || 5,
			pivotColor = settings.pivotColor || '#222',
			pivotRadius = settings.pivotRadius || 5,
			opacity = settings.opacity || 0
			seriesCfg = {},
			axes = [],
			series = [];

		// Gauge
		axes.push({
			type: 'kpigauge',
			position: 'gauge',
			minimum: axisMinimum,
			maximum: axisMaximum,
			steps: majorTickSteps,
			margin: margin,
			label: {
				fill: fontColor,
				font: font
			}
		});
				
		Ext.apply(seriesCfg, {
			type: 'kpigauge',
            field: dataColumn,
         	needle: {
				width: needleWidth,
				pivotFill: pivotColor,
				pivotRadius: pivotRadius
			},
			donut: donut,
			ranges: ranges
		});
		series.push(seriesCfg);
		
		return [axes, series];
	}
});