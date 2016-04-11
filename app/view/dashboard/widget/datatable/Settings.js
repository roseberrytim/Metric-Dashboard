Ext.define('Metric.view.dashboard.widget.datatable.Settings', {
	extend: 'Metric.view.dashboard.widget.Settings',
	alias: 'widget.datatableboxsettings',
	requires: [
		'Ext.layout.container.VBox', 'Ext.layout.container.HBox', 'Ext.grid.Panel', 'Ext.form.Panel', 'Ext.form.field.Text', 
		'Ext.form.field.ComboBox', 'Ext.selection.CheckboxModel', 'Ext.ux.grid.FiltersFeature', 'Ext.ux.container.SearchGroup'
	],
	title: 'Data Table Widget Settings',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	width: 800,
	initComponent: function () {
		var widget = this.getWidget(),
			widgetSettings = widget.getWidgetSettings();		
		Ext.apply(this, {			
			animateTarget: widget,
			items:[{
				xtype: 'container',
				flex: 1,
				margins: '0 0 5 0',
				layout: {
					type: 'hbox',
					align: 'stretch'
				},
				items: [{
					xtype: 'gridpanel',
					itemId: 'definitionSelector',					
					flex: 1,
					border: true,
					margins: '5 2 5 5',
					store: 'DataDefinitions',
					autoScroll: true,
					selModel : {
						mode: 'SINGLE',
						allowDeselect: false
					},
					viewConfig: {
						stripeRows: true
					},
					columns: [{ 
						text: 'Title', 
						dataIndex: 'Title', 
						flex: 1
					}],
					tbar: [{
						xtype: 'searchgroup',
						selectRowOnSearch: false
					}],
					listeners: {
						scope: this,
						selectionchange: function (selModel, record) {
							this.fireEvent('datadefinitionchange', this, record[0]);
						}
					}
				},{
					xtype: 'form',
					itemId: 'settingsForm',
					flex: 1,
					border: true,
					margins: '5 5 5 2',
					bodyPadding: 5,
					items: [{
						xtype: 'textfield',					
						name: 'title',
						anchor: '90%',
						fieldLabel: 'Title',
						value: widgetSettings.title || ''						
					}]
				}]
			},{
				xtype: 'container',
				itemId: 'dataContainer',
				flex: 1,
				disabled: true,
				layout: 'fit',
				items: []
			}]
		});
		this.callParent(arguments);
		this.addEvents('datadefinitionchange', 'afterdatadefinitionchange', 'datadefinitionload', 'restoresettings');
	},
	resetSettings: function (disable) {
		var dataContainer = this.down('#dataContainer'),
			settingsForm = this.down('#settingsForm').getForm();			
				
		settingsForm.reset();
		dataContainer.setDisabled(disable);		
	}
});