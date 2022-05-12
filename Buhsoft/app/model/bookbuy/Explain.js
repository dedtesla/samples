Ext.define('Buh.model.bookbuy.Explain', {
	extend: 'Ext.data.Model',
	fields: [
		'id',// int(10) AI
		'owner_id',// int(10) - id старшего
		'rnpt',// c(250) - РНПТ
		'okei',// c(5) - ОКЕИ
		'count',// d(15,5) - количество
		'summa_explain'// d(15,2) - сумма по товару
	]
})