Ext.define('Buh.store.VidDirs', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.VidDir',
    proxy: {
        type: 'ajax',
        api: {
            read: dir_start_buh_ + 'griditemsbuy.php/read',
            create: dir_start_buh_ + 'griditemsbuy.php/insert',
            update: dir_start_buh_ + 'griditemsbuy.php/upd',
            destroy: dir_start_buh_ + 'griditemsbuy.php/delete'
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    writer: {
        type: 'json',
        writeAllFields: false,
        root: 'data'
    },
});
