Ext.define('Buh.view.import.ImpField', {
    extend: 'Ext.container.Container',

    constructor: function (config) {
        this.callParent(arguments);
        var n1 = arguments[0]['title_'],
            n2 = arguments[0]['name_'];
        if (n1 != undefined) {
            Ext.apply(this.down('#cbox'), {boxLabel: n1 + ':', name: n2 + "_"});
            Ext.apply(this.down('#tbox'), {name: n2});
        }
    },

    xtype: 'impfield',
    defaults: {labelWidth: 118, labelAlign: 'right'},
    layout: 'hbox',
//margins: '0 0 10 0',

    items: [
        {
            itemId: 'cbox',
            xtype: 'checkbox',
            width: 150
        }, {
            itemId: 'tbox',
            hideLabel: true,
            xtype: 'textfield',
            emptyText: '№',
            width: 50,
            listeners: {
                change: function () {
                    if (this.getValue() > 0) {
                        this.up("impfield").down('checkbox').setValue(1);
                    }
                    else {
                        this.up("impfield").down('checkbox').setValue(0);
                    }
                }
            }
        }]

});
