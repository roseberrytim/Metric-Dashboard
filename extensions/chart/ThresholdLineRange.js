/**
 * @class Ext.ux.chart.ThresholdLineRange
 * @extends Ext.AbstractPlugin
 * Plugin to add ability of displaying Threshold Lines and Color Ranges on Cartesian style charts
 *	
 *	Example usage:
 *	plugins: [Ext.create('Ext.ux.chart.ThresholdLineRange', {
 *		lines: [{
 *			position: 'left',
 *			color: '#000',
 *			value: 30,
 *			width: 3,
 *			label: {
 *				text: 'Goal',
 *				showValue: false
 *			}
 *		}, {
 *			position: 'right',
 *			value: 70,
 *			color: '#ff0000',
 *			width: 3,
 *			label: {
 *				text: 'Threshold 2'
 *			}
 *		}],
 *		ranges: [{
 *			opacity: 0.1,
 *			from: 0,
 *			to: 70,
 *			color: '#FF0000'
 *		}, {
 *			opacity: 0.1,
 *			from: 70,
 *			to: 90,
 *			color: '#FFFF00'
 *		}, {
 *			opacity: 0.1,
 *			from: 90,
 *			to: 100,
 *			color: '#00FF00'
 *		}]
 *	})]
 *
 * @ptype thresholdlinerange
 */
