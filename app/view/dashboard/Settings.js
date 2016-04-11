Ext.define('Metric.view.dashboard.Settings', {
	extend: 'Ext.window.Window',
	alias: 'widget.dashboardsettings',	
	requires: ['Ext.tab.Panel', 'Ext.form.Panel', 'Ext.form.field.Text', 'Ext.form.field.HtmlEditor', 'Ext.form.field.ComboBox'],
	height: 500,
	width: 500,
	layout: 'fit',
	modal: true,
	bodyPadding: '5 0 0 2',
	editing: false,
	initComponent: function () {
		var editing = this.editing,
			fields;
		if (editing) {
			fields = this.getStandardFields();
		} else {
			fields = this.buildNewDashboardFields();
		}
				
		Ext.apply(this, {
			items: {
				xtype: 'tabpanel',
				plain: true,
				items: [{
					xtype: 'form',
					title: 'Details',
					itemId: 'settingsForm',
					layout: {
						type: 'vbox',
						align: 'stretch'
					},
					defaults: {anchor: '100%'},
					bodyPadding: 10,
					fieldDefaults: {msgTarget: 'side'},
					items: fields
				}, {
					xtype: 'panel',
					title: 'Security'
				}]
			},
			bbar: [{
				text: 'Delete',
				hidden: !editing,
				action: 'delete',
				iconCls: 'icon-delete'
			}, '->', {
				text: 'Cancel',		
				handler: function () {
					this.up('window').close();
				}
			}, {
				text: 'Save',
				action: 'save'
			}]
		});
		
		this.callParent();
	},
	getStandardFields: function () {
		return [{
			xtype: 'textfield',				
			name: 'Title',
			fieldLabel: 'Name',
			emptyText: 'Enter Dashboard name...',				
			allowBlank: false
		}, {
			xtype: 'htmleditor',
			flex: 1,
			fieldLabel: 'Notes',
			name: 'Notes'
		}, {
			xtype: 'combo',
			name: 'Published',
			fieldLabel: 'Published',
			value: '0',
			store: [
				['1', 'Yes'],
				['0', 'No']
			]
		}];
	},	
	buildNewDashboardFields: function () {
		var fields = this.getStandardFields();
		
		Ext.Array.insert(fields, 0, [{
			xtype: 'combo',
			itemId: 'dashboardTemplate',
			name: 'Template',
			submitValue: false,
			fieldLabel: 'Template',
			emptyText: '<Blank>',			
			store: 'Dashboards',
			valueField: 'ID',
			displayField: 'Title'
		}]);
		return fields;
	}
});