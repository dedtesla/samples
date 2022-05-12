Ext.define('Buh.model.singletax.SingleTaxGridModel', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: ['kvartal', 'year', 'p1_nalog_to_pay', 'p2_nalog_to_pay', 'sum_pay', 'dolg']
});