Ext.define('Metric.view.dashboard.widget.chart.Scatter', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractChart',
	alias: 'widget.scatterchart',	
	requires: ['Ext.chart.series.Scatter'],
	initComponent: function () {
		var settings = this.getWidgetSettings(),
			axes = [{
				type: 'Numeric',
				position: 'bottom',
				fields: ['Data1', 'Data2', 'Data3', 'Data4'],
				title: '',
				grid: true,
				minimum: 0
			}, {
				type: 'Numeric',
				position: 'left',
				title: 'Scatter Chart',
				fields: ['Data1', 'Data2', 'Data3', 'Data4'],
				grid: true,
				minimum: 0
			}],
			series =  [{
				type : 'scatter',
				axis : 'left',
				xField : 'Data1',
				yField : 'Data2',
				title  : 'Series 1',
				highlight: true,
				tips: {
					trackMouse: true,
					bodyPadding:'15',
					padding: '5',
					renderer: function(storeItem, item) {
						this.setTitle(item.series.title)	
						this.update('X: '+storeItem.get('Data1') + '<br>' + 'Y: ' + storeItem.get('Data2')) ;
					}
				}
			}, {
				type : 'scatter',
				axis : 'left',
				xField : 'Data3',
				yField : 'Data4',
				title  : 'Series 2',
				highlight: true,
				tips: {
					trackMouse: true,
					bodyPadding:'15',
					padding: '5',
					renderer: function(storeItem, item) {
						this.setTitle(item.series.title)	
						this.update('X: '+storeItem.get('Data3') + '<br>' + 'Y: ' + storeItem.get('Data4')) ;
					}
				}
			}],
			lines, ranges;
		if (settings) {
			// store should now be the new dynamic instance from Widget Controller generateChartBoxChart() method
			var custom = this.buildAxesSeriesFromSettings(settings);
			axes = custom[0];
			series = custom[1];
			lines = settings.lines;
			ranges = settings.ranges;
		}
		
		Ext.apply(this, {
			title: 'Scatter Chart',
			legend: false,
			axes: axes,
			series: series,
			plugins: [{
				ptype: 'thresholdlinerange',
				lines: lines || [],
				ranges: ranges || []
			}]
		});
		this.callParent(arguments);
	},
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			numericFields = this.getDataColumns,
			nl = numericFields.length,
			categoryField = settings.categoryColumn,
			valueLabels = settings.valueLabels || false,
			categoryLabelOrientation = settings.labelOrientation || 'horizontal',
			rotation = 0,
			i = 0,
			seriesCfg = {},
			axes = [],
			series = [],
			legendTitles = [],
			fieldIndex;
		
		if (categoryLabelOrientation !== 'horizontal') {
			rotation = 90;
		}
	
		// Numeric
		axes.push({
			type: 'Numeric',
			position: 'left',
			fields: numericFields,
			title: '',
			grid: true,
			minimum: 0
		});
		// Category
		axes.push({
			type: 'Category',
			position: 'bottom',
			fields: [categoryField],
			title: 'Column Chart',
			label: {
				rotate: {
					degrees: rotation
				}
			}
		});
		
		for (i; i < nl; i++) {
			legendTitles.push(headers.get(numericFields[i]));
		}
		
		Ext.apply(seriesCfg, {
			type: 'column',
			axis: 'left',
			highlight: true,
			style: {
				opacity: 0.85
			},
			tips: {
				trackMouse: true,
				bodyPadding:'10 10 10 10',
				padding: '10',
				renderer: function(storeItem, item) {
					var title = headers.get(item.yField);
					this.setTitle(item.value[0])
					this.update(title + ': ' + item.value[1]);
				}
			},
			xField: categoryField,
			yField: numericFields,
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
					display: 'outside',
					field: numericFields,
					renderer: Ext.util.Format.numberRenderer('0'),
					orientation: 'horizontal',
					color: '#333',
					'text-anchor': 'middle'
				}
			});
		}
		series.push(seriesCfg);
		
		return [axes, series];
	}
});