Ext.define('Buh.view.sprav.Dir.Window', {
    extend: 'winEditDoc',
    requires: [
        'Buh.view.sprav.Dir.Grid',
    ],
    alias: 'widget.spravdir',
    itemId: 'winSpravDir',
    height: 612,
    cls: 'style2018 sprav_window',

    items: {
        xtype: 'form',
        name: 'main_panel',
        title: 'Доходы и расходы для КУДИР',
        bodyCls: 'panel-pad',
        layout: 'fit',
        items: [
            {
                xtype: 'grd_sprav_dir',
                store: Ext.create('Buh.store.VidDirs'),
            },
        ]

    },
    bbar: {
        hidden: true,
        name: 'tbVDR',
        xtype: 'toolbar',
        items: [
            {
                xtype: 'button',
                cls: 'green-btn',
                text: 'Выбрать',
                action: 'select'
            },
            {
                xtype: 'button',
                text: 'Отмена',
                action: 'cancel'
            },


        ]
    },

    filter: 0,
    select: 0,
    typ_oper: 1

});
