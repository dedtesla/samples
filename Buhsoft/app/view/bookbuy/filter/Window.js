
Ext.define('Buh.view.bookbuy.filter.Window', {
	extend: 'winFloatTbar',
	cls: 'style2018 init_window pad_small toolbar-highlight',
	width: 700,
	header: false,
	requires: ['Buh.view.bookbuy.filter.Form', 'Buh.view.bookbuy.filter.Line'],
	type: 'buy',
	initComponent: function() {
		this.items = {
			xtype: 'bookbuyfilterform',
			type: this.type
		};
		this.height = (this.type == 'buy' ? 465 : 510);
		this.callParent(arguments);
	},
	alias: 'widget.bookbuyFilterWindow',
	bbar: {
		itemId: 'bbar',
		cls: '',
		items: [{
			xtype: 'greenbuttonsimple',
			itemId: 'applybtn',
			text: 'Применить'
		}, {
			text: 'Сбросить',
			itemId: 'resetbtn',
			icon: _icons.x_red
		}, {
			text: 'Отмена',
			itemId: 'cancelbtn'
		}]
	}
});