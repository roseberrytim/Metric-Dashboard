Ext.define('Metric.view.dashboard.widget.button.Button', {
	extend: 'Metric.view.dashboard.widget.WidgetBox',
	alias: 'widget.buttonbox',
	requires: ['Ext.layout.container.VBox', 'Ext.button.Button'],
	type: 'buttonbox',
	height: 50,
	width: 100,
	layout: {
		type: 'vbox',
		align: 'stretch'				
	},
	initComponent: function () {
		var editing = this.getEditing() || false,
			settings = this.getWidgetSettings() || {},
			text = settings.text || 'Not Configured',
			action = settings.action || 'nothing',
			linkCfg = settings.linkCfg || {};
			
		Ext.apply(this, {			
			items: [{
				xtype: 'button',				
				disabled: editing,
				flex: 1,
				text: text,
				action: action,
				linkCfg: linkCfg
			}]
		});
		this.callParent(arguments);
	}	
});