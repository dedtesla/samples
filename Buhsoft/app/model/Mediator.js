Ext.define('Buh.model.Mediator', {
    extend: 'Ext.data.Model',
    fields: [
        {type: 'string', name: 'id'},
        {type: 'date', name: 'date_doc'},
        {type: 'string', name: 'n_doc'},
        {type: 'string', name: 'mediator'},
        {type: 'string', name: 'way_create'},
        {type: 'string', name: 'period'},
        {type: 'string', name: 'contract'},
        {type: 'date', name: 'dat_b'},
        {type: 'date', name: 'dat_e'},
        'reward'
    ]
});
