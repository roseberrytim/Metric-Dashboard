Ext.define('Metric.view.dashboard.widget.WidgetBox', {
	extend: 'Ext.container.Container',
	alias: 'widget.widgetbox',	
	requires: ['Metric.view.dashboard.widget.WidgetBoxTools', 'Metric.view.dashboard.widget.Settings'],
	config: {
		editing: false,		
		records: [],
		store: false,
		type: '',
		viewable: true,
		widgetSettings: false,
		zoomCfg: false
	},
	cls: 'widget-box',
	hideMode: 'offsets',
	isWidget: true,	
	renderTpl: ['<div id="{id}-tool-wrapper" class="widget-tool-wrapper" ></div>', '{%this.renderContainer(out,values)%}'],
	x: 100,
	y: 50,
	height: 300,
	width: 300,
	floating: false,	
	layout: 'fit',
	items: [],
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var editing = this.getEditing();		
		if (editing) {			
			Ext.apply(this, {
				cls: 'widget-draggable sheet-container-widget',
				draggable: {				
					overCls: 'widget-draggable-over',
					ddGroup: 'widgets',		
					onDrag: function (e) {
						var me = this,
							comp = me.comp,
							offset = me.getOffset();

						comp.setPagePosition(me.startPosition[0] + offset[0], me.startPosition[1] + offset[1]);						
					},
					onEnd: function (e) {
						var comp = this.comp,
							xy = comp.getLocalXY(),					
							x, y;
						if (comp.isDestroyed || comp.destroying) {
							return;
						}
						x = Math.max(xy[0], 0);
						y = Math.max(xy[1], 0);
						comp.setPosition(x, y);
					}
				},
				resizable: {
					disabled: false,
					dynamic: true
				}				
			});
		}
		this.callParent();
	},
	beforeDestroy : function(){
        this.callParent(arguments);
		if (this.tools) {
			this.tools.destroy();
		}
		if (this.sheet) {
			this.sheet.unregisterWidget(this);
		}
	},
	enableWidgetBoxTools: function () {
		var id = this.getId();
		this.tools = Ext.create('Metric.view.dashboard.widget.WidgetBoxTools', {
			widget: this,
			renderTo: id + '-tool-wrapper'
		});
	},
	resetOffsets: function (el) {
		var me = this;				
		
		if (!Ext.isIE7) {
			el.setStyle({
				'-webkit-transform': 'none',
				'-moz-transform': 'none',
				'-ms-transform': 'none',
				'transform': 'none'
			});
		} else {
			el.setStyle({
				'zoom': 1,
				//'-ms-filter': 'progid:DXImageTransform.Microsoft.Matrix(enabled=false)',
				//'filter': 'progid:DXImageTransform.Microsoft.Matrix(enabled=false)',
				'margin-left': 0,
				'margin-top': 0
			});
		}
		this.setZoomCfg(false);
		return me.getOffsetsTo(me.sheet);				
	},
	scaleWidget: function (factor) {		
		var me = this,
			el = me.getEl(),
			offset, aspectX, aspectY;
		if (el) {								
			offset = me.resetOffsets(el);
			if (factor !== 1) {
				aspectX =  Math.round(0 - (offset[0] - (offset[0] * factor)));
				aspectY =  Math.round(0 - (offset[1] - (offset[1] * factor)));
				
				if (!Ext.isIE7) {
					el.setStyle({
						'-webkit-transform': 'translate(' + aspectX + 'px, ' + aspectY + 'px) scale(' + factor + ')',
						'-webkit-transform-origin': '0 0',
						'-moz-transform': 'translate(' + aspectX + 'px, ' + aspectY + 'px) scale(' + factor + ')',
						'-moz-transform-origin': '0 0',
						'-ms-transform': 'translate(' + aspectX + 'px, ' + aspectY + 'px) scale(' + factor + ')',
						'-ms-transform-origin': '0 0',
						'transform': 'translate(' + aspectX + 'px, ' + aspectY + 'px) scale(' + factor + ')',
						'transform-origin': '0 0'						
					});			
				} else {
					el.setStyle({
						'zoom': factor,
						//'-ms-filter': "progid:DXImageTransform.Microsoft.Matrix(M11=" + factor + ", M12=0, M21=0, M22=" + factor + ", SizingMethod='auto expand')",
						//'filter': "progid:DXImageTransform.Microsoft.Matrix(M11=" + factor + ", M12=0, M21=0, M22=" + factor + ", SizingMethod='auto expand')",
						'margin-left': aspectX + 'px',
						'margin-top': aspectY + 'px'					
					});
				}
				this.setZoomCfg({
					zoom: factor,
					offsetX: aspectX,
					offsetY: aspectY
				});
			}
		}
	
		
		/*
		var initialDimensions = this.getInitialDimensions(),
			widgetEl = this.getEl(),
			width, height;
		
		width = initialDimensions[0];
		height = initialDimensions[1];
		
		if (Ext.isEmpty(initialDimensions)) {
			width = this.width;
			height = this.height
			this.setInitialDimensions([width, height]);
		}
		
		if (widgetEl) {
			this.setWidth(Math.floor(width * factor));
			this.setHeight(Math.floor(height * factor));
		} else {
			this.width = (Math.floor(width * factor));
			this.height = (Math.floor(height * factor));
		}
		*/
	},
	getSaveConfiguration: function () {
		var type = this.getType(),			
			widgetSettings = this.getWidgetSettings(),			
			viewable = this.getViewable(),			
			width, height, xy;
			
		if (this.el) {
			xy = this.getLocalXY();
			width = this.getWidth();
			height = this.getHeight();
		} else {
			xy = [this.x, this.y];
			width = this.width;
			height = this.height;
		}
		return Ext.apply({}, {		
			type: type,
			x: xy[0],
			y: xy[1],
			width: width,
			height: height,			
			viewable: viewable,		
			widgetSettings: widgetSettings
		});
	}
});