Ext.define('Ext.ux.form.field.ColorField', {
    extend:'Ext.form.field.Picker',
    alias: 'widget.colorfield',
    requires: ['Ext.picker.Color'],
    alternateClassName: ['Ext.form.ColorField', 'Ext.form.Color'],

    matchFieldWidth: false,
    
    initComponent : function(){
        var me = this;            
        me.callParent();
    },

    // @private
    getSubmitValue: function() {
        var value = this.getValue();
        return value ? value : '';
    },

    createPicker: function() {
        var me = this,
            format = Ext.String.format;
		me.picker = Ext.create('Ext.picker.Color',{
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
			autoScroll: true,
			height: 200,
			width: 200,
			colors: [
				'000000', '000080', '00008B', '0000CD', '0000FF', '006400', '008000', 
				'008080', '008B8B', '00BFFF', '00CED1', '00FA9A', '00FF00', '00FF7F', 
				'00FFFF', '00FFFF', '191970', '1E90FF', '20B2AA', '228B22', '2E8B57', 
				'2F4F4F', '32CD32', '3CB371', '40E0D0', '4169E1', '4682B4', '483D8B', 
				'48D1CC', '4B0082', '556B2F', '5F9EA0', '6495ED', '66CDAA', '696969', 
				'6A5ACD', '6B8E23', '708090', '778899', '7B68EE', '7CFC00', '7FFF00', 
				'7FFFD4', '800000', '800080', '808000', '808080', '87CEEB', '87CEFA', 
				'8A2BE2', '8B0000', '8B008B', '8B4513', '8FBC8F', '90EE90', '9370DB', 
				'9400D3', '98FB98', '9932CC', '9ACD32', 'A0522D', 'A52A2A', 'A9A9A9', 
				'ADD8E6', 'ADFF2F', 'AFEEEE', 'B0C4DE', 'B0E0E6', 'B22222', 'B8860B', 
				'BA55D3', 'BC8F8F', 'BDB76B', 'C0C0C0', 'C71585', 'CD5C5C', 'CD853F',
				'D2691E', 'D2B48C', 'D3D3D3', 'D8BFD8', 'DA70D6', 'DAA520', 'DB7093', 
				'DC143C', 'DCDCDC', 'DDA0DD', 'DEB887', 'E0FFFF', 'E6E6FA', 'E9967A', 
				'EE82EE', 'EEE8AA', 'F08080', 'F0E68C', 'F0F8FF', 'F0FFF0', 'F0FFFF', 
				'F4A460', 'F5DEB3', 'F5F5DC', 'F5F5F5', 'F5FFFA', 'F8F8FF', 'FA8072', 
				'FAEBD7', 'FAF0E6', 'FAFAD2', 'FDF5E6', 'FF0000', 'FF00FF', 'FF00FF', 
				'FF1493', 'FF4500', 'FF6347', 'FF69B4', 'FF7F50', 'FF8C00', 'FFA07A', 
				'FFA500', 'FFB6C1', 'FFC0CB', 'FFD700', 'FFDAB9', 'FFDEAD', 'FFE4B5', 
				'FFE4C4', 'FFE4E1', 'FFEBCD', 'FFEFD5', 'FFF0F5', 'FFF5EE', 'FFF8DC', 
				'FFFACD', 'FFFAF0', 'FFFAFA', 'FFFF00', 'FFFFE0', 'FFFFF0', 'FFFFFF'
			],
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
		return me.picker;
    },
    
    onDownArrow: function(e) {
        this.callParent(arguments);
        if (this.isExpanded) {
            this.getPicker().focus();
        }
    },

    onSelect: function(m, d) {
        var me = this;

        me.setValue(d);
		me.setFieldDisplayColor(d);		
        me.fireEvent('select', me, d);
        me.collapse();
    },
	setFieldDisplayColor: function (value) {
		this.setFieldStyle.call(this, {
			'background':  '#' + value,
			'background-image': 'none'
		});
		this.detectFontColor();
	},
	detectFontColor: function (){
		var convertHex = function (a) {
				return parseInt(a, 16);
			},
			value, avg, c;
			
		if (!this.picker || !this.picker.rawValue){
			if (!this.value) {
				value = 'FFFFFF';
			} else {
				value = [
					convertHex(this.value.slice(0, 2)),
					convertHex(this.value.slice(2, 4)),
					convertHex(this.value.slice(4, 6))
				];
			}
		} else { 
			value = this.picker.rawValue;
		}
		
		avg = (value[0] + value[1] + value[2]) / 3;

		if (this.value == '00FF00') {
			avg = 129;
		}
		
		c = (avg > 128) ? '#000' : '#FFF';
		
		this.setFieldStyle.call(this, {
			'color': c
		});
	},
	afterRender: function (){
     	this.setFieldStyle.call(this, {
			'background':  '#' + this.value,
			'background-image': 'none'
		});
		this.detectFontColor();
	},
    /**
     * @private
     * Sets the Date picker's value to match the current field value when expanding.
     */
    onExpand: function() {
        var value = this.getValue();
        this.picker.select(value, true);
    },

    /**
     * @private
     * Focuses the field when collapsing the Date picker.
     */
    onCollapse: function() {
        this.focus(false, 60);
    },

    // private
    beforeBlur : function(){
        var me = this,
            v = me.getRawValue(),
            focusTask = me.focusTask;

        if (focusTask) {
            focusTask.cancel();
        }

        if (v) {
            me.setValue(v);
        }
    }    
});