Ext.define('Buh.model.singletax.SingleTaxDeflatorModel', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: [
        'id', 'year', 'value'
    ]
});