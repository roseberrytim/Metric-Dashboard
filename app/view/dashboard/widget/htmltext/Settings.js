Ext.define('Metric.view.dashboard.widget.htmltext.Settings', {
	extend: 'Metric.view.dashboard.widget.Settings',
	alias: 'widget.htmltextboxsettings',
	requires: ['Ext.form.field.HtmlEditor'],	
	initComponent: function () {
		var widget = this.getWidget(),
			htmlComponent = widget.child(),			
			currentValue = htmlComponent.el.dom.innerHTML;
		Ext.apply(this, {						
			animateTarget: widget,
			items:[{
				xtype: 'htmleditor',
				anchor: '100%',
				value: currentValue			
			}]
		});
		this.callParent(arguments);
	}
});