Ext.define('Ext.ux.chart.ThresholdLineRange', {
    /* Begin Definitions */
    extend: 'Ext.AbstractPlugin',
    requires: ['Ext.chart.Chart', 'Ext.chart.series.Cartesian', 'Ext.chart.series.Radar'],
    /* End Definitions */
    alias: 'plugin.thresholdlinerange',
    /**
     * @cfg {Array} lines
     * An array containing threshold line object configurations that will be added to the chart utilizing the first cartesian series boundary information
     *
     * Configurable properties are as follow
     * - 'position' - the axis position that the line will start from (string)
     * - `color` - an rgb or hex color string for the background color of the line. defaults to '#000'
     * - `value` - the axis scale value that the line will appear at (number)
     * - `width` - the width of the stroke (integer). defaults to `1`
     * - `opacity` - the opacity of the line and the fill color (decimal). defaults to `1`
     * - `label` - a config object for defining the parameters for display of the line's label. If no config is defined then system will create a blank label
     *		Configurable properties are as follow
     * 			- `text` - the value to be displayed as the label of the threshold line (string)
     *			- `color` - an rgb or hex color string for the background color of the line. defaults to '#000'
     *			- `font` - the font config to use for the text that is displayed. defaults to `11px Helvetica, sans-serif`
     *			- `showValue` - true or false value to display the value of the threshold line inline with the label text (boolean). defaults to `true`
     *	
     * Example usage:
     *	lines: [{
     *		position: 'left',
     *		color: '#ff0000',
     *		value: 25,
     *		width: 3,
     *		label: {
     *			text: 'Threshold 1',
     *			color: '#000',
     *			font: "11px Helvetica, sans-serif",
     *			showValue: true
     *		}
     *	}, {
     *		position: 'left',
     *		value: 50,
     *		width: 3
     *	}]
     */
    lines: [],
    /**
     * @cfg {Array} ranges
     * An array containing object configurations that will allow you to add color filled regions to the background of the chart based on the first cartesian series boundary information
     *
     * Configurable properties are as follow
     * - `opacity` - the opacity of the line and the fill color (decimal)
     * - `from` - the value	to start the colored region fill (number)
     * - `to` - the value to end the colored region fill(number)
     * - `color` - an rgb or hex color string for the background color of the region.
     * - `lineWidth` - the width of the line stroke that will be used around the range
     * Example usage:
     *	ranges: [{
     *		opacity: 0.1,
     *		from: 0,
     *		to: 70,
     *		color: '#FF0000'
     *	}, {
     *		opacity: 0.1,
     *		from: 70,
     *		to: 90,
     *		color: '#FFFF00'
     *	}, {
     *		opacity: 0.1,
     *		from: 90,
     *		to: 100,
     *		color: '#00FF00'
     *	}]
     */
    ranges: [],
    init: function (chart) {
        var me = this,
            seriesCollection = chart.series,
            firstSeries = seriesCollection.first();
        // Check to see if the series is already instantiated
        if (firstSeries instanceof Ext.chart.series.Series) {
            me.setupSeriesListener(firstSeries);
        } else {
            /*
				Because the series is still in raw config format the only way to gain reference to the series 'afterrender' event is to add
				a listener to replace event of the Ext.util.MixedCollection object that holds all the series configs. When the chart finally
				instantiates the series it will replace the existing key of the Ext.util.MixedCollection with the new class object. Then we 
				can add a 'afterrender' listener to that new Ext.chart.series.Series inherited object.
			*/
            seriesCollection.on({
                // We set this to only run once because we only need to calculate the region boundaries once in order to add line and region to chart surface
                single: true,
                replace: me.onSeriesReplace,
                scope: me
            });
        }
    },
    // @private called when a new series is instantiated into Chart's series collection
    onSeriesReplace: function (key, old, newObj) {
        this.setupSeriesListener(newObj);
    },
    // @private called to setup afterrender event listener on series instance
    setupSeriesListener: function (series) {
        if (series instanceof Ext.chart.series.Cartesian || series instanceof Ext.chart.series.Radar) {
            // Add listener to the series so that we may add our configured plugin to the chart
            series.on({
                // Because the 'afterrender' event of the series doesnt pass any parameters we need to bind the series to our listener
                afterrender: Ext.bind(this.onSeriesAfterRender, this, [series], false),
                scope: this
            });
        }
    },
    /**
     * @private
     * Event handler to calculate the appropriate chart boundaries and initiate the drawing of the Threshold Lines and Ranges
     */
    onSeriesAfterRender: function (series) {
        var me = this,
            chart = series.chart,
            surface = chart.surface,
            lines = me.lines,
            ranges = me.ranges,
			type = series.type,
            path, bounds, line, range, i, ln;
        // Set scope properties for easier access
        me.chart = chart;
        me.surface = surface;
        // Check to see how series calculates bounds.  If series contains 'getBounds()' method then its inherited from Bar type series. If not then its a Line type series
        bounds = series.getBounds ? series.getBounds() : type === 'radar' ? me.getRadarSeriesBounds(series) : me.getLineSeriesBounds(series);
        if (lines) {
            ln = lines.length;
            i = 0;
            // Setup surface groups to hold the new Lines and Labels
            me.thresholdLineGroup = surface.getGroup('thresholdlines');
            me.thresholdLabelGroup = surface.getGroup('thresholdlabels');
            for (i; i < ln; i++) {
                line = lines[i];
                // Calculate the actual Path for the new line
                if (type === 'radar') {
					path = me.calculateRadarLinePath(series, bounds, line);
					me.drawThresholdCircle(path, line, i);
				} else if (type === 'histogram') {
					path = me.calculateHistogramLinePath(bounds, line);
					me.drawThresholdLine(path, line, i);
				} else {
					path = me.calculateCartesianLinePath(bounds, line);
					// Draw the line
					me.drawThresholdLine(path, line, i);
				}
            }
        }
        if (ranges) {
            ln = ranges.length;
            i = 0;
            // Setup sruface groups to hold new Ranges
            me.rangeGroup = surface.getGroup('rangegroup');
            for (i; i < ln; i++) {
                range = ranges[i];
                // Calculate the actual Path for the new Range
                if (type ==='radar') {
					path = me.calculateRadialRangePath(bounds, range);
				} else {
					path = me.calculateRangePath(series.axis, bounds, range);
				}
				// Draw the Range
				me.drawRanges(path, range, i);
            }
        }
    },
    /**
     * Calculates the series boundaries for Line type of series
     * @param {Ext.chart.series.Series} series The instantiated series object that will be used to calcuate the boundaries from.
     *
     * Most of the code here is derivitive of the 'drawSeries()' method of the Ext.chart.series.Line class
     * 
     * @return {Object} return An object containing all the needed boundary and scale information of the Ext.chart.series.Series
     */
    getLineSeriesBounds: function (series) {
        var me = this,
            // Get the basic series dimension box
            bbox = series.bbox,
            storeCount = me.chart.getChartStore().getCount(),
            chartAxes = me.chart.axes,
            // Find out the axes that are bound to the chart
            boundAxes = series.getAxesForXAndYFields(),
            boundXAxis = boundAxes.xAxis,
            boundYAxis = boundAxes.yAxis,
            axis, ends, minX, minY, maxX, maxY;
        // Get the min and max of the X axis
        if (axis = chartAxes.get(boundXAxis)) {
            ends = axis.applyData();
            minX = ends.from;
            maxX = ends.to;
        }
        // Get the min and max of the Y axis
        if (axis = chartAxes.get(boundYAxis)) {
            ends = axis.applyData();
            minY = ends.from;
            maxY = ends.to;
        }
        // Calculate the scale of the X axis
        if (isNaN(minX)) {
            minX = 0;
            xScale = bbox.width / ((storeCount - 1) || 1);
        } else {
            xScale = bbox.width / ((maxX - minX) || (storeCount - 1) || 1);
        }
        // Calculate the scale of the Y axis
        if (isNaN(minY)) {
            minY = 0;
            yScale = bbox.height / ((storeCount - 1) || 1);
        } else {
            yScale = bbox.height / ((maxY - minY) || (storeCount - 1) || 1);
        }
        return {
            bbox: bbox,
            minX: minX,
            minY: minY,
            xScale: xScale,
            yScale: yScale
        }
    },
	/**
     * Calculates the series boundaries for radial type of series
     * @param {Ext.chart.series.Series} series The instantiated series object that will be used to calcuate the boundaries from.
     *
     * Most of the code here is derivitive of the 'drawSeries()' method of the Ext.chart.series.Radar class
     * 
     * @return {Object} return An object containing all the needed boundary and scale information of the Ext.chart.series.Series
     */
	getRadarSeriesBounds: function (series) {
		var me = this,
			chart = me.chart,
			store = chart.getChartStore(),
            data = store.data.items,
			seriesItems = chart.series.items,
			l = store.getCount(),
			maxValue = 0,
			fields = [],
            max = Math.max,
			axis = chart.axes && chart.axes.get(0),
            aggregate = !(axis && axis.maximum),
			d, record, s, sLen, nfields, ser;
			
		maxValue = aggregate? 0 : (axis.maximum || 0);
		if (aggregate) {
            //get all renderer fields
            for (s = 0, sLen = seriesItems.length; s < sLen; s++) {
                ser = seriesItems[s];
                fields.push(ser.yField);
            }
            //get maxValue to interpolate
            for (d = 0; d < l; d++) {
                record = data[d];
                for (i = 0, nfields = fields.length; i < nfields; i++) {
                    maxValue = max(+record.get(fields[i]), maxValue);
                }
            }
        }
		//ensure non-zero value.
        maxValue = maxValue || 1;
		return {
			bbox: series.bbox,
			radius: series.radius,
			centerX: series.centerX,
			centerY: series.centerY,
			maxValue: maxValue
		}
	},
    /**
     * @private
     * Calculates the SVG path string for the Threshold Line for Cartesian series
     * @param {Object} bounds An object that contains all the boundary information for the series
     * @param {Object} line Object contains the user config of the line to be drawn
     * 
     * @return {Object} return An object containing the path string and the start x and y coordinates
     */
    calculateCartesianLinePath: function (bounds, line) {
        var position = line.position,
            value = line.value,
            bbox = bounds.bbox,
            // Check to see if bounds are setup as individual Line series x and y scales or if one scale is defined typically by Bar series types
            xScale = bounds.xScale || bounds.scale || 1,
            yScale = bounds.yScale || bounds.scale || 1,
            // Check to see if min values are setup in the bounds. If not then default them to start at 0
            minX = bounds.minX || 0,
            minY = bounds.minY || 0,
            boxX = bbox.x,
            boxY = bbox.y,
            height = bbox.height,
            width = bbox.width,
            path = [],
            x, y;
        // Calculate the path string based on bounds and scale info
        if (position == 'left') {
            x = boxX + (0 - minX) * xScale;
            y = boxY + height - (value - minY) * yScale;
			if ((y < boxY) || (y > (boxY + height))) {
				path = false;
			} else {			
				path = path.concat(["M", x, y, "l", width, 0]);
			}
        } else if (position == 'right') {
            x = boxX + width + (0 - minX) * xScale;
            y = boxY + height - (value - minY) * yScale;
            if ((y < boxY) || (y > (boxY + height))) {
				path = false;
			} else {			
				path = path.concat(["M", x, y, "l", -width, 0]);
			}
        } else if (position == 'bottom') {
            y = boxY + height + (0 - minX) * yScale;
            x = boxX + (value - minY) * xScale;
			if ((x < boxX) || (x > (boxX + width))) {
				path = false;
			} else {			
			    path = path.concat(["M", x, y, "l", 0, -height]);
			}
        } else if (position == 'top') {
            y = boxY + (0 - minX) * yScale;
            x = boxX + (value - minY) * xScale;
			if ((x < boxX) || (x > (boxX + width))) {
				path = false;
			} else {			
			    path = path.concat(["M", x, y, "l", 0, height]);
			}
        }
        return path ? {path: path, x: x, y: y} : false;
    },
	/**
     * @private
     * Calculates the SVG path string for the Threshold Line for Histogram series
     * @param {Object} bounds An object that contains all the boundary information for the series
     * @param {Object} line Object contains the user config of the line to be drawn
     * 
     * @return {Object} return An object containing the path string and the start x and y coordinates
     */
	calculateHistogramLinePath: function (bounds, line) {
		var position = line.position,
            value = line.value,
            bbox = bounds.bbox,
            // Check to see if bounds are setup as individual Line series x and y scales or if one scale is defined typically by Bar series types
            xScale = bounds.xScale || bounds.scale || 1,
            yScale = bounds.yScale || bounds.scale || 1,
            // Check to see if min values are setup in the bounds. If not then default them to start at 0
            maxY = bounds.maxY || 0,
			minX = bounds.minX || 0,
            minY = bounds.minY || 0,
            boxX = bbox.x,
            boxY = bbox.y,
            height = bbox.height,
            width = bbox.width,
            path = [],
            x, y;
        // Calculate the path string based on bounds and scale info
        if (position == 'left' || position == 'top') {
            y = boxY + (0 - minX) * yScale;
            //x = boxX + (value - minY) * xScale;
			x = boxX + (((value - minY) * width) / (maxY - minY));
			if ((x < boxX) || (x > (boxX + width))) {
				path = false;
			} else {			
			    path = path.concat(["M", x, y, "l", 0, height]);
			}
        } else {
            y = boxY + height + (0 - minX) * yScale;
            //x = boxX + (value - minY) * xScale;
			x = boxX + (((value - minY) * width) / (maxY - minY));
			if ((x < boxX) || (x > (boxX + width))) {
				path = false;
			} else {			
			    path = path.concat(["M", x, y, "l", 0, -height]);
			}
        }
		
		return path ? {path: path, x: x - 5, y: y} : false;
		
	},
	/**
     * @private
     * Calculates the SVG path string for the Threshold Line for Radar series
     * @param {Object} bounds An object that contains all the boundary information for the series
     * @param {Object} line Object contains the user config of the line to be drawn
     * 
     * @return {Object} return An object containing the path string and the center x and y coordinates and radius
     */
	calculateRadarLinePath: function (series, bounds, line) {
		var me = this,
			value = line.value,
			bbox = bounds.bbox,
			centerX = bounds.centerX,
			centerY = bounds.centerY,
			radius = bounds.radius,
			maxValue = bounds.maxValue,
			pi2 = Math.PI * 2,
			cos = Math.cos,
            sin = Math.sin,
			rho, x, y;
		        
        rho = radius * value / maxValue;
        x = rho * cos(0 / 1 * pi2);
        y = rho * sin(0 / 1 * pi2);
        
		return {
			radius: rho,
            x: centerX,
            y: centerY + y
        }
	},
    /**
     * @private
     * Calculates the SVG path string for the Range
     * @param {String} position The position of the series's bound axis value
     * @param {Object} bounds An object that contains all the boundary information for the series
     * @param {Object} range Object contains the user config of the range to be drawn
     * 
     * @return {Object} return An object containing the path string
     */
    calculateRangePath: function (position, bounds, range) {
        var bbox = bounds.bbox,
            // Check to see if bounds are setup as individual Line series x and y scales or if one scale is defined typically by Bar series types
            xScale = bounds.xScale || bounds.scale || 1,
            yScale = bounds.yScale || bounds.scale || 1,
            // Check to see if min values are setup in the bounds. If not then default them to start at 0
            minX = bounds.minX || 0,
            minY = bounds.minY || 0,
            boxX = bbox.x,
            boxY = bbox.y,
            height = bbox.height,
            width = bbox.width,
            path = [],
            to = range.to,
            from = range.from,
            toPoint = [],
            fromPoint = [],
            lineWidth = (range.lineWidth ? range.lineWidth : 1) / 2,
            x, y, temp;
		
		if (from > to ) {
			temp = from;
			from = to;
			to = temp;			
		}
        // Calculate the path string based on bounds and scale info
        if (position == 'left' || position == 'right') {
            toPoint[0] = boxX + (0 - minX) * xScale;
            toPoint[1] = Math.max(boxY + height - (to - minY) * yScale, boxY);
            fromPoint[0] = boxX + (0 - minX) * xScale;
            fromPoint[1] = Math.max(Math.min(boxY + height - (from - minY) * yScale, boxY + height), boxY);
			
			if (toPoint[1] !== fromPoint[1]) {
				path.push("M", fromPoint[0] + 1 + lineWidth, fromPoint[1] + 0.5 - lineWidth, "L", fromPoint[0] + 1 + width - lineWidth, fromPoint[1] + 0.5 - lineWidth, "L", toPoint[0] + 1 + width - lineWidth, toPoint[1] + 0.5 + lineWidth, "L", toPoint[0] + 1 + lineWidth, toPoint[1] + 0.5 + lineWidth, "Z");
			} else {
				path = false;
			}
        }
		else if (position == 'top' || position == 'bottom') {
            toPoint[0] =  Math.max(Math.min(boxX + (to - minY) * xScale, boxX + width), boxX);
			toPoint[1] = boxY + (0 - minX) * yScale;
			fromPoint[0] = Math.max(boxX + (from - minY) * xScale, boxX);
			fromPoint[1] = boxY + (0 - minX) * yScale;
			if (toPoint[0] !== fromPoint[0]) {					
				path.push(	"M", fromPoint[0] + 1 + lineWidth, fromPoint[1] + 0.5 - lineWidth, "L", fromPoint[0] + 1 + lineWidth, fromPoint[1] + 0.5  + height - lineWidth,	"L", toPoint[0] + 1 + lineWidth, toPoint[1] + 0.5 + height - lineWidth, "L", toPoint[0] + 1 + lineWidth, toPoint[1] + 0.5 + lineWidth, "Z");
			} else {
				path = false;
			}
        }        
        return path;
    },
    /**
     * @private
     * Calculates the SVG path string for the Radial Range
     * @param {Object} bounds An object that contains all the boundary information for the series
     * @param {Object} range Object contains the user config of the range to be drawn
     * 
     * @return {Object} return An object containing the path string
     */
	calculateRadialRangePath: function (bounds, range) {
		var x = bounds.centerX,
			y = bounds.centerY,
			radius = bounds.radius,
			maxValue = bounds.maxValue,
			to = range.to > maxValue ? maxValue : range.to,
			from = range.from,
			R = radius * to / maxValue,
			r = radius * from / maxValue || 0.001,
			y1 = y + R,
			y2 = y + r,
			path;
		/*
		path = [
			['M', x, y1],
			['A', R, R, 0, 1, 1, x + 0.001, y1],
			['M', x, y2],
			['A', r, r, 0, 1, 0, x - 0.001, y2]
		];
		*/
		
		path = [
			["M", x - R, y - 0.001],
			["A", R, R, 0, 0, 1, x + R, y], ["L", x + R, y],
			["A", R, R, 0, 0, 1, x - R, y + 0.001], ["L", x - R, y + 0.001],
			["L", x - r, y + 0.001],
			["A", r, r, 0, 0, 0, x + r, y], ["L", x + r, y],
			["A", r, r, 0, 0, 0, x - r, y - 0.001], ["L", x - r, y - 0.001],
			["Z"]
		]
		return path;
	},
	/**
     * @private
     * Draws the ThresholdLine Sprite and intiaties draw of Label
     * @param {Object} path An object containing the path string and the start x and y coordinates
     * @param {Object} line The object that contains the user config of the line to be drawn
     * @param {Number} index The position in the lines array
     */
    drawThresholdLine: function (path, line, index) {
        var me = this,
            // Get reference to the Sprite Group that will contain all the Lines
            lineGroup = me.thresholdLineGroup,
            // Get reference to the line if already exists
            thresholdLine = lineGroup.getAt(index);
        if (path) {
			if (!thresholdLine) {
				thresholdLine = me.surface.add({
					value: line.value,
					type: 'path',
					group: lineGroup,
					path: path.path,
					opacity: line.opacity || 1,
					"stroke-width": line.width || 1,
					stroke: line.color || '#000',
					'stroke-dasharray': line.dash || ''
				});
			}
			// Show the new line and apply the new calculated path if line already exists
			thresholdLine.setAttributes({
				hidden: false,
				path: path.path
			}, true);
			// Initiate the drawing of the Label that goes with this line
			me.getOrCreateLabel(path, line, index);
		} else {
			if (thresholdLine) {
				thresholdLine.setAttributes({
					hidden: true				
				}, true);
				me.getOrCreateLabel(path, line, index);
			}
		}
    },
	/**
     * @private
     * Draws the ThresholdLine Sprite and intiaties draw of Label
     * @param {Object} path An object containing the path string and the start x and y coordinates
     * @param {Object} line The object that contains the user config of the line to be drawn
     * @param {Number} index The position in the lines array
     */
	drawThresholdCircle: function (path, line, index) {
		var me = this,
			lineGroup = me.thresholdLineGroup,
			thresholdLine = lineGroup.getAt(index);
		if (!thresholdLine) {
			thresholdLine = me.surface.add({
				type: 'circle',
				group: lineGroup,
				x: path.x,
				y: path.y,
				radius: path.radius,
				opacity: line.opacity || 1,
                "stroke-width": line.width || 1,
                stroke: line.color || '#000',
				'stroke-dasharray': line.dash || '4, 0'
			});
		}
		 thresholdLine.setAttributes({
            hidden: false,
			x: path.x,
			y: path.y,
			radius: path.radius
        }, true);
        // Initiate the drawing of the Label that goes with this line
		path.x = path.x + path.radius;
		me.getOrCreateLabel(path, line, index);
	},
    /**
     * @private
     * Creates the Label sprite at default location
     * @param {path} path An object containing the path string and the start x and y coordinates of the Line
     * @param {Object} line The object that contains the user config of the line to be drawn
     * @param {Number} index The position in the lines array
     * 
     * @return {Object} return An object containing the Label sprite and its default dimensions
     */
    getOrCreateLabel: function (path, line, index) {
        var me = this,
            // Get reference to the Sprite group that holds all Labels
            labelGroup = me.thresholdLabelGroup,
            // Get reference to the Label if it already eixts
            textLabel = labelGroup.getAt(index),
            position = line.position || 'left',
            value = line.value,
            labelCfg = line.label || {},
            // Default Label config
            config = {
                text: '',
                color: '#000',
                font: "11px Helvetica, sans-serif",
                showValue: true
            },
			pad = 5,
			x = path.x,
			y = path.y,
			width, height;
        if (path) {
			if (!textLabel) {
				// If Line position originates from Top or Bottom then rotate the label sprite accordingly to display the text to read top->bottom or bottom->top
				if (position == 'top' || position == 'bottom') {
					Ext.apply(config, {
						rotate: {
							degrees: position == 'top' ? 90 : 270
						}
					});
				}
				// Apply user configs with default label configs
				Ext.apply(config, labelCfg);
				// If users specified to display value of Line inline with label then update text config to show
				if (config.showValue) {
					Ext.apply(config, {
						text: config.text + ' (' + value + ')'
					});
				}
				// Add the label to the surface at default coordinates. We do this so that we can get reference to how big the new Label is with the display text applied so we
				// can properly calculate offsets later
				textLabel = me.surface.add(Ext.apply({
					group: labelGroup,
					type: 'text',
					x: 0,
					y: 0
				}, config));
				me.surface.renderItem(textLabel);
			}
			textLabel._bbox = textLabel.getBBox();
			
			// Calculate new dimensions and coordinates based off of generated Label and Line Position
			width = textLabel._bbox.width;
			height = textLabel._bbox.height;
			if (position == 'top') {
				x = x - pad - (height / 2) + width;
				y = y + pad + (height / 2);
			} else if (position == 'bottom') {
				y = y - pad - (height / 2);
				x = x - (width / 2) - (height / 2);
			} else if (position == 'left') {
				x = x + pad
				y = y - (height / 2);
			} else {
				x = x - width - pad
				 y = y - (height / 2);
			}
			// Show the new Label and apply the new calculated coordinates if label already exists
			textLabel.setAttributes({
				hidden: false,
				x: x,
				y: y
			}, true);
		} else {
			if (textLabel) {
				textLabel.setAttributes({
					hidden: true				
				}, true);
			}
		}
    },
    /**
     * @private
     * Draws the Range Sprite
     * @param {Object} path An object containing the path string and the start x and y coordinates
     * @param {Object} range The object that contains the user config of the range to be drawn
     * @param {Number} index The position in the lines array
     */
    drawRanges: function (path, range, index) {
        var me = this,
            // Get reference to the Sprite Group that will contain all the Ranges
            rangeGroup = me.rangeGroup,
            // Get reference to the range if already exists
            rangeSprite = rangeGroup.getAt(index);
        if (path) {
			if (!rangeSprite) {
				rangeSprite = me.surface.add({
					type: 'path',
					group: rangeGroup,
					path: path,
					opacity: range.opacity || 0.1,
					zIndex: -1,
					fill: range.color
				});
			}
			// Show the new range and apply the new calculated path if range already exists
			rangeSprite.setAttributes({
				hidden: false,
				path: path
			}, true);
		} else {
			if (rangeSprite) {
				rangeSprite.setAttributes({
				hidden: true				
			}, true);
			}
		}
    }
});