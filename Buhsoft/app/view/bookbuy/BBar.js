/**
 * ������ ������� �����
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
		html: '�����'
	},{
		xtype: 'tbardisplay',
		for: 'buy',
		itemId: 'summa',
		title: '��������� ���. ���'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'summa',
		title: '��������� ���. ��� � ���'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum20',
		title: '��������� 20, ��� ���'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum10',
		title: '��������� 10, ��� ���'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sum0',
		title: '��������� 0, ��� ���'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sumnds20',
		title: '��� 20'
	}, {
		xtype: 'tbardisplay',
		for: 'sale',
		itemId: 'sumnds10',
		title: '��� 10'
	}, {
		xtype: 'tbardisplay',
		itemId: 'sumnds',
		for: 'buy',
		title: '����� ���'
	}, {
		xtype: 'tbardisplay',
		itemId: 'sumb',
		title: '��������� ��� ���'
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