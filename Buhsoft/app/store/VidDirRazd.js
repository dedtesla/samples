Ext.define('Buh.store.VidDirRazd', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.VidDir',
    proxy: {
        type: 'ajax',
        api: {
            read: dir_start_buh_ + 'griditemsbuy.php/read',
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    },
});
