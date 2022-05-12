Ext.define('Buh.store.kudir.PaymentDocs', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.kudir.PaymentDoc',
    proxy: {
        type: 'ajax',
        url: dir_start_buh_ + 'kudir_process.php',
        extraParams: {'action': 'getPaymentDocs'},
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    autoLoad: true
});
