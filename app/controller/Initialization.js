/*global Ext, Metric*/
Ext.define('Metric.controller.Initialization', {
    extend: 'Ext.app.Controller',
    models: [],
    stores: ['Dashboards'],
    views: ['Viewport'],
	refs: [{
		ref: 'viewport', selector: 'viewport'
	}],
	init: function () {
        var me = this;
		me.listen({
			controller: {
				'*': {
					'applicationready': 'onApplicationReady'					
				}
			},
			component: {
				'viewport': {
					afterrender: 'onViewportRender'
				}
			}
		});
		me.getUserGroupInfo();
    },
	/**
     * @private
     * Configure applications global user configuration items.  Setup which roles users is in and also configure
     * what type of user the current user is. After configuration of user items is done finally create the application's
     * main viewport
     */
    getUserGroupInfo: function () {
        // Populate AppGlobal Current User Information
       Sharepoint.data.WebServices.getUserCollectionFromSite(this, function (options, success, userResponse) {
            var config = Metric.config.Globals,
				users = userResponse.responseXML.getElementsByTagName('User');
            Ext.each(users, function (user) {
                if (user.getAttribute('ID') === config.currentUserID) {
                    config.currentUser = user.getAttribute('LoginName');
                    config.currentUserDisplayName = user.getAttribute('Name');
                    config.currentUserUpdateValue = config.currentUserID + ';#' + config.currentUser;
                    return false;
                }
            });
            // Get current user's Group/Role membership
            Sharepoint.data.WebServices.getGroupCollectionFromUser(config.currentUser, this, function (options, success, groupResponse) {
                var groups = groupResponse.responseXML.getElementsByTagName('Group');
                Ext.each(groups, function (group) {
                    var groupName = group.getAttribute('Name'),
                        description = group.getAttribute('Description');
                    if (description === config.roleDescription) {
                        if (groupName === config.adminGroupName) {
                            config.isAdmin = true;
                        } else if (groupName === config.powerUserGroupname) {
                            config.isPowerUser = true;
                        }
                        config.currentUserRoles.push(groupName);
                    }
                });
				this.getApplication().fireEvent('applicationready');
            });
        });
    },
    /**
     * Event handler notifies that Application Setup is Complete.
	 * Create the Viewport
     */
	onApplicationReady: function () {
		var dashboard = this.getUrlParameters('dashboard');
		if (dashboard) {
			var viewport = this.getViewport(),
				dashboardRecord = this.getDashboardsStore().getById(dashboard);			
			if (dashboardRecord) {
				Ext.create('Metric.view.Viewport', {
					items: [{
						xtype: 'viewer',
						record: dashboardRecord,
						editing: false,
						publishMode: true
					}]
				});
			}
		} else {	
			Ext.create('Metric.view.Viewport', {
				items: [{
					xtype: 'navigationcontainer'
				}]
			});
		}
	},
	/**
     * Render event handler for the Viewport of the application.
	 * Removes Application Loading Masks
     */
	onViewportRender: function () {
        Ext.get('loading').remove();
        Ext.get('loading-mask').fadeOut({
            remove: true
        });
	},
	
	getUrlParameters: function (parameter){	   
		try {
			var currLocation =  window.location.search,
			   parArr = currLocation.split("?")[1].split("&"),
			   returnBool = true,
			   i = 0,
			   pl = parArr.length,
			   parr;
		   
		   for (i; i < pl; i++){
				parr = parArr[i].split("=");
				if (parr[0] == parameter){
					return decodeURIComponent(parr[1]);
					returnBool = true;
				} else {
					returnBool = false;            
				}
		   }
		   
		   if (!returnBool) return false; 
		} catch (e) {
			return false;
		}
	}
});