Ext.define('Buh.store.Mediators', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.Mediator',
    proxy: {
        type: 'ajax',
        api: {
            read: dir_start_buh_ + 'mediator_proc.php',
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    },
});
