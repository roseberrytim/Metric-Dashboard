Ext.define('Metric.view.navigation.Header', {
	extend: 'Ext.container.Container',	
	alias: 'widget.navigationheader',
	requires: ['Ext.layout.container.HBox', 'Metric.view.navigation.NavButton'],
	layout: {
		type: 'hbox',
		align: 'stretch'
	},
	cls: 'navigation-header',
	autoScroll: true,
	initComponent: function () {
		var globalCfg = Metric.config.Globals,
			title = globalCfg.title || '',
			isAdmin = globalCfg.isAdmin;
		Ext.apply(this, {
			items: [{
				xtype: 'navbutton',
				margin: '0 0 10 5',	
				action: 'dashboard',
				title: 'Dashboard',				
				iconCls: 'icon-dashboard'
			}, {
				xtype: 'navbutton',				
				margin: '0 0 10 0',	
				action: 'data',			
				title: 'Data',
				hidden: !isAdmin,
				iconCls: 'icon-datasource'				
			}, {
				xtype: 'component',
				flex: 1
			}, {
				xtype: 'component',
				flex: 0,
				cls: 'navigation-title',
				html: '<h1>' + title + '</h1>'
			}, {
				xtype: 'component',
				flex: 1
			}, {
				xtype: 'toolbar',
				itemId: 'actionToolbar',
				style: 'background-color: #f3f3f3;',
				items: ['->', {
					xtype: 'button',
					action: 'configure',
					hidden: true,
					scale: 'large',
					iconCls: 'icon-configure',
					iconAlign: 'top',
					tooltip: 'Configure Current'
				}, {				
					xtype: 'button',					
					action: 'add',
					scale: 'large',
					iconCls: 'icon-add',
					iconAlign: 'top',
					tooltip: 'Add New'
				}]
			}]
		});
		this.callParent();
	}
});