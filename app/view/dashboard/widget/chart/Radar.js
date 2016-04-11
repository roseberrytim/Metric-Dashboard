Ext.define('Metric.view.dashboard.widget.chart.Radar', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.radarchart',	
	requires: ['Ext.chart.axis.Radial', 'Ext.chart.series.Radar'],
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
		var position = settings.legendPosition || 'left',
			visible = !settings.legendVisible ? false : true;
		return Ext.apply({}, {
			visible: visible,
			position: position
		});
	},
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			numericFields = this.getDataColumns(),
			nl = numericFields.length,
			categoryField = settings.categoryColumn,
			valueLabels = settings.valueLabels || false,
			axisMaximum = settings.axisMaximum || NaN,
			majorTickSteps = settings.majorSteps || false,
			i = 0,
			axes = [],
			series = [],
			seriesCfg, fieldIndex;
				
		// Radar
		axes.push({
			type: 'Radial',
			position: 'radial',
			maximum: axisMaximum,
			steps: majorTickSteps,
			label: {				
				display: valueLabels
			}
		});
		for (i; i < nl; i++) {
			seriesCfg = Ext.apply({}, {
				type: 'radar',
				xField: categoryField,
				yField: numericFields[i],
				showInLegend: true,
				showMarkers: true,
				tips: {
					trackMouse: true,
					bodyPadding:'10 10 10 10',
					padding: '10',
					renderer: function(storeItem, item) {
						var title = storeItem.get(item.series.xField);
						this.setTitle(title);
						this.update(item.series.title + ': ' + storeItem.get(item.series.yField));
					}
				},
				markerConfig: {
					radius: 5,
					size: 5
				},
				style: {
					'stroke-width': 2,
					fill: 'none'
				},
				title: headers.get(numericFields[i]),
				listeners: {
					scope: this,
					'itemmouseup': function(item) {
					  this.fireEvent('chartseriesclick', item, this);
					}
				}
			});
			series.push(seriesCfg)
		}
		return [axes, series];
	}
});