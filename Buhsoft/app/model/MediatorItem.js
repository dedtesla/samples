Ext.define('Buh.model.MediatorItem', {
    extend: 'Ext.data.Model',
    fields: ['id', 
        {type: 'date', name: 'dat'},
        'md', 'mdoc', 'sd_summa', 's_buy', 'include_sb', 'sd_summa', 's_buy', 'reward', 'way_calc_reward']
});
