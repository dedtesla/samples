Ext.define('Buh.model.bookbuy.Explain', {
	extend: 'Ext.data.Model',
	fields: [
		'id',// int(10) AI
		'owner_id',// int(10) - id ��������
		'rnpt',// c(250) - ����
		'okei',// c(5) - ����
		'count',// d(15,5) - ����������
		'summa_explain'// d(15,2) - ����� �� ������
	]
})