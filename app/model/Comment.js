Ext.define('Metric.model.Comment', {
    extend: 'Ext.data.Model',
	idProperty: 'ID',
	fields: [{
		name: "ID",
		mapping: '@ows_ID'
	}, {
		name: "Title",
		mapping: '@ows_LinkTitle'
	}, {
		name: 'Comment',
		mapping: '@ows_Comment'
	}, {
		name: 'Dashboard',
		mapping: '@ows_Dashboard'
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
	},  {
		name: 'Author',
		mapping: '@ows_Author',
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
		mapping: '@ows_Author',
		persist: false,
		convert: function(v, data) {
			var a = v.split(';#'),
				fixedValue = ''
			if (a.length === 2) {
				fixedValue = a[0];
			}
			return fixedValue;
		}
	}],
	proxy: {
		type: 'splistsoap',
		extraParams: {
			listName: 'CommentsV11'
		}
	}
});