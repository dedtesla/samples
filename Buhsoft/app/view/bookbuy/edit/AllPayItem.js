Ext.define('Buh.view.bookbuy.edit.AllPayItem', {
	extend: 'Ext.container.Container',
	cls: 'cnt-item',
	xtype: 'bookbuyallpayitem',
	layout: 'hbox',
	index: 0,
	initComponent: function () {
		this.items = [{
			xtype: 'textfield',
			cls: 'input-number',
			name: `Item[all_pay][${this.index}][n]`,
			width: 170
		},{
			xtype: 'gbs_date',
			submitFormat: 'Y-m-d',
			name: `Item[all_pay][${this.index}][dat]`,
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