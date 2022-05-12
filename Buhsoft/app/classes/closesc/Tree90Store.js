Ext.define('Buh.classes.closesc.Tree90Store', {
    extend: 'Ext.data.TreeStore',
    loaded : false,
    fields: [
        {name: 'id', type: 'string'},
        {name: 'sc', type: 'string'},
        {name: 'ssc', type: 'string'},
        {name: 'name', type: 'string'},
        {name: 'analit_name', type: 'string'},
        {name: 'analit1', type: 'string'},
        {name: 'error', type: 'boolean'},
        'period',
        'sign',
        'ost'

    ],
    proxy: {
        type: 'ajax',
        url: dir_start_buh_ + 'closeaccounts/tree20/',
        extraParams: {
            yearDatabase: currYear,
            scMask: '90,91'
        },
        autoLoad: false
    },
    autoLoad: false

});
