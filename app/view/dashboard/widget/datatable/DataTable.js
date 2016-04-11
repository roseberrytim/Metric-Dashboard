Ext.define('Metric.view.dashboard.widget.datatable.DataTable', {
	extend: 'Metric.view.dashboard.widget.dynamicdata.DynamicData',
	alias: 'widget.datatablebox',		
	width: 500,
	height: 200,
	type: 'datatablebox',
	initComponent: function () {
		var settings = this.getWidgetSettings();
		if (settings) {	
			Ext.apply(this, {			
				items: []
			});
		} else {
			this.html = 'Data Table Widget is not configured'
		}	
		this.callParent(arguments);
	}
});