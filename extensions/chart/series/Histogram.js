Ext.define('Ext.ux.chart.series.Histogram', {
	extend: 'Ext.chart.series.Column',
    type: 'histogram',
    alias: 'series.histogram',
    column: false,
	
	showMeanLine: false,
	show3SigmaLine: false,
	showNormalLine: false,
	autoScale: true,	
    binSize: null,
	binWidth: null,
	frequencyData: [],
	binMesh: [],
	stdDeviation: null,
	mean: null,
	binFirst: null,
	binLast: null,
	mean: NaN,
	minX: NaN,
	maxX: NaN,
	minY: NaN,
	maxY: NaN,
	
	constructor: function(config) {
        this.callParent(arguments);
		var surface = this.chart.surface;
        this.deviationGroup = surface.getGroup(this.seriesId + '-deviation');
    },
	dnormal: function (x, mu, sigma) {
		var ONEBYS2PI = 0.3989422804014327;
		if(sigma <= 0)
			return null;
		
		var temp = (x - mu) * (x - mu) / (sigma * sigma);
		return ONEBYS2PI * Math.exp(-0.5 * temp);
	},
	minunit: function (val) {
        if (val == 0)
            return 1;

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
                temp *= 10;
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
	calculateBins: function () {
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
            i, ln, ln2, j, k, dataLength = data.length,
            countedFields = {},
            allFields = {},
            excludable = true,
			calcData = [],
            fields, fieldMap, record, field, value, range;

        fields = me.fields || me.xField;
        for (j = 0, ln = fields.length; j < ln; j++) {
            allFields[fields[j]] = true;
        }
		/*
        for (i = 0, ln = series.length; i < ln; i++) {
            if (series[i].seriesIsHidden) {
                continue;
            }
            if (!series[i].getAxesForXAndYFields) {
                continue;
            }
            axes = series[i].getAxesForXAndYFields();
            if (axes.xAxis && axes.xAxis !== position && axes.yAxis && axes.yAxis !== position) {
                // The series doesn't use this axis.
                continue;
            }

            fields = Ext.Array.from(series[i].xField);
 
            if (me.fields.length) {
                for (j = 0, ln2 = fields.length; j < ln2; j++) {
                    if (allFields[fields[j]]) {
                        break;
                    }
                }
                if (j == ln2) {
                    // Not matching fields, skipping this series.
                    continue;
                }
            }
			
			if (!fields || fields.length == 0) {
				fields = me.fields;
			}
			for (j = 0; j < fields.length; j++) {
				if (excludable && series[i].__excludes && series[i].__excludes[j]) {
					continue;
				}
				allFields[fields[j]] = countedFields[fields[j]] = true;
			}
            
        }
		*/
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
		if (me.binSize === null) {
			var bin = Math.floor(Math.sqrt(calcData.length));
			bin = Math.max(5, bin);
			bin = Math.min(20, bin);
			me.binSize = bin;
		}
		
		var o = me.minunit(range / me.binSize);
		me.binWidth = o.value;
		var minunit = o.minunit;	
		
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
				temp = Math.floor(temp) - 0.5;
				for (var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				me.binFirst = temp;
			} else {
				for (var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				temp = Math.floor(temp) - 0.5;
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
		for (var i = 0;i <= me.binSize;i++) {
			me.frequencyData.push(0);
			me.binMesh.push(me.binFirst + me.binWidth * i);
		}
		
		var sum = 0, idx, dv, sv;
		
		for (var i = 0;i < calcData.length;i++) {
			dv = calcData[i];
			sum += dv;
			
			if (dv === me.binFirst) {
				idx = 0;
			} else {
				idx = Math.floor(Math.floor((dv - me.binFirst) / me.binWidth)); 
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
	
	getAxesForXAndYFields: function() {
        return {
            xAxis: 'left',
            yAxis: 'bottom'
        };
    },
	
	drawSeries: function() {
        //this.calculateBins();
		var me = this,
            group = me.group,
			deviationGroup = me.deviationGroup,
            chart = me.chart,
            surface = chart.surface,
            axes = chart.axes,
			chartBBox = chart.chartBBox,            
			items = me.items = [],
			i = 0,
			bl, bbox, sprite, barAttr, yl, xp1, xp2, hp, yp, path, lineAttr, xpos, ypos, l3sigma, u3sigma, sigmaLines, dnormal, pos, cnt, min, max, line;
		
		me.setBBox(true);
        bbox = me.bbox;
		
		me.unHighlightItem();
        me.cleanHighlights();
		
		axes.each(function (axis) {
			if (axis.position === 'left') {
				me.minY = axis.minY;
				me.maxY = axis.maxY;
				me.lineLength = axis.length;
			}
			if (axis.position === 'bottom') {
				me.minX = axis.minX;
				me.maxX = axis.maxX;
				me.mean = axis.mean;
				me.stdDeviation = axis.stdDeviation;
				me.frequencyData = axis.frequencyData;
				me.binMesh = axis.binMesh;
			}
		}, me);	
		
		bl = me.binMesh.length;
    	for (i; i < bl - 1; i++) {
			
			yl = me.frequencyData[i];
			if (yl === 0) {
				continue;
			}
			xp1 = bbox.x + ((me.binMesh[i] - me.minX) * bbox.width) / (me.maxX - me.minX); // x pixels
			xp2 = bbox.x + ((me.binMesh[i + 1] - me.minX) * bbox.width) / (me.maxX - me.minX);
			hp = (yl - me.minY) * bbox.height / (me.maxY - me.minY); // height pixels
			yp = bbox.y + bbox.height - hp;
			
			barAttr = Ext.apply({}, {
				type: 'rect',
				width: xp2 - xp1,
				height: hp,
				x: xp1,
				y: yp,
				fill: '#94ae0a',
				'stroke-width': '0'
			});
			
			if (hp > 0) {				
				sprite = group.get(i);
				if (!sprite) {					
					sprite = surface.add(Ext.apply({}, {
						id: i,
						type: 'rect',
						group: group
					}, barAttr));
				}
				items.push({
                    series: me,
                    bin: me.binMesh[i],
                    storeItem: me.binMesh,
                    value: yl,
                    attr: barAttr,
                    point: [barAttr.x + barAttr.width / 2, barAttr.y],
					sprite: sprite
                });
				sprite.setAttributes(barAttr, true);
			}
		}
		if (me.showMeanLine) {
			xpos = bbox.x + (((me.mean - me.minX) * bbox.width) / (me.maxX - me.minX));
			
			if (xpos > bbox.x - 20 && xpos < (bbox.x + bbox.width) + 20) {
				path = ["M", xpos, bbox.y, "l", 0, me.lineLength];
				lineAttr = Ext.apply({}, {
					path: path,
					width: 1,
					height: me.lineLength,
					x: xpos - 5,
					y: bbox.y
				});
				
				sprite = deviationGroup.get('meanLine');
				if (!sprite) {
					sprite = surface.add(Ext.apply({}, {
						id: 'meanLine',
						type: 'path',
						group: deviationGroup,
						path: path,
						stroke: 'green',
						'stroke-width': 2
					}));
				}
				
				items.push({
					series: me,
					sprite: sprite,
					storeItem: me.binMesh,
					value: me.mean.toFixed(2),
					attr: lineAttr,
					point: [xpos, lineAttr.y]
				});
				
				sprite.setAttributes({
					path: path
				}, true);
			}
		}
		if (me.show3SigmaLine && me.stdDeviation !== 0) {
			l3sigma = me.mean - me.stdDeviation * 3;
			u3sigma = me.mean + me.stdDeviation * 3;
			sigmaLines = {
				l3sigma: l3sigma,
				u3sigma: u3sigma
			}
			for (line in sigmaLines) {
				xpos = bbox.x + (((sigmaLines[line] - me.minX) * bbox.width) / (me.maxX - me.minX));
				
				if (xpos > bbox.x - 20 && xpos < (bbox.x + bbox.width) + 20) {
					path = ["M", xpos, bbox.y, "l", 0, me.lineLength];
					lineAttr = Ext.apply({}, {
						path: path,
						width: 1,
						height: me.lineLength,
						x: xpos - 5,
						y: bbox.y
					});
					sprite = deviationGroup.get(line);
					if (!sprite) {
						sprite = surface.add(Ext.apply({}, {
							id: line,
							type: 'path',
							group: deviationGroup,
							path: path,
							stroke: 'blue',
							'stroke-width': 2
						}));
					}
					items.push({
						series: me,
						sprite: sprite,
						storeItem: me.binMesh,
						value: sigmaLines[line].toFixed(2),
						attr: lineAttr,
						point: [xpos, lineAttr.y]
					});
					
					sprite.setAttributes({
						path: path
					}, true);
				}
			}
		}
		if (me.showNormalLine) {
			pos = [];
			cnt = 0;
			min = bbox.x;
			max = bbox.x + bbox.width;			
			for (i = min; i <= max; i++) {
				xpos = ((i - min) * (me.maxX - me.minX) / bbox.width + me.minX);
				yp = me.dnormal(xpos, me.mean, me.stdDeviation);
				dnormal = me.dnormal(me.mean, me.mean, me.stdDeviation);
				ypos = (bbox.y + bbox.height) - (yp * bbox.height / dnormal);
				
				if (ypos > (bbox.y + bbox.height)) {
					continue;
				}
				pos[cnt++] = i + ',' + Math.floor(ypos);
			}
			
			pos[cnt++] = max + ',' + (bbox.y + bbox.height);
			pos[cnt++] = (bbox.x) + ',' + (bbox.y + bbox.height);
			
			path = 'M' + pos.join('L');
			
			sprite = deviationGroup.get('normalLine');
			lineAttr = Ext.apply({}, {
				path: path,
				width: 1,
				height: bbox.height,
				x: bbox.x,
				y: bbox.y
			});
			if (!sprite) {
				sprite = surface.add(Ext.apply({}, {
					id: 'normalLine',
					type: 'path',
					group: deviationGroup,
					path: path,
					fill: '#0f0',
					opacity: 0.2
				}));
			}
			items.push({
				series: me,
				sprite: sprite,
				storeItem: pos,
				value: '',
				attr: lineAttr,
				point: [bbox.x, bbox.y]
			});
			sprite.setAttributes({
				path: path
			}, true);
		}
		me.renderLabels();		
    },
	onPlaceLabel: function(label, storeItem, item, i, display, animate, index) {
        var me = this,
            column = me.column,
            chart = me.chart,
            chartBBox = chart.chartBBox,
            resizing = chart.resizing,
            yValue = item.value,
            attr = item.attr,
            config = me.label,
            stacked = me.stacked,
            stackedDisplay = config.stackedDisplay,
            rotate = (config.orientation == 'vertical'),
            field = [].concat(config.field),
            format = config.renderer,
			barWidth = attr.width,
            text, size, width, height,
            
            insideStart = 'insideStart',
            insideEnd = 'insideEnd',
            outside = 'outside',
            over = 'over',
            under = 'under',
            labelMarginX = 4,   // leave space around the labels (important when saving chart as image)
            labelMarginY = 2,
            
            x, y, finalAttr;

        if (display == insideStart || display == insideEnd || display == outside) {
            label.setAttributes({
                // Reset the style in case the label is being reused (for instance, if a series is excluded)
                // and do it before calling the renderer function.
                style: undefined
            });
            text = item.value;
            label.setAttributes({
                // Set the text onto the label.
                text: text
            });
            size = me.getLabelSize(text, label.attr.style);
            width = size.width;
            height = size.height;
           
			if (!width || !height || (stacked && (attr.height < height))) {
				label.hide(true);
				return;
			}
			
			// Align horizontally the label in the middle of the column
			x = attr.x + (rotate ? barWidth/2 : (barWidth - width)/2);
			
			// If the label is to be displayed outside, make sure there is room for it, otherwise display it inside.
			if (display == outside) {
				var free = (yValue >= 0 ? (attr.y - chartBBox.y) : (chartBBox.y + chartBBox.height - attr.y - attr.height));
				if (free < height + labelMarginY) {
					display = insideEnd;
				}
			}

			// If the label is to be displayed inside a non-stacked chart, make sure it is 
			// not taller than the box, otherwise move it outside.
			if (!stacked && (display != outside)) {
				if (height + labelMarginY > attr.height) {
					display = outside;
				}
			}

			// Place the label vertically depending on its config and on whether the value
			// it represents is positive (above the X-axis) or negative (below the X-axis)
			if (!y) {
				y = attr.y;
				if (yValue >= 0) {
					switch (display) {
						case insideStart: y += attr.height + (rotate ? -labelMarginY : -height/2);  break;
						case insideEnd:   y += (rotate ? height + labelMarginX : height/2);         break;
						case outside:     y += (rotate ? -labelMarginY : -height/2);                break;
					}
				} else {
					switch (display) {
						case insideStart: y += (rotate ? height + labelMarginY : height/2);                             break;
						case insideEnd:   y += (rotate ? attr.height - labelMarginY : attr.height - height/2);          break;
						case outside:     y += (rotate ? attr.height + height + labelMarginY : attr.height + height/2); break;
					}
				}
			}
           
        } else if (display == over || display == under) {
            
        }
        
        if (x == undefined || y == undefined) {
            // bad configuration: x/y are not set
            label.hide(true);
            return;
        }

        label.isOutside = (display == outside);
        label.setAttributes({
            text: text
        });

        //set position
        finalAttr = {
            x: x,
            y: y
        };
        //rotate
        if (rotate) {
            finalAttr.rotate = {
                x: x,
                y: y,
                degrees: 270
            };
        }
        //check for resizing
        if (animate && resizing) {
            if (column) {
                x = attr.x + attr.width / 2;
                y = zero;
            } else {
                x = zero;
                y = attr.y + attr.height / 2;
            }
            label.setAttributes({
                x: x,
                y: y
            }, true);
            if (rotate) {
                label.setAttributes({
                    rotate: {
                        x: x,
                        y: y,
                        degrees: 270
                    }
                }, true);
            }
        }
        //handle animation
        if (animate) {
            me.onAnimate(label, { to: finalAttr });
        }
        else {
            label.setAttributes(Ext.apply(finalAttr, {
                hidden: false
            }), true);
        }
    }
});