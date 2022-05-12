Ext.define('Buh.store.singletax.SingleTaxDeflatorStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.singletax.SingleTaxDeflatorModel',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    data: [
        {'id': 1, 'year': 2021, 'value': 1.032},
        {'id': 2, 'year': 2022, 'value': 1.096}
    ]
});
