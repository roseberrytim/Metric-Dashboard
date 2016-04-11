Ext.define('Ext.ux.chart.axis.Frequency', {
    extend: 'Ext.ux.chart.axis.Histogram',
	type: 'Frequency',
    
    alias: 'axis.frequency',

	stepY : 10,
	minY: 0,
	maxY: 100,
	autoScale: true,
	showGridLine: false,	
	
	drawAxis: function (init) {
		this.calculateBins();
		var me = this,
			x = me.x,
            y = me.y,
			dashSize = me.dashSize,			
            length = me.length,						
			position = me.position,
			dashDirection = (position == 'left' || position == 'top' ? -1 : 1),
            dashLength = dashSize * dashDirection,
			chart = me.chart,
			bbox = chart.chartBBox,
			CHART_Y_SCALE_STEP = 20,
			min = 0,			
			inflections = [],
			i = 0,
			path, currentY, currentX, v, szstep, max, yinterval;
		
		max = Math.floor(Math.max.apply(null, this.frequencyData));
		
		if (this.autoScale) {
			max += 5;
			max = max - max % 5;
		} else {
			min = this.minY;
			max = this.maxY;
		}
		
		if (max < this.stepY) {
			max = this.stepY;
		}
			
		this.maxY = max;
		
		if (this.stepY > 0) {
			yinterval = this.stepY;
			szstep = Math.floor((max - min) / yinterval);
		} else {
			if (max < 10) {
				szstep = max
			} else {
				szstep = CHART_Y_SCALE_STEP;
			}	
			if (szstep === 0) {
				szstep = CHART_Y_SCALE_STEP;
			}
			yinterval = (max - min) / szstep;
		}
		
		me.labels = [];
		
		currentX = Math.floor(x);
		path = ["M", currentX + 0.5, y, "l", 0, -length];		
		for (i; i <= szstep;i++) {
			var v = min + yinterval * i;
						
            currentY = y - ((v - min) * length) / (max - min);
            path.push("M", currentX, Math.floor(currentY) + 0.5, "l", dashLength * 2, 0);
            inflections.push([ currentX, Math.floor(currentY) ]);
			me.labels.push(v);
		}
		
		if (!me.axis) {
            me.axis = me.chart.surface.add(Ext.apply({
                type: 'path',
                path: path
            }, me.axisStyle));
        }
        me.axis.setAttributes({
            path: path
        }, true);
		me.inflections = inflections;
        if (!init && me.grid) {
            me.drawGrid();
        }
        me.axisBBox = me.axis.getBBox();
        me.drawLabel();
	}	
});
