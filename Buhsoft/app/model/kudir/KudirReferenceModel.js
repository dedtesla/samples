Ext.define('Buh.model.kudir.KudirReferenceModel', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: [
        'id', 'indicator', 'row', 'summa', 'outerid'
    ]
});