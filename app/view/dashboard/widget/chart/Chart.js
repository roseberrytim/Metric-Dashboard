Ext.define('Metric.view.dashboard.widget.chart.Chart', {
	extend: 'Metric.view.dashboard.widget.dynamicdata.DynamicData',
	alias: 'widget.chartbox',
	requires: [				
		'Metric.view.dashboard.widget.chart.Area', 'Metric.view.dashboard.widget.chart.Bar',
		'Metric.view.dashboard.widget.chart.Column', 'Metric.view.dashboard.widget.chart.Line',
		'Metric.view.dashboard.widget.chart.Pie', 'Metric.view.dashboard.widget.chart.Gauge', 
		'Metric.view.dashboard.widget.chart.Histogram', 'Metric.view.dashboard.widget.chart.Radar'
	],
	type: 'chartbox',
	initComponent: function () {
		Ext.apply(this, {			
			items: []
		});	
		this.callParent();
	},
	scaleWidget: function (factor) {
		// Configs to update BBox coordinates to allow Series tooltips to work in a zoomed mode.
		this.callParent(arguments);
		var zoomCfg = this.getZoomCfg(),
			chart = this.down('chart'),
			surface = chart.surface,			
			chartBBox = chart.chartBBox,
			tempBBox = chart.getTempBBox(),			
			spriteBBox, chartBBox, height, width, x, y, series, i;
		
		if (!tempBBox) {			
			tempBBox = Ext.apply({}, {
				chart: chartBBox,
				sprite: surface.getBBox
			});
			chart.setTempBBox(tempBBox);
		}
		
		if (zoomCfg) {			
			var getSpriteBBox = function (sprite) {
				var transform = sprite.bbox.transform,
					th = Math.round(transform.height * factor),
					tw = Math.round(transform.width * factor),
					tx = Math.round(transform.x * factor),
					ty = Math.round(transform.y * factor);
				return Ext.apply({}, {
					width: tw,
					height: th,
					x: tx,
					y: ty
				});
			}
			width = Math.round(tempBBox.chart.width * factor);
			height = Math.round(tempBBox.chart.height * factor);
			x = Math.round(tempBBox.chart.x * factor);
			y = Math.round(tempBBox.chart.y * factor); 
			
			chart.chartBBox = Ext.apply({}, {
				width: width,
				height: height,
				x: x,
				y: y
			});
			
			Ext.Function.interceptAfter(surface, 'getBBox', getSpriteBBox);
		} else {
			chart.chartBBox = tempBBox.chart;			
			surface.getBBox = tempBBox.sprite;
		}
		series = chart.series.items;
		for (i = 0; i < series.length; i++) {
			series[i].setBBox(true);
		}
	}
});