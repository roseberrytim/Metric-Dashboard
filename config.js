/*global Ext, Metric, _spUserId*/
Ext.define('Metric.config.Globals', {
	singleton: true,
	title: 'Metric Reporting',	
	defaultDashboardConfig: {
		sheets: [{
			title: 'Sheet 1',
			backgroundColor: 'FFFFFF',
			visible: true,
			widgets: []			
		}]
	},
	defaultWidgetBox: {
		x: 50,
		y: 50,
		width: 350,
		height: 250,
		layout: 'fit'
	},
	modelSeed: 1000,
	
	dashboardListTpl: [
		'<tpl for=".">',
			'<div class="selector-button">',
				'<h2>{[this.shorten(values.Title, 25)]}</h2>',			
			'</div>',
			'<div class="selector-seperator"></div>',
		'</tpl>',
		{        
			shorten: function(name, len){
			   return Ext.String.ellipsis(name,len,false);
			}
		}
	],
	dataDefinitionListTpl: [
		'<tpl for=".">',
			'<div class="selector-button">',
				'<h2>{[this.shorten(values.Title, 25)]}</h2>',				
			'</div>',
			'<div class="selector-seperator"></div>',
		'</tpl>',
		{        
			shorten: function(name, len){
			   return Ext.String.ellipsis(name,len,false);
			}
		}
	],	
	
	viewsCollection: {},
	currentUserID: _spUserId.toString(),
    currentUser: '',
    currentUserDisplayName: '',
	currentUserUpdateValue: '',
    currentUserRoles: [],
	roleDescription: 'Use only for internal application',
	applicationUserGroup: 'Users',
    applicationAdmin: 'Application Administrator',
	adminGroupName: 'Administrators',
    powerUserGroupname: 'PowerUsers',
    isAdmin: false,
    isPowerUser: false,
    isUser: true	
});