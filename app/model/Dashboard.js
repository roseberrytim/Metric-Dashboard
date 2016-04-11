Ext.define('Metric.model.Dashboard', {
    extend: 'Ext.data.Model',
	idProperty: 'ID',
	fields: [{
		name: "ID",
		mapping: '@ows_ID'
	}, {
		name: "Title",
		mapping: '@ows_LinkTitle'
	}, {
		name: 'Notes',
		mapping: '@ows_Notes'
		//serialize: function (v, data) {
		//	return Ext.util.Format.htmlEncode(v);
		//}
	}, {
		name: 'Published',
		mapping: '@ows_Published'
	}, {
		name: 'Settings',
		mapping: '@ows_Settings'
	}, {
		name: 'Modified',
		mapping: '@ows_Modified',
		persist: false, 
		type: 'date',
		dateFormat: 'Y-m-d H:i:s'
	}, {
		name: 'Created',
		mapping: '@ows_Created',
		persist: false, 
		type: 'date',
		dateFormat: 'Y-m-d H:i:s'
	}, {
		name: 'Owner',
		mapping: '@ows_Owner'
	}, {
		name: 'Author',
		mapping: '@ows_Owner',
		persist: false,
		convert: function(v, data) {
			var a = v.split(';#'),
				fixedValue = ''
			if (a.length === 2) {
				fixedValue = a[1];
			}
			return fixedValue;
		}
	}, {
		name: 'CreatedBy',
		mapping: '@ows_Owner',
		persist: false,
		convert: function(v, data) {
			var a = v.split(';#'),
				fixedValue = ''
			if (a.length === 2) {
				fixedValue = a[0];
			}
			return fixedValue;
		}
	}, {
        name: 'UpdateValue',
        mapping: '@ows_LinkTitle',
        persist: false,
        convert: function (value, record) {
            var updateValue = record.get('ID') + ';#' + value;
            return updateValue;
        }
    }],
	proxy: {
		type: 'splistsoap',
		extraParams: {
			listName: 'DashboardsV11'
		}
	}
});