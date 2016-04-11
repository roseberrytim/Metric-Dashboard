Ext.define('Metric.view.dashboard.widget.image.Image', {
    extend: 'Metric.view.dashboard.widget.WidgetBox',
    alias: 'widget.imagebox',
    requires: ['Ext.container.Container'],
    type: 'imagebox',
    initComponent: function () {
        var widgetSettings = this.getWidgetSettings(),
            url = widgetSettings.imageUrl || 'resources/images/default.png';
        image = this.buildImage(url);
        Ext.apply(this, {
            items: [{
                xtype: 'container',
                itemId: 'imageContainer',
                style: image
            }]
        });
        this.callParent(arguments);
    },
    buildImage: function (url) {
        var absUrl = this.getAbsoluteUrl(url);
		// Need to update this method to pass the full path of the image due to issue with IE8 and AlphaImageLoader filter throwing content security warnings
        return Ext.String.format("background: url({0}) no-repeat center center; background-size: contain;filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{0}', sizingMethod='scale');-ms-filter: 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src='{0}', sizingMethod='scale')';", absUrl);
    },
    getAbsoluteUrl: function (url) {
		/* Only accept commonly trusted protocols:
		 * Only data-image URLs are accepted, Exotic flavours (escaped slash,
		 * html-entitied characters) are not supported to keep the function fast */
        if (/^(https?|file|ftps?|mailto|javascript|data:image\/[^;]{2,9};):/i.test(url)) return url; //Url is already absolute
        var base_url = location.href.match(/^(.+)\/?(?:#.+)?$/)[0] + "/";        
        if (url.substring(0, 2) == "//") {            
            return location.protocol + url;
        } else if (url.charAt(0) == "/") {            
            return location.protocol + "//" + location.host + url;
        } else if (url.substring(0, 2) == "./") {            
            url = "." + url;
        } else if (/^\s*$/.test(url)) {            
            return ""; //Empty = Return nothing
        } else {            
            url = "../" + url;
        }

        url = base_url + url;

        while (/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g, "")));

        /* Escape certain characters to prevent XSS */
        url = url.replace(/\.$/, "").replace(/\/\./g, "").replace(/"/g, "%22").replace(/'/g, "%27").replace(/</g, "%3C").replace(/>/g, "%3E");
        return url;
    }
});