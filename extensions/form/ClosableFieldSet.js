Ext.define('Ext.ux.form.ClosableFieldSet', {
    extend: 'Ext.form.FieldSet',
    alias: 'widget.closablefieldset',
    createLegendCt: function () {
        var me = this,
            items = [],
            legend = {
                xtype: 'container',
                baseCls: me.baseCls + '-header',
                id: me.id + '-legend',
                autoEl: 'legend',
                items: items,                
				ownerCt: me,
                shrinkWrap: true,
                ownerLayout: me.componentLayout
            };

        // Checkbox
        if (me.checkboxToggle) {
            items.push(me.createCheckboxCmp());
        } else if (me.collapsible) {
            // Toggle button
            items.push(me.createToggleCmp());
        }
        // Title
        items.push(me.createTitleCmp());
		// Close
		items.push(me.createCloseCmp());
        
		return legend;
    },
	createCloseCmp: function () {
		var me = this;
        me.closeCmp = Ext.widget({
            xtype: 'tool',
            height: 16,
            width: 16,
            type: 'close',
			margin: '0 0 0 2',
			cls: 'x-closable-fieldset',
            handler: me.onCloseClick,
            id: me.id + '-legendClose',
            scope: me
        });
		return me.closeCmp;
	},	
    onCloseClick: function () {
        if (this.ownerCt) {
            this.ownerCt.remove(this, true);
        }
    }
});