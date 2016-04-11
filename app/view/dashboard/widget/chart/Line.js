Ext.define('Metric.view.dashboard.widget.chart.Line', {
	extend: 'Metric.view.dashboard.widget.chart.AbstractCartesian',
	alias: 'widget.linechart',		
	buildAxesSeriesFromSettings: function (settings) {
		var headers = this.getHeaders(),
			numericFields = this.getDataColumns(),
			nl = numericFields.length,
			categoryField = settings.categoryColumn,
			valueLabels = settings.valueLabels || false,
			categoryLabelOrientation = settings.labelOrientation || 'horizontal',
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
			axes = [],
			series = [],
			seriesCfg, fieldIndex;
		
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
			seriesCfg = Ext.apply({}, {
				type: 'line',
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
						var title = storeItem.get(item.series.xField);
						this.setTitle(title);
						this.update(item.series.title + ': ' + item.value[1]);
					}
				},
				xField: categoryField,
				yField: numericFields[i],
				title: headers.get(numericFields[i]),
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
						field: numericFields[i],
						renderer: Ext.util.Format.numberRenderer('0'),
						orientation: 'horizontal',
						color: '#333',
						'text-anchor': 'middle'
					}
				});
			}
			series.push(seriesCfg);
		}
		return [axes, series];
	}
});