Ext.define('Metric.view.dashboard.Details', {
	extend: 'Ext.panel.Panel',	
	alias: 'widget.dashboarddetails',
	requires: ['Ext.layout.container.HBox', 'Ext.layout.container.VBox', 'Metric.view.dashboard.ActionButton', 'Metric.view.dashboard.Comments'],
	closable: true,
	layout: {
		type: 'vbox',
		align: 'stretch'
	},	
	autoScroll: true,	
	config: {
		allowEdit: false,
		record: null		
	},
	detailsTpl: [
		'<div class="db-detail-wrapper">',	
			'<h2>{Title}</h2>',
			//'<div class="db-created-wrapper">',
			//	'<div>Created by: <span>{Author}</span>Last modified: <span>{[this.formatDate(values.Modified)]}</span></div>',
			//'</div>',			
			'<div class="db-detail-notes">{Notes}</div>',
		'</div>',
		{
			formatDate: function (date) {
				return Ext.Date.format(date, 'F j, Y, g:i a');
			}
		}
	],
	
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var me = this,				
			detailBody = me.buildBodyPanel();			
			
		Ext.apply(me, {			
			items: [detailBody, {
				xtype: 'comments',
				flex: 1
			}]
		});
		me.callParent(arguments);
	},
	
	buildBodyPanel: function () {
		var me = this,
			detailsTpl = me.detailsTpl,			
			allowEdit = me.getAllowEdit(),			
			data = me.getRecord().getData(),
			actions = [{			
				xtype: 'actionbutton',					
				title: 'View',
				margin: 5,
				details: 'Click to view currently selected Dashboard',
				iconCls: 'icon-viewdashboard'			
			}]
		
		if (allowEdit) {
			actions.push({
				xtype: 'actionbutton',
				allowEdit: true,
				title: 'Edit',				
				margin: 5,
				details: 'Click to edit currenlty selected Dashboard',
				iconCls: 'icon-editdashboard'
			});
		}
				
		return Ext.create('Ext.container.Container', {			
			flex: 1,			
			layout: {
				type: 'hbox',
				pack: 'center',
				align: 'stretch'
			}, 
			items: [{
				xtype: 'container',
				flex: 1,
				autoScroll: true,				
				cls: 'action-container',				
				itemId: 'actionContainer',				
				layout: {
					type: 'vbox',
					align: 'center',
					pack: 'center'					
				},
				items: actions				
			}, {
				xtype: 'component',
				cls: 'details-seperator',
				width: 5
			}, {
				xtype: 'component',
				padding: '5 5 5 5',				
				itemId: 'details',				
				flex: 1,
				autoScroll: true,
				tpl: detailsTpl,
				data: data
			}]
		});
	},
	updateDetails: function (record) {
		var details = this.down('#details'),
			data = record.getData();
		details.update(data);		
	}
});