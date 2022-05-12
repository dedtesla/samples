Ext.define('Buh.view.bookbuy.ItemMenu', {
	extend: 'Ext.menu.Menu',
	alias: 'widget.bookbuyItemMenu',
	cls: 'style2018 menu-gray',
	items: [{
		text: 'Прослеживаемый товар',
		action: 'showCard',
		itemId: 'showCard',
		icon: _icons.card
	},{
		text: 'Изменить',
		action: 'edit',
		itemId: 'edit',
		icon: _icons.edit
	},{
		text: 'Удалить',
		action: 'delete',
		itemId: 'delete',
		icon: _icons.del
	}]
});