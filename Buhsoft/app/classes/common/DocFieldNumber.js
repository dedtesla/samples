Ext.define('Buh.classes.common.DocFieldNumber', {
    constructor: function () {
        let text = '', title = '';
        let args = arguments[0];
        this.callParent(arguments);
        this.text = args.text || '';
        this.title = args.title || '';
    },
    extend: 'Ext.Component',
    xtype: 'docfieldnumber',
    alias: 'widget.docfieldnumber',
    scope: this,
    autoEl: {
        html: '',
        tag: 'div',
        'data-title': '',
        cls: 'number-pole_left'
    },
    listeners: {
        render: function (cmp) {
            let me = this;
            cmp.getEl().update(me.text);
            cmp.getEl().set({
                'data-title': me.title
            });

        }
    }
});
