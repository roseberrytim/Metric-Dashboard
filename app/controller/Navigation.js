/*global Ext, Metric*/
Ext.define('Metric.controller.Navigation', {
    extend: 'Ext.app.Controller',
    models: ['Dashboard', 'DataDefinition'],
    stores: ['Dashboards', 'DataDefinitions'],
    views: ['navigation.Navigation', 'navigation.Selector', 'navigation.Instructions'],	
	refs: [{
		ref: 'dashboardNavButton', selector: 'navigationheader navbutton[action=dashboard]'
	}, {
		ref: 'navListViewContainer', selector: 'navigationselector #listViewContainer'
	}, {
		ref: 'navContainer', selector: 'navigationcontainer #mainContainer'
	}, {
		ref: 'configButton', selector: 'navigationheader button[action=configure]'
	}],
	init: function () {
        var me = this;
		me.listen({
			component: {				
				'navigationcontainer' : {
					afterrender: 'onNavigationRender'
				},
				'navigationheader navbutton': {
					navbuttonclick: 'onNavigationButtonClick',
					navselected: 'onNavigationSelected'
				},				
				'navigationheader button[action=add]': {
					click: 'onAddClick'
				},
				'navigationselector': {
					resetsearch: 'onResetSearchClick'
				},
				'navigationselector #searchField': {
					change: {
                        fn: me.onSearchFieldChange,                    
                        buffer: 100
                    }
				},
				'navigationselector button': {
					toggle: 'onNavigationFilterToggle'
				},
				'navigationheader button[action=configure]': {
					click: 'onConfigureButtonClick'
				}
			}			
		});		
    },
	allowToEdit: function (record) {
		var author = record.get('Author'),
			me = Metric.config.Globals.currentUserDisplayName;
			
		return author === me ? true : false || Metric.config.Globals.isAdmin;
	},
	getSearchValue: function (value) {
        var me = this;            
        if (value === '') {
            return null;
        }
        try {
            new RegExp(value);
		} catch(error) {
			return null;
		}
		if (value === '^' || value === '$') {
			return null;
		}	
        return value;
    },
	resetNavigation: function () {
		var mainContainer = this.getNavContainer(),			
			configButton = this.getConfigButton();
				
		mainContainer.removeAll();
		mainContainer.add({
			xtype: 'instructions'
		});
		configButton.hide();
	},
	onNavigationRender: function () {
		this.getDashboardNavButton().toggle(true);
	},
	onNavigationSelected: function (button, refresh) {
		try {
			var action = button.action || 'dashboard',
				listViewContainer = this.getNavListViewContainer(),
				listView;
			if (refresh) {
				listView = listViewContainer.getLayout().getActiveItem();
			} else {
				listView = listViewContainer.getLayout().setActiveItem(action);
			}
			if (listView) {
				listView.getStore().load();
			}			
		} catch (e) {
			Ext.MessageBox.alert('Error', 'There was an error with the current selection<br><br>' + e.message);
		}
	},
	onNavigationButtonClick: function (button, action) {
		
		if (button.pressed) {
			button.fireEvent('navselected', button, true);
			return false;
		}
		
		var navButtons = Ext.ComponentQuery.query('navigationheader navbutton'),
			bl = navButtons.length,
			i = 0,
			action = button.action,
			navButton;
		
		for (i; i < bl; i++) {
			navButton = navButtons[i];
			if (navButton.pressed) {
				navButton.toggle(false);			
			}
		}
		button.toggle(true);
	},	
	onResetSearchClick: function (field) {
		var listViewContainer = this.getNavListViewContainer().getLayout(),
			listView = listViewContainer.getActiveItem(),
			store = listView.getStore();
		store.clearFilter();
	},
	onSearchFieldChange: function (field, newValue) {
		var searchValue = this.getSearchValue(newValue),
			listViewContainer = this.getNavListViewContainer().getLayout(),
			listView = listViewContainer.getActiveItem(),
			store = listView.getStore(),
			searchRegExp;
		if (searchValue !== null) {
            searchRegExp = new RegExp(searchValue, 'gi');
			 store.filterBy(function (record) {
				var key, recordMatch;
				for (key in record.data) {
					if (record.data.hasOwnProperty(key)) {
						recordMatch = String(record.data[key]).match(searchRegExp) ? true : false
						if (recordMatch) {
							return true;
						}
					}
				}
				return false;
			});
		} else {
			store.clearFilter();
		}
	},
	onNavigationFilterToggle: function (button, state) {
		if (state) {
			var action = button.action,
				listViewContainer = this.getNavListViewContainer().getLayout(),
				listView = listViewContainer.getActiveItem(),
				store = listView.getStore(),
				me;
			store.clearFilter();
			if (action === 'me') {
				me = Metric.config.Globals.currentUserDisplayName;
				store.filter('Author', me);
			}
			listView.refresh();
		}
	},
	onConfigureButtonClick: function (button) {
		var header = button.up('navigationheader'),
			navButton = header.down('navbutton[pressed=true]'),
			action, active;
		if (navButton) {
			action = navButton.action;			
			active = this.getNavContainer().child(),
			this.fireEvent('configure' + action, active);
		}
	},
	onAddClick: function (button) {
		var header = button.up('navigationheader'),
			navButton = header.down('navbutton[pressed=true]'),
			action;
		if (navButton) {
			action = navButton.action;						
			this.fireEvent('add' + action, button);
		}
	}
});