Ext.define('Metric.view.dashboard.widget.chart.Column', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractCartesian',
	alias: 'widget.columnchart',	
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			numericFields = this.getDataColumns(),
			nl = numericFields.length,
			categoryField = settings.categoryColumn,
			valueLabels = settings.valueLabels || false,
			categoryLabelOrientation = settings.labelOrientation || 'horizontal',
			stacked = settings.stacked || false,
			axisMinimum = settings.axisMinimum || 0,
			axisMaximum = settings.axisMaximum || NaN,
			adjustAxisMaximum = settings.adjustMaximum || false,
			adjustAxisMinimum = settings.adjustMinimum || false,
			constrain = settings.constrain || false,
			majorTickSteps = settings.majorSteps || false,
			xtitle = settings.xtitle || '',
			ytitle = settings.ytitle || '',
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
			title: ytitle,
			grid: true,
			minimum: axisMinimum,
			maximum: axisMaximum,
			adjustMaximumByMajorUnit: adjustAxisMaximum,
			adjustMinimumByMajorUnit: adjustAxisMinimum,
			majorTickSteps: majorTickSteps,
			constrain: constrain
		});
		// Category
		axes.push({
			type: 'Category',
			position: 'bottom',
			fields: [categoryField],
			title: xtitle,
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
			stacked: stacked,
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