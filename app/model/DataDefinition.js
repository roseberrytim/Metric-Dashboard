Ext.define('Metric.model.DataDefinition', {
    extend: 'Ext.data.Model',
	idProperty: 'ID',
	fields: [{
		name: "ID",
		mapping: '@ows_ID'
	}, {
		name: "Title",
		mapping: '@ows_LinkTitle'
	}, {
		name: 'Headers',
		mapping: '@ows_Headers'
	}, {
		name: 'DefinitionType',
		mapping: '@ows_DefinitionType'
	}, {
		name: 'FirstRowHeader',
		mapping: '@ows_FirstRowHeader',
		type: 'boolean'
	}, {
		name: 'Url',
		mapping: '@ows_Url'
	}, {
		name: 'SPListName',
		mapping: '@ows_SPListName'
	}, {
		name: 'View',
		mapping: '@ows_View'
	}, {
		name: 'Modified',
		mapping: '@ows_Modified',
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
	}],
	proxy: {
		type: 'splistsoap',
		extraParams: {
			listName: 'DataDefinitionsV11'
		}
	}
});