﻿/*global Ext, Metric*/
Ext.define('Metric.controller.Dashboard', {
    extend: 'Ext.app.Controller',
    models: ['Dashboard'],
    stores: ['Dashboards'],
    views: ['dashboard.Viewer', 'dashboard.Dashboard'],	
	refs: [{
		ref: 'viewport', selector: 'viewport'
	}, {
		ref: 'dashboardTitle', selector: 'viewer #dashboardTitle'
	}, {
		ref: 'viewer', selector: 'viewer'
	}, {
		ref: 'dashboard', selector: 'viewer dashboard'
	}, {
		ref: 'zoomSlider', selector: 'viewer #zoomFactor'
	}, {
		ref: 'saveDashboardButton', selector: 'viewer button[action=save]'
	}],
	init: function () {
        var me = this;
		me.listen({
			controller: {
				'*': {
					opendashboard: 'onOpenDashboard'					
				}
			},
			component: {				
				'viewer': {
					render: 'onViewerRender',
					titleclick: 'onDashboardTitleClick'
				},
				'viewer #zoomFactor': {
					changecomplete: 'onZoomFactorChange'
				},
				'viewer button[action=home]': {
					click: 'onBackToDetails'
				},
				'viewer button[action=config]': {
					click: 'onViewerConfigClick'
				},
				'viewer button[action=info]': {
					click: 'onViewerInfoClick'
				},
				'viewer button[action=save]': {
					click: 'onViewerSaveClick'
				},
				'dashboard': {
					beforeremove: 'onDashboardSheetRemove',
					closemenuclick: 'onSheetContextMenuClick',
					settingsmenuclick: 'onSheetContextMenuClick',
					sheettabcontextmenu: 'onSheetTabContextMenu',
					dashboardrestore: 'onDashboardRestore',
					markdirty: 'onDashboardMarkDirty',
					settingssave: 'onDashboardSettingsSave',
					tabchange: 'onDashboardSheetChange'
				},
				'dashboard #addSheetButton': {
					click: 'onAddSheetButtonClick'
				},
				'sheet': {
					render: 'restoreSheetWidgets',
					sheetcontextmenu: 'onSheetContextMenu',
					settingsupdate: 'onSheetSettingsUpdate',
					titlechange: 'onSheetTitleChange'
				},
				'sheetsettings button[action=save]': {
					click: 'onSheetSettingsSave'
				}			
			}			
		});		
    },
	
	onZoomFactorChange: function (slider, value) {
		var factor = value / 100;
		
		var dashboard = this.getDashboard(),
			sheet = dashboard.getActiveTab(),
			widgets;
		if (sheet) {
			sheet.setZoomFactor(value);
			widgets = sheet.getWidgets();
			widgets.each(function (widget) {
				widget.scaleWidget(factor);
			});
		}
	},
	onViewerRender: function (viewer) {
		try {
			var record = viewer.getRecord(),
				editing = viewer.getEditing(),
				settings, sheets, sl, dashboard;
				
			if (record) {
				settings = Ext.decode(record.get('Settings'));
				sheets = settings.sheets || [];
				sl = sheets.length;
				
				viewer.setLoading(true);
				dashboard = Ext.create('Metric.view.dashboard.Dashboard', {
					flex: 1,
					record: record,
					settings: settings,
					restoring: true,
					editing: editing,
					sheetCount: sl
				});				
				viewer.add(dashboard);
				
				Ext.Function.defer(this.restoreSheets, 1000, this, [dashboard, sheets, editing]);
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was a problem reading the dashboard configuration');		
		}
	},
	onViewerSaveClick: function (button) {
		var viewer = button.up('viewer'),
			dashboard = viewer.down('dashboard');
		this.saveDashboard(dashboard);		
	},
	onViewerConfigClick: function (button) {
		var viewer = button.up('viewer'),
			dashboard = viewer.down('dashboard'),
			sheet, settings;
		if (dashboard) {
			sheet = dashboard.getActiveTab();
			this.showSheetSettings(sheet);			
		}
	},
	onViewerInfoClick: function (button) {
		var record = button.up('viewer').getRecord(),
			notes;
		if (record) {
			notes = record.get('Notes');
		}
		
		// need to show window that allow user to see information about the dashboard
		// as well as to submit new feedback/bug/comment
		
		
	},
	onBackToDetails: function (button) {
		var viewer = button.up('viewer'),
			dashboard = viewer.down('dashboard'),
			editing = dashboard.getEditing(),
			isDirty = dashboard.getDirty();		
		if (editing && isDirty) {
			Ext.MessageBox.show({
				title:'Save Changes?',
				msg: 'You are closing a dashboard that has unsaved changes. Would you like to save your changes?',
				buttons: Ext.MessageBox.YESNOCANCEL,
				icon: Ext.MessageBox.QUESTION,
				scope: this,
				fn: function (buttonId) {
					if (buttonId === 'yes') {
						this.saveDashboard(dashboard);
					} else if (buttonId === 'no') {
						this.closeViewer(viewer);
					}
				}
			});
		} else {
			this.closeViewer(viewer);
		}
	},
	
	onDashboardMarkDirty: function (dashboard) {		
		var isDirty = dashboard.getDirty(),
			saveButton;
		if (!isDirty) {
			dashboard.setDirty(true);
			saveButton = this.getSaveDashboardButton();
			saveButton.setIconCls('icon-viewer-save-dirty');
		}
	},
	onDashboardSettingsSave: function (dashboard) {
		var saveButton = this.getSaveDashboardButton();
		dashboard.setDirty(false);
		saveButton.setIconCls('icon-viewer-save');
	},
	onDashboardRestore: function (dashboard) {
		var viewer = dashboard.up('viewer');
		dashboard.setRestoring(false);
		this.getViewer().setLoading(false);		
	},
	onDashboardTitleClick: function (viewer, title) {
		var currentTitle = title.text,
			dashboard;
		Ext.MessageBox.prompt('Enter Title', 'Please enter a title', function (btn, text) {
			if (btn === 'ok') {
				title.setText(text);
				dashboard = viewer.down('dashboard');
				dashboard.fireEvent('markdirty', dashboard);
			}
		}, this, false, currentTitle);
	},
	onDashboardSheetRemove: function (dashboard, sheet) {
		if (!sheet.allowClose) {
			Ext.MessageBox.confirm('Confirm', 'Are you sure you wish to remove the sheet - "' + sheet.title + '"', function (answer) {
				if (answer === "yes") {					
					sheet.allowClose = true;
					dashboard.remove(sheet);
					dashboard.fireEvent('markdirty', dashboard);
				}
			}, this);
			return false;
		}
	},
	onDashboardSheetChange: function (dashboard, newSheet, oldSheet) {
		if (oldSheet && !newSheet.getEditing()) {
			var zoomSlider = this.getZoomSlider(),
				zoom = newSheet.getZoomFactor();
			
			zoomSlider.setValue(zoom);
		}
	},	
	onOpenDashboard: function (dashboard) {
		var viewer = this.getViewer(),
			viewport = this.getViewport(),
			dashboardRecord = this.getDashboardsStore().getById(dashboard);			
		if (dashboardRecord) {
			if (viewer) {
				viewer.destroy();
			}
			viewport.add({
				xtype: 'viewer',
				record: dashboardRecord,
				editing: false
			});			
			viewport.getLayout().setActiveItem(1);
		}
	},
	
	onAddSheetButtonClick: function (button) {
		var dashboard = button.up('dashboard'),			
			sheet = Ext.create('Metric.view.dashboard.sheet.Sheet', {				
				editing: true,
				dashboard: dashboard				
			});
		dashboard.add(sheet);
		dashboard.fireEvent('markdirty', dashboard);
		sheet.show();		
	},
	onSheetTitleChange: function (sheet, newTitle, oldTitle) {
		var dashboard = sheet.getDashboard();
		dashboard.fireEvent('markdirty', dashboard);
	},
	onSheetTabContextMenu: function (event, target, dashboard) {
		var menu = dashboard.closeMenu,          
            tab = dashboard.tabBar.getChildByElement(target),
            index, sheet;
			
		if (!tab.disableCloseMenu) {
			index = dashboard.tabBar.items.indexOf(tab);
			sheet = dashboard.getComponent(index);
			menu.child('*[text="Close Sheet"]').setDisabled(!sheet.closable);			
			menu.currentSheet = sheet;			
			menu.showAt(event.getXY());
		}
	},
	onSheetContextMenu: function (event, target, sheet) {
		var dashboard = sheet.getDashboard(),
			menu = dashboard.settingsMenu,
			pasteable = Ext.Object.isEmpty(dashboard.getClipboard());
		if (menu) {
			menu.child('*[action=paste]').setDisabled(pasteable);
			menu.currentSheet = sheet;
			menu.showAt(event.getXY());			
		}
	},
	onSheetContextMenuClick: function (menu, item) {
		try {
			if (item) {
				var action = item.action,
					sheet = menu.currentSheet,
					dashboard = sheet.getDashboard(),
					tab, editor, coord, scroll;
					
				switch (action) {
					case 'close':
						if (sheet) {
							dashboard.remove(sheet);							
						}
						break;
					case 'rename':
						tab = sheet.tab,							
						editor = dashboard.tabTitleEditingPlugin; // assigned from TabTitleEdit Plugin
						if (editor) {
							editor.editFromMenu(tab, sheet);
						}
						break;
					case 'paste':
						this.pasteWidget(menu, dashboard, sheet);
						break;
					case 'settings':
						this.showSheetSettings(sheet);
						break;
					default:
						break;
				}
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was a problem adding the selected widget');
		}
	},	
	onSheetSettingsUpdate: function (sheet, settings) {
		var dashboard = sheet.getDashboard();
		dashboard.fireEvent('markdirty', dashboard);
	},
	onSheetSettingsSave: function (button) {
		var window = button.up('window'),
			form = window.down('form'),
			sheet = window.getSheet(),
			values;
		if (form.isValid()) {
			values = form.getValues();
			sheet.applySheetSettings(values);
			sheet.fireEvent('settingsupdate', sheet, values);
			window.close();
		}
	},
	
	saveDashboard: function (dashboard) {
		try {
			var me = this,			
				record = dashboard.getRecord(),
				config = {},
				sheets = dashboard.query('sheet'),
				sheetsCfg = [];
			
			Ext.Array.each(sheets, function (sheet) {				
				var settings = sheet.getSettings(),
					widgets = sheet.getWidgets(),
					widgetCfg = []
				widgets.each(function (widget) {
					widgetCfg.push(widget.getSaveConfiguration());
				});
				sheetsCfg.push(Ext.apply({}, {
					widgets: widgetCfg
				}, settings));				
			});
				
			Ext.apply(config, {
				sheets: sheetsCfg
			});
			config = Ext.encode(config);
			record.set('Settings', config);
			dashboard.fireEvent('settingssave', dashboard);
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error saving the configuration of the current dashboard - ' + e.message);
		}
	},
	closeViewer: function (viewer) {
		this.getViewport().getLayout().setActiveItem(0);
		viewer.destroy();
	},
	restoreSheetWidgets: function (sheet) {
		var dashboard = sheet.getDashboard(),
			config = sheet.getSettings(),
			editing = sheet.getEditing(),
			restoreCount = sheet.getWidgetCount(),
			widgets = config.widgets || [],
			restoring = false;
		Ext.each(widgets, function (widget) {
			var type = widget.type,
				viewable = widget.viewable,
				box;
			if (viewable || editing) {
				box = Ext.widget(type, Ext.apply(widget, {
					viewable: viewable,
					editing: editing
				}));
				if (box) {						
					sheet.add(box);					
					restoring = true;
				}
			} else {
				if (--restoreCount <= 0) {
					dashboard = sheet.getDashboard();
					dashboard.fireEvent('dashboardrestore', dashboard);
				}
				sheet.setWidgetCount(restoreCount);
			}
		});
		if (!restoring) {
			dashboard.fireEvent('dashboardrestore', dashboard);
		}
	},
	showSheetSettings: function (sheet) {
		if (sheet) {
			Ext.create('Metric.view.dashboard.sheet.Settings', {
				sheet: sheet
			});
		}
	},
	restoreSheets: function (dashboard, sheets, editing) {		
		if (Ext.isEmpty(sheets)) {
			dashboard.fireEvent('dashboardrestore', dashboard);
		} else {
			Ext.each(sheets, function (sheetCfg) {				
				var title = sheetCfg.title || 'Sheet',
					widgets = sheetCfg.widgets || [],
					wl = widgets.length,
					sheet = Ext.create('Metric.view.dashboard.sheet.Sheet', {
						title: sheetCfg.title || 'Sheet',
						dashboard: dashboard,
						settings: sheetCfg,
						editing: editing,						
						widgetCount: wl
					});
				dashboard.add(sheet);			
			}, this);
			dashboard.setActiveTab(0);
			if (editing && dashboard.editTools) {
				dashboard.editTools.show();
			}
		}
	},
	pasteWidget: function (menu, dashboard, sheet) {
		var clipboard = dashboard.getClipboard(),
			cutOperation = dashboard.getCutOperation(),
			coord = menu.getOffsetsTo(sheet),
			scroll = sheet.el.getScroll(),
			config;	
		
		config = Ext.apply({}, {
			x: coord[0] + scroll.left,
			y: coord[1] + scroll.top,
			editing: true
		}, clipboard);
			
		sheet.add(Ext.create('widget.' + config.type, config));
		dashboard.fireEvent('markdirty', dashboard);
		if (cutOperation) {
			dashboard.setClipboard({});
		}
	}
});