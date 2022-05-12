Ext.define('Buh.store.bookbuy.Buys', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.bookbuy.Buy',
    buffered: true,
    leadingBufferZone: 100,
    pageSize: 100,
    proxy: {
        type: 'ajax',
        api: {
            read: dir_start_buh_ + 'bookbuy/gridData',
            position: dir_start_buh_ + 'bookbuy/findPosition',
            countall: dir_start_buh_ + 'bookbuy/calcCountAll'
        },
        reader: {
            type: 'json',
            root: 'data',
            totalProperty: 'totalCount'
        }
    },
    listeners: {
        beforeload: function() {
            if(this.pageMap) {
                this.pageMap.clear()
            }
        }
    }
})