/*global Ext, Metric*/
Ext.define('Metric.view.Viewport', {
    extend: 'Ext.Viewport',
    requires: ['Ext.layout.container.Card', 'Ext.layout.container.Border', 'Ext.layout.container.HBox', 'Ext.layout.container.VBox', 'Metric.view.navigation.Navigation', 'Metric.view.dashboard.Viewer'],
	layout: 'card',
	items: []
});