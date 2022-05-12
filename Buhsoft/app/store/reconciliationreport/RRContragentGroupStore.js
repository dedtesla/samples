Ext.define('Buh.store.reconciliationreport.RRContragentGroupStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.reconciliationreport.RRContragentGroupModel',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        extraParams: {
            yearDatabase: currYear,
            limit: 5,
            namefield: 'rrLastContragents'
        },
        api: {
            read: dir_start_buh_ + 'contragent/readListForComboMixed/'
        }
    },
    autoLoad: false
});
