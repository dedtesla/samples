Ext.define('Buh.store.BankRegPlts', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.BankRegPlt',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'items'
        }
    },
    data: [{id: '0', name: '111'}],
    setReg: function (_val) {
    }
});
