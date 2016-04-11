Ext.define('Metric.view.dashboard.widget.chart.Pie', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.piechart',	
	requires: ['Ext.chart.series.Pie'],
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
			series, legend, theme;
		if (settings) {			
			series = this.buildSeriesFromSettings(settings);
			legend = this.buildLegend(settings);
			theme = settings.theme || 'Base';
			Ext.apply(this, {			
				title: settings.chartTitle || false,
				titleLocation: settings.titleLocation || 'top',
				titleFont: settings.titleFont || 'bold 12px Helvetica, sans-serif',
				titlePadding: settings.titlePadding || 5,
				titleMargin: settings.titleMargin || 0,
				theme: theme,
				shadow: false,
				legend: legend,
				series: series
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
	buildSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			dataColumns = this.getDataColumns(),			
			categoryField = settings.categoryColumn,
			valueLabels = settings.valueLabels || false,
			rotation = 0,
			i = 0,
			seriesCfg = {},
			series = [],
			legendTitles = [],
			fieldIndex;
				
		this.store.each(function(record) {
			legendTitles.push(record.get(categoryField));
		});
		
		Ext.apply(seriesCfg, {
			type: 'pie',
			field: dataColumns,
			showInLegend: true,
			tips: {
				trackMouse: true,
				bodyPadding:'10 10 10 10',
				padding: '10',
				renderer: function(storeItem, item) {
					var total = 0;
					storeItem.stores[0].each(function(rec) {
						total += rec.get(dataColumns[0]);
					});
					this.setTitle(storeItem.get(categoryField));
					this.update(Math.round(storeItem.get(dataColumns[0]) / total * 100) + '%');
				}
			},
			highlight: {
				segment: {
					margin: 20
				}
			},
			title: legendTitles,
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
					field: categoryField,
					display: 'rotate',
					contrast: true,
					font: '12px Arial',
					renderer: function (v, label, storeItem, item) {
						return v;
					}
				}
			});
		}
		series.push(seriesCfg);
		
		return series;
	}
});