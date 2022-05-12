Ext.define('Buh.classes.closesc.TopContainerRed', {
    extend: 'Ext.container.Container',
    xtype: 'redpaneltop',
    name:'cb2',
    cls: 'block_info-txt block_info-red container-align',
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
            //flex: 1,
            html: 'заголовок для жирного красного текста'
        }, {
            xtype: 'box',
            name: "text-pad",
            cls: 'body-text',
            width: '740',
            // flex: 1,
            html: 'обычный текст с переносами <br> на несколько строк'
        }]
});
