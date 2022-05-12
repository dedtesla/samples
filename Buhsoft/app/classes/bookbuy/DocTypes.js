Ext.define('Buh.classes.bookbuy.DocTypes', {
	extend: 'Ext.data.ArrayStore',
	fields: ['id', 'name'],
	storeId: 'bookbuyDocTypes',
	batchUpdateMode: 'complete',
	data: [
		["9", "����� ��-� �� �����"],
		["8", "��-� �� �����"],
		["4", "��-�������"],
		["18", "���"],
		["19", "���� �-�"]
	],
	proxy: {
		type: 'memory'
	}
});
new Buh.classes.bookbuy.DocTypes();
