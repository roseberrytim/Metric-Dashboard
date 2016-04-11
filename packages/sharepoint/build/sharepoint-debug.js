Ext.define('Sharepoint.data.WebServices', {
    singleton: true,
                           
    buildSOAPPacket: function (param, method, namespace) {
        var packet = "",
            xml = "",
            p;
        if (param) {
            // Call contains parameters
            for (p in param) {
                if (param.hasOwnProperty(p)) {
                    xml += "<" + p + ">" + param[p] + "</" + p + ">";
                }
            }
            packet = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + "<soap:Envelope " + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" " + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">" + "<soap:Body>" + "<" + method + " xmlns=\"" + namespace + "\">" + xml + "</" + method + "></soap:Body></soap:Envelope>";
        } else {
            // Call contains no parameters
            packet = "<?xml version=\"1.0\" encoding=\"utf-8\"?>" + "<soap:Envelope " + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " + "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" " + "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">" + "<soap:Body>" + "<" + method + " xmlns=\"" + namespace + "\" />" + "</soap:Body></soap:Envelope>";
        }
        return packet;
    },
    //Create SharePoint SOAP Based AJAX Web Serivce request
    createRequest: function (serviceUrl, method, params, namespace, scopeCB, successCB) {
        Ext.Ajax.request({
            url: serviceUrl,
            nosim: false,
	    actionMethod: {
                read: 'POST'
            },
            headers: {
                'SOAPAction': namespace + method,
                'Content-Type': 'text/xml; charset=utf-8'
            },
            xmlData: this.buildSOAPPacket(params, method, namespace),
            scope: scopeCB,
            callback: successCB
        });
    },
    //Create SharePoint SOAP Based AJAX Search Web Service request
    searchRequest: function (serviceUrl, method, params, namespace) {
        var response = Ext.Ajax.request({
            url: serviceUrl,
            method: 'POST',
            headers: {
                'SOAPAction': namespace + "/" + method,
                'Content-Type': 'text/xml; charset=utf-8'
            },
            xmlData: this.buildSOAPPacket(params, method, namespace)
        });
        return response;
    },
    // Define SharePoint's Web Services SOAP NameSpaces and URL Paths
    copyNamespace: 'http://schemas.microsoft.com/sharepoint/soap/',
    copyService: L_Menu_BaseUrl + '/_vti_bin/Copy.asmx',
    listsNamespace: 'http://schemas.microsoft.com/sharepoint/soap/',
    listsService: L_Menu_BaseUrl + '/_vti_bin/Lists.asmx',
    permissionsNamespace: 'http://schemas.microsoft.com/sharepoint/soap/directory/',
    permissionsService: L_Menu_BaseUrl + '/_vti_bin/Permissions.asmx',
    userGroupNamespace: 'http://schemas.microsoft.com/sharepoint/soap/directory/',
    userGroupService: L_Menu_BaseUrl + '/_vti_bin/UserGroup.asmx',
    viewsNamespace: 'http://schemas.microsoft.com/sharepoint/soap/',
    viewsService: L_Menu_BaseUrl + '/_vti_bin/Views.asmx',
    versionsNamespace: 'http://schemas.microsoft.com/sharepoint/soap/',
    versionsService: L_Menu_BaseUrl + '/_vti_bin/Versions.asmx',
    workflowNamespace: 'http://schemas.microsoft.com/sharepoint/soap/workflow/',
    workflowService: L_Menu_BaseUrl + '/_vti_bin/Workflow.asmx',
    websNamespace: 'http://schemas.microsoft.com/sharepoint.soap/',
    websService: L_Menu_BaseUrl + '/_vti_bin/Webs.asmx',
    queryExNamespace: 'http://microsoft.com/webservices/OfficeServer/QueryService',
    searchNamespace: 'urn:Microsoft.Search',
    searchService: L_Menu_BaseUrl + '/_vti_bin/Search.asmx',
    // Helper methods to call into SharePoint Web Service methods
    query: function (queryXml) {
        var method = 'Query',
            params = {
                'queryXml': '<![CDATA[' + queryXml + ']]>'
            };
        return this.searchRequest(this.searchService, method, params, this.searchNamespace);
    },
    queryEx: function (queryXml) {
        var method = 'QueryEx',
            params = {
                'queryXml': queryXml
            };
        return this.searchRequest(this.searchService, method, params, this.queryExNamespace);
    },
    addGroup: function (groupName, ownerIdentifier, ownerType, defaultUserLoginName, description, scopeCB, successCB) {
        var method = 'AddGroup',
            params = {
                'groupName': groupName,
                'ownerIdentifier': ownerIdentifier,
                'ownerType': ownerType,
                'defaultUserLoginName': defaultUserLoginName,
                'description': description
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    addList: function (listName, description, templateID, scopeCB, successCB) {
        var method = 'AddList',
            params = {
                'listName': listName,
                'description': description,
                'templateID': templateID
            };
        return this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
	addListFromFeature: function (listName, description, featureID, templateID, customTemplate, scopeCB, successCB) {
		var method = 'AddListFromFeature',
			params = {
				'listName': listName,
				'description': description,
				'featureID': featureID,
				'templateID': templateID,
				'customTemplate': customTemplate
			};
		return this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
	},
    addPermission: function (objectName, objectType, permissionIdentifier, permissionType, permissionMask, scopeCB, successCB) {
        var method = 'AddPermission',
            params = {
                'objectName': objectName,
                'objectType': objectType,
                'permissionIdentifier': permissionIdentifier,
                'permissionType': permissionType,
                'permissionMask': permissionMask
            };
        return this.createRequest(this.permissionsService, method, params, this.permissionsNamespace, scopeCB, successCB);
    },
    addUserToGroup: function (groupName, userName, userLoginName, userEmail, userNotes, scopeCB, successCB) {
        var method = 'AddUserToGroup',
            params = {
                'groupName': groupName,
                'userName': userName,
                'userLoginName': userLoginName,
                'userEmail': userEmail,
                'userNotes': userNotes
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    addAttachment: function (listName, listItemID, fileName, attachment, scopeCB, successCB) {
		 var method = 'AddAttachment',
            params = {
                'listName': listName,
				'listItemID': listItemID,
				'fileName': fileName,
				'attachment': attachment
            };
        this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
	},
	callUpdateListItems: function (listName, fields, command, rootFolder, scopeCB, successCB) {
        var batch, itemArray, i = 0,
            il, att, currentItem;
        batch = "<Batch OnError='Continue'";
        if (rootFolder !== null) {
            batch += " RootFolder='" + rootFolder + "'";
        }
        batch += ">";
        if (fields.constructor !== Array) {
            itemArray = [fields];
        } else {
            itemArray = fields;
        }
        il = itemArray.length;
        for (i; i < il; i++) {
            currentItem = itemArray[i];
            batch += "<Method ID='1' Cmd='" + command + "'>";
            for (att in currentItem) {
                if (currentItem.hasOwnProperty(att)) {
                    batch += "<Field Name='" + att + "'><![CDATA[" + currentItem[att] + "]]></Field>";
                }
            }
            batch += "</Method>";
        }
        batch += "</Batch>";
        return this.updateListItems(listName, batch, scopeCB, successCB);
    },
    callFolderNew: function (listName, folderName, command, rootFolder, scopeCB, successCB) {
        var batch;
        batch = "<Batch OnError='Continue'";
        if (rootFolder !== null) {
            batch += " RootFolder='" + rootFolder + "'";
        }
        batch += ">";
        batch += "<Method ID='1' Cmd='" + command + "'>" + "<Field Name='FSObjType'>1</Field>" + "<Field Name='BaseName'>" + folderName + "</Field>" + "</Method>" + "</Batch>";
        return this.updateListItems(listName, batch, scopeCB, successCB);
    },
    callFolderUpdate: function (listName, itemId, filePath, folderName, command, scopeCB, successCB) {
        var batch;
        batch = "<Batch OnError='Continue'>";
        batch += "<Method ID='1' Cmd='" + command + "'>" + "<Field Name='FSObjType'>1</Field>" + "<Field Name='ID'>" + itemId + "</Field>" + "<Field Name='FileRef'>" + filePath + "</Field>" + "<Field Name='BaseName'>" + folderName + "</Field>" + "</Method>" + "</Batch>";
        return this.updateListItems(listName, batch, scopeCB, successCB);
    },
    copyIntoItems: function (SourceUrl, DestinationUrls, Fields, Stream, scopeCB, successCB) {
        var method = 'CopyIntoItems',
            params = {
                'SourceUrl': SourceUrl,
                'DestinationUrls': '<string>' + DestinationUrls + '</string>',
                'Fields': Fields,
                'Stream': Stream
            };
        return this.createRequest(this.copyService, method, params, this.copyNamespace, scopeCB, successCB);
    },
    copyIntoItemsLocal: function (SourceUrl, DestinationUrls, scopeCB, successCB) {
        var method = 'CopyIntoItemsLocal',
            params = {
                'SourceUrl': SourceUrl,
                'DestinationUrls': '<string>' + DestinationUrls + '</string>'
            };
        return this.createRequest(this.copyService, method, params, this.copyNamespace, scopeCB, successCB);
    },
    createFolder: function (listName, folderName, rootFolder, scopeCB, successCB) {
        return this.callFolderNew(listName, folderName, "New", rootFolder, scopeCB, successCB);
    },
    updateFolder: function (listName, itemId, filePath, folderName, scopeCB, successCB) {
        return this.callFolderUpdate(listName, itemId, filePath, folderName, "Update", scopeCB, successCB);
    },
    deleteList: function (listName, scopeCB, successCB) {
        var method = 'DeleteList',
            params = {
                'listName': listName
            };
        return this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
    getGroupCollectionFromSite: function (scopeCB, successCB) {
        var method = 'GetGroupCollectionFromSite',
            params = {};
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getGroupCollectionFromUser: function (userLoginName, scopeCB, successCB) {
        var method = 'GetGroupCollectionFromUser',
            params = {
                'userLoginName': userLoginName
            };
        this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getGroupInfo: function (groupName, scopeCB, successCB) {
        var method = 'GetGroupInfo',
            params = {
                'groupName': groupName
            };
        this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getList: function (listName, scopeCB, successCB) {
        var method = 'GetList',
            params = {
                'listName': listName
            };
        this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
	getListAndView: function (baseUrl, listName, viewName, scopeCB, successCB) {
        var method = 'GetListAndView',
            params = {
                'listName': listName,
				'viewName': viewName
            },
			serviceUrl = baseUrl + '/_vti_bin/Lists.asmx';
        this.createRequest(serviceUrl, method, params, this.listsNamespace, scopeCB, successCB);
    },
    getListCollection: function (scopeCB, successCB) {
        var method = 'GetListCollection',
            params = {};
        this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
    getListItems: function (listName, viewName, query, viewFields, rowLimit, queryOptions, webID, scopeCB, successCB) {
        if (queryOptions === null || queryOptions === '') {
            queryOptions = '<QueryOptions/>';
        }
        var method = 'GetListItems',
            params = {
                'listName': listName,
                'viewName': viewName,
                'query': query,
                'viewFields': viewFields,
                'rowLimit': rowLimit,
                'queryOptions': queryOptions,
                'webID': webID
            };
        this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
	crossSiteGetListItems: function (baseUrl, listName, viewName, query, viewFields, rowLimit, queryOptions, webID, scopeCB, successCB) {
		if (queryOptions === null || queryOptions === '') {
            queryOptions = '<QueryOptions/>';
        }
        var method = 'GetListItems',
            params = {
                'listName': listName,
                'viewName': viewName,
                'query': query,
                'viewFields': viewFields,
                'rowLimit': rowLimit,
                'queryOptions': queryOptions,
                'webID': webID
            },
			serviceUrl = baseUrl + '/_vti_bin/Lists.asmx';
        this.createRequest(serviceUrl, method, params, this.listsNamespace, scopeCB, successCB);
	},
    getPermissionCollection: function (objectName, objectType, scopeCB, successCB) {
        var method = 'GetPermissionCollection',
            params = {
                'objectName': objectName,
                'objectType': objectType
            };
        return this.createRequest(this.permissionsService, method, params, this.permissionsNamespace, scopeCB, successCB);
    },
    getTemplatesForItem: function (item, scopeCB, successCB) {
        var method = 'GetTemplatesForItem',
            params = {
                'item': item
            };
        return this.createRequest(this.workflowService, method, params, this.workflowNamespace, scopeCB, successCB);
    },
    getView: function (listName, viewName, scopeCB, successCB) {
        var method = 'GetView',
            params = {
                'listName': listName,
				'viewName': viewName
            };
        this.createRequest(this.viewsService, method, params, this.viewsNamespace, scopeCB, successCB);
    },
	getViewCollection: function (listName, scopeCB, successCB) {
        var method = 'GetViewCollection',
            params = {
                'listName': listName
            };
        this.createRequest(this.viewsService, method, params, this.viewsNamespace, scopeCB, successCB);
    },
    getVersionCollection: function (strlistID, strlistItemID, strFieldName, scopeCB, successCB) {
        var method = 'GetVersionCollection',
            params = {
                'strlistID': strlistID,
                'strlistItemID': strlistItemID,
                'strFieldName': strFieldName
            };
        return this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
    getVersions: function (fileName, scopeCB, successCB) {
        var method = 'GetVersions',
            params = {
                'fileName': fileName
            };
        return this.createRequest(this.versionsService, method, params, this.versionsNamespace, scopeCB, successCB);
    },
    getUserCollection: function (userLoginNamesXml, scopeCB, successCB) {
        var method = 'GetUserCollection',
            params = {
                'userLoginNamesXml': userLoginNamesXml
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getUserCollectionFromSite: function (scopeCB, successCB) {
        var method = 'GetUserCollectionFromSite',
            params = {};
        this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getUserCollectionFromGroup: function (groupName, scopeCB, successCB) {
        var method = 'GetUserCollectionFromGroup',
            params = {
                'groupName': groupName
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getRoleCollectionFromUser: function (userLoginName, scopeCB, successCB) {
        var method = 'GetRoleCollectionFromUser',
            params = {
                'userLoginName': userLoginName
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getRoleCollectionFromWeb: function (scopeCB, successCB) {
        var method = 'GetRoleCollectionFromWeb',
            params = {};
        this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    getWeb: function (webUrl, scopeCB, successCB) {
        var method = 'GetWeb',
            params = {
                'webUrl': webUrl
            };
        return this.createRequest(this.websService, method, params, this.websNamespace, scopeCB, successCB);
    },
    getWebCollection: function (scopeCB, successCB) {
        var method = 'GetWebCollection',
            params = {};
        return this.createRequest(this.websService, method, params, this.websNamespace, scopeCB, successCB);
    },
    getAllSubWebCollection: function (scopeCB, successCB) {
        var method = 'GetAllSubWebCollection',
            params = {};
        return this.createRequest(this.websService, method, params, this.websNamespace, scopeCB, successCB);
    },
    quickAddListItem: function (listName, fields, rootFolder, scopeCB, successCB) {
        return this.callUpdateListItems(listName, fields, "New", rootFolder, scopeCB, successCB);
    },
    quickDeleteDocLibItem: function (listName, itemIds, filePath, scopeCB, successCB) {
        var batch, idFields = [],
            i = 0,
            il, att, currentItem;
        batch = "<Batch OnError='Continue'>";
        if (itemIds.constructor === Array) {
            il = itemIds.length;
            for (i; i < il; i++) {
                idFields.push({
                    ID: itemIds[i]
                });
            }
        } else {
            il = 1;
            idFields = [{
                ID: itemIds
            }];
        }
        for (i = 0; i < il; i++) {
            currentItem = idFields[i];
            batch += "<Method ID='1' Cmd='Delete'>";
            for (att in currentItem) {
                if (currentItem.hasOwnProperty(att)) {
                    batch += "<Field Name='" + att + "'><![CDATA[" + currentItem[att] + "]]></Field>";
                    batch += "<Field Name=\"FileRef\">" + filePath + "</Field>";
                }
            }
            batch += "</Method>";
        }
        batch += "</Batch>";
        return this.updateListItems(listName, batch, scopeCB, successCB);
    },
    quickDeleteListItem: function (listName, itemIds, scopeCB, successCB) {
        var idFields = [],
            i = 0,
            il = itemIds.length;
        if (itemIds.constructor === Array) {
            for (i; i < il; i++) {
                idFields.push({
                    ID: itemIds[i]
                });
            }
        } else {
            idFields = [{
                ID: itemIds
            }];
        }
        return this.callUpdateListItems(listName, idFields, "Delete", null, scopeCB, successCB);
    },
    quickUpdateListItem: function (listName, fields, rootFolder, scopeCB, successCB) {
        return this.callUpdateListItems(listName, fields, "Update", rootFolder, scopeCB, successCB);
    },
    removeGroup: function (groupName, scopeCB, successCB) {
        var method = 'RemoveGroup',
            params = {
                'groupName': groupName
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    removePermissionCollection: function (objectName, objectType, memberIdsXml, scopeCB, successCB) {
        var method = 'RemovePermissionCollection',
            params = {
                'objectName': objectName,
                'objectType': objectType,
                'memberIdsXml': memberIdsXml
            };
        return this.createRequest(this.permissionsService, method, params, this.permissionsNamespace, scopeCB, successCB);
    },
    removeUserFromGroup: function (groupName, userLoginName, scopeCB, successCB) {
        var method = 'RemoveUserFromGroup',
            params = {
                'groupName': groupName,
                'userLoginName': userLoginName
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    startWorkflow: function (item, templateId, workflowParameters, scopeCB, successCB) {
        var method = 'StartWorkflow',
            params = {
                'item': item,
                'templateId': templateId,
                'workflowParameters': workflowParameters
            };
        return this.createRequest(this.workflowService, method, params, this.workflowNamespace, scopeCB, successCB);
    },
    updateGroupInfo: function (oldGroupName, groupName, ownerIdentifier, ownerType, description, scopeCB, successCB) {
        var method = 'UpdateGroupInfo',
            params = {
                'oldGroupName': oldGroupName,
                'groupName': groupName,
                'ownerIdentifier': ownerIdentifier,
                'ownerType': ownerType,
                'description': description
            };
        return this.createRequest(this.userGroupService, method, params, this.userGroupNamespace, scopeCB, successCB);
    },
    updateListItems: function (listName, updates, scopeCB, successCB) {
        var method = 'UpdateListItems',
            params = {
                'listName': listName,
                'updates': updates
            };
        return this.createRequest(this.listsService, method, params, this.listsNamespace, scopeCB, successCB);
    },
    base64: {
        keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4, il, i = 0,
                output = "";
            input = Ext.ux.sharepoint.WebServices.base64.utf8_encode(input);
            il = input.length;
            while (i < il) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output + this.keyStr.charAt(enc1) + this.keyStr.charAt(enc2) + this.keyStr.charAt(enc3) + this.keyStr.charAt(enc4);
            }
            return output;
        },
        decode: function (input) {
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4, il, i = 0,
                output = "";
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            il = input.length;
            while (i < il) {
                enc1 = this.keyStr.indexOf(input.charAt(i++));
                enc2 = this.keyStr.indexOf(input.charAt(i++));
                enc3 = this.keyStr.indexOf(input.charAt(i++));
                enc4 = this.keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = Ext.ux.sharepoint.WebServices.base64.utf8_decode(output);
            return output;
        },
        utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "",
                sl = string.length,
                n = 0,
                c;
            for (n; n < sl; n++) {
                c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        utf8_decode: function (utftext) {
            var string = "",
                i = 0,
                ul = utftext.length,
                c = 0,
                c2 = 0,
                c3;
            while (i < ul) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    },
	moveDocLibFolder: function (oldUrl, newUrl, scopeCB, successCB) {
		// uses RPC method to move folder from one location to another
		var renameOption = "findbacklinks",
			putOption = "overwrite,createdir,migrationsemantics",       
			doCopy = false;
			method = Ext.String.format("method=move+document%3a12.0.4518.1016&service_name=%2f&oldUrl={0}&newUrl={1}&url_list=[]&rename_option={2}&put_option={3}&docopy={4}", oldUrl, newUrl, renameOption, putOption, doCopy);
		Ext.Ajax.request({
			url: L_Menu_BaseUrl + '/_vti_bin/_vti_aut/author.dll',
            actionMethod: {
                read: 'POST'
            },
            headers: {
				'Content-Type': 'application/x-vermeer-urlencoded',
				'X-Vermeer-Content-Type': 'application/x-vermeer-urlencoded'
            },
            xmlData: method,
            scope: scopeCB,
            callback: successCB
		});
	}
});

Ext.define('Sharepoint.data.proxy.SPList', {
    extend:  Ext.data.soap.Proxy ,
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

