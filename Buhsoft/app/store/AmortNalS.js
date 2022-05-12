Ext.define('Buh.store.AmortNalS', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.AmortNal',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'getosamort_nalog.php'
        },
    }
});
