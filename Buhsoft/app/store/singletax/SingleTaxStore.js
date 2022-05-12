Ext.define('Buh.store.singletax.SingleTaxStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.singletax.SingleTaxGridModel',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'geten21.php'
        },
    }
});
