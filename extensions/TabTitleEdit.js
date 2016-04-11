/**
 * Plugin for adding a close context menu to tabs. Note that the menu respects
 * the closable configuration on the tab. As such, commands like remove others
 * and remove all will not remove items that are not closable.
 */
Ext.define('Ext.ux.TabTitleEdit', {
    alias: 'plugin.tabtitleedit',
	uses: ['Ext.tab.Panel'],
	mixins: {
        observable: 'Ext.util.Observable'
    },
	constructor: function (config) {
        var me = this;		
		me.mixins.observable.constructor.call(me, config);		
    },
    init : function (tabpanel) {
        var me = this;
		me.tabPanel = tabpanel;
        me.tabBar = tabpanel.down("tabbar");

        me.mon(me.tabPanel, {
            scope: me,
            afterlayout: me.onAfterLayout,
            single: true
        });
		
		tabpanel.tabTitleEditingPlugin = me;
    },

    onAfterLayout: function() {
        this.mon(this.tabBar.el, {
            scope: this,
            dblclick: this.onTabDblClick,
            delegate: '.x-tab'
        });
    },
	
	destroy: function() {
		var me = this,
			tabPanel = me.tabPanel;
		if (me.editor) {			
			Ext.destroy(this.editor);		
			tabPanel.tabTitleEditingPlugin = me.editor = me.tabPanel = me.tabBar = null;			
		}
        this.callParent(arguments);
    },
  
    // private
    onTabDblClick : function (event, target){
        var me = this,
            tab = me.tabBar.getChildByElement(target),
            index = me.tabBar.items.indexOf(tab),
			editor = me.getEditor(); //createEditor();

        me.item = me.tabPanel.getComponent(index);               
		
        event.preventDefault();
        if (me.item) {            
			editor.startEdit(target, me.item.title);
        }
    },
	editFromMenu: function (tab, panel) {
		var me = this,
			tabEl = tab.getEl(),
			editor = me.getEditor();			
		me.item = panel;
		if (me.item) {
			editor.startEdit(tabEl, me.item.title);
		}
	},
	getEditor: function () {
		var me = this;		
		if (!me.editor) {
			me.editor = Ext.create('Ext.Editor', {                
				alignment: "l-l",
				hideEl : false,
				field: {
					xtype: 'textfield',
					allowBlank: false,
					selectOnFocus: true
				},
				listeners: {
					complete: function(editor, value){
						var item = me.item
						item.setTitle(value);						
					},
					scope: me
				}
            });		
		}
		return me.editor;
	}    
});

