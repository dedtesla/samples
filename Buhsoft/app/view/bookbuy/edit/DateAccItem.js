Ext.define('Buh.view.bookbuy.edit.DateAccItem', {
	extend: 'Ext.container.Container',
	cls: 'cnt-item',
	xtype: 'bookbuydateaccitem',
	layout: 'hbox',
	index: 0,
	initComponent: function () {
		this.items = [{
			xtype: 'gbs_date',
			submitFormat: 'Y-m-d',
			name: `Item[dates_accounting][${this.index}]`,
			width: 170
		},{
			xtype: 'button',
			action: 'remove',
			hidden: true,
			text: 'x',
			cls: 'x-reset_button'
		}];
		this.callParent(arguments);
	}
});