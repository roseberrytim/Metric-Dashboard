Ext.define('Metric.controller.DataDetails', {
	extend: 'Ext.app.Controller',
	models: ['DataDefinition'],
	stores: ['DataDefinitions'],
	views: ['data.ListView', 'data.Details', 'data.Settings'],
	refs: [{
		ref: 'viewport', selector: 'viewport'
	}, {
		ref: 'mainContainer', selector: 'navigationcontainer #mainContainer'
	}, {
		ref: 'selector', selector: 'datalistview'
	}, {
		ref: 'configButton', selector: 'navigationheader button[action=configure]'
	}],	
	init: function () {
		var me = this;
		me.listen({
			store: {
				'#DataDefinitions': {
					update: 'onDataDefinitionAddEdit'
				}
			},
			controller: {
				'*': {
					'getspdatadetailsstore': 'getSPDataDetailsStore',
					'getspdatadetailsgrid': 'getSPDataDetailsGrid'					
				},
				'#Navigation': {
					configuredata: 'onConfigureDataClick',
					adddata: 'onAddDataClick'
				}
			},
			component: {				
				'datadetails': {
					close: 'onDetailsPanelClose'
				},
				'datalistview': {
					itemclick: 'onDataSelect',
					beforecontainerclick: 'onDataListViewClick'
				},
				'datasettings button[action=delete]': {
					click: 'onDataSettingsDelete'
				},
				'datasettings button[action=save]': {
					click: 'onDataSettingsSave'
				}
			}			
		});   
	},
	createSharePointStoreFromDefinition: function (record, fields, config) {
		config = config || {};
		var list = record.get('SPListName'),
			view = record.get('View'),
			url = record.get('Url'),
			model = this.createSharePointModelDefinition(list, fields);
		config = Ext.apply(config, {
			autoDestroy: true,
			model: model,
			proxy: {
				type: 'splistsoap',
				baseSiteUrl: url,
				extraParams: {
					listName: list,
					viewName: view,
					rowLimit: '0'
				}
			}
		});
		return Ext.create('Ext.data.Store', config);
	},
	createSharePointModelDefinition: function (title, viewFields) {
		var modelSeed = ++Metric.config.Globals.modelSeed,
			fields = [],
			i = 0,
			fl = viewFields.length,
			field, dataIndex, fieldType, decimals, countRelated;
		
		title = title + modelSeed;
		
		for (i; i < fl; i++) {
			field = viewFields[i];			
			fieldType = field.type;
			dataIndex = field.dataIndex;
			decimals = field.decimals;
			countRelated = field.countRelated;
			
			if (fieldType === 'DateTime') {
				fields.push({
					name: dataIndex,
					mapping: '@ows_' + dataIndex,
					type: 'date',
					dateFormat: 'Y-m-d H:i:s'
				});
			} else if (fieldType === 'Number' || fieldType === 'Currency') {				
				fields.push({
					name: dataIndex,
					mapping: '@ows_' + dataIndex,
					type: 'number'
				});
			} else if (fieldType === 'Calculated') {
				calculationType = field.calcType || false;
				if (calculationType === 'DateTime') {						
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'spcalcdate'							
					});
				} else if (calculationType === 'Number' || calculationType === 'Currency') {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'spcalcnumber'
					});
				} else if (calculationType === 'Boolean') {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'spcalcbool'
					});
				} else if (calculationType === 'Text') {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'spcalctext'
					});
				} else {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex
					});
				}					
			} else if (fieldType === 'Lookup' || fieldType === 'User') {
				if (countRelated) {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'spcalcnumber'
					});
				} else {
					fields.push({
						name: dataIndex,
						mapping: '@ows_' + dataIndex,
						type: 'splookup'
					});
				}
			} else {
				fields.push({
					name: dataIndex,
					mapping: '@ows_' + dataIndex
				});
			}
		}
		
		return this.modelFactory(title, fields, 'ID');
	},	
	modelFactory: function (title, fields, idProperty) {
		title = title.replace(/\s+/g, ' ');
		
		return Ext.define('Metric.model.' + title, {
			extend: 'Ext.data.Model',
			idProperty: idProperty,
			fields: fields
		});
	},	
	getSPListViewData: function (record, callback) {
		var spList = record.get('SPListName'),			
			view = record.get('View'),
			baseSiteUrl;
		
		if (!spList) {
			Ext.Error.raise({
				msg: 'Required configuration value is missing for SharePoint List',
				option: spList,
				'error code': 101
			});
		}
		baseSiteUrl = record.get('Url');
		Sharepoint.data.WebServices.getListAndView(baseSiteUrl, spList, view, this, callback);
	},
	getSPDataDetailsGrid: function (record, options) {
		this.getSPListViewData(record, function (o, success, viewXml) {
			var gridConfig = options.gridCfg || {},
				storeConfig = options.storeCfg || {},
				dataGrid = this.getSharePointDataGrid(record, viewXml, gridConfig, storeConfig),
				scope = options.scope || this;
			
			if (Ext.isFunction(options)) {
				Ext.callback(options, scope, [dataGrid]);
			}
			if (options.callback) {			
				Ext.callback(options.callback, scope, [dataGrid]);
			}			
		});
	},
	getSPDataDetailsStore: function (record, options) {
		this.getSPListViewData(record, function (o, success, viewXml) {
			try {							
				var fields = this.getViewFieldsFromXML(viewXml),
					scope = options.scope || this,
					config = options.config || {},
					store;
				if (fields.length > 0) {
					store = this.createSharePointStoreFromDefinition(record, fields, config);					
					
					if (Ext.isFunction(options)) {
						Ext.callback(options, scope, [fields, store]);
					}
					if (options.callback) {			
						Ext.callback(options.callback, scope, [fields, store]);
					}	
				}
			} catch (e) {
				Ext.MessageBox.alert('Error', 'There was an error processing the request - ' + e.message);			
			}
		});
	},
	getSharePointDataGrid: function (record, viewXml, gridConfig, storeConfig) {
		try {						
			var fields = this.getViewFieldsFromXML(viewXml),
				store, details;
			if (fields.length > 0) {
				store = this.createSharePointStoreFromDefinition(record, fields, storeConfig);
				Ext.apply(gridConfig, {
					fields: fields,					
					record: record,
					store: store,
					type: 'SharePointList'
				});
				details = Ext.create('Metric.view.data.Details', gridConfig);
			}
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error processing the request - ' + e.message);			
		} finally {
			return details;
		}
	},
	
	getViewFieldsFromXML: function (viewXml) {		
		var viewFields = viewXml.responseXML.getElementsByTagName('ViewFields')[0],
			i = 0,
			fields = [],
			idPresent = false,
			fl, field, fieldName, fieldDefinition, details;
		if (!viewFields) {					
			Ext.Error.raise({
				msg: 'Configured SharePoint view contains no fields',
				option: viewXml,
				'error code': 102
			});
		}			
		fl = viewFields.childNodes.length;									
		for (i; i < fl; i++) {
			field = viewFields.childNodes[i];
			fieldName = field.getAttribute('Name');
			if (fieldName === 'ID') {
				idPresent = true;
			}
			fieldDefinition = Ext.query('Field[Name="' + fieldName + '"]', viewXml.responseXML)[0];
			if (!fieldDefinition) {
				Ext.Error.raise({
					msg: 'Error retrieving the list field definition',
					option: fieldName,
					'error code': 103
				});
			}
			fields.push(Ext.apply({}, {
				name:  fieldDefinition.getAttribute('DisplayName'),
				dataIndex: fieldDefinition.getAttribute('Name'),
				decimals: Ext.Number.from(fieldDefinition.getAttribute('Decimals'), 0),
				calcType: fieldDefinition.getAttribute('ResultType'),
				type: fieldDefinition.getAttribute('Type'),
				countRelated: fieldDefinition.getAttribute('CountRelated') || false
			}));			
		}
		if (!idPresent) {
			Ext.Array.insert(fields, 0, [{
				name: 'ID',
				dataIndex: 'ID',
				decimals: 0,
				calcType: null,
				type: 'Computed'
			}]);
		}
		return fields;
	},
	
	generateDataDetails: function (record) {		
		try {
			var	mainContainer = this.getMainContainer(),
				configButton = this.getConfigButton(),				
				title = record.get('Title'),
				dataType = record.get('DefinitionType'),
				allowEdit = this.getController('Navigation').allowToEdit(record),
				config;
			
			configButton.setVisible(allowEdit);
			
			switch (dataType) {
				case 'SharePointList':					
					config = {
						title: title						
					}
					this.getSPDataDetailsGrid(record, {
						gridCfg: config, 						
						scope: this,
						callback: function (grid) {
							if (grid) {						
								mainContainer.removeAll();
								mainContainer.add(grid);
								grid.getStore().load();	
							} else {
								this.showBlankDataDefinition(record);
							}
						}
					});					
					break;
				default: 					
					Ext.Error.raise({
						msg: 'Data type not supported',
						option: dataType,
						'error code': 100
					});
					break;
			}
		} catch (e) {
			this.showBlankDataDefinition(record);
			Ext.MessageBox.alert('Error', 'There was an error processing the request - ' + e.message);			
		}
	},
	showBlankDataDefinition: function (record) {
		var mainContainer = this.getMainContainer(),
			title = record.get('Title');
		mainContainer.removeAll();
		mainContainer.add({
			xtype: 'datadetails',
			title: title,
			record: record
		});
	},
	resetNavigation: function () {		
		var navController = this.getController('Navigation'),
			selector = this.getSelector();
		
		selector.getSelectionModel().deselectAll();
		navController.resetNavigation();		
	},
	
	
	onDataDefinitionAddEdit: function (store, record, operation, fields) {		
		if (operation === 'commit') {
			var selector = this.getSelector();				
			selector.getSelectionModel().select(record);
			this.generateDataDetails(record);
		}		
	},
	onConfigureDataClick: function (active) {
		var record = active.getRecord(),
			settingsWindow = Ext.create('Metric.view.data.Settings', {
				title: 'Settings - ' + record.get('Title'),
				editing: true
			});		
		settingsWindow.down('#settingsForm').loadRecord(record);		
		settingsWindow.show();
	},
	onAddDataClick: function () {
		var settingsWindow = Ext.create('Metric.view.data.Settings', {
			title: 'New Data Definition'
		});
		settingsWindow.show();
	},
	onDataSettingsDelete: function (button) {
		var definitions = this.getDataDefinitionsStore(),
			settingsWindow = button.up('window'),
			record = settingsWindow.down('#settingsForm').getRecord();
		Ext.MessageBox.confirm('Confirm Removal', 'Are you sure you want to remove the selected Data Definition?', function (answer) {
			if (answer === "yes") {				
				definitions.remove(record);
				this.resetNavigation();
				settingsWindow.close();
			}
		}, this);
	},
	onDataSettingsSave: function (button) {		
		var settingsWindow = button.up('window'),			
			form = settingsWindow.down('#settingsForm'),
			values = form.getValues(),
			record = form.getRecord(),
			settings, me;
		if (record) {
			form.updateRecord(record);			
		} else {
			me = Metric.config.Globals.currentUserUpdateValue || "";
			Ext.apply(values, {
				Owner: me
			});
			this.getDataDefinitionsStore().add(values);
		}
		settingsWindow.close();
	},
	onDetailsPanelClose: function () {
		this.resetNavigation();
	},
	onDataSelect: function (view, record) {
		this.generateDataDetails(record);
	},
	onDataListViewClick: function () {
		return false;
	}
});