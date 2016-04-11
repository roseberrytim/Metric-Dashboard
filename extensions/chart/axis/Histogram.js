Ext.define('Ext.ux.chart.axis.Histogram', {
    extend: 'Ext.chart.axis.Axis',
	alternateClassName: 'Ext.chart.HistogramAxis',

    type: 'Histogram',
    alias: 'axis.histogram',
	position: 'bottom',
   	constrain: false,
	
	autoScale: true,
	show3SigmaLine: false,
    binSize: null,
	
	binWidth: null,
	frequencyData: [],
	binMesh: [],
	stdDeviation: null,
	mean: null,
	binFirst: null,
	binLast: null,
	minX: NaN,
	maxX: NaN,	
	
	minunit: function (val) {
        if (val == 0) {
            return {
				minunit: 1,
				value: 1
			};
		}
        var temp = val;
        var minunit;

        if (Math.abs(temp) >= 1) {
            minunit = 0;
            while (true) {
                temp /= 10;
                if (Math.floor(temp) == 0) {
                    temp = val;
                    for (var i = 1; i <= minunit; i++) {
                        temp /= 10;
                    }
                    temp = Math.floor(temp) + 0.5;
					for (var i = 1; i <= minunit; i++) {
                        temp *= 10;
                    }
                    return {
                        minunit: minunit,
                        value: temp
                    };
                } else {
                    minunit++;
                }
            }
        } else {
            minunit = 1;
            while (true) {
                //temp *= 10;                   
				if (Math.floor(temp) == 0) {
                    temp = val;
                    for (var i = 1; i <= minunit; i++) {
                        temp *= 10;
                    }
                    temp = Math.floor(temp) + 0.5;					
                    for (var i = 1; i <= minunit; i++) {
                        temp /= 10;
                    }
                    return {
                        minunit: minunit,
                        value: temp
                    };
                } else {
				   minunit++;
                }
            }
        }
    },
	stddev: function (data, mean) {
        if (!(data instanceof Array) || data.length < 1)
            throw new Error('Data should be instance of Array and have one or more than elements.');

        if (!mean) {
            mean = this.mean(data);
        }
        var variance = Ext.Array.sum(Ext.Array.map(data, function (v) {
            return Math.pow(v - mean, 2);
        })) / data.length;

        return Math.sqrt(variance);
    },
	initiateBins: function () {			
			//this.binSize = null,
			this.binWidth = null,
			this.frequencyData = [];
			this.binMesh = [];
			this.binFirst = null;
			this.binLast = null;
			//this.minX = NaN;
			//this.maxX = NaN;
	},
	calculateBins: function () {
		this.initiateBins();
		var me = this,
            chart = me.chart,
            store = chart.getChartStore(),
            data = store.data.items,
            series = chart.series.items,
            position = me.position,
            axes,
            seriesClasses = Ext.chart.series,
            aggregations = [],
            min = Infinity, max = -Infinity,
            mesh, i, ln, ln2, j, k, dataLength = data.length,
            countedFields = {},
            allFields = {},
            excludable = true,
			calcData = [],
            fields, fieldMap, record, field, value, range;

        fields = me.fields;
        for (j = 0, ln = fields.length; j < ln; j++) {
            allFields[fields[j]] = true;
        }
		
        for (i = 0; i < dataLength; i++) {
            record = data[i];
            for (field in allFields) {
                value = record.get(field);
                if (me.type == 'Time' && typeof value == "string") {
                    value = Date.parse(value);
                }
                if (isNaN(value)) {
                    continue;
                }
                if (value === undefined) {
                    value = 0;
                }
                if (allFields[field]) {
                   calcData.push(value)
                }
            }
        }
		
		min = Ext.Array.min(calcData);
		max = Ext.Array.max(calcData);
		
		range = max - min;
		if (range == 0) {
			me.binWidth = 1;
			me.binSize = me.binSize || 5;
			me.binFirst = Math.floor(min) - 2;
			me.binLast = Math.floor(min) + 3;
		} else {
			if (me.binSize === null) {
				var bin = Math.ceil(Math.sqrt(calcData.length));			
				bin = Math.max(1, bin);
				bin = Math.min(20, bin);
				me.binSize = bin;
			}
			me.binWidth = (range / me.binSize) + 0.5;
			me.binFirst = min;
			me.binLast = me.binFirst + (me.binWidth * me.binSize)
			while (me.binLast - me.max <= 0.00000000000001) {
				me.binLast += me.binWidth;
				me.binSize += 1;
			}
		}
		/*
		//var o = me.minunit(range / me.binSize);
		//me.binWidth = o.value;
		//var minunit = o.minunit;
		
        if (range == 0) {
			me.binSize = 5;
			me.binFirst = Math.floor(min) - 2;
			me.binLast = Math.floor(min) + 3;
		} else {
			
			var temp = min;
			
			if (Math.abs(me.binWidth) >= 1) {
				for(var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				//temp = Math.floor(temp) - 0.5;
				temp = Math.floor(temp);
				for (var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				me.binFirst = temp;
			} else {
				for (var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				//temp = Math.floor(temp) - 0.5;
				temp = Math.floor(temp);
				for (var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				me.binFirst = temp;
				
			}
			
			me.binLast = me.binFirst + me.binWidth * me.binSize;
			while (me.binLast - me.max <= 0.00000000000001) {
				me.binLast += me.binWidth;
				me.binSize += 1;
			}
		}
		*/
		for (var i = 0;i <= me.binSize;i++) {
			me.frequencyData.push(0);
			mesh = me.binFirst + me.binWidth * i
			me.binMesh.push((Math.floor(mesh) == mesh ? mesh : mesh.toFixed(2)));
		}
		
		var sum = 0, idx, dv, sv;
		
		for (var i = 0;i < calcData.length;i++) {
			dv = calcData[i];
			sum += dv;
			
			if (dv === me.binFirst) {
				idx = 0;
			} else {
				idx = Math.min(Math.floor(Math.floor((dv - me.binFirst) / me.binWidth)), me.binSize); 
			}
			
			me.frequencyData[idx]++;
		}
		me.minimum = me.binMesh[0];
		me.maximum = me.binMesh[me.binMesh.length - 1];
				
		if (range !== 0) {
			while (me.frequencyData.length > 0) {
				if (me.frequencyData[0] !== 0)
					break;
				me.frequencyData.shift();
				me.binFirst += me.binWidth;
				me.binMesh.shift();
				me.binLast -= me.binWidth;
				me.binSize -= 1;
			}
		}
		
		if (this.mean === null) {
			this.mean = sum / calcData.length;
		}
		
		if (this.stdDeviation === null) {
			this.stdDeviation = this.stddev(calcData, this.mean);
		}
		
		// Set labels
		me.labels = me.binMesh;
	},
	applyData: function() {
        this.callParent();
        var from = this.minX,
			to = this.maxX;
		return {
			from: from,
			to: to
		}
    },
	
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
			binMesh = me.binMesh,
			stepCount = binMesh.length,
			inflections = [],
			tick = 0,
			path, currentY, currentX, v, min, max, xpos, ypos;
		
		if (me.autoScale) {
			min = me.binMesh[0];
			max = me.binMesh[me.binMesh.length - 1];
			var vs = [min, max];

			if (me.show3SigmaLine) {
				vs.push(me.mean - me.stdDeviation * 3);
				vs.push(me.mean + me.stdDeviation * 3);
			}
			
			min = Math.min.apply(null, vs);
			max = Math.max.apply(null, vs);			
		} else {
			min = this.minX;
			max = this.maxX;
		}
		
		this.minX = min;
		this.maxX = max;

		currentY = Math.floor(y);
		
		path = ["M", x, currentY + 0.5, "l", length, 0];		
		for (tick = 0; tick < stepCount; tick++) {
			currentX = x + (binMesh[tick] - min) * length / (max - min);
			path.push("M", Math.floor(currentX) + 0.5, currentY, "l", 0, dashLength * 2 + 1);

			inflections.push([ Math.floor(currentX), currentY ]);
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
