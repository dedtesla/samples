Ext.define('Buh.classes.bookbuy.DocTypes', {
	extend: 'Ext.data.ArrayStore',
	fields: ['id', 'name'],
	storeId: 'bookbuyDocTypes',
	batchUpdateMode: 'complete',
	data: [
		["9", "Зачет сч-ф на аванс"],
		["8", "Сч-ф на аванс"],
		["4", "Сч-фактура"],
		["18", "УПД"],
		["19", "Корр С-Ф"]
	],
	proxy: {
		type: 'memory'
	}
});
new Buh.classes.bookbuy.DocTypes();
