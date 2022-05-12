Ext.define('Buh.store.bookbuy.Explain', {
	extend: 'Ext.data.Store',
	model: 'Buh.model.bookbuy.Explain',
	proxy: {
		type: 'ajax',
		api: {
			read: dir_start_buh_ + 'bookbuy/gridExplain',
		},
		reader: {
			type: 'json',
			root: 'data'
		}
	}
})