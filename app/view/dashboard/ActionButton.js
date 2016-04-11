Ext.define('Metric.view.dashboard.ActionButton', {
	extend: 'Ext.Component',
	alias: 'widget.actionbutton',
	
	height: 75,
	//width: 250,	
	allowEdit: false,
	 
	baseCls: 'action-button',
	overCls: 'action-button-over',
	renderTpl: [
		'<span role="img" class="{baseCls}-icon-el {iconCls}"></span>',
		'<h2>{title}</h2>',
		'<p>{details}</p>'		
	],
	
	initComponent: function () {
				
		this.callParent(arguments);
		
		this.addEvents('actionbuttonclick');
	},
	beforeRender: function () {
		var me = this;
		
		me.callParent();
       
        // Apply the renderData to the template args
        Ext.applyIf(me.renderData, me.getTemplateArgs());
	},
	afterRender: function () {
		var me = this;
		me.mon(me.el, 'click', me.onButtonClick, me);
				
        me.callParent(arguments);
	},
	getTemplateArgs: function () {
		var me = this;
		return {
            title: me.title,
			details: me.details,
			iconCls: me.iconCls			
        };
	},
	
	onButtonClick: function (e) {
		e.stopEvent(); 
        this.fireEvent('actionbuttonclick', this);
	}	
});
