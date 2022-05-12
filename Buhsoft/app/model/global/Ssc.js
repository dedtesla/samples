Ext.define('Buh.model.global.Ssc', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.reader.Json'
    ],

    fields: [
        {type: 'string', name: 'sc'},
        {type: 'string', name: 'ssc'},
        {type: 'string', name: 'sc_ssc'},
        {type: 'string', name: 'name'},
        {type: 'string', name: 'sc_ssc_name'},
        {type: 'string', name: 'analit1'},
        {type: 'string', name: 'analit2'},
        {type: 'string', name: 'analit3'},
        {type: 'int', name: 'child'}
    ]
});