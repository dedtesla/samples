Ext.define('Buh.classes.store.NdsTypes', {
	extend: 'Ext.data.ArrayStore',
	fields: ['id', 'name'],
	storeId: 'ndsTypes',
	data: [
		['5', '20 %'],
		['1', '18 %'],
		['2', '10 %'],
		['3', '0 %'],
		['4', 'Не обл.']
	]
});
new Buh.classes.store.NdsTypes();