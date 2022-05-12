Ext.define('Buh.view.bookbuy.card.GridExplain', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.bookbuygridexplain',
	store: Ext.create('Buh.store.bookbuy.Explain'),
	selModel: 'rowmodel',
	columns: [{
		text: '�� / ����',
		flex: 10,
		dataIndex: 'rnpt'
	},{
		text: '����',
		flex: 1,
		dataIndex: 'okei'
	},{
		text: '����������',
		flex: 2,
		dataIndex: 'count',
		renderer: toLocaleDigits2
	},{
		text: '���������� ��� ���',
		flex: 3,
		align: 'right',
		dataIndex: 'summa_explain',
		tdCls: 'txt-blue2-bold',
		renderer: toLocaleDigits2
	}]
})