Ext.define('Buh.view.bank.TBar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'bankbar',
    layout: 'fit',
    dock: 'bottom',
    items: [{
        xtype: 'container',
        name: 'errordata',
        cls: 'bottom-block_alert-info',
        layout: 'hbox',
        defaultType: 'button',
        defaults: {
            componentCls: 'x-toolbar-item'
        },
    },
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaultType: 'button',
                    defaults: {
                        componentCls: 'x-toolbar-item'
                    },
                    items: [{
                        text: 'Сохранить',
                        action: 'save',
                        cls: 'green-btn',
                    }, {
                        text: 'Распечатать',
                        action: 'print',
                        menu: [
                            {
                                text: 'Сохранить и распечатать',
                                action: 'save_print',
                            },
                            {
                                text: 'Сохранить и скачать XLS',
                                action: 'save_download_xls',
                            }
                        ]
                    },
                        {
                            text: 'Отмена',
                            action: 'close_window',
                        },
                        {xtype: 'tbfill'},
                        {
                            itemId: 'prov',
                            xtype: 'green-cbox',
                            boxLabelAlign: 'after',
                            checked: true,
                            boxLabel: 'Сделать проводку',
                            width: 150
                        }]
                }]
        }]
});
