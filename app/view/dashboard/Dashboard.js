Ext.define('Metric.view.dashboard.Dashboard', {
	extend: 'Ext.tab.Panel',	
	alias: 'widget.dashboard',
	requires: ['Ext.ux.TabReorderer', 'Ext.ux.TabTitleEdit', 'Ext.menu.Menu', 'Metric.view.dashboard.widget.Toolbox', 'Metric.view.dashboard.sheet.Sheet'],	
	autoScroll: true,
	plain: true,
	deferredRender: false,   
	layout: 'fit',
	config: {
		record: null,
		settings: {},
		editing: false,
		dirty: false,
		restoring: false,
		sheetCount: 0,
		clipboard: {},
		cutOperation: false
	},	
	constructor: function (config) {
		this.addEvents('restore', 'closemenuclick', 'settingsmenuclick', 'sheettabcontextmenu', 'markdirty', 'settingssave');
		this.initConfig(config);
		this.callParent(arguments);		
	},
	initComponent: function () {
		var me = this,
			editing = me.getEditing(),
			defaultTabItems = [],
			plugins = [Ext.create('Ext.ux.TabReorderer')];
				
		if (editing) {
			me.editTools = me.buildEditTools();
			plugins.push(Ext.create('Ext.ux.TabTitleEdit'));
			defaultTabItems.push({				
				itemId: 'addSheetButton',
				iconCls: 'icon-add-tab',
				tooltip: 'Click to add new Sheet',
				disableCloseMenu: true,
				closable: false,
				reorderable: false
			});
			this.closeMenu = me.buildCloseMenu();
			this.settingsMenu = me.buildSettingsMenu();
		}		
		Ext.apply(me, {			
			plugins: plugins,
			tabBar:{
				defaults: {
					disableCloseMenu: false					
				},
				items: defaultTabItems
			},
			listeners: {
				el: {
					scope: me,
					contextmenu: me.onSheetTabContextMenu,					
					delegate: '.x-tab'
				}
			}
		});
		me.callParent(arguments);
	},
	buildCloseMenu: function () {
		var menu = Ext.create('Ext.menu.Menu', {
			currentSheet: null,			
			items: [{
				text: 'Close Sheet',
				action: 'close'
			}, {
				text: 'Rename Sheet',
				action: 'rename'			
			}, {
				text: 'Settings',
				action: 'settings'
			}]
		});
		this.relayEvents(menu, ['click'], 'closemenu');
		return menu;		
	},
	buildSettingsMenu: function () {
		var menu = Ext.create('Ext.menu.Menu', {
			currentSheet: null,
			items: [{
				text: 'Paste',
				action: 'paste'
			}, '-', {
				text: 'Settings',
				action: 'settings'
			}]
		});
		this.relayEvents(menu, ['click'], 'settingsmenu');
		return menu;
	},
	buildEditTools: function () {
		return Ext.create('Metric.view.dashboard.widget.Toolbox', {
			dashboard: this
		});
	},
	onSheetTabContextMenu: function (event, target) {
		if (this.closeMenu) {
			this.fireEvent('sheettabcontextmenu', event, target, this);
		}
		event.preventDefault();		
	},
	onDestroy : function(){
        var me = this;
		if (me.closeMenu) {
			me.closeMenu.destroy();
		}
		if (me.settingsMenu) {
			me.settingsMenu.destroy();
		}
		if (me.editTools) {
			me.editTools.destroy();
		}
        me.callParent(arguments);
    }
});