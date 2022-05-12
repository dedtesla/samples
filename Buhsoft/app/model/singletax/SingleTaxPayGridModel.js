Ext.define('Buh.model.singletax.SingleTaxPayGridModel', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: ['id', 'year', 'kvartal', 'df', 'n_doc', 'summa', 'confirm', 'rsmy_id', 'rs_bank', 'org_nam', 'id_bank_pay']
});