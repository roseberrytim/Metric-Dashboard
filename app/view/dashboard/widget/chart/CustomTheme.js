var colors = ['#color1', '#color2', '#color3', '#color4', '#color5'];
    
Ext.chart.theme.Rainbow = Ext.extend(Ext.chart.theme.Base, {
	constructor: function(config) {
		Ext.chart.theme.Base.prototype.constructor.call(this, Ext.apply({
			colors: colors
		}, config));
	}
});