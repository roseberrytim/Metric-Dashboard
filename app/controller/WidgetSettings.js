Ext.define('Metric.controller.WidgetSettings', {
    extend: 'Ext.app.Controller',
    models: [],
    stores: ['Dashboards', 'DataDefinitions', 'Headers'],
    views: [
		'dashboard.widget.Settings', 'dashboard.widget.htmltext.Settings', 'dashboard.widget.button.Settings', 
		'dashboard.widget.image.Settings', 'dashboard.widget.datatable.Settings', 'dashboard.widget.chart.Settings', 'dashboard.widget.chart.Preview'
	],		
	refs: [],
	init: function () {
        var me = this;
		me.listen({
			component: {				
				// HTMLTextBox
				'htmltextboxsettings button[action=save]': {
					click: 'onHTMLTextSettingsSaveClick'
				},
				// ButtonBox
				'buttonboxsettings': {
					render: 'onButtonBoxSettingsRender'
				},
				'buttonboxsettings button[action=save]': {
					click: 'onButtonBoxSettingsSaveClick'
				},
				// ImageBox
				'imageboxsettings button[action=save]': {
					click: 'onImageBoxSettingsSaveClick'
				},
				// DataTableBox
				'datatableboxsettings': {
					afterrender: 'onAfterDynamicDataWidgetSettingsRender',
					afterdatadefinitionchange: 'onAfterDataDefinitionChange',
					datadefinitionchange: 'onDataDefinitionChange'					
				},
				//ChartBox
				'chartboxsettings': {
					afterrender: 'onAfterDynamicDataWidgetSettingsRender',
					afterdatadefinitionchange: 'onAfterDataDefinitionChange',
					datadefinitionchange: 'onDataDefinitionChange'					
				},
				'chartboxsettings button[action=save]': {
					click: 'onChartBoxSettingsSaveClick'
				},
				'chartboxsettings button[action=previewChart]': {
					click: 'onPreviewChartClick'
				},
				'chartboxsettings form button': {
					click: 'onAddThresholdRangeClick'
				},				
				'datadetails button[action=clearFilterData]': {
					click: 'onClearFilterDataClick'
				}
				/*
				'chartboxsettings #chartDataEntryGrid button[action=clearFilterData]': {
					click: 'onChartDataEntryFilterClearClick'
				},
				'chartboxsettings #chartDataEntryGrid': {
					filterupdate: 'onChartDataEntryFilterUpdate'
				},
				'chartboxsettings #definitionGrid': {
					selectionchange: 'onChartSettingsDefinitionSelectionChange'
				},
				'chartboxsettings button[action=widgetsave]': {
					click: 'onChartSettingsSaveClick'
				},
				'chartboxsettings #chartPreview button[action=refreshchartpreview]': {
					click: 'onChartSettingsPreviewChartRefreshClick'
				},
				'chartboxsettings #chartThresholdSettings button[action=addthreshold]': {
					click: 'onChartSettingsAddThreshold'
				},
				'chartboxsettings #chartRangeSettings button[action=addrange]': {
					click: 'onChartSettingsAddRange'
				}
				*/
			}
		});
    },
	// Save Handlers
	onHTMLTextSettingsSaveClick: function (button) {
		var settingsWindow = button.up('window'),
			widget = settingsWindow.getWidget(),
			value = settingsWindow.down('htmleditor').getValue(),
			component = widget.child();
		
		widget.setWidgetSettings({
			html: value
		});
		component.update(value);
		settingsWindow.close(); 
	},
	onButtonBoxSettingsSaveClick: function (button) {
		var settingsWindow = button.up('window'),
			widget = settingsWindow.getWidget(),
			values = settingsWindow.down('form').getForm().getValues(),
			button = widget.down('button'),
			widgetSettings = {},
			linkCfg = {},
			text = values.text,			
			action = values.action
		
		switch (action) {			
			case 'sheetlink': {
				Ext.apply(linkCfg, {
					sheetLink: values.sheetLink
				});
				break;
			}
			case 'dashboardlink':
				Ext.apply(linkCfg, {
					dashboardLink: values.dashboardLink
				});
				break;
			case 'urllink':
				Ext.apply(linkCfg, {
					urlLink: values.urlLink
				});
				break;
			default:
				break;
		}
		
		Ext.apply(widgetSettings, {
			text: text,
			action: action,
			linkCfg: linkCfg		
		});
		button.setText(text);		
		widget.setWidgetSettings(widgetSettings);		
		settingsWindow.close();
	},
	onImageBoxSettingsSaveClick: function (button) {
		var settingsWindow = button.up('window'),
			widget = settingsWindow.getWidget(),
			imageContainer = widget.down('#imageContainer').getEl(),
			url = widget.getAbsoluteUrl(settingsWindow.down('textfield').getValue());
		
		imageContainer.setStyle('background', 'url('+ url + ') no-repeat center center');
		imageContainer.setStyle('background-size', 'contain');
		imageContainer.setStyle('filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + url + ', sizingMethod="scale")');
		imageContainer.setStyle('-ms-filter', 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src=' + url + ', sizingMethod="scale")');	
		widget.setWidgetSettings({
			imageUrl: url
		});		
		settingsWindow.close();
	},
	onChartBoxSettingsSaveClick: function (button) {		
		try {
			var settingsWindow = button.up('window'),
				widget = settingsWindow.getWidget(),
				settings = this.getChartSettings(settingsWindow, widget);
			if (settings) {	
				widget.setWidgetSettings(settings);
				this.fireEvent('chartsettingsupdate', widget, settings);
				settingsWindow.close();
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the widget configuration - ' + e.message);
		}
	},	
	
	// Button Widget Settings
	onButtonBoxSettingsRender: function (win) {
		var widget = win.getWidget(),
			widgetSettings = widget.getWidgetSettings(),
			actionType = widgetSettings.action
		win.toggleLinkFields(actionType);
	},
	
	// Dynamic Data Widget Settings
	onAfterDynamicDataWidgetSettingsRender: function (win) {
		var widget = win.getWidget(),			
			widgetSettings = widget.getWidgetSettings(),			
			dataSettings = widgetSettings.dataSettings || false,			
			definitionSelector, definitionId, record;
			
		if (dataSettings) {
			definitionId = dataSettings.dataDefinition;
			record = this.getDataDefinitionsStore().getById(definitionId);
			if (record) {				
				definitionSelector = win.down('#definitionSelector');
				definitionSelector.getSelectionModel().select(record, false, true);
				this.restoreDynamicDataSettings(win, record, widget, dataSettings);
			}
		}		
	},
	onDataDefinitionChange: function (win, record) {
		try {						
			var dataType = (record ? record.get('DefinitionType') : ''),
				dataContainer = win.down('#dataContainer');			
			switch (dataType) {
				case 'SharePointList':
					this.getSharePointDataTable(win, record);
					break;
				default: 					
					dataContainer.removeAll();
					win.resetSettings(true);
					break;
			}
		} catch (e) {			
			Ext.MessageBox.alert('Error', 'There was an error processing the request - ' + e.message);			
		}
	},
	restoreDynamicDataSettings: function (win, record, widget, dataSettings) {
		try {
			var dataType = (record ? record.get('DefinitionType') : ''),
				widgetType = widget.getType(),				
				dataFilters = dataSettings.filters || [],
				sorters = dataSettings.sorters || [],
				result = {},
				storeFilters, gridFilters, spConfigs;
				
				this.fireEvent('generatedatafilters', dataFilters, null, result);
				if (result.filters) {
					storeFilters = result.filters
				}
				gridFilters = this.getColumnFilters(dataFilters),
				spConfigs = {
					chartbox: {
						event: 'getspdatadetailsgrid',
						options: {
							callback: Ext.bind(this.restoreChartSettings, this, [win], true),
							scope: this,
							gridCfg: {
								closable: false,				
								selModel: {
									mode: 'simple'
								},
								selType: 'checkboxmodel',
								viewConfig: {
									stripeRows: true
								},
								features: [{
									ftype: 'filters',
									encode: false,
									local: true,
									filters: gridFilters
								}],
								tbar: [{
									text: 'Clear Filter Data',
									action: 'clearFilterData'
								}]			
							},
							storeCfg: {
								filters: storeFilters,
								filterOnLoad: true,
								sorters: sorters
							}
						}
					},
					datatablebox: {
						event: 'getspdatadetailsgrid',
						options: {
							callback: Ext.bind(this.restoreDataTableSettings, this, [win], true),
							scope: this,
							gridCfg: {
								closable: false,				
								selModel: {
									mode: 'simple'
								},
								selType: 'checkboxmodel',
								viewConfig: {
									stripeRows: true
								},
								features: [{
									ftype: 'filters',
									encode: false,
									local: true,
									filters: gridFilters
								}],
								tbar: [{
									text: 'Clear Filter Data',
									action: 'clearFilterData'
								}]			
							},
							storeCfg: {
								filters: storeFilters,
								filterOnLoad: true,
								sorters: sorters
							}
						}
					}
				};
			
			switch (dataType) {
				case 'SharePointList':
					this.fireEvent(spConfigs[widgetType].event, record, spConfigs[widgetType].options);
					break;
				default:						
					Ext.Error.raise({
						msg: 'Definined data type not supported',
						option: dataType,
						'error code': 100
					});
					break;
			}	
		} catch (e) {			
			Ext.MessageBox.alert('Error', 'There was an error preparing the configuration of the widget - ' + e.message);			
		}
	},
	
	onAfterDataDefinitionChange: function (win, grid, record) {
		try {
			var dataContainer = win.down('#dataContainer'),
				disable = grid ? false : true;
			
			win.resetSettings(disable);

			dataContainer.removeAll();
			if (grid) {
				dataContainer.add(grid);
				grid.getStore().load();
				this.resetHeadersStoreFromGrid(grid);
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the request - ' + e.message);
		}
	},
	onClearFilterDataClick: function (button) {
		var grid = button.up('grid');
		grid.filters.clearFilters();
	},
	onAddThresholdRangeClick: function (button) {
		var form = button.up('form'),
			action = button.action;
		fieldSet = this['generate' + action + 'FieldSet']()
		
		form.add(fieldSet);
		form.doLayout();
		form.scrollBy([0,10000], true);
	},
	onPreviewChartClick: function (button) {
		var settingsWindow = button.up('window'),
			widget = settingsWindow.getWidget(),
			settings = this.getChartSettings(settingsWindow, widget);
		this.fireEvent('generatepreviewchart', settings);		
	},

	restoreDataTableSettings: function (grid, win) {
		var dataContainer = win.down('#dataContainer');
		
		win.resetSettings(false);
		
		dataContainer.add(grid);		
		grid.getStore().load();		
	},
	getChartSettings: function (win, widget) {
		try {
			var settings = Ext.clone(widget.getWidgetSettings()),
				definitionSelector = win.down('#definitionSelector'),
				dataDetails = win.down('#dataContainer datadetails'),
				dataStore = dataDetails.getStore(),
				chartConfigForms = win.down('#chartConfigForms').query('form'),
				definition = definitionSelector.getSelectionModel().getSelection()[0],
				dataRecords = dataDetails.getSelectionModel().getSelection(),
				settingValues = {},				
				selectedRecords = [],
				filters = [],
				sorters = [],
				filterCfg;
			
			Ext.Array.each(chartConfigForms, function (form) {
				var title = form.title,
					values, i, key, temp, action, count;
				if (form.isValid()) {
					values = form.getForm().getFieldValues();
					if (title !== 'Thresholds' && title !== 'Ranges') {
						Ext.Object.merge(settingValues, values);
					} else {					
						action = form.action;
						count = form.query('closablefieldset').length;
						result = [];
						for (i = 0; i < count; i++) {
							temp = {};
							for (key in values) {
								temp[key] = Ext.Array.from(values[key])[i];
							}
							if (action === 'lines') {
								temp = Ext.apply({}, {
									position: temp.position,
									color: '#' + temp.color,
									value: temp.value,
									width: temp.width,
									dash: temp.dash == false ? false : '4, 4',
									label: {
										text: temp.label,
										showValue: temp.showValue
									}
								})
							} else if (action === 'ranges') {
								temp = Ext.apply({}, {
									opacity: temp.opacity,
									from: temp.from,
									to: temp.to,
									color: '#' + temp.color
								});
							}
							result.push(temp);
						}
						
						settingValues[action] = result;
					}
				} else {
					Ext.Error.raise({
						msg: 'Required Configuration Missing',
						option: 'chartsettingsupdate',
						'error code': 110
					});
				}
			});
			
			Ext.Array.each(dataRecords, function (record) {
				selectedRecords.push(record.getId());
			});
			filterCfg = dataDetails.filters.getFilterData();
			Ext.each(filterCfg, function (filter) {
				filters.push(Ext.apply({}, {
					dataIndex: filter.field
				}, filter.data));
			});
			dataStore.sorters.each(function (sorter) {
				sorters.push(Ext.apply({}, {
					property : sorter.property,
					direction: sorter.direction
				}));
			});
			Ext.apply(settings, {				
				dataSettings: {
					dataDefinition: definition.get('ID'),
					records: selectedRecords,
					filters: filters,
					sorters: sorters
				}
			}, settingValues);
			
			return settings;
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the widget configuration - ' + e.message);
			return false;
		}
	},
	restoreChartSettings: function (grid, win) {
		var me = this,			
			widgetSettings = win.getWidget().getWidgetSettings(),
			dataSettings = widgetSettings.dataSettings || false,
			selectedRecords = dataSettings.records || [],
			linesSettings = widgetSettings.lines || [],
			rangesSettings = widgetSettings.ranges || [],
			dataContainer = win.down('#dataContainer'),
			chartConfigForms = win.down('#chartConfigForms'),
			chartAxisSettings = chartConfigForms.down('#chartAxisSettings').getForm(),
			chartSeriesSettings = chartConfigForms.down('#chartSeriesSettings').getForm(),
			chartTitleLegendSettings = chartConfigForms.down('#chartTitleLegendSettings').getForm(),
			chartThresholdSettings = chartConfigForms.down('#chartThresholdSettings'),
			chartRangeSettings = chartConfigForms.down('#chartRangeSettings'),
			lines = [],
			ranges = [],
			records = [];
		
		win.resetSettings(false);
		
		dataContainer.add(grid)
		grid.getStore().load(function () {
			me.resetHeadersStoreFromGrid(grid);
			
			Ext.each(linesSettings, function (lineCfg) {
				lines.push(me.generateThresholdFieldSet(lineCfg));
			});
			Ext.each(rangesSettings, function (rangeCfg) {
				ranges.push(me.generateRangeFieldSet(rangeCfg));
			});
			
			chartAxisSettings.setValues(widgetSettings);
			chartSeriesSettings.setValues(widgetSettings);
			chartTitleLegendSettings.setValues(widgetSettings);
			chartThresholdSettings.add(lines);
			chartRangeSettings.add(ranges);
			
			if (!Ext.isEmpty(selectedRecords)) {
				Ext.Array.each(selectedRecords, function (record) {
					records.push(this.getById(record));
				}, this);
				grid.getSelectionModel().select(records);
			}
		});
	},
	
	getColumnFilters: function (dataFilters) {
		try {
			var filters = [],
				indexMap = [];
			
			Ext.Array.each(dataFilters, function (f) {
				var value = f.value,
					field = f.dataIndex,
					operand = f.comparison,
					type = f.type,
					append = false,
					filter, index, tmpValue;
								
				if (operand) {
					if (type === 'date') {
						if (operand === 'lt') {
							operand = 'before';
						} else if (operand === 'gt') {
							operand = 'after';
						} else {
							operand = 'on'
						}
						value = Ext.Date.parse(value, 'm/d/Y');
					}
					/*
						If there is a filter of Date, DateTime, Number type where there can be multiple operands we need
						to check if there is already a filter indexed for that field. This way we can append the operand to the
						filter object instead of creating a new filter object which would only show in the grid filters the last applied one.
					*/
					index = Ext.Array.indexOf(indexMap, field);
					if (index === -1) {
						tmpValue = {};
						tmpValue[operand] = value;
						value = tmpValue;
					} else {
						append = true;
						tmpValue = filters[index].value;
						tmpValue[operand] = value;
					}
				}
				if (!append) {
					indexMap.push(field);
					filters.push({
						dataIndex: field,
						type: type,
						value:  value
					});
				}
			});
			return filters;
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error restoring the saved configuration ' + e.message);
			return filters;
		} 
	},
	getSharePointDataTable: function (win, record) {
		var config = {
			closable: false,				
			selModel: {
				mode: 'simple'
			},
			selType: 'checkboxmodel',
			viewConfig: {
				stripeRows: true
			},
			features: [{
				ftype: 'filters',
				encode: false,
				local: true,
				filters: []
			}],
			tbar: [{
				text: 'Clear Filter Data',
				action: 'clearFilterData'
			}]
		};
			
		this.fireEvent('getspdatadetailsgrid', record, {
			gridCfg: config, 			
			scope: this,
			callback: function (grid) {
				win.fireEvent('afterdatadefinitionchange', win, grid, record);				
			}			
		});		
	},
	resetHeadersStoreFromGrid: function (grid) {
		var me = this,
			headersStore = this.getHeadersStore(),
			headers = [];
		Ext.Array.each(grid.columns, function (column) {
			headers.push({
				id: column.dataIndex,
				name: column.text
			});
		});		
		headersStore.loadData(headers);
	},
	generateThresholdFieldSet: function (values) {
		values = values || {};
		var labelCfg = values.label || {},
			color = values.color || '';
		color = color.split('#')[1] || '000000';
		
		return Ext.create('Ext.ux.form.ClosableFieldSet', {
			title: 'Threshold Line',
			collapsible: true,
			maxHeight: 200,
			defaults: {
				anchor: '100%',
				layout: { type: 'hbox', defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}}
			},
			items:[{					
				xtype: 'textfield',
				name: 'label',
				itemId: 'label',
				fieldLabel: 'Label',
				value: labelCfg.text || ''
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Value',
				itemId: 'value',
				name: 'value',
				step: 1,
				value: values.value || ''
			}, {
				xtype: 'combo',
				name: 'position',
				fieldLabel: 'Position',
				itemId: 'position',
				store: [['left', 'Left'], ['right', 'Right'], ['top', 'Top'], ['bottom', 'Bottom']],
				queryMode: 'local',
				value: values.position || 'left'
			}, {
				xtype: 'colorfield',
				name: 'color',
				fieldLabel: 'Color',
				itemId: 'color',
				value: color				
			}, {
				xtype: 'numberfield',
				fieldLabel: 'Width',
				name: 'width',
				itemId: 'width',
				step: 1,
				maxValue: 5,
				value: values.width || 1
			}, {
				xtype: 'combo',
				name: 'dash',
				fieldLabel: 'Dashed Line',
				itemId: 'dash',
				store: [[true, 'Yes'], [false, 'No']],
				queryMode: 'local',
				value: !!values.dash
			}, {
				xtype: 'checkboxfield',
				itemId: 'showValue',
				fieldLabel: 'Show Value',
				labelWidth: 110,
				name: 'showValue',
				inputValue: true,
				uncheckedValue: false,
				checked: labelCfg.showValue || true
			}]
		});
	},
	generateRangeFieldSet: function (values) {
		values = values || {};
		var color = values.color || '';
		color = color.split('#')[1] || 'FFFFFF';
		return Ext.create('Ext.ux.form.ClosableFieldSet', {
			title: 'Range',
			collapsible: true,
			maxHeight: 200,
			defaults: {
				anchor: '100%',
				layout: { type: 'hbox', defaultMargins: {top: 0, right: 5, bottom: 0, left: 0}}
			},
			items:[{
				xtype: 'numberfield',
				itemId: 'from',
				fieldLabel: 'From',
				name: 'from',
				step: 1	,
				value: values.from
			}, {
				xtype: 'numberfield',
				itemId: 'to',
				fieldLabel: 'To',
				name: 'to',
				step: 1,
				value: values.to
			}, {
				xtype: 'colorfield',
				itemId: 'color',
				name: 'color',
				fieldLabel: 'Color',
				value: color
			}, {
				xtype: 'combo',
				itemId: 'opacity',
				name: 'opacity',
				fieldLabel: 'Opacity',
				store: [[0.0, '100%'], [0.1, '90%'], [0.2, '80%'], [0.3, '70%'], [0.4, '60%'], [0.5, '50%'], [0.6, '40%'], [0.7, '30%'], [0.8, '20%'], [0.9, '10%'],[1.0, '0%']],
				queryMode: 'local',
				value: values.opacity || 0.1
			}]
		});
	}	
});