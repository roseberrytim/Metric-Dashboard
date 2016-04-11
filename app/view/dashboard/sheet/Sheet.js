Ext.define('Metric.view.dashboard.sheet.Sheet', {
	extend: 'Ext.container.Container',
	alias: 'widget.sheet',
	requires: ['Ext.layout.container.Absolute', 'Metric.view.dashboard.sheet.Settings'],
	layout: 'absolute',
	autoScroll: true,
	cls: 'sheet-container',
	hideMode: 'offsets',
	title: 'Sheet',
	config: {
		widgetCount: 0,
		editing: false,		
		dashboard: null,
		zoomFactor: 100,
		settings: {
			title: 'Sheet',
			backgroundColor: 'ffffff',
			visible: true,
			widgets: []
		}
	},
	constructor: function (config) {	
		this.addEvents('sheetcontextmenu', 'settingsupdate');
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var me = this,
			editing = me.getEditing(),
			settings = me.getSettings(),			
			backgroundColor;
			
		backgroundColor = Ext.util.Format.colorCode(settings.backgroundColor || 'FFFFFF');		
		Ext.apply(me, {
			closable: editing,
			hidden: !settings.visible && !editing,			
			style: 'background-color:' + backgroundColor,
			allowClose: false,			
			items: [],
			listeners: {
				el: {
					scope: me,
					contextmenu: me.onSheetContextMenu					
				}
			}
		});
		me.callParent();		
		// Setup ZIndex management stuff.
		me.zSeed = 100;
		me.widgetList = new Ext.util.MixedCollection();
		me.zIndexStack = [];
        me.front = null;
	},	
	registerWidget: function (widget) {
		if (widget.isWidget) {
			var me = this,
				seed = me.zSeed,
				stack = me.zIndexStack,
				sl = stack.length,
				widgetId = widget.getId();
			
			Ext.apply(widget, {
				style: {
					'z-index': seed + sl
				},
				sheet: me
			});		
			me.widgetList.add(widgetId, widget);
			me.zIndexStack.push(widget);
			me.front = widget;
		}		
	},
	unregisterWidget: function (widget) {
		var me = this,
			widgetList = me.widgetList,
			widgetId = widget.getId(),
			stack = me.zIndexStack;
			
		if (widgetList && widgetList.containsKey(widgetId)) {
			widgetList.removeAtKey(widgetId);
			//delete widgetList[widgetId];
			
			if (me.front == widget) {
				me.front = stack[stack.length - 1]
			}
			Ext.Array.remove(stack, widget);
		}
	},
	assignZIndices: function () {
		var me = this,
			stack = me.zIndexStack,
			sl = stack.length,
			i = 0,
			zIndex = me.zSeed,
			widget;
		for (i;i < sl; i++) {
			widget = stack[i];
			
			if (widget) {
				widget.el.setStyle('z-index', zIndex + i);
			}	
		}
	},	
	bringWidgetToFront: function (widget) {
		var me = this,
			index = me.widgetList.indexOf(widget),
			stack = me.zIndexStack,
			result = false,
			order = {};
			
		if (widget !== me.front) {
			order[index] = me.widgetList.getCount() - 1;
			Ext.Array.remove(stack, widget);
			stack.push(widget);
			me.widgetList.reorder(order);
			me.assignZIndices();
			result = true;
			me.front = widget;
		}
		return result;
	},
	sendWidgetToBack: function (widget) {
		var me = this,
			index = me.widgetList.indexOf(widget),
			stack = me.zIndexStack,
			order = {};
		
		order[index] = 0;
		Ext.Array.remove(stack, widget);
		stack.unshift(widget);
		me.widgetList.reorder(order);
		me.assignZIndices();
	},
	getWidgets: function () {
		return this.widgetList;
	},
	setBackgroundColor: function (color) {
		var el = this.getEl();
		color = Ext.util.Format.colorCode(color || 'FFFFFF');
		if (el) {
			el.setStyle('background-color', color);
		}
		
	},	
	applySheetSettings: function (settings) {
		var me = this,
			title = settings.title,
			visible = settings.visible,
			color = settings.backgroundColor;
		me.setTitle(title);		
		me.setBackgroundColor(color);
		me.setSettings(settings);
	},
	onSheetContextMenu: function (event, target) {
		var editing = this.getEditing();
		if (editing) {
			this.fireEvent('sheetcontextmenu', event, target, this);
			event.preventDefault();
		}
	},
	setTitle: function (newTitle) {
		var me = this,
			settings = me.getSettings(),
            oldTitle = me.title;
			
		if (oldTitle !== newTitle) {	
			me.title = newTitle;
			me.setSettings(Ext.apply({}, {
				title: newTitle
			}, settings));
			me.fireEvent('titlechange', me, newTitle, oldTitle);
		}
	},
	getTitle: function () {
		return this.title;
	}
});