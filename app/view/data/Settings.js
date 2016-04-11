Ext.define('Metric.view.data.Settings', {
	extend: 'Ext.window.Window',
	alias: 'widget.datasettings',	
	requires: ['Ext.tab.Panel', 'Ext.form.Panel', 'Ext.form.field.Text', 'Ext.form.field.ComboBox'],
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
			fields = this.buildNewDataFields();
		}
				
		Ext.apply(this, {
			items: {
				xtype: 'tabpanel',
				plain: true,
				items: [{
					xtype: 'form',
					title: 'Details',
					itemId: 'settingsForm',					
					defaults: {anchor: '100%'},
					bodyPadding: 10,
					fieldDefaults: {msgTarget: 'side'},
					items: fields
				}, {
					xtype: 'panel',
					title: 'Security',
					html: 'Feature Not Implemented'
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
			emptyText: 'Enter Data Definition name...',				
			allowBlank: false
		}, {
			xtype: 'textfield',
			fieldLabel: 'Base Url',
			name: 'Url',
			value: L_Menu_BaseUrl,
			allowBlank: false
		}, {
			xtype: 'textfield',
			fieldLabel: 'List Name',
			name: 'SPListName',
			allowBlank: false
		}, {
			xtype: 'textfield',
			fieldLabel: 'View GUID',
			name: 'View',
			emptyText: 'Default View'
		}];
	},	
	buildNewDataFields: function () {
		var fields = this.getStandardFields();
		
		Ext.Array.insert(fields, 0, [{
			xtype: 'combo',
			itemId: 'definitionType',
			name: 'DefinitionType',			
			fieldLabel: 'Definition Type',
			allowBlank: false,
			value: 'SharePointList',
			store: [
				['SharePointList', 'SharePoint List']				
			]
		}]);
		return fields;
	}
});