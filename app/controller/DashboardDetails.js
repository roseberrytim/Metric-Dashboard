/*global Ext, Metric*/
Ext.define('Metric.controller.DashboardDetails', {
    extend: 'Ext.app.Controller',
    models: ['Dashboard', 'Comment'],
    stores: ['Dashboards', 'Comments'],
    views: ['dashboard.Viewer', 'dashboard.ListView', 'dashboard.Details', 'dashboard.Settings'],	
	refs: [{
		ref: 'viewport', selector: 'viewport'
	}, {
		ref: 'mainContainer', selector: 'navigationcontainer #mainContainer'
	}, {
		ref: 'selector', selector: 'dashboardlistview'
	}, {
		ref: 'commentField', selector: 'comments #postContainer textfield'
	}, {
		ref: 'detailsPanel', selector: 'dashboarddetails'
	}, {
		ref: 'configButton', selector: 'navigationheader button[action=configure]'
	}],
	init: function () {
        var me = this;
		me.listen({
			store: {
				'#Dashboards': {
					update: 'onDashboardAddEdit'
				}
			},
			controller: {
				'#Navigation': {
					configuredashboard: 'onConfigureDashboardClick',
					adddashboard: 'onAddDashboardClick'
				}
			},
			component: {				
				'dashboarddetails': {
					close: 'onDetailsPanelClose'
				},
				'dashboardlistview': {
					itemclick: 'onDashboardSelect',
					beforecontainerclick: 'onDashboardListViewClick'
				},
				'dashboarddetails #postContainer button[action=postComment]': {
					click: 'onPostCommentClick'
				},
				'comments #comments': {
					refresh: 'onCommentsViewRefresh'
				},
				'dashboarddetails actionbutton': {
					actionbuttonclick: 'onDashboardActionButtonClick'
				},
				'dashboardsettings button[action=delete]': {
					click: 'onDashboardSettingsDelete'
				},
				'dashboardsettings button[action=save]': {
					click: 'onDashboardSettingsSave'
				}
			}			
		});		
    },
	allowToEdit: function (record) {
		var author = record.get('Author'),
			me = Metric.config.Globals.currentUserDisplayName;
			
		return author === me ? true : false;
	},
	showDashboardDetails: function (record) {		
		var mainContainer = this.getMainContainer(),
			configButton = this.getConfigButton(),			
			commentsStore = this.getCommentsStore(),
			dashboardID = record.get('ID'),
			dashboard = record.get('Title'),			
			queryString = Ext.String.format('<Query><Where><Eq><FieldRef Name="Dashboard"/><Value Type="Lookup">{0}</Value></Eq></Where></Query>', dashboardID),			
			details, allowEdit;
		
		allowEdit = this.getController('Navigation').allowToEdit(record);		
		
		details = Ext.create('Metric.view.dashboard.Details', {
			title: dashboard,
			record: record,
			allowEdit: allowEdit 
		});
		
		mainContainer.removeAll();
		mainContainer.add(details);
				
		commentsStore.load({
			params: {
				query: queryString
			}
		});		
		configButton.setVisible(allowEdit);
	},
	resetNavigation: function () {
		var navController = this.getController('Navigation'),
			selector = this.getSelector();
		
		selector.getSelectionModel().deselectAll();
		navController.resetNavigation();		
	},
	onDashboardAddEdit: function (store, record, operation, fields) {		
		if (operation === 'commit') {
			if (Ext.Array.indexOf(fields, 'Settings') === -1) {
				var selector = this.getSelector();				
				selector.getSelectionModel().select(record);
				this.showDashboardDetails(record);
			}
		}		
	},
	onDetailsPanelClose: function () {
		this.resetNavigation();
	},
	onDashboardSelect: function (view, record) {
		this.showDashboardDetails(record);
	},
	onAddDashboardClick: function () {
		var settingsWindow = Ext.create('Metric.view.dashboard.Settings', {
			title: 'New Dashboard'
		});
		settingsWindow.show();
	},
	onConfigureDashboardClick: function (active) {
		var record = active.getRecord(),
			settingsWindow = Ext.create('Metric.view.dashboard.Settings', {
				title: 'Settings - ' + record.get('Title'),
				editing: true
			});		
		settingsWindow.down('#settingsForm').loadRecord(record);		
		settingsWindow.show();
	},
	onDashboardSettingsDelete: function (button) {
		var dashboards = this.getDashboardsStore(),
			settingsWindow = button.up('window'),
			record = settingsWindow.down('#settingsForm').getRecord();
		Ext.MessageBox.confirm('Confirm Removal', 'Are you sure you want to remove the selected dashboard?', function (answer) {
			if (answer === "yes") {
				this.getCommentsStore().removeAll();
				dashboards.remove(record);
				this.resetNavigation();
				settingsWindow.close();
			}
		}, this);
	},
	onDashboardSettingsSave: function (button) {		
		var settingsWindow = button.up('window'),			
			form = settingsWindow.down('#settingsForm'),
			values = form.getValues(),
			record = form.getRecord(),
			settings, templateField, template, templateRecord, me;
		if (record) {
			form.updateRecord(record);			
		} else {
			templateField = form.down('#dashboardTemplate');
			template = templateField.getValue();
		
			if (template) {
				templateRecord = templateField.findRecordByValue(template);
				if (templateRecord) {
					settings = templateRecord.get('Settings');		
				}
			} else {
				settings = Ext.encode(Metric.config.Globals.defaultDashboardConfig);
			}
			
			me = Metric.config.Globals.currentUserUpdateValue || "";
			Ext.apply(values, {
				Owner: me,
				Settings: settings
			});			
			this.getDashboardsStore().add(values);
		}
		settingsWindow.close();
	},
	onDashboardListViewClick: function () {
		return false;
	},
	onDashboardActionButtonClick: function (button) {
		var detailsPanel = this.getDetailsPanel(),
			dashboardRecord = detailsPanel.getRecord(),
			viewPort = this.getViewport();
			
		viewPort.add({
			xtype: 'viewer',
			record: dashboardRecord,
			editing: button.allowEdit
		});
		viewPort.getLayout().setActiveItem(1);
	},
	onPostCommentClick: function () {
		var detailsPanel = this.getDetailsPanel(),
			dashboard = detailsPanel.getRecord(),
			commentsStore = this.getCommentsStore(),
			commentField = this.getCommentField(),
			comment;
			
		comment = commentField.getValue();
		
		if (!Ext.isEmpty(comment)) {
			commentsStore.add({
				Title: 'Comment',
				Comment: comment,
				Dashboard: dashboard.get('UpdateValue')
			});
			commentField.reset();
		}		
	}, 
	onCommentsViewRefresh: function (view) {
		var viewEl = view.getEl(),
			comments = viewEl.query('.detail-comment'),
			viewWidth, maxWidth;
		if (comments) {
			viewWidth = viewEl.getWidth();
			// Manual fix to IE quirks mode css not recognize max-width option.  We have to manual check size and adjust if over our desired width percentage
			maxWidth = (60 / 100) * viewWidth;
			Ext.Array.each(comments, function (comment) {
				var el = Ext.get(comment);
					elWidth = el.getWidth()
				if (elWidth > maxWidth) {
					el.setWidth(maxWidth);
				}
			});
		}
	}
});