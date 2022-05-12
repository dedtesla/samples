Ext.define('Buh.classes.container.IFramePrintDirect',
    {
        extend: 'Ext.ux.IFrame',
        xtype: 'iframeprint',
        id: 'iFramePrintDirect',
        src: '',
        cls: 'x-hidden',
        style: {
            display: "none"
        },
        renderTo: document.body
    });
