Ext.define('Buh.store.global.RefGroupStore', {
    extend: 'Ext.data.Store',
    fields: ['id', 'name', 'nms'],
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json',
            root: 'data',
        },
        api: {
            read: dir_start_buh_ + 'nomgrp/readAll/'
        }
    },
    autoLoad: false
});
