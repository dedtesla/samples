Ext.define('Buh.model.VidDir', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.reader.Json'
    ],

    fields: ['id', 'idps', 'name_gr', 'name', 'id_analit1', 'id_analit2', 'acc', 'ssc', 'sc_ssc', 'read_onl', 'd_r_', 'id_gr', 'id_pgr', 'id_orig']
});