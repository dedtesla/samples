Ext.define('Buh.model.AmortNal', {
    extend: 'Ext.data.Model',

    requires: [
        'Ext.data.reader.Json'
    ],

    fields: ['id_os', 'name', 'first_summa', 'summa', 'byr_summa', 'rest_summa', 'sc_dt', 'sc_ct']
});