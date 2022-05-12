Ext.define('Buh.model.kudir.KudirSection4Model', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: [
        'order_num',
        'id',
        'id_op',
        'id_op_orig',
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
        'ops',
        'oss',
        'oms',
        'fss_trauma',
        'benefit',
        'fss_voluntary',
        'id_doc',
        'tab_id',
        'details',
        'quarter'
    ]
});