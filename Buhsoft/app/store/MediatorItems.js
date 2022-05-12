Ext.define('Buh.store.MediatorItems', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.MediatorItem',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
});
