Ext.define('Buh.store.AmortBuhS', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.AmortBuh',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'getosamort.php'
        },
    }
});
