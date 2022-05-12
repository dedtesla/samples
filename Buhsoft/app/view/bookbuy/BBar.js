/**
 * Панель подвала Книги
 *
 */
Ext.define('Buh.view.bookbuy.BBar', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.bookbuybbar',
	xtype: 'bookbuybbar',
	padding: '2 0 0 0',
	initComponent: function() {
		let me = this;
		me.items = me.items.filter((item) => (!item.for || item.for === me.type));
		this.callParent(arguments)
	},
	items: [{
		xtype: 'container',
		html: 'Итого'
	},{
		xtype: 'tbardisplay',
		for: 'buy',
		itemId: 'summa',
		title: 'Стоимость вкл. НДС'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'summa',
		title: 'Стоимость вкл. НДС в руб'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum20',
		title: 'Стоимость 20, без НДС'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum10',
		title: 'Стоимость 10, без НДС'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum0',
		title: 'Стоимость 0, без НДС'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sumnds20',
		title: 'НДС 20'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sumnds10',
		title: 'НДС 10'
	}, {
		xtype: 'tbardisplay',
		itemId: 'sumnds',
		for: 'buy',
		title: 'Сумма НДС'
	}, {
		xtype: 'tbardisplay',
		itemId: 'sumb',
		title: 'Стоимость без НДС'
	}]
});

Ext.define('Buh.view.bookbuy.Display', {
	extend: 'Ext.form.field.Display',
	xtype: 'tbardisplay',
	title: '',
	renderer: function (value) {
		value = toLocaleDigits2(value);
		return `<span style="margin-right: 8px;">${this.title}</span><span class="txt-darkgrey-bold">${value}</span>`;
	}
});