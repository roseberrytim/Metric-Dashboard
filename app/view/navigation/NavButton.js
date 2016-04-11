Ext.define('Metric.view.navigation.NavButton', {
	extend: 'Ext.Component',
	alias: 'widget.navbutton',
	
	height: 75,
	width: 125,
	pressed: false,
		
	baseCls: 'navigation-button',
	
	pressedCls: 'pressed', 
	calloutCls: 'callout',
	calloutBorderCls: 'callout-border',
	
	renderTpl: [
		'<span role="img" class="{baseCls}-icon-el {iconCls}"></span>',
		'<span class="{baseCls}-inner">{title}</span>',
		'<div class="{baseCls}-{calloutBorderCls}"></div>',
		'<div class="{baseCls}-{calloutCls}"></div>'
	],
	
	initComponent: function () {
				
		this.callParent(arguments);
		
		this.addEvents('navbuttonclick', 'navselected');
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
            title: me.title || '',
			calloutBorderCls: me.calloutBorderCls,
			calloutCls: me.calloutCls,
			iconCls: me.iconCls			
        };
	},
	
	onButtonClick: function (e) {
		e.stopEvent(); 
			
        this.fireEvent('navbuttonclick', this);
	},
	toggle: function (state) {
        var me = this;
        state = state === undefined ? !me.pressed: !!state;
        if (state !== me.pressed) {
            if (me.rendered) {
                me[state ? 'addClsWithUI': 'removeClsWithUI'](me.pressedCls);
            }
            me.pressed = state; 
			if (state) {
				me.fireEvent('navselected', me);
			}
        }
        return me;
    }
	
});