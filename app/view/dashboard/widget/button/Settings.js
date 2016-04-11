Ext.define('Metric.view.dashboard.widget.button.Settings', {
	extend: 'Metric.view.dashboard.widget.Settings',
	alias: 'widget.buttonboxsettings',
	requires: ['Ext.form.Panel', 'Ext.form.field.Text', 'Ext.form.field.ComboBox'],
	height: 300,	
	initComponent: function () {
		var widget = this.getWidget(),
			widgetSettings = widget.getWidgetSettings(),
			linkCfg = widgetSettings.linkCfg || {};		
		Ext.apply(this, {			
			animateTarget: widget,			
			items:[{
				xtype: 'form',
				defaults: {anchor: '100%'},
				bodyPadding: 10,
				fieldDefaults: {msgTarget: 'side'},
				autoScroll: true,				
				items: [{
					xtype: 'textfield',
					fieldLabel: 'Button Text',
					name: 'text',
					value: widgetSettings.text || ''
				}, {
					xtype: 'combo',
					itemId: 'buttonAction',
					fieldLabel: 'Button Action',
					name: 'action',
					value: widgetSettings.action || 'nothing',
					store: [['nothing', 'Nothing'], ['nextsheet', 'Next Sheet'], ['prevsheet', 'Previous Sheet'], ['sheetlink', 'Sheet Link'], ['dashboardlink','Dashboard Link'], ['urllink', 'Url Link']],
					listeners: {
						scope: this,
						select: function (combo, records) {
							var actionType = records[0].get('field1');
							this.toggleLinkFields(actionType);
						}
					}
				}, {
					xtype: 'combo',
					itemId: 'sheetLink',
					fieldLabel: 'Sheet',
					store: this.getSheetLinkData(),
					name: 'sheetLink',
					value: linkCfg.sheetLink,					
					hidden: true,
					queryMode: 'local'
				}, {
					xtype: 'combo',
					itemId: 'dashboardLink',
					fieldLabel: 'Dashboard Link',
					name: 'dashboardLink',
					store: 'Dashboards',
					displayField: 'Title',
					valueField: 'ID',
					queryMode: 'local',
					value: linkCfg.dashboardLink || '',
					hidden: true
				}, {
					xtype: 'textfield',
					itemId: 'urlLink',
					fieldLabel: 'Url Link',
					name: 'urlLink',
					value: linkCfg.urlLink || '',
					hidden: true
				}]
			}]
		});
		this.callParent(arguments);
	},
	toggleLinkFields: function (type) {
		var sheetLink = this.down('form #sheetLink'),
			dashboardLink = this.down('form #dashboardLink'),
			urlLink = this.down('form #urlLink');			
			
		switch(type) {
			case 'nothing':{
				sheetLink.reset();
				sheetLink.hide();
				dashboardLink.reset();
				dashboardLink.hide();
				urlLink.reset();
				urlLink.hide();				
				break;
			}
			case 'sheetlink': {
				sheetLink.show();
				
				dashboardLink.reset();
				dashboardLink.hide();
				urlLink.reset();
				urlLink.hide();
				break;
			}
			case 'dashboardlink': {
				dashboardLink.show();
				sheetLink.reset();
				sheetLink.hide();
				urlLink.reset();
				urlLink.hide();				
				break;
			}
			case 'urllink': {
				urlLink.show();
				sheetLink.reset();
				sheetLink.hide();
				dashboardLink.reset();
				dashboardLink.hide();													
				break;
			}			
			default:
				sheetLink.reset();
				sheetLink.hide();
				dashboardLink.reset();
				dashboardLink.hide();				
				urlLink.reset();
				urlLink.hide();
		}
	},
	getSheetLinkData: function () {
		var widget = this.getWidget(),
			sheet = widget.sheet,
			dashboard = sheet.getDashboard(),
			sheets = dashboard.getLayout().getLayoutItems(),
			len = sheets.length,
			i = 0,
			choices = [],
			title;
			
		for (i; i < len; i++) {
			title = sheets[i].title
			choices.push([i, title]);
		}		
		return choices;
	}
});