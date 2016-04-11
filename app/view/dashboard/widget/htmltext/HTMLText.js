Ext.define('Metric.view.dashboard.widget.htmltext.HTMLText', {
	extend: 'Metric.view.dashboard.widget.WidgetBox',
	alias: 'widget.htmltextbox',	
	type: 'htmltextbox',
	bodyPadding: '0 10 0 10',
	initComponent: function () {
		var widgetSettings = this.widgetSettings || {},
			html = widgetSettings.html || 'HTML/Text Widget is not configured';
		Ext.apply(this, {						
			items: [{
				xtype: 'component',
				cls: 'htmltext-widget-innerCt',
				html: html
			}]
		});
		this.callParent(arguments);
	}
});