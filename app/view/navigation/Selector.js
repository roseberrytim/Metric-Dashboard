Ext.define('Metric.view.navigation.Selector', {
	extend: 'Ext.container.Container',
	alias: 'widget.navigationselector',
	requires: ['Ext.form.field.Trigger', 'Metric.view.dashboard.ListView', 'Metric.view.data.ListView'],
	layout: {
		type: 'vbox',
		align: 'stretch'
	},
	initComponent: function () {
		var me = this,		
			searchField = me.buildSearchField(),
			filterButtons = me.buildFilterButtons(),
			listViewContainer = me.buildListViewContainer();		
		
		Ext.apply(me, {
			items: [searchField, filterButtons, listViewContainer]
		});
				
		me.callParent();
		
		me.addEvents('resetsearch');
	},
	buildSearchField: function () {
		var me = this,
			field = Ext.create('Ext.form.field.Trigger', {
				itemId: 'searchField',
				margin: '5 0 5 0',
				triggerCls: 'x-form-clear-trigger',
				hideTrigger: false,
				emptyText: 'Search...',
				enableKeyEvents: true,
				onTriggerClick: function () {
					this.reset();
					this.focus();
					me.fireEvent('resetsearch', field);
				}
			});
		return field;
	},
	buildFilterButtons: function () {
		return Ext.create('Ext.container.Container', {
			layout: {
				type: 'hbox',
				align: 'stretch'				
			},
			height: 30,
			items: [{
				xtype: 'button',
				action: 'all',
				margin: '0 2 0 0',
				flex: 1,
				text: 'All',
				pressed: true,
				allowDepress: false,
				toggleGroup: 'listViewFilters'				
			}, {				
				xtype: 'button',
				action: 'me',
				flex: 1,
				text: 'My Records',
				allowDepress: false,
				toggleGroup: 'listViewFilters'
			}]
		});
	},
	buildListViewContainer: function () {
		return Ext.create('Ext.container.Container', {
			itemId: 'listViewContainer',
			flex: 1,
			margin: '10 0 0 0',
			style: 'background-color: #ffffff;',
			layout: 'card',
			items: [{
				xtype: 'dashboardlistview',
				itemId: 'dashboard'
			}, {
				xtype: 'datalistview',
				itemId: 'data'
			}]
		});
	}
});