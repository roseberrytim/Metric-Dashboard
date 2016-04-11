Ext.define('Metric.view.dashboard.widget.Settings', {
	extend: 'Ext.window.Window',
	alias: 'widget.settingswindow',
	config: {
		widget: null		
	},
	width: 500,
	height: 500,
	layout: 'fit',
	modal: true,
	constructor: function(config) {
        this.initConfig(config);
		this.callParent(arguments);
    },
	initComponent: function () {
		var buttons = this.buildButtons();
		Ext.apply(this, {
			buttons:buttons
		});
		this.callParent(arguments);
	},
	buildButtons: function () {
		return [{
			text: 'Cancel',
			scope: this,
			handler: function() {
				this.close();
			}
		}, {
			text: 'Save',
			action: 'save'
		}];
	}
});