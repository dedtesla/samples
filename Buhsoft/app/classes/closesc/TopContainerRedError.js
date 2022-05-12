Ext.define('Buh.classes.closesc.TopContainerRedError', {
    extend: 'Ext.container.Container',
    xtype: 'redpaneltoperror',
    name:'cb4',
    cls: 'block_info-txt block_info-red container-align',
    //hidden : true,
    state: 0,
    layout: {
        type: 'vbox'
    },
    items: [
        {
            xtype: 'box',
            name: "title-pad",
            cls: 'header-text',
            width: '740',
            // flex: 1,
            html: 'Невозможно закрыть период'
        }, {
            xtype: 'box',
            name: "text-pad",
            cls: 'body-text',
            width: '740',
            // flex: 1,
            html: 'обычный текст с переносами <br> на несколько строк'
        }]
});
