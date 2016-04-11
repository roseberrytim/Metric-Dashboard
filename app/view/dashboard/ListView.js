Ext.define('Metric.view.dashboard.ListView', {
	extend: 'Metric.view.navigation.AbstractListView',
	alias: 'widget.dashboardlistview',
	initComponent: function () {
		var tpl = Ext.XTemplate.getTpl(Metric.config.Globals, 'dashboardListTpl')
		Ext.apply(this, {
			store: 'Dashboards',
			tpl: tpl
			/*
			[
				'<tpl for=".">',
					'<div class="selector-button">',
						'<h2>{[this.shorten(values.Title, 25)]}</h2>',
						'<p>{[this.shorten(values.Notes, 100)]}</p>',				
						'<div class="selector-created">',
							'<div>Created by: <span>{Author}</span></div>',
							'<div>Last modified: <span>{[this.formatDate(values.Modified)]}</span></div>',
						'</div>',
					'</div>',
					'<div class="selector-seperator"></div>',
				'</tpl>',
				{        
					shorten: function(name, len){
					   return Ext.String.ellipsis(name,len,false);
					},
					formatDate: function (date) {
						return Ext.Date.format(date, 'n-j-Y');
					}
				}
			]
			*/
		});
		this.callParent();
	}
});