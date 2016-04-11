Ext.define('Metric.controller.Widget', {
    extend: 'Ext.app.Controller',
    models: ['DataDefinition'],
    stores: ['DataDefinitions'],
    views: [
		'dashboard.sheet.Sheet', 'dashboard.sheet.Settings','dashboard.widget.WidgetBox', 'dashboard.widget.Toolbox', 
		'dashboard.widget.button.Button', 'dashboard.widget.htmltext.HTMLText', 'dashboard.widget.image.Image', 
		'dashboard.widget.datatable.DataTable', 'dashboard.widget.chart.Chart'
	],	
	refs: [{
		ref: 'dashboard', selector: 'dashboard'
	}],
	init: function () {
        var me = this;
		me.listen({
			controller: {
				'*': {
					'generatedatafilters': 'getGeneratedDynamicDataFilters',
					'chartsettingsupdate': 'onDynamicDataWidgetSettingsUpdate',
					'generatepreviewchart' : 'getPreviewChart'
				}
			},
			component: {
				'sheet': {
					beforeadd: 'onBeforeAddWidget'					
				},
				'widgetbox': {
					render: 'onWidgetBoxRender',
					move: 'onWidgetBoxMoveResize'					
				},
				'widgettoolbox component[action=addwidget]': {
					click: 'onAddWidgetClick'
				},
				'widgetboxtools component': {
					click: 'onWidgetBoxToolClick'
				},
				'dynamicdatabox': {
					render: 'onDynamicDataBoxRender'
				},
				'buttonbox button[action=nextsheet]': {
					click: 'onPrevNextSheetButtonClick'
				},
				'buttonbox button[action=prevsheet]': {
					click: 'onPrevNextSheetButtonClick'
				},
				'buttonbox button[action=sheetlink]': {
					click: 'onOpenSheetButtonClick'
				},
				'buttonbox button[action=dashboardlink]': {
					click: 'onOpenDashboardButtonClick'
				},
				'buttonbox button[action=urllink]': {
					click: 'onOpenUrlButtonClick'
				}				
			}			
		});		
    },
	
	onBeforeAddWidget: function (sheet, widget) {
		sheet.registerWidget(widget);
		return true;
	},	
	onWidgetBoxRender: function (widget) {
		var sheet = widget.sheet,
			restoreCount = sheet.getWidgetCount(),
			editing = widget.getEditing(),
			dashboard;
		if (editing) {
			widget.enableWidgetBoxTools();
		}
		if (--restoreCount <= 0) {
			dashboard = sheet.getDashboard();
			dashboard.fireEvent('dashboardrestore', dashboard);
		}
		sheet.setWidgetCount(restoreCount);
	},
	onWidgetBoxMoveResize: function (widget) {
		var dashboard = widget.sheet.getDashboard(),
			dirty = dashboard.getDirty();			
		if (!dirty) {
			dashboard.fireEvent('markdirty', dashboard);
		}
	},	
	onDynamicDataBoxRender: function (widget) {
		try {
			if (!widget.getLoaded()) {
				var widgetSettings = widget.getWidgetSettings(),
					dataSettings = widgetSettings.dataSettings || false,
					definitionId, record;
				if (dataSettings) {
					definitionId = dataSettings.dataDefinition;
					record = this.getDataDefinitionsStore().getById(definitionId);				
					widget.setLoading(true);					
					this.loadDynamicDataComponent(record, widget, dataSettings);
				}
			}
		} catch (e) {			
			widget.setLoading(false);
			Ext.MessageBox.alert('Error', 'There was an error preparing the configuration of the widget - ' + e.message);			
		}
	},
	onDynamicDataWidgetSettingsUpdate: function (widget, widgetSettings) {
		try {
			widget.setLoaded(false);
			widget.removeAll();
			var dataSettings = widgetSettings.dataSettings || false,
				definitionId, record;
			if (dataSettings) {
				definitionId = dataSettings.dataDefinition;
				record = this.getDataDefinitionsStore().getById(definitionId);				
				widget.setLoading(true);					
				this.loadDynamicDataComponent(record, widget, dataSettings);			
			}
		} catch (e) {			
			widget.setLoading(false);
			Ext.MessageBox.alert('Error', 'There was an error preparing the configuration of the widget - ' + e.message);			
		}
	},
	onAddWidgetClick: function (button) {
		try {
			var dashboard = button.up('window').getDashboard(),
				sheet = dashboard.getActiveTab(),
				config = Ext.apply({}, {
					editing: true
				}, button.widgetCfg);
			
			sheet.add(Ext.create('widget.' + config.type, config));
			dashboard.fireEvent('markdirty', dashboard);
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was a problem adding the selected widget');
		}		
	},
	onWidgetBoxToolClick: function (button) {
		try {
			var action = button.action,
				widget = button.up('toolbar').getWidget(),
				sheet = widget.sheet,
				dashboard = sheet.getDashboard();
			if (action) {
				switch (action) {
					case 'edit':
						this.showWidgetSettings(widget);
						break;
					case 'toFront':					
						sheet.bringWidgetToFront(widget);					
						break;
					case 'toBack':					
						sheet.sendWidgetToBack(widget);					
						break;
					case 'copy':
						this.cutCopyWidget(dashboard, widget, false);
						break
					case 'cut':
						this.cutCopyWidget(dashboard, widget, true);					
						break;
					case 'resize':
						this.resizeWidget(widget, button.dimensions);
						break;
					case 'visible':
						this.toggleWidgetVisibility(widget, button);
						break;
					case 'close':
						Ext.MessageBox.confirm('Confirm', 'Are you sure you wish to remove the widget?', function (answer) {
							if (answer === "yes") {
								widget.destroy();
							}
						}, this);					
						break;
					default:
					 break;
				}
				dashboard.fireEvent('markdirty', dashboard);
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was a problem performing the requested operation');
		}
	},
	
	onPrevNextSheetButtonClick: function (button) {
		try {
			var widget = button.up('widgetbox'),
				sheet = widget.sheet,
				dashboard = sheet.getDashboard(),
				layout = dashboard.getLayout(),
				action = button.action,
				comp;
			if (action === 'nextsheet') {
				comp = layout.getNext();
			} else {
				comp = layout.getPrev();
			}
			if (comp) {
				layout.setActiveItem(comp);
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the action - ' + e.message);	
		}
	},
	onOpenSheetButtonClick: function (button) {
		try {
			var config = button.linkCfg,
				sheetId = config.sheetLink,
				widget = button.up('widgetbox'),
				sheet = widget.sheet,
				dashboard = sheet.getDashboard();
			
			dashboard.getLayout().setActiveItem(sheetId);			
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the action - ' + e.message);
		}		
	},
	onOpenDashboardButtonClick: function (button) {
		var config = button.linkCfg,
			dashboardId = config.dashboardLink;
		this.fireEvent('opendashboard', dashboardId);
	},
	onOpenUrlButtonClick: function (button) {
		try {
			var config = button.linkCfg,
				url = config.urlLink;
			window.open(url);
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the action - ' + e.message);	
		}
	},
	
	getGeneratedDynamicDataFilters: function (dataFilters, records, result) {
		result = result || {};
		result.filters = this.generateDynamicDataFilters(dataFilters, records);
	},
	generateDynamicDataFilters: function (dataFilters, records) {		
		var filters = [];
			
		Ext.each(dataFilters, function (filter) {
			var property = filter.dataIndex,
				value = filter.value,
				type = filter.type,
				operand = filter.comparison,
				fn = {
					property: property,
					value: value
				};					
			if (operand) {
				fn = function (item) {
					var a = item.get(property),
						b = value,
						date = Ext.Date;
					if (type === 'date') {
						a = date.clearTime(a, true).getTime();
						b = date.parse(b, 'm/d/Y');
						b = date.clearTime(b, true).getTime();
					} 
					if (operand === 'lt') {
						return a < b;
					} else if (operand === 'gt') {
						return a > b;
					} else {
						return a == b;
					}
				}
			}
			filters.push(fn);
		});
		if (!Ext.isEmpty(records)) {
			filters.push(function (item) {
				var id = item.get('ID');
				/*
				if (Ext.isEmpty(records)) {
					return true;
				}
				*/
				return (Ext.Array.indexOf(records, id) === -1) ? false : true;
			});
		}		
		return filters;
	},
	getPreviewChart: function (settings) {
		try {
			var dataSettings = settings.dataSettings || false,
				definitionId, record;
			if (dataSettings) {
				definitionId = dataSettings.dataDefinition;
				record = this.getDataDefinitionsStore().getById(definitionId),
				widget = Ext.widget('preview', {
					widgetSettings: settings
				});
				this.loadDynamicDataComponent(record, widget, dataSettings);		
			}
		} catch (e) {			
			Ext.MessageBox.alert('Error', 'There was an error preparing the configuration for the preview - ' + e.message);	
		}
	},
	loadDynamicDataComponent: function (record, widget, dataSettings) {
		var dataType = (record ? record.get('DefinitionType') : ''),
			widgetType = widget.getType(),
			records = dataSettings.records || [],
			dataFilters = dataSettings.filters || [],
			sorters = dataSettings.sorters || [],
			filters = this.generateDynamicDataFilters(dataFilters, records),
			spConfigs = {
				chartbox: {
					event: 'getspdatadetailsstore',
					options: {
						callback: Ext.bind(this.generateChart, this, [widget], true),
						scope: this,
						config: {
							filters: filters,
							filterOnLoad: true,
							sorters: sorters
						}
					}
				},
				datatablebox: {
					event: 'getspdatadetailsgrid',
					options: {
						callback: Ext.bind(this.generateDataTable, this, [widget], true),
						scope: this,
						gridCfg: {
							closable: false								
						},
						storeCfg: {
							filters: filters,
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
	},
	generateChart: function (fields, store, widget) {
		var widgetSettings = widget.getWidgetSettings(),			
			chartType = widgetSettings.chartType,
			seriesMode = widgetSettings.mode || 'row',
			categoryColumn = widgetSettings.categoryColumn,
			columns = widgetSettings.columns,
			dataColumns = Ext.Array.from(columns, true),
			chartStoreData = [],
			chartStoreFields = Ext.Array.push(categoryColumn, columns),
			headerCollection = new Ext.util.MixedCollection(),			
			fl = fields.length,
			i = 0,
			chartStore, chart;		
		
		for (i; i < fl; i++) {
			headerCollection.add(fields[i].dataIndex, fields[i].name);
		}		
		
		store.load({
			scope: this,
			callback: function (records, operations, success) {
				try {
					// Need to also check for Pie Chart type because it needs to only return 2 store fields (category, series column).  if multiple series column names
					// are returned then the chart will rendered in a very abstract art type of way
					if (seriesMode !== 'row') {						
						/*
							List Entries =	  A     B
											Test1	10
											Test2	20
											Test3	30
							
							chartStoreFields = [A, Test1, Test2, Test3]
							chartStoreData = [[B, 10, 20 ,30]]					
							chartStoreFields = iterate each record and get "Category" field
							chartStoreData = iterate each Columns field and using that field name iterate each record and get that field value
							
							Category = A
							Columns = [B]
						*/
						
						Ext.Array.each(columns, function (field) {
							var data = [];
							data.push(headerCollection.get(field));
							store.each(function (record) {													
								var value = record.get(field);
								if (Ext.isDate(value)){
									value = Ext.Date.format(value, 'm/d/Y')
								} else {
									value = isNaN(value) ? value : parseFloat(value);						
								}
								data.push(value);			
							});
							chartStoreData.push(data);
						}, this);
						headers = [categoryColumn];
						store.each(function (record) {
							var value = record.get(categoryColumn);
							if (Ext.isDate(value)) {
								value = Ext.Date.format(value, 'm/d/Y');
							}
							headers.push(value);
						}, this);
						hl = headers.length;
						
						chartStoreFields = [];
						dataColumns = [];
						headerCollection.removeAll();
						for (i = 0; i < hl; i++) {
							headerCollection.add(headers[i], headers[i])
							chartStoreFields.push(headers[i]);
							if (i !== 0) {
								dataColumns.push(headers[i]);
							}
						}
					} else {
						store.each(function (record) {
							var data = [];
							Ext.Array.each(chartStoreFields, function (field) {
								var value = record.get(field);
								if (Ext.isDate(value)){
									value = Ext.Date.format(value, 'm/d/Y')
								} else {
									value = isNaN(value) ? value : parseFloat(value);						
								}
								data.push(value);
							});
							chartStoreData.push(data);
						}, this);
					}
					chartStore = Ext.create('Ext.data.ArrayStore', {
						autoDestroy: true,
						fields: chartStoreFields,
						data: chartStoreData
					});
					chart = Ext.create('widget.' + chartType, {
						widgetSettings: widgetSettings,
						store: chartStore,
						headers: headerCollection,
						dataColumns: dataColumns
					});
					widget.add(chart);
					widget.setLoaded(true);
					widget.setLoading(false);
				} catch (e) {
					Ext.MessageBox.alert('Error', 'There was an error processing the chart widget configuration');
				}
			}
		});		
	},	
	generateDataTable: function (grid, widget) {
		var widgetSettings = widget.getWidgetSettings(),
			title = widgetSettings.title || '';
		if (grid) {
			grid.setTitle(title);
			widget.add(grid);
			grid.getStore().load();
			widget.setLoaded(true);
			widget.setLoading(false);
		}
	},
	cutCopyWidget: function (dashboard, widget, remove) {
		var clipboard = dashboard.getClipboard(),
			settings = widget.getSaveConfiguration();			
		
		dashboard.setClipboard(settings);
		dashboard.setCutOperation(remove);
		if (remove) {
			widget.destroy()
		}
	},
	showWidgetSettings: function (widget) {
		var type = widget.getType(),
			settings = Ext.create('widget.' + type + 'settings', {
				widget: widget
			});
		settings.show()
	},	
	toggleWidgetVisibility: function (widget, button) {
		var viewable = widget.getViewable();
		widget.setViewable(!viewable);
		button.setIconCls(viewable ? 'icon-hidden' : 'icon-visible');
	},
	resizeWidget: function (widget, dimensions) {
		if (dimensions) {
			widget.setSize(dimensions);
		} else {
			var currentWidth = widget.getWidth(),
				currentHeight = widget.getHeight(),
				win = Ext.create('Ext.window.Window', {				
					title:'Set custom size', 
					bodyPadding:15, 
					modal:true,
					items:[{
						xtype: 'form',
						defaults:{anchor:'100%'},
						items: [{
							xtype: 'numberfield',
							fieldLabel: 'Width',
							name: 'width',
							minValue: 20, 							
							value: currentWidth,
							allowBlank: false
						}, {
							xtype: 'numberfield',
							fieldLabel: 'Height',
							name: 'height',
							minValue: 20, 							
							value: currentHeight,
							allowBlank: false
						}]
					}],
					buttons:[{
						text:'Cancel',
						handler: function (){
							win.close();
						}
					}, {
						text:'Apply',					
						handler: function (button){
							var form = win.down('form'),
								values = form.getValues(false, false, false, true);
							if (form.isValid()) {
								widget.setSize(values);
								win.close();
							}
						}
					}]
				});
			win.show();
		}
	}
});