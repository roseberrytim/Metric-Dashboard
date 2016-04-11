/*global Ext, Metric*/
Ext.define('Metric.view.dashboard.sheet.Settings', {
    extend: 'Ext.window.Window',
    alias: 'widget.sheetsettings',
    requires: ['Ext.form.Panel', 'Ext.form.field.Text', 'Ext.form.field.Checkbox', 'Ext.ux.form.field.ColorField'],
    autoShow: true,
	height: 300,
    width: 500,
    layout: 'fit',
    modal: true,
	title: 'Sheet Settings',
    config: {
        sheet: null
    },
    constructor: function (config) {
        this.initConfig(config);
        this.callParent(arguments);
    },
    initComponent: function () {
        var sheet = this.getSheet(),
            settings = sheet.getSettings();
        Ext.apply(this, {
            items: {
                xtype: 'form',
                itemId: 'settingsForm',
                defaults: {
                    anchor: '100%'
                },
                bodyPadding: 10,
                fieldDefaults: {
                    msgTarget: 'side'					
                },
                items: [{
                    xtype: 'checkbox',
                    name: 'visible',
                    fieldLabel: 'Visible',
                    checked: settings.visible,
					inputValue: true,
					uncheckedValue: false
                }, {
                    xtype: 'textfield',
                    name: 'title',
                    fieldLabel: 'Title',
                    allowBlank: false,
                    value: settings.title
                }, {
                    xtype: 'colorfield',
                    name: 'backgroundColor',
                    fieldLabel: 'Background Color',                    
                    value: settings.backgroundColor
                }]
            },
            buttons: [{
                text: 'Cancel',
                handler: function () {
                    this.up('window').close();
                }
            }, {
                action: 'save',
				text: 'Save',
                action: 'save'
            }]
        });

        this.callParent();
    }
});