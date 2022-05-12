Ext.define('Buh.view.service.WinConfirmRed', {
    extend: "Ext.window.Window",
    alias: 'widget.winconfirmred',
    cls: 'style2018 init_window color-red',

    width: 440,
    closable: false,
    resizable: false,
    shadow: false,
    draggable: false,
    modal: true,
    focusOnToFront: false,


    constructor: function (config) {
        var t1 = arguments[0]['title'],
            t = arguments[0]['text'],
            y = arguments[0]['yes'],
            n = arguments[0]['no'];
        if (t1 != undefined) {
            this.title = t1;
            this.items = [{
                xtype: 'form',
                layout: 'form',
                items: [{
                    xtype: 'container',
                    html: t
                }]
            }];
            this.bbar = [
                {
                    text: y,
                    action: 'ok'
                }, {
                    text: n,
                    action: 'cancel'
                }
            ];
        }
        this.callParent(arguments);
    },

});
