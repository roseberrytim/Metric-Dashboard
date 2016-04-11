Ext.define('Metric.view.dashboard.widget.image.Settings', {
	extend: 'Metric.view.dashboard.widget.Settings',
	alias: 'widget.imageboxsettings',
	requires: ['Ext.layout.container.Anchor', 'Ext.form.field.Text'],
	height: 200,
	bodyPadding: 5,
	layout: 'anchor',
	initComponent: function () {
		var widget = this.getWidget(),
			widgetSettings = widget.getWidgetSettings();			
		Ext.apply(this, {			
			animateTarget: widget,
			items:[{
				xtype: 'textfield',
				anchor: '100%',				
				fieldLabel: 'Image URL',
				value: widgetSettings.imageUrl || ''				
			}]
		});
		this.callParent(arguments);
	}
});