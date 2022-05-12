Ext.define('Buh.model.kudir.KudirSection5Model', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: [
        'order_num',
        'id',
        'n_doc',
        'n_doc_orig',
        'short_name',
        'short_name_orig',
        'doc_date',
        'date_orig',
        'at_period',
        'at_period_orig',
        'auto',
        'iskl',
        'is_dirty',
        'summa',
        'summa_orig',
        'id_doc',
        'tab_id',
        'details'
    ]
});