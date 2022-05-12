Ext.define('Buh.store.VPDocs', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.VPDoc',
    proxy: {
        type: 'ajax',
        url: dir_start_buh_ + 'getbnkvdoc.php',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    autoLoad: true
});
