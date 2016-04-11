Ext.define('Ext.ux.Histogram', {
	extend : 'Ext.Component',
	
	//usl : 87,
	//target : 62,
	//lsl : 37,
	show3SigmaLine : false,
	showSpecLimit : false,
	showGridLine : true,
	autoScaleX : true,
	autoScaleY : true,
	minX : 0,
	maxX : 100000,
	minY : 0,
	maxY : 100,
	stddev : null,
	stepY : 10,
	
	data : null,
	
	calculate : function() {
		this.initCalc();
		
		if(this.data.length < 2)
			return false;
			
		this.min = Ext.Stat.min(this.data);
		this.max = Ext.Stat.max(this.data);
		
		var range = this.max - this.min;
		
		if(this.binsize === null) {
			var bin = Math.floor(Math.sqrt(this.data.length));
			bin = Math.max(5, bin);
			bin = Math.min(20, bin);
			this.binsize = bin;
		}
		
		var o = Ext.Stat.minunit(range / this.binsize);
		this.binwidth = o.value;
		var minunit = o.minunit;
		
		if(range == 0) {
			this.binsize = 5;
			this.binfirst = Math.floor(this.min) - 2;
			this.binlast = Math.floor(this.min) + 3;
		} else {
			var temp = this.min;
			
			if(Math.abs(this.binwidth) >= 1) {
				for(var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				temp = Math.floor(temp) - 0.5;
				for(var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				this.binfirst = temp;
			} else {
				for(var i = 1;i <= minunit;i++) {
					temp *= 10;
				}
				temp = Math.floor(temp) - 0.5;
				for(var i = 1;i <= minunit;i++) {
					temp /= 10;
				}
				this.binfirst = temp;
			}
			
			this.binlast = this.binfirst + this.binwidth * this.binsize;
			while(this.binlast - this.max <= 0.00000000000001) {
				this.binlast += this.binwidth;
				this.binsize += 1;
			}
		}
		
		for(var i = 0;i <= this.binsize;i++) {
			this.freqData.push(0);
			this.binMesh.push(this.binfirst + this.binwidth * i);
		}
		
		var sum = 0, idx, dv, sv;
		
		for(var i = 0;i < this.data.length;i++) {
			dv = this.data[i];
			sum += dv;
			
			if(dv === this.binfirst) {
				idx = 0;
			} else {
				idx = Math.floor(Math.floor((dv - this.binfirst) / this.binwidth)); 
			}
			
			this.freqData[idx]++;
		}
		
		if(range !== 0) {
			while(this.freqData.length > 0) {
				if(this.freqData[0] !== 0)
					break;
				this.freqData.shift();
				this.binfirst += this.binwidth;
				this.binMesh.shift();
				this.binlast -= this.binwidth;
				this.binsize -= 1;
			}
		}
		
		if(this.mean === null) {
			this.mean = sum / this.data.length;
		}
		
		if(this.stddev === null) {
			this.stddev = Ext.Stat.stddev(this.data, this.mean);
		}
		
		this.calculated = true;
	},
	
	initCalc : function() {
		this.binMesh = [];
		this.freqData = [];
		this.min = null;
		this.max = null;
		this.stddev = null;
		this.mean = null;
		this.binfirst = null;
		this.binlast = null;
		this.binwidth = null;
		this.binsize = null;
		this.calculated = false;
	},

	initComponent : function() {
		this.callParent(arguments);
	},
	
	afterRender : function() {
		var width = this.getWidth();
		var height = this.getHeight();
		
		this.canvas = Raphael(this.el.dom, width, height);
		
		this.generate();
		this.calculate();
		
		var rect = this.drawRegion();
		this.drawTitle('Capability Analysis', 'Histogram Axis', 'Count');
		this.drawXAxis(rect);
		this.drawYAxis(rect);
		this.drawBar(rect); // Columns
		//this.drawNormalLine(rect); // Curve Bell
		this.draw3SLine(rect);
		//this.drawSpecLine(rect);
	
		
		this.callParent(arguments);
	},
	
	generate : function() {
		/*
		const NTEST = 100;
		const RANDMAX = 100;
		
		this.data = [];
		
		for(var i = 0;i < NTEST /2;i++)
			this.data[i] = 10 + Math.floor(Math.random() * RANDMAX);
		for(;i < NTEST;i++)
			this.data[i] = 10 + Math.floor((RANDMAX / 4) + Math.random() * (RANDMAX / 2));
		for(;i < NTEST * 4;i++)
			this.data[i] = 10 + Math.floor((RANDMAX / 3) + Math.random() * (RANDMAX / 3));
		for(;i < NTEST * 16;i++)
			this.data[i] = 10 + Math.floor((RANDMAX / 2.5) + Math.random() * (RANDMAX / 4));
		*/
		this.data = [1,1,1,4,4,5,5,5,6,7,8,8,8,9,9,9,9,9,9,10,10,11,12,12,13,14,14,15,15,16,16,16,16,17,17,17,18,18]
	},
	
	drawRegion : function() {
		var bw = this.getWidth();
		var bh = this.getHeight();
		
		const CHART_LEFT_GAP_PIXELS = 60;
		const CHART_RIGHT_GAP_PIXELS = 30;
		const CHART_TOP_GAP_PIXELS = 90;
		const CHART_BOTTOM_GAP_PIXELS = 90;
		
		var rect = {
			x : CHART_LEFT_GAP_PIXELS,
			y : CHART_TOP_GAP_PIXELS,
			w : bw - CHART_LEFT_GAP_PIXELS - CHART_RIGHT_GAP_PIXELS,
			h : bh - CHART_TOP_GAP_PIXELS - CHART_BOTTOM_GAP_PIXELS
		};
		
		var region = this.canvas.rect(rect.x, rect.y, rect.w, rect.h).attr({
			fill : '#fff',
			// opacity : '0.2',
			stroke : 'navy',
			'stroke-width' : '2'
		});
		
		return rect;
	},
	
	drawTitle : function(top, bottom, left) {
		
		const CHART_BORDER_PIXELS = 10;
		
		var bw = this.getWidth();
		var bh = this.getHeight();

		var rect = {
			x : CHART_BORDER_PIXELS,
			y : CHART_BORDER_PIXELS,
			w : bw - 2 * CHART_BORDER_PIXELS,
			h : bh - 2 * CHART_BORDER_PIXELS
		};

		var textattr = {
			'fill' : '#ff7000',
			'font-size' : '16px',
			'font-family' : 'Verdana',
			'font-weight' : 'bold'
		};
		
		if(top)
			this.canvas.text(rect.x + rect.w / 2, rect.y, top).attr(textattr);
		if(bottom)
			this.canvas.text(rect.x + rect.w / 2, rect.y + rect.h - 2, bottom).attr(textattr);
		if(left)
			this.canvas.text(rect.x + 5, rect.y + rect.h / 2, left).attr(textattr).rotate(-90, true);
	},
	
	drawXAxis : function(r) {
		const CHART_Y_SCALE_STEP = 20;

		var min, max, xpos, ypos;
		var textHeight = 15;
		
		if(this.autoScaleX) {
			min = this.binMesh[0];
			max = this.binMesh[this.binMesh.length - 1];
			
			var vs = [min, max];

			if(this.show3SigmaLine) {
				vs.push(this.mean - this.stddev * 3);
				vs.push(this.mean + this.stddev * 3);
			}
			
			if(this.showSpecLimit) {
				vs.push(this.target);
				vs.push(this.lsl);
				vs.push(this.usl);
			}
			
			min = Math.min.apply(null, vs);
			max = Math.max.apply(null, vs);
		} else {
			min = this.minX;
			max = this.maxX;
		}
		
		this.minX = min;
		this.maxX = max;

		var path;
		
		ypos = r.y + r.h;
		
		for(var i = 0;i < this.binMesh.length;i++) {
			xpos = r.x + ((this.binMesh[i] - min) * r.w) / (max - min);

			path = 'M' + xpos + ','  + (ypos + 5) + 'L' + xpos + ',' + ypos;
			this.canvas.path(path);
			this.canvas.text(xpos, ypos + 10, this.binMesh[i].toFixed(4));
		}

		if(this.show3SigmaLine && this.showSpecLimit) {
			ypos = r.y + r.h + 8 + textHeight * 3;
		} else if(!this.showSpecLimit && this.show3SigmaLine) {
			ypos = r.y + r.h + 8 + textHeight * 2;
		} else {
			ypos = r.y + r.h + 8 + textHeight * 1;
		}
		
		path = 'M' + (r.x - 20) + ',' + ypos + 'L' + (r.x + r.w + 20) + ',' + ypos;
		this.canvas.path(path);
		
		var szstep = (this.maxX - this.minX) / CHART_Y_SCALE_STEP;

		for(var i = 0;i <= CHART_Y_SCALE_STEP;i++) {
			var v = this.minX + szstep * i;
			var xpos = r.x + ((v - min) * r.w) / (max - min);

			path = 'M' + xpos + ','  + (ypos + 5) + 'L' + xpos + ',' + ypos;
			this.canvas.path(path);
			this.canvas.text(xpos, ypos + 10, v.toFixed(4));
		}
		
	},
	
	drawYAxis : function(r) {
		const CHART_Y_SCALE_STEP = 20;

		var min = 0, max, ypos, szstep, yinterval;
		
		max = Math.floor(Math.max.apply(null, this.freqData));
		
		if(this.autoScaleY) {
			max += 5;
			max = max - max % 5;
		} else {
			min = this.minY;
			max = this.maxY;
		}
		
		if(max < this.stepY)
			max = this.stepY;
			
		this.maxY = max;
		
		// var path = 'M' + r.x + ',' + r.y + 'L' + r.x + ',' + (r.y + r.h);
		// this.canvas.path(path);
		// path = 'M' + (r.x + r.w) + ',' + (r.y + r.h) + 'L' + (r.x + r.w) + ',' + (r.y + r.h + 1);
		// this.canvas.path(path);
				
		if(this.stepY > 0) {
			yinterval = this.stepY;
			szstep = Math.floor((max - min) / yinterval);
		} else {
			if(max < 10) {
				szstep = max
			} else {
				szstep = CHART_Y_SCALE_STEP;
			}
			
			if(szstep === 0) {
				szstep = CHART_Y_SCALE_STEP;
			}
			
			yinterval = (max - min) / szstep;
		}
		
		for(var i = 0;i <= szstep;i++) {
			var v = min + yinterval * i;
			ypos = (r.y + r.h) - ((v - min) * r.h) / (max - min);
			path = 'M' + (r.x - 5) + ',' + ypos + 'L' + r.x + ',' + ypos;
			this.canvas.path(path);
			
			if(this.showGridLine) {
				path = 'M' + (r.x + 1) + ',' + ypos + 'L' + (r.x + r.w) + ',' + ypos;
				this.canvas.path(path).attr({
					opacity : 0.1
				});
			}
			
			this.canvas.text((r.x - 10), ypos, v).attr({
				'text-anchor': 'end'
			});
		}
	},
	
	drawBar : function(r) {
		var canvas = this.canvas;
		
		var yl, xp1, xp2, hp, yp;
		
		for(var i = 0;i < this.binMesh.length - 1;i++) {
			yl = this.freqData[i];
			
			xp1 = r.x + ((this.binMesh[i] - this.minX) * r.w) / (this.maxX - this.minX); // x pixels
			xp2 = r.x + ((this.binMesh[i + 1] - this.minX) * r.w) / (this.maxX - this.minX);
			hp = (yl - this.minY) * r.h / (this.maxY - this.minY); // height pixels
			
			yp = r.y + r.h - hp;
			
			if(hp > 0) {
				canvas.rect(xp1, yp, xp2 - xp1, hp).attr({
					fill : '#00f',
					opacity : '0.2',
					stroke : 'navy',
					'stroke-width' : '2'
				});
			}
			
			yp = Math.min(yp + hp / 2, r.y + r.h - 20);
			canvas.text((xp1 + xp2) / 2, yp, this.freqData[i]).attr({
				'font-size' : 20,
				'opacity' : 0.2,
				'fill' : '#f00'
			});
		}
	},
	
	drawNormalLine : function(r) {
		var min, max;
		
		min = r.x;
		max = r.x + r.w;
		
		var pos = [];
		var cnt = 0;
		
		for(var i = min;i <= max;i++) {
			var x = (i - min) * (this.maxX - this.minX) / r.w + this.minX;
			
			var dnormal = Ext.Stat.dnormal(x, this.mean, this.stddev);
			
			var y = dnormal;
			dnormal = Ext.Stat.dnormal(this.mean, this.mean, this.stddev);
			
			var ypos = (r.y + r.h) - (y * r.h / dnormal);
			
			if(ypos > (r.y + r.h))
				continue;
				
			pos[cnt++] = i + ',' + Math.floor(ypos);
		}
		
		pos[cnt++] = (r.x + r.w) + ',' + (r.y + r.h);
		pos[cnt++] = (r.x) + ',' + (r.y + r.h);
		
		var path = 'M' + pos.join('L');
		this.canvas.path(path).attr({
			fill : '#0f0',
			opacity : 0.2
		});
	},
	
	draw3SLine : function(r) {
		/* Mean Line 그리기 */
		
		var origin = {
			x : r.x,
			y : r.y + r.h
		};
		var min = this.minX, max = this.maxX;
		
		var xpos = origin.x + (((this.mean - min) * r.w) / (max - min));
		var ypos = origin.y;
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 30)).attr({
				stroke : 'red'
			});
			this.canvas.text(xpos, ypos - r.h - 45, 'M').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		var textHeight = 20;
		
		if(this.showSpecLimit) {
			this.canvas.text(xpos, ypos + textHeight * 2, this.mean.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		} else {
			this.canvas.text(xpos, ypos + textHeight, this.mean.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		if(this.stddev == 0)
			return;
					
		/* 3Sigma Line 그리기 */
		
        var l3sigma = this.mean - this.stddev * 3;
		var u3sigma = this.mean + this.stddev * 3;
		
		xpos = origin.x + (((l3sigma - min) * r.w) / (max - min));
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 30)).attr({
				stroke : 'red'
			});
			this.canvas.text(xpos, ypos - r.h - 45, '-3s').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		if(this.showSpecLimit) {
			this.canvas.text(xpos, ypos + textHeight * 2, l3sigma.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		} else {
			this.canvas.text(xpos, ypos + textHeight, l3sigma.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}

		xpos = origin.x + (((u3sigma - min) * r.w) / (max - min));
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 30)).attr({
				stroke : 'red'
			});
			this.canvas.text(xpos, ypos - r.h - 45, '3s').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		if(this.showSpecLimit) {
			this.canvas.text(xpos, ypos + textHeight * 2, u3sigma.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		} else {
			this.canvas.text(xpos, ypos + textHeight, u3sigma.toFixed(4)).attr({
				'font-size' : 10,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
	},
	
	drawSpecLine : function(r) {
		/* Target Line 그리기 */
		
		var origin = {
			x : r.x,
			y : r.y + r.h
		};
		var min = this.minX, max = this.maxX;
		
		var xpos = origin.x + (((this.target - min) * r.w) / (max - min));
		var ypos = origin.y;
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10));
			this.canvas.text(xpos, ypos - r.h - 25, 'T').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		var textHeight = 20;
		
		this.canvas.text(xpos, ypos + textHeight, this.target.toFixed(4)).attr({
			'font-size' : 10,
			'opacity' : 1.0,
			'fill' : '#f00'
		});
		
		if(this.stddev == 0)
			return;
					
		/* Spec Line 그리기 */
		
		xpos = origin.x + (((this.lsl - min) * r.w) / (max - min));
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10));
			this.canvas.text(xpos, ypos - r.h - 25, 'LSL').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		this.canvas.text(xpos, ypos + textHeight, this.lsl.toFixed(4)).attr({
			'font-size' : 10,
			'opacity' : 1.0,
			'fill' : '#f00'
		});

		xpos = origin.x + (((this.usl - min) * r.w) / (max - min));
		
		if(xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
			this.canvas.path('M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10));
			this.canvas.text(xpos, ypos - r.h - 25, 'USL').attr({
				'font-size' : 20,
				'opacity' : 1.0,
				'fill' : '#f00'
			});
		}
		
		this.canvas.text(xpos, ypos + textHeight, this.usl.toFixed(4)).attr({
			'font-size' : 10,
			'opacity' : 1.0,
			'fill' : '#f00'
		});
	},
	
	onDestroy : function() {
		this.callParent(arguments);
	}
});