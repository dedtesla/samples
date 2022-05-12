Ext.define('Buh.store.singletax.SingleTaxPayStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.singletax.SingleTaxPayGridModel',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'getenpay.php'
        },
    }
});
