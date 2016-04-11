Ext.define('Sharepoint.data.proxy.SPList', {
    extend: 'Ext.data.soap.Proxy',
	alias: 'proxy.splistsoap',	
	constructor: function(config) {
        var me = this,
	    url;			
        config = config || {};
	url = config.baseSiteUrl || L_Menu_BaseUrl;
	
	Ext.apply(config, {
	    url: url + '/_vti_bin/Lists.asmx',
	    envelopeTpl: [
		'<?xml version="1.0" encoding="utf-8"?>',
		'<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
			'{[values.bodyTpl.apply(values)]}',
		'</soap:Envelope>'
	    ],
	    createBodyTpl: [
		'<soap:Body>',
		    '<{operation} xmlns="{targetNamespace}">',
			'<listName>{params.listName}</listName>',
			'<updates>',
			    '<Batch OnError="Continue" RootFolder="">',
				'<tpl for="records">',
				    '<Method ID="{[xindex]}" Cmd="New">',
					'<tpl if="docLibrary">',
					    '<Field Name="FSObjType">1</Field>',
					    '<Field Name="ID">New</Field>',
					    '<Field Name="BaseName>{[values.get("Name")]}</Field>',
					    '<Field Name="ContentType">{[values.get("ContentType")]}</Field>',
					'<tpl else>',
					    '<tpl for="fields">',
						'<tpl if = "persist">',
						    '<Field Name="{name}">{[this.getModifiedValue(parent, values.name)]}</Field>',
						'</tpl>',
					    '</tpl>',
					'</tpl>',
				    '</Method>',
				'</tpl>',
			    '</Batch>',
			'</updates>',
		    '</{operation}>',
		'</soap:Body>',
		{
		    getIdField: function (record) {
			var idProperty = record.idProperty;
			return record.get(idProperty);
		    },
		    getModifiedValue: function (record, fieldName) {
			var field = record.fields.get(fieldName),
			    dateFormat = field.dateWriteFormat || field.dateFormat,
			    value = record.get(fieldName);
									
			if (field.serialize) {
			    value = field.serialize(value, record);
			} else if (field.type === Ext.data.Types.DATE && dateFormat && Ext.isDate(value)) {
			    value = Ext.Date.format(value, dateFormat);
			}				
			
			return "<![CDATA[" + value + "]]>";					
		    }
		}
	    ],
	    updateBodyTpl: [
		'<soap:Body>',
		    '<{operation} xmlns="{targetNamespace}">',
			'<listName>{params.listName}</listName>',
			'<updates>',
			    '<Batch OnError="Continue" RootFolder="">',
				'<tpl for="records">',
				    '<Method ID="{#}" Cmd="Update">',
				    '<tpl if="docLibrary">',
					    '<Field Name="FSObjType">1</Field>',
					    '<Field Name="ID">{[this.getIdField(values)]}</Field>',
					    '<Field Name="FileRef>{[values.get("Path")]}</Field>',
					    '<Field Name="BaseName">{[values.get("Name")]}</Field>',
					'<tpl else>',
					    '<Field Name="ID">{[this.getIdField(values)]}</Field>',
					    '<tpl foreach="modified">',
						'<Field Name="{$}">{[this.getModifiedValue(parent, xkey)]}</Field>',
					    '</tpl>',
					'</tpl>',
				    '</Method>',
				'</tpl>',
			    '</Batch>',
			'</updates>',
		    '</{operation}>',
		'</soap:Body>',
		{
		    getIdField: function (record) {
			var idProperty = record.idProperty;
			return record.get(idProperty);
		    },
		    getModifiedValue: function (record, fieldName) {
			var field = record.fields.get(fieldName),
			    dateFormat = field.dateWriteFormat || field.dateFormat,
			    value = record.get(fieldName)
									
			if (field.serialize) {
			    value = field.serialize(value, record);
			} else if (field.type === Ext.data.Types.DATE && dateFormat && Ext.isDate(value)) {
			    value = Ext.Date.format(value, dateFormat);
			}				
			
			return "<![CDATA[" + value + "]]>";
		    }					
		}
	    ],
	    destroyBodyTpl: [
		'<soap:Body>',
		    '<{operation} xmlns="{targetNamespace}">',
			'<listName>{params.listName}</listName>',
			'<updates>',
			    '<Batch OnError="Continue" RootFolder="">',
				'<tpl for="records">',
				    '<Method ID="{#}" Cmd="Delete">',
					'<tpl if="docLibrary">',
					    '<Field Name="FSObjType">1</Field>',
					    '<Field Name="ID">{[this.getIdField(values)]}</Field>',
					    '<Field Name="FileRef">{[this.unescapeString(values.get("Path"))]}</Field>',
					'<tpl else>',
					    '<Field Name="ID">{[this.getIdField(values)]}</Field>',
					'</tpl>',
				    '</Method>',
				'</tpl>',
			    '</Batch>',
			'</updates>',
		    '</{operation}>',
		'</soap:Body>',
		{
		    getIdField: function (record) {
			var idProperty = record.idProperty;
			return record.get(idProperty);
		    },
		    unescapeString: function (path) {
			// Sharepoint function to unescape url encoded strings
			return unescapeProperly(path);
		    }
		}
	    ],
	    api: {
		read: 'GetListItems',
		create: 'UpdateListItems',
		destroy: 'UpdateListItems',
		update: 'UpdateListItems'
	    },
	    soapAction: {
		read: 'http://schemas.microsoft.com/sharepoint/soap/GetListItems',
		create: 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems',
		update: 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems',
		destroy: 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems'
	    },
	    operation: 'op',
	    targetNamespace: 'http://schemas.microsoft.com/sharepoint/soap/',
	    reader: {
		type: 'soap',
		record: 'z|row',
		namespace: 'z'
	    }
	});
	me.callParent([config]);
    }	
});