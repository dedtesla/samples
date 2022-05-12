Ext.define('Buh.view.import.ImportWindow', {
    extend: 'winEditDoc',

    requires: [
        'Buh.view.import.MaketGrid',
        'Buh.view.import.DetailPanel',
        'Buh.view.import.ImpHeader',
        'Buh.view.import.EmptyPanel'
    ],

    alias: 'widget.impmaketwindow',
    itemId: 'winImpSost',
    width: 1100,
    cls: 'style2018 sprav_window pad_full-width',
    // items begin
    items: {
        xtype: 'form',
        name: 'main_panel',
        header: {},

        bodyCls: 'panel-pad',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },

        items: [
            {
                xtype: 'grd_imp',
                cls: 'body-container',
                height: 200,
                store: Ext.create('Buh.store.ImpMakets'),
            },

            {
                cls: 'body-container_topline',
                xtype: 'impmaketdetail',
                hidden: true
            },
            {
                cls: 'body-container_topline',
                xtype: 'impmaketempty',
                hidden: false
            }

        ]
    },

    // items end

    bbar: {
        xtype: 'toolbar',
        dock: 'top',
        items: [{
            xtype: 'greenbuttonsimple',
            text: 'Импортировать',
            name: 'import_sostav',
            disabled: true,
        }, '->', {
            xtype: 'textfield',
            hidden: false,
            name: 'maketName',
            width: 260
        },
            {
                xtype: 'button',
                cls: 'grey-btn',
                text: 'Сохранить изменения в шаблоне',
                action: 'save'
            }

        ]
    }

});
