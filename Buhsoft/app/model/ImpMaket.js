Ext.define('Buh.model.ImpMaket', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.reader.Json'
    ],

    fields: ['id', 'UserId', 'maketName', 'sprav', 'kod', 'cb_sc_ssc', 'idanalit']
});