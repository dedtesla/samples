Ext.define('Buh.model.reconciliationreport.RRContragentGroupModel', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: ['id', 'name', 'nms', 'isGroup']
});