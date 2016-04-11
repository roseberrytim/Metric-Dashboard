 Ext.define('Metric.view.dashboard.widget.WidgetBoxTools', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.widgetboxtools',
	
	config: {
		widget: null
	},
	vertical: true,
	style: 'background: transparent;',
	defaults: {
		margin: 1
	},
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var viewable = this.getWidget().getViewable();
		Ext.apply(this, {
			items: [{
				xtype: 'button',
				action: 'edit',
				iconCls: 'icon-edit',
				tooltip: 'Change Widget Settings'
			}, {
				xtype: 'button',
				iconCls: 'icon-zindex',
				tooltip: 'Change Z-Index Order',
				arrowCls: '',
				menu: [{
					text: 'To Front',
					iconCls: 'icon-bringfront',					
					action: 'toFront'					
				}, {
					text: 'To Back',
					iconCls: 'icon-toback',					
					action: 'toBack'					
				}]
			}, {
				xtype: 'button',
				action: 'copy',
				iconCls: 'icon-copy',
				tooltip: 'Copy Widget'
			}, {
				xtype: 'button',
				action: 'cut',
				iconCls: 'icon-cut',
				tooltip: 'Cut Widget'
			}, {
				xtype: 'button',
				iconCls: 'icon-resize',
				tooltip: 'Resize Widget',
				arrowCls: '',
				menu: [{
					text: '150(w) x 150(h)',					
					action: 'resize',
					dimensions: {width:150, height:150}
				}, {
					text:'300(w) x 150(h)',					
					action: 'resize',
					dimensions: {width:300, height:150}					
				},'-', {
					text:'300(w) x 300(h)',					
					action: 'resize',
					dimensions: {width:300, height:300}
				},'-', {
					text: 'Custom Size',					
					action: 'resize',
					dimensions: false					
				}]
			}, {
				xtype: 'button',
				action: 'visible',
				pressed: !viewable,
				iconCls: viewable ? 'icon-visible' : 'icon-hidden',
				tooltp: 'Toggle Widget Visibility',
				enableToggle: true
			}, {
				xtype: 'button',
				action: 'close',
				iconCls: 'icon-close'
			}]
		});
		this.callParent();
	}
});