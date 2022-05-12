Ext.define('Buh.model.global.Simple', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.reader.Json'
    ],

    fields: [
        {type: 'string', name: 'id'},
        {type: 'string', name: 'name'},
    ]
});