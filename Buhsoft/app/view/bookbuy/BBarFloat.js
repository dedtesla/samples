Ext.define('Buh.view.bookbuy.BBarFloat', {
	extend: 'Ext.Window',
	xtype: 'bookbuybbarfloat',
	requires: ['Buh.view.bookbuy.BBar'],
	border: false,
	cls: 'style2018 win-podval-bank',
	resizable: false,
	x: 0,
	minHeight: 45,
	items: [{
		xtype: 'bookbuybbar',
		type: 'buy',
		itemId: 'buy'
	},{
		xtype: 'bookbuybbar',
		type: 'sale',
		itemId: 'sale'
	}],
	layout: 'card',
	header: false,
	hidden: false,
	closable: false,
	mixins: {
		fixMe: 'FixedPosition'
	}
});