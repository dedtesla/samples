Ext.define('Buh.view.bookbuy.card.GridExplain', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.bookbuygridexplain',
	store: Ext.create('Buh.store.bookbuy.Explain'),
	selModel: 'rowmodel',
	columns: [{
		text: 'ТД / РНПТ',
		flex: 10,
		dataIndex: 'rnpt'
	},{
		text: 'ОКЕИ',
		flex: 1,
		dataIndex: 'okei'
	},{
		text: 'Количество',
		flex: 2,
		dataIndex: 'count',
		renderer: toLocaleDigits2
	},{
		text: 'Стоиомость без ндс',
		flex: 3,
		align: 'right',
		dataIndex: 'summa_explain',
		tdCls: 'txt-blue2-bold',
		renderer: toLocaleDigits2
	}]
})