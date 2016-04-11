Ext.define('Metric.view.dashboard.Viewer', {
	extend: 'Ext.container.Container',
	alias: 'widget.viewer',
	requires: ['Ext.toolbar.TextItem', 'Ext.slider.Slider', 'Metric.view.dashboard.Dashboard'],
	
	config: {
		record: null,
		settings: {},
		editing: false,
		publishMode: false
	},	
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	
	constructor: function (config) {
		this.addEvents('titleclick', 'markdirty');
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var me = this,
			toolbar = me.buildToolbar();			
			
		Ext.apply(me, {			
			items: [toolbar]
		});
		
		this.callParent();	
	},
	buildToolbar: function () {
		var editMode = this.getEditing(),
			publishMode = this.getPublishMode(),
			rec = this.getRecord(),			
			items = [];
		
		if (!publishMode) {
			items.push({
				action: 'home',
				scale: 'medium',			
				iconCls: 'icon-home',
				tooltip: 'Back To Details'
			});
		}
		
		items.push({
			xtype: 'tbtext',
			itemId: 'dashboardTitle',			
			cls: 'dashboard-title',
			overCls: editMode ? 'dashboard-title-over' : '',
			text: rec.get('Title'),
			listeners: {
				el: {
					scope: this,
					click: this.onTitleClick
				}
			}
		}, '->');
		if (!editMode) {
			items.push({
				xtype: 'slider',
				itemId: 'zoomFactor',
				fieldLabel: '',
				width: 150,
				value: 100,
				increment: 10,
				minValue: 10,
				maxValue: 200,
				animate: false
			});
		}
		if (editMode) {
			items.push({				
				action: 'save',
				iconCls: 'icon-viewer-save',
				tooltip: 'Save Dashboard',
				scale: 'medium'
			},  {				
				action: 'config',
				iconCls: 'icon-viewer-config',
				tooltip: 'Configure Current Sheet',
				scale: 'medium'
			},{				
				action: 'previewEdit',				
				hidden: true,
				iconCls: 'icon-viewer-preview',
				tooltip: 'Toggle Edit/View Mode',
				scale: 'medium',
				toggleGroup: 'editViewMode'				
			});
		}
		
		items.push({
			action: 'info',
			hidden: true,
			iconCls: 'icon-help',
			scale: 'medium',
			tooltip: 'Information'
		});
		
		return Ext.create('Ext.toolbar.Toolbar', {
			style: 'background-color: #f5f5f5;',
			items: items
		});
	}, 
	onTitleClick: function (event, target) {
		var editing = this.getEditing(),
			component;
			
		if (editing) {
			component = this.down('#dashboardTitle');
			this.fireEvent('titleclick', this, component);
		}
	}
});