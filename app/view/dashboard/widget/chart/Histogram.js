Ext.define('Metric.view.dashboard.widget.chart.Histogram', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.histogramchart',
	requires: ['Ext.ux.chart.series.Histogram', 'Ext.ux.chart.axis.Histogram', 'Ext.ux.chart.axis.Frequency'],	
	initComponent: function () {
		var settings = this.getWidgetSettings(),
			axes, series, lines, custom;
		if (settings) {		
			custom = this.buildAxesSeriesFromSettings(settings);
			axes = custom[0];
			series = custom[1];
			lines = settings.lines;
			
			Ext.apply(this, {				
				title: settings.chartTitle || false,
				titleLocation: settings.titleLocation || 'top',
				titleFont: settings.titleFont || 'bold 12px Helvetica, sans-serif',
				titlePadding: settings.titlePadding || 5,
				titleMargin: settings.titleMargin || 0,
				axes: axes,
				series: series,
				legend: false,
				plugins: [{
					ptype: 'thresholdlinerange',
					lines: lines || [],
					ranges: []
				}]
			});
		} else {
			this.html = 'Chart Widget is not configured'
		}
		this.callParent(arguments);
	},
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			dataFields = this.getDataColumns(),			
			valueLabels = settings.valueLabels || false,
			stepY = settings.stepY || 10,
			binSize = settings.binSize || null,
			show3SigmaLine = settings.show3SigmaLine || false,
			showNormalLine = settings.showNormalLine || false,
			showMeanLine = settings.showMeanLine || false,			
						
			title = settings.title,
			i = 0,
			seriesCfg = {},
			axes = [],
			series = [],
			fieldIndex;
				
		// Numeric
		axes.push({
			type: 'Frequency',
			position: 'left',
			fields: dataFields,	
			stepY: stepY,
			binSize: binSize,
			grid: true
		});
		// Category
		axes.push({
			type: 'Histogram',
			position: 'bottom',
			fields: dataFields,			
			binSize: binSize,
			show3SigmaLine: show3SigmaLine
		});
				
		Ext.apply(seriesCfg, {
			type: 'histogram',
			axis: 'bottom',			
			//highlight: true,
			show3SigmaLine: show3SigmaLine,
			showNormalLine: showNormalLine,
			showMeanLine: showMeanLine,
			tips: {
				trackMouse: true,
				bodyPadding: '10 10 10 10',
				padding: '10',
				renderer: function(storeItem, item) {
					//this.setTitle('Test')	
					this.update(item.value);
				}
			},
			xField: dataFields,			
			listeners: {
				scope: this,
				'itemmouseup': function(item) {
				  this.fireEvent('chartseriesclick', item, this);
				}
			}
		});
		if (valueLabels) {
			Ext.apply(seriesCfg, {
				label: {
					display: 'insideEnd',
					'text-anchor': 'middle',                    
                    orientation: 'horizontal',
                    fill: '#fff',
                    font: '12px Arial'
                }
			});
		}
		series.push(seriesCfg);
		
		return [axes, series];
	}
});