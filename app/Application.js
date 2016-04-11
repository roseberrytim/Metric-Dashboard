Ext.BLANK_IMAGE_URL = 'resources/images/s.gif';
Ext.Loader.setConfig({
	enabled: true,
	disableCaching: false,
	paths: {
		'Ext.ux': 'extensions',
		'Sharepoint': 'packages/sharepoint/src'
	}
});
Ext.define('Metric.Application', {
    name: 'Metric',    
	extend: 'Ext.app.Application',
	requires: ['Sharepoint.data.WebServices', 'Sharepoint.data.proxy.SPList', 'Ext.data.SortTypes', 'Ext.data.Types', 'Ext.form.field.VTypes', 'Ext.window.MessageBox'],  
	controllers: ['Initialization', 'Navigation', 'DashboardDetails', 'DataDetails', 'Dashboard', 'Widget', 'WidgetSettings'],
	views: [],
	stores: [],
	launch: function () {
		var sortTypes = Ext.data.SortTypes,
			guidTest = /^[a-z0-9]{8}(?:-[a-z0-9]{4}){3}-[a-z0-9]{12}$/i;
		
		Ext.tip.QuickTipManager.init();
		
		Ext.apply(Ext.util.Format, {
			colorCode: function (code) {
				if (code[0] != '#' || code === 'transparent') {
					return '#'+ code;
				} else {
					return code;
				}
			},
			SPYesNo: function (value) {
				if (value) {
					return value == '1' ? 'Yes' : 'No';
				}
				return value;
			}
		});
		Ext.apply(Ext.data.SortTypes, {
			asFloat: function(v){
				var n = parseFloat(v);
				  return isNaN(n) ? v : n;
			}
		});		
		Ext.apply(Ext.data.Types, {
			FLOAT: {
				convert: function(v) {
					if (typeof v === 'number') {
						return v;
					}
					return v !== undefined && v !== null && v !== '' ?
						(isNaN(v) ? v : parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10)) : v;
				},
				sortType: sortTypes.asFloat,
				type: 'float'
			},
			SPCALCDATE: {
				convert: function (v) {
					var df = 'Y-m-d H:i:s',
						parsed;

					if (!v) {
						return null;
					}
					// instanceof check ~10 times faster than Ext.isDate. Values here will not be cross-document objects
					if (v instanceof Date) {
						return v;
					}
					
					v = v.split(';#');
					v = v[1];
										
					return Ext.Date.parse(v, df);					
				},
				sortType: sortTypes.asDate,
				type: 'spcalcdate'
			},
			SPCALCNUMBER: {
				convert: function (v) {
					if (typeof v === 'number') {
						return v;
					}
					if (Ext.isNumeric(v)) {
						return parseFloat(v);
					}
					v = v.split(';#');
					v = v[1];
					
					return v !== undefined && v !== null && v !== '' ?
						(isNaN(v) ? v : parseFloat(String(v).replace(Ext.data.Types.stripRe, ''), 10)) : v;
				},
				sortType: sortTypes.asFloat,
				type: 'spcalcnumber'
			},
			SPCALCBOOL: {
				convert: function (v) {
					if (typeof v === 'boolean') {
						return v;
					}
					if (this.useNull && (v === undefined || v === null || v === '')) {
						return null;
					}
					v = v.split(';#');
					v = v[1];
					
					return v === 'true' || v == 1 || v == '1';
				},
				sortType: sortTypes.none,
				type: 'spcalcbool'
			},
			SPCALCTEXT: {
				convert: function (v) {
					v = v.split(';#');
					return String(v[1]);
				},
				sortType: sortTypes.asUCString,
				type: 'spcalctext'
			},
			SPLOOKUP: {				
				convert: function (v) {
					if (Ext.isNumeric(v)) {
						return parseFloat(v);
					}
					v = v.split(';#');
					return String(v[1]);
				},
				sortType: sortTypes.asUCString,
				type: 'splookup'
			}
		});
		Ext.apply(Ext.form.field.VTypes, {
			guid: function (val, field) {
				return guidTest.test(val);
			},
			guidText: 'Not a valid GUID. Must be in the format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"',
			guidMask: /[a-z0-9-]/i
		});
	}
});