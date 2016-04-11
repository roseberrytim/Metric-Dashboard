Ext.define('Metric.view.dashboard.Comments', {
	extend: 'Ext.container.Container', 
	alias: 'widget.comments', 
	title: 'Comments',
	layout: {
		type: 'vbox',
		align: 'stretch'
	},	
	commentsTpl: [
		'<tpl for=".">',
			'<div class="comment-{[xindex % 2 === 0 ? "even" : "odd"]}">',
				'<div class="detail-comment-wrapper">',							
					'<div class="detail-comment">',
						'{Author}',
						'<p>{Comment}</p>',
					'</div>',
				'</div>',
				'<div class="detail-comment-createdby">Received: <span>{[this.formatDate(values.Created)]}</span></div>',
				'<div class="callout callout-border"></div><div class="callout callout-pointer"></div>',
			'</div>',
			'<br class="clear">',
		'</tpl>',
		{
			formatDate: function (date) {
				return Ext.Date.format(date, 'F j, Y, g:i a');
			}
		}
	],
	
	initComponent: function () {
		Ext.apply(this, {
			items: [{
				xtype: 'component',
				cls: 'comments-label',
				html: '<h2>Comments</h2>'
			}, {
				xtype: 'container',
				itemId: 'postContainer',
				layout: 'hbox',
				cls: 'comments-post-container',				
				items: [{
					xtype: 'textfield',
					emptyText: 'Enter new comment...',
					flex: 1,
					margin: '0 5 0 0'
				}, {
					xtype: 'button',					
					action: 'postComment',
					text: 'Post'
				}]
			}, {				
				xtype: 'dataview',
				itemId: 'comments',
				flex: 1,						
				autoScroll: true,
				margin: '10 0 0 0',
				cls: 'dashboard-comments',				
				store: 'Comments',
				selModel: {
					enableKeyNav: false
				},
				itemSelector: 'div.detail-comment',
				tpl: this.commentsTpl,				
				emptyText: 'No Comments Posted'				
			}]
		});
		
		this.callParent(arguments);
	}
});