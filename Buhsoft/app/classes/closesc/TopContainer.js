Ext.define('Buh.classes.closesc.TopContainer', {
    extend: 'Ext.container.Container',
    xtype: 'greenpaneltop',
    name: 'cb1',
    cls: 'block_info-txt container-align',
    state: 0,
    layout: {
        type: 'vbox'
    },
    items: [
        {
            xtype: 'box',
            name: "title-pad",
            cls: 'header-text',
            width: 740,
            html: 'заголовок для жирного текста'
        }, {
            xtype: 'box',
            name: "text-pad",
            cls: 'body-text',
            width: 740,
            html: 'обычный текст с переносами <br> на несколько строк'
        }, {
            xtype: 'container',
            name: "btn-pad",
            flex: 1,
            layout: {
                type: 'hbox'
            },
            items: [
                {
                    xtype: 'button',
                    cls: "btn-sel-blue",
                    text: 'Посмотреть проводки в журнале операций',
                    handler: function () {
                        this.up('window').fireEvent("jumpToJournal");
                    }
                }, {
                    xtype: 'box',
                    html: "&nbsp;·&nbsp;"
                }, {
                    xtype: 'button',
                    cls: "btn-sel-blue color-grey ",
                    text: 'Удалить проводки',
                    handler: function () {
                        this.up('window').fireEvent("closingrecordsdelete");
                    }
                }


            ]
        }]
});
