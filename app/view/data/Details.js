Ext.define('Metric.view.data.Details', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.datadetails',
	requires: ['Sharepoint.data.proxy.SPList', 'Ext.grid.column.Date', 'Ext.grid.column.Boolean', 'Ext.grid.column.Number'],
	closable: true,	
	autoScroll: true,
	config: {
		type: '',		
		record: null,
		fields: []
	},
	constructor: function (config) {
		this.initConfig(config);
		this.callParent(arguments);
	},
	initComponent: function () {
		var store = this.store || '',
			columns = this.buildColumns();		
		
		Ext.apply(this, {
			columns: columns,
			store: store			
		});
		this.callParent();
	},
	buildColumns: function () {
		var type = this.getType(),
			fields = this.getFields(),
			fl = fields.length,
			columns = [],
			i = 0,
			field, dataIndex, displayName, valueType, calcType, editor;
		
		if (type === 'SharePointList') {
			for (i; i < fl; i++) {
				field = fields[i];
				displayName = field.name;
				valueType = field.type;
				dataIndex = field.dataIndex;
				
				if (valueType === 'DateTime') {
					columns.push({
						xtype: 'datecolumn',
						text: displayName,
						dataIndex: dataIndex,						
						format: 'm/d/Y',
						filterable: true
					});
				} else if (valueType === 'Calculated') {
					calcType = field.calcType || false;
					if (calcType === 'DateTime') {
						columns.push({
							xtype: 'datecolumn',
							text: displayName,
							dataIndex: dataIndex,							
							format: 'm/d/Y',
							filterable: true
						});
					} else if (calcType === 'Boolean') {
						columns.push({
							xtype: 'booleancolumn',
							text: displayName,
							dataIndex: dataIndex,							
							trueText: 'Yes',
							falseText: 'No',
							filterable: true
						});
					} else {
						columns.push({
							text: displayName,
							dataIndex: dataIndex,
							filterable: true							
						});
					}
				} else if (valueType === 'Number') {
					columns.push({
						xtype: 'numbercolumn',
						text: displayName,
						dataIndex: dataIndex,
						filterable: true
					});
				} else if (valueType === 'Currency') {
					columns.push({
						xtype: 'numbercolumn',
						text: displayName,
						dataIndex: dataIndex,
						renderer: Ext.util.Format.usMoney,
						filterable: true
					});
				} else if (valueType === 'Lookup') {
					calcType = field.countRelated || false;
					if (calcType) {
						columns.push({
							xtype: 'numbercolumn',
							text: displayName,
							dataIndex: dataIndex,
							filterable: true
						});
					}					
				} else {
					columns.push({
						text: displayName,
						dataIndex: dataIndex,
						filterable: true					
					});
				}
			}
		}
		return columns;	
	}	
});