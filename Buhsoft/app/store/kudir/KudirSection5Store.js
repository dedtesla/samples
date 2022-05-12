Ext.define('Buh.store.kudir.KudirSection5Store', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.kudir.KudirSection5Model',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'kudir_process.php'
        },
    }
});
