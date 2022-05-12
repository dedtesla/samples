Ext.define('Buh.view.kudir.service.Confirm', {
    extend: 'winEditDoc',
    modal: true,
    width: 600,
    btn1: 'Подтвердить',
    btn2: 'Отмена',
    title: 'Подтвердите действие',
    msg: '',
    fn1: '',
    initComponent: function () {
        let me = this;

        Ext.define('msg.Form', {
            extend: 'gbs.window.Form',

            initComponent: function () {
                Ext.apply(this, {
                    title: me.title,
                    items: [{
                        'xtype': 'label',
                        'html': me.msg
                    }],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        ui: 'footer',
                        items: [
                            {
                                text: me.btn1,
                                xtype: 'greenbuttonsimple',
                                scope: this,
                                handler: this.onBtn1
                            },
                            {
                                text: me.btn2,
                                scope: this,
                                handler: this.onCancel
                            }
                        ]
                    }]
                });

                this.callParent();
            },
            onBtn1: function () {
                this.up('window').close();
                if (me.fn1 != false) me.fn1(me);
            },
            onCancel: function () {
                this.up('window').close();
            }
        });

        Ext.apply(me, {
            items: Ext.create('msg.Form')
        });

        me.callParent();
    }

});
