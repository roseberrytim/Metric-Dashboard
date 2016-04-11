/*global Ext */
Ext.define('Ext.ux.container.SearchGroup', {
    extend: 'Ext.container.Container',
    alias: 'widget.searchgroup',
    requires: ['Ext.form.field.Text', 'Ext.form.field.Checkbox', 'Ext.form.CheckboxManager', 'Ext.form.field.Trigger'],    
    selectRowOnSearch: true,
    searchValue: null,
    /**
     * @private
     * The row indexes where matching strings are found. (used by previous and next buttons)
     */
    indexes: [],
    /**
     * @private
     * The row index of the first search, it could change if next or previous buttons are used.
     */
    currentIndex: null,
    /**
     * @private
     * The generated regular expression used for searching.
     */
    searchRegExp: null,
    /**
     * @private
     * Case sensitive mode.
     */
    caseSensitive: false,
    /**
     * @private
     * Regular expression mode.
     */
    regExpMode: false,
    /**
     * @cfg {String} matchCls
     * The matched string css classe.
     */
    matchCls: 'x-livesearch-match',
    tagsRe: /<[^>]*>/gm,
    tagsProtect: '\x0f',
    regExpProtect: /\\|\/|\+|\\|\.|\[|\]|\{|\}|\?|\$|\*|\^|\|/gm,
    initComponent: function () {
        var me = this;
        me.searchField = Ext.widget('triggerfield', {
            triggerCls: "x-form-clear-trigger",
            hideTrigger: false,
            name: 'searchField',
            width: 160,
            emptyText: "Enter search term",
            listeners: {
                change: {
                    fn: me.onSearchFieldChange,
                    scope: this,
                    buffer: 100
                }
            },
            onTriggerClick: function () {
                this.reset();
                this.focus();
            }
        });
        Ext.apply(me, {
            layout: {
				type: 'hbox',
				align: 'middle',
				defaultMargins: {top: 0, right: 3, bottom: 0, left: 0}
			},
            items: [me.searchField,
            {
                action: 'SearchPrev',
                xtype: 'button',
                text: '&lt;',
                tooltip: 'Find Previous Row',
                handler: me.onPreviousClick,
                scope: me
            }, {
                action: 'SearchNext',
                xtype: 'button',
                tooltip: 'Find Next Row',
                text: '&gt;',
                handler: me.onNextClick,
                scope: me
            }]

        });
        me.callParent(arguments);
    },
    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        me.grid = me.up('gridpanel');
    },
    getSearchValue: function () {
        var me = this,
            value = me.searchField.getValue();
        if(value === '') {
            return null;
        }
        if(!me.regExpMode) {
            value = value.replace(me.regExpProtect, function (m) {
                return '\\' + m;
            });
        } else {
            try {
                new RegExp(value);
            } catch(error) {
                return null;
            }
            if(value === '^' || value === '$') {
                return null;
            }
        }
        return value;
    },
    onSearchFieldChange: function () {
        var me = this,
			grid = me.grid,
			store = grid.store,
            count = 0;
        store.clearFilter();
		grid.view.refresh();
        me.searchValue = me.getSearchValue();
        me.indexes = [];
        me.currentIndex = null;
        if (me.searchValue !== null) {
            me.searchRegExp = new RegExp(me.searchValue, 'g' + (me.caseSensitive ? '' : 'i'));
		   store.each(function (record, idx) {
				var td = Ext.fly(grid.view.getNode(idx)).down('td'),
					cell, matches, cellHTML;
				while(td) {
					cell = td.down('.x-grid-cell-inner');
					matches = cell.dom.innerHTML.match(me.tagsRe);
					cellHTML = cell.dom.innerHTML.replace(me.tagsRe, me.tagsProtect);
					// populate indexes array, set currentIndex, and replace wrap matched string in a span
					cellHTML = cellHTML.replace(me.searchRegExp, function (m) {
						count += 1;
						if(Ext.Array.indexOf(me.indexes, idx) === -1) {
							me.indexes.push(idx);
						}
						if(me.currentIndex === null) {
							me.currentIndex = idx;
						}
						return '<span class="' + me.matchCls + '">' + m + '</span>';
					});
					// restore protected tags
					Ext.each(matches, function (match) {
						cellHTML = cellHTML.replace(me.tagsProtect, match);
					});
					// update cell html
					cell.dom.innerHTML = cellHTML;
					td = td.next();
				}
			}, me);
			// results found
			if (me.currentIndex !== null) {
				if(me.selectRowOnSearch) {
					grid.getSelectionModel().select(me.currentIndex);
				}
				//me.setTitle('Search (' + count + ' matches)');
			}
        }
        // no results found
        if (me.currentIndex === null) {
            grid.getSelectionModel().deselectAll();
            //me.setTitle('Search');
        }
        // force textfield focus
        me.searchField.focus();
        //me.searchField.setHideTrigger(me.searchValue === null);
    },
    onPreviousClick: function () {
        var me = this,
            idx;

        if((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx - 1] || me.indexes[me.indexes.length - 1];
            me.grid.getSelectionModel().select(me.currentIndex);
        }
    },
    onNextClick: function () {
        var me = this,
            idx;

        if((idx = Ext.Array.indexOf(me.indexes, me.currentIndex)) !== -1) {
            me.currentIndex = me.indexes[idx + 1] || me.indexes[0];
            me.grid.getSelectionModel().select(me.currentIndex);
        }
    }
});