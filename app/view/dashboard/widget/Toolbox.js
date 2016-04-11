Ext.define('Metric.view.dashboard.widget.Toolbox', {
	extend: 'Ext.window.Window',
	alias: 'widget.widgettoolbox',
	title: 'Widgets',
	config: {
		dashboard: null
	},
	layout: {
		type: 'vbox',
		align: 'center',
		padding: '5',
		defaultMargins: '5 0 0 0'
	},
	x: 10,
	y: 100,
	width: 72,
	closable: false,
	autoHeight: true,
	constrain: true,
	defaultType: 'button',
	defaults: {
		ui: 'default-toolbar',
		scale: 'large'
	},
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		Ext.apply(this, {
			items: [{
				iconCls: 'icon-widget-chart',			
				arrowCls: '',				
				tooltip: 'Add Chart Widget',
				menu: [{
					text: 'Area',					
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'areachart'
						}
					}
				}, {
					text: 'Bar',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'barchart'
						}
					}
				}, {
					text: 'Column',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'columnchart'
						}
					}
				}, {
					text: 'Gauge',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'gaugechart'
						}
					}
				}, {
					text: 'Histogram',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'histogramchart'
						}
					}
				}, {
					text: 'Line',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'linechart'
						}
					}
				}, {
					text: 'Pie',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'piechart'
						}
					}
				}, {
					text: 'Radar',
					action: 'addwidget',
					widgetCfg: {
						type: 'chartbox',
						widgetSettings: {
							chartType: 'radarchart'
						}
					}
				}]
			}, {							
				widgetCfg: {
					type: 'buttonbox'
				},					
				action: 'addwidget',
				iconCls: 'icon-widget-button',			
				tooltip: 'Add Button Widget'				
			}, {							
				widgetCfg: {
					type: 'imagebox'
				},
				action: 'addwidget',
				iconCls: 'icon-widget-image',			
				tooltip: 'Add Image Widget'
			}, {							
				widgetCfg: {
					type: 'htmltextbox'
				},
				action: 'addwidget',
				iconCls: 'icon-widget-htmltext',			
				tooltip: 'Add HTML/Text Widget'
			}, {							
				widgetCfg: {
					type: 'datatablebox'
				},
				action: 'addwidget',
				iconCls: 'icon-widget-datatable',			
				tooltip: 'Add DataTable Widget'
			}]
			/*
			items: [{
				text: 'Overlay',
				action: 'overlay',
				width: 100,				
				tooltip: 'Add Visual Aid Overlay',
				scale: 'medium',
				toggleGroup: 'widgetOverlay'
			}, {
				xtype: 'button',
				iconCls: 'icon-save',
				tooltip: 'Save Dashboard',
				scale: 'large'
			},  {
				xtype: 'button',
				iconCls: 'icon-settings',
				tooltip: 'Configure Dashboard',
				scale: 'large'
			}, '-',{
				xtype: 'button',
				iconCls: 'icon-widget-chart',			
				arrowCls: '',
				scale: 'large',			
				tooltip: 'Add Chart Widget',
				menu: [{
					text: 'Area',
					itemId: 'areachart'
				}, {
					text: 'Bar',
					itemId: 'barchart'
				}, {
					text: 'Column',
					itemId: 'columnchart'
				}, {
					text: 'Gauge',
					itemId: 'gaugechart'
				}, {
					text: 'Histogram',
					itemId: 'histogramchart'
				}, {
					text: 'Line',
					itemId: 'linechart'
				}, {
					text: 'Pie',
					itemId: 'piechart'
				}, {
					text: 'Radar',
					itemId: 'radarchart'
				}, {
					text: 'Scatter',
					itemId: 'scatterchart'
				}]
			}, {			
				xtype: 'button',
				iconCls: 'icon-widget-button',			
				tooltip: 'Add Button Widget',
				scale: 'large',			
				handler: function () {
					var sheet = dashboard.getActiveTab();
					var widget = Ext.create('WidgetBox', {
						x: 100,
						y: 100,						
						layout: {
							type: 'vbox',
							align: 'stretch'						
						},
						items: [{
							xtype: 'button',
							itemId: 'buttonWidget',
							disabled: true,
							flex: 1,
							text:  'Not Configured',
							action: 'nothing',
							linkCfg:  {},
							iconCls:  '',
							handler: function () {
								Ext.MessageBox.alert('Test', 'Hello Tester');
							}
						}]                        
					});
					
					sheet.add(widget);
					applyEditToolbar(widget);
				}
			}, {			
				xtype: 'button',
				iconCls: 'icon-widget-image',			
				tooltip: 'Add Image Widget',
				scale: 'large',			
				handler: function () {
					var sheet = dashboard.getActiveTab();
					var url = Ext.String.format("background: url({0}) no-repeat center center; background-size: cover;filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{0}', sizingMethod='scale');-ms-filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{0}', sizingMethod='scale')';", 'resources/images/default.png');
					var widget = Ext.create('WidgetBox', {
						x: 200,
						y: 100,
						layout: 'fit',
						items: [{
							xtype: 'container',						
							style: url
						}]
					});
					sheet.add(widget);
					applyEditToolbar(widget);
				}
			}, {			
				xtype: 'button',
				iconCls: 'icon-widget-htmltext',			
				tooltip: 'Add HTML/Text Widget',
				scale: 'large',			
				handler: function () {
					var sheet = dashboard.getActiveTab();
					var widget = Ext.create('WidgetBox', {
						x: 300,
						y: 100,
						layout: 'fit',
						items: [{
							xtype: 'component',
							autoEl: {
								bodyStyle: 'background:transparent;',
								html: 'Widget is not configured'
							}
						}]
					});
					sheet.add(widget);
					applyEditToolbar(widget);
				}
			}, {			
				xtype: 'button',
				iconCls: 'icon-widget-datatable',			
				tooltip: 'Add DataTable Widget',
				scale: 'large'			
			}]
			*/
		});
		this.callParent();
	}
});