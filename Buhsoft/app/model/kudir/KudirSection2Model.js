Ext.define('Buh.model.kudir.KudirSection2Model', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.reader.Json'
    ],
    fields: [
        'id',
        'datvv',
        'datvv_orig',
        'auto',
        'iskl',
        'is_dirty',
        'name',
        'name_orig',
        'tab_id',
        'details',
        'base_cost',
        'base_cost_orig',
        'quarter_fees',
        'quarter_fees_orig',
        'tax_fees',
        'tax_fees_orig',
        'previous_fees',
        'previous_fees_orig',
        'future_fees',
        'future_fees_orig'
    ]
});