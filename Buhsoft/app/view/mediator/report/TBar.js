Ext.define('Buh.view.mediator.report.TBar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'mediatorbar',
    layout: 'fit',
    dock: 'bottom',
    items: [
        {
            xtype: 'container',
            name: 'errordata',
            cls: 'bottom-block_alert-info',
            layout: 'hbox',
            hidden: true,
            defaultType: 'button',
            defaults: {
                componentCls: 'x-toolbar-item'
            },
        },
        {
            xtype: 'box',
            name: 'notedata',
            hidden: true,
            cls: 'txt-darkgrey-bold bottom-block_alert-info',
            html : ''
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
                    },{
                        text: 'Распечатать',
                        action: 'print',
                        menu: [{
                            text : 'Сохранить и распечатать',
                            action: 'save_print',
                         },{
                            text : 'Сохранить и скачать PDF',
                            action: 'save_pdf',
                         },{
                            text : 'Сохранить и скачать XLS',
                            action: 'save_xls',

                        }]
                    },
                    {
                        text: 'Отмена',
                        action: 'close_window',
                    }]
                }]
        }]
});
