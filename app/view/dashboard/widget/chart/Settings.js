Ext.define('Metric.view.dashboard.widget.chart.Settings', {
	extend: 'Metric.view.dashboard.widget.Settings',
	alias: 'widget.chartboxsettings',	
	requires: [
		'Ext.data.JsonStore', 'Ext.data.ArrayStore', 'Ext.layout.container.VBox', 'Ext.layout.container.HBox', 'Ext.grid.Panel', 'Ext.form.Panel',  
		'Ext.form.field.Text', 'Ext.form.field.ComboBox', 'Ext.selection.CheckboxModel', 'Ext.ux.grid.FiltersFeature', 'Ext.ux.container.SearchGroup',
		'Ext.ux.form.ClosableFieldSet', 'Ext.chart.theme.Base'
	],
	title: 'Chart Widget Settings',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	width: 800,
	height: 600,
	initComponent: function () {
		var widget = this.getWidget(),
			widgetSettings = widget.getWidgetSettings(),
			
			chartType = widgetSettings.chartType,
			chartAxisFields = this.buildAxisFields(chartType),
			chartSeriesFields = this.buildSeriesFields(chartType),
			chartTitleLegendFields = this.buildTitleLegendFields(chartType),
			hideThreshold = this.isThresholdVisible(chartType),
			hideRanges = this.isRangesVisible(chartType);
			
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
					xtype: 'tabpanel',					
					itemId: 'chartConfigForms',
					disabled: true,
					plain: true,
					margins: '5 0 0 0',
					flex: 1,
					items: [{
						xtype: 'form',
						title: 'Axis',
						itemId: 'chartAxisSettings',
						defaults: {labelWidth: 120, anchor: '100%'},
						bodyPadding: 10,
						fieldDefaults: {msgTarget: 'side'},
						autoScroll: true,
						items: chartAxisFields
					}, {
						xtype: 'form',
						title: 'Series',
						itemId: 'chartSeriesSettings',
						defaults: {labelWidth: 120, anchor: '100%'},
						bodyPadding: 10,
						fieldDefaults: {msgTarget: 'side'},
						autoScroll: true,
						items: chartSeriesFields
					}, {
						xtype: 'form',
						title: 'Title / Legend', 
						itemId: 'chartTitleLegendSettings',
						defaults: {labelWidth: 120, anchor: '100%'},
						bodyPadding: 10,
						fieldDefaults: {msgTarget: 'side'},
						autoScroll: true,
						items: chartTitleLegendFields
					}, {
						xtype: 'form',
						title: 'Thresholds',
						action: 'lines',
						itemId: 'chartThresholdSettings',
						hidden: hideThreshold,
						defaults: {anchor: '100%'},
						bodyPadding: 10,
						fieldDefaults: {msgTarget: 'side'},
						autoScroll: true,
						items: [],
						tbar: [{
							text: 'Add Threshold',
							action: 'Threshold'
						}]
					}, {
						xtype: 'form',
						title: 'Ranges',
						action: 'ranges',
						itemId: 'chartRangeSettings',
						hidden: hideRanges,
						defaults: {anchor: '100%'},
						bodyPadding: 10,
						fieldDefaults: {msgTarget: 'side'},
						autoScroll: true,
						items: [],
						tbar: [{
							text: 'Add Range',
							action: 'Range'
						}]
					}]				
				}]
			},{
				xtype: 'container',
				itemId: 'dataContainer',
				flex: 1,
				layout: 'fit',
				items: []
			}]
		});
		this.callParent(arguments);
		this.addEvents('datadefinitionchange', 'afterdatadefinitionchange', 'datadefinitionload', 'restoresettings');
	},
	buildButtons: function () {
		return [{
			text: 'Preview Chart',
			action: 'previewChart'
		}, '->', {
			text: 'Cancel',
			scope: this,
			handler: function() {
				this.close();
			}
		}, {
			text: 'Save',
			action: 'save'
		}];
	},
	buildAxisFields: function (type) {
		var fields;
		switch (type) {
			case 'kpigaugechart':
			case 'gaugechart': 
				fields = [{
					xtype: 'numberfield',
					fieldLabel: 'Axis Minimum',
					name: 'axisMinimum',
					minValue: 0
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Axis Maximum',
					name: 'axisMaximum',
					minValue: 0
				},  {
					xtype: 'numberfield',
					fieldLabel: 'Major Tick Steps',
					name: 'majorSteps',
					minValue: 2					
				}, {
					xtype: 'textfield',
					fieldLabel: 'Step Margin',
					name: 'margin'				
				}, {
					xtype: 'textfield',
					fieldLabel: 'Font Color',
					name: 'fontColor',
					value: '#333'
				}, {
					xtype: 'textfield',
					fieldLabel: 'Font',
					name: 'font',
					value: '12px Heveltica, sans-serif'
				}];
				break;
			case 'piechart':
				fields = [{
					xtype: 'displayfield',
					value: 'Chart Type does not require an Axis configuration'
				}];
				break;
			case 'histogramchart':
				fields = [{
					xtype: 'numberfield',
					fieldLabel: 'Bin Size',
					name: 'binSize',
					minValue: 1
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Major Step Increment',
					name: 'stepY',
					minValue: 1
				}]
				break;
			default:
				fields = [{
					xtype: 'textfield',
					name: 'xtitle',
					fieldLabel: 'X-Axis Title'
				}, {
					xtype: 'textfield',
					name: 'ytitle',
					fieldLabel: 'Y-Axis Title'
				}, {
					xtype: 'combo',
					name: 'labelOrientation',
					fieldLabel: 'Label Orientation',
					store: [['horizontal', 'Horizontal'], ['vertical', 'Vertical']],
					queryMode: 'local'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Axis Minimum',
					name: 'axisMinimum',
					minValue: 0,
					allowBlank: true
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Axis Maximum',
					name: 'axisMaximum',
					minValue: 0,
					allowBlank: true
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Major Tick Steps',
					name: 'majorSteps',
					minValue: 0,
					allowBlank: true						
				}, {
					xtype: 'checkbox',
					name: 'adjustMinimum',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Adjust Minimum',
					checked: false						
				}, {
					xtype: 'checkbox',
					name: 'adjustMaximum',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Adjust Maximum',
					checked: false						
				}, {
					xtype: 'checkbox',
					name: 'constrain',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Constrain',
					checked: false						
				}]
				break;
		}
		return fields;
	},
	buildSeriesFields: function (type) {
		var headersStore = Ext.data.StoreManager.lookup('Headers'),
			fields;
		switch (type) {
			case 'kpigaugechart':
				fields = [{
					xtype: 'combo',
					name: 'columns',
					fieldLabel: 'Data Column',
					store: 'Headers',
					displayField: 'name',
					allowBlank: false,
					valueField: 'id',
					queryMode: 'local'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Donut',
					name: 'donut',
					minValue: 0,
					maxValue: 100
				}, {
					xtype: 'textfield',
					name: 'needleWidth',
					fieldLabel: 'Needle Width'
				}, {
					xtype: 'textfield',
					name: 'pivotColor',
					fieldLabel: 'Pivot Color'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Pivot Radius',
					name: 'pivotRadius',
					minValue: 0,
					maxValue: 10
				}, {
					xtype: 'textfield',
					fieldLabel: 'Opacity',
					name: 'opacity'
				}];
				break;
			case 'gaugechart':
				fields = [{
					xtype: 'combo',
					name: 'columns',
					fieldLabel: 'Data Column',
					store: 'Headers',
					allowBlank: false,
					//multiSelect: true,
					displayField: 'name',
					valueField: 'id',
					queryMode: 'local'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Donut',
					name: 'donut',
					minValue: 0,
					maxValue: 100
				}, {
					xtype: 'checkbox',
					name: 'needle',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Needle',
					checked: false
				}]
				break;
			case 'histogramchart': 
				fields = [{
					xtype: 'combo',
					name: 'mode',
					allowBlank: false,
					fieldLabel: 'Series Mode',
					store: [['row', 'Row Series'], ['column', 'Column Series']],
					queryMode: 'local'				
				}, {
					xtype: 'combo',
					name: 'categoryColumn',
					fieldLabel: 'Category Column',
					store: 'Headers',
					allowBlank: false,
					displayField: 'name',
					valueField: 'id',
					queryMode: 'local'
				}, {
					xtype: 'combo',
					name: 'columns',
					allowBlank: false,
					fieldLabel: 'Data Columns',
					store: 'Headers',
					multiSelect: true,
					displayField: 'name',
					valueField: 'id',
					queryMode: 'local'				
				}, {
					xtype: 'checkbox',
					name: 'show3SigmaLine',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Show 3Sigma Lines',
					checked: false						
				},  {
					xtype: 'checkbox',
					name: 'showNormalLine',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Show Normal Curve',
					checked: false						
				}, {
					xtype: 'checkbox',
					name: 'showMeanLine',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Show Mean Line',
					checked: false						
				}, {
					xtype: 'checkbox',
					name: 'valueLabels',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Show Values',
					checked: false						
				}]
				break;
			// Need to probably add color
			case 'piechart':
			default:
				fields = [{
					xtype: 'combo',
					name: 'mode',
					allowBlank: false,
					fieldLabel: 'Series Mode',
					store: [['row', 'Row Series'], ['column', 'Column Series']],
					queryMode: 'local'				
				}, {
					xtype: 'combo',
					name: 'categoryColumn',
					allowBlank: false,
					fieldLabel: 'Category Column',
					store: 'Headers',
					displayField: 'name',
					valueField: 'id',
					queryMode: 'local'
				}, {
					xtype: 'combo',
					name: 'columns',
					allowBlank: false,
					fieldLabel: 'Data Columns',
					store: 'Headers',
					multiSelect: true,
					displayField: 'name',
					valueField: 'id',
					queryMode: 'local'
				}, {
					xtype: 'checkbox',
					name: 'stacked',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Stacked',
					checked: false						
				}, {
					xtype: 'checkbox',
					name: 'valueLabels',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Show Values',
					checked: false						
				}, {
					xtype: 'combo',
					name: 'theme',
					fieldLabel: 'Color Theme',
					store: [
						['Base', 'Default'], ['Green', 'Green'], ['Sky', 'Sky'], ['Red', 'Red'], ['Purple', 'Purple'], ['Blue', 'Blue'], ['Yellow','Yellow'],
						['Category1', 'Category1'], ['Category2', 'Category2'],['Category3', 'Category3'],['Category4', 'Category4'],['Category5', 'Category5'],['Category6', 'Category6']
					],
					queryMode: 'local',
					value: 'Base'
				}]
				break;
		}
		return fields;
	},
	buildTitleLegendFields: function (type) {
		var fields;
		switch (type) {
			case 'kpigaugechart':
			case 'gaugechart':
				fields = [{
					xtype: 'textfield',
					name: 'chartTitle',
					fieldLabel: 'Chart Title'
				}, {
					xtype: 'combo',
					name: 'titleLocation',
					fieldLabel: 'Title Position',
					value: 'top',
					store: [['top', 'Top'],['right', 'Right'], ['bottom', 'Bottom'],['left', 'Left']],
					queryMode: 'local'					
				}, {
					xtype: 'textfield',
					name: 'titleFont',
					fieldLabel: 'Title Font'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Title Padding',
					name: 'titlePadding',
					minValue: 0,
					allowBlank: true						
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Title Margin',
					name: 'titleMargin',
					minValue: 0,
					allowBlank: true				
				}];
				break;
			default: 
				fields = [{
					xtype: 'textfield',
					name: 'chartTitle',
					fieldLabel: 'Chart Title'
				}, {
					xtype: 'combo',
					name: 'titleLocation',
					fieldLabel: 'Title Position',
					value: 'top',
					store: [['top', 'Top'],['right', 'Right'], ['bottom', 'Bottom'],['left', 'Left']],
					queryMode: 'local'					
				}, {
					xtype: 'textfield',
					name: 'titleFont',
					fieldLabel: 'Title Font'
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Title Padding',
					name: 'titlePadding',
					minValue: 0,
					allowBlank: true						
				}, {
					xtype: 'numberfield',
					fieldLabel: 'Title Margin',
					name: 'titleMargin',
					minValue: 0,
					allowBlank: true						
				}, {
					xtype: 'checkbox',
					name: 'legendVisible',
					inputValue: true,
					uncheckedValue: false,
					fieldLabel: 'Legend Visible',
					checked: true				
				}, {
					xtype: 'combo',
					name: 'legendPosition',
					fieldLabel: 'Legend Position',
					value: 'right',
					store: [['top', 'Top'],['right', 'Right'], ['bottom', 'Bottom'],['left', 'Left']],
					queryMode: 'local'
				}];
				break;
		}
		return fields;
	},
	isThresholdVisible: function (type) {
		var thresholdAvailable = ['columnchart', 'barchart', 'linechart', 'radarchart', 'scatterchart', 'areachart', 'histogramchart'];			
		return Ext.Array.indexOf(thresholdAvailable, type) === -1		
	},
	isRangesVisible: function (type) {
		var rangeAvailable = ['columnchart', 'barchart', 'linechart', 'scatterchart', 'radarchart', 'areachart', 'kpigaugechart'];
		return Ext.Array.indexOf(rangeAvailable, type) === -1
	},
	resetSettings: function (disable) {
		var chartConfigForms = this.down('#chartConfigForms'),
			dataContainer = this.down('#dataContainer');			
			
		chartConfigForms.down('#chartAxisSettings').getForm().reset();
		chartConfigForms.down('#chartSeriesSettings').getForm().reset();
		chartConfigForms.down('#chartTitleLegendSettings').getForm().reset();
		chartConfigForms.down('#chartThresholdSettings').removeAll();
		chartConfigForms.down('#chartRangeSettings').removeAll();
		
		chartConfigForms.setDisabled(disable);
		dataContainer.setDisabled(disable);
	}
});