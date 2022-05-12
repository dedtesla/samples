Ext.define('Buh.model.kudir.KudirCardSection2Model', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: ['id', 'parameter', 'indicator', 'value']
});