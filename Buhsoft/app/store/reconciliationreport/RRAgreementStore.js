Ext.define('Buh.store.reconciliationreport.RRAgreementStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.reconciliationreport.RRAgreementModel',
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        extraParams: {
            yearDatabase: currYear
        },
        api: {
            read: dir_start_buh_ + 'agreement/listAgreements/'
        },
    },
    autoLoad: true
});
