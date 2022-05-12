Ext.define('Buh.store.reconciliationreport.RRContragentStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.reconciliationreport.RRContragentModel',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        extraParams: {
            yearDatabase: currYear,
            idOnly: 0
        },
        api: {
            read: dir_start_buh_ + 'contragent/readContragentsByGroup/'
        }
    },
    autoLoad: false
});
