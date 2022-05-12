Ext.define('Buh.classes.container.SingleTaxPeriod',
    {
        constructor: function () {
            let args = arguments[0];
            this.callParent(arguments);
        },
        extend: 'Ext.container.Container',
        xtype: 'singletaxperiod',
        alias: 'widget.singletaxperiod',
        cls: 'block-btn-unite',
        layout: 'hbox',
        items: [
            {
                xtype: 'hidden',
                name: 'kvartal',
                value: oDefaults.enPeriod,
                listeners: {
                    change: function (th, nv, ov, e) {
                        let me = this, tab = Ext.getCmp('main_winSDPay').down('tabpanel').activeTab.itemId,
                            parent = me.up('container'), panel = Ext.getCmp('main_winSDPay').down('tabpanel'),
                            form = panel.down('form');

                        me.up('container').down('[name=btn1]').removeCls(cls_btn);
                        me.up('container').down('[name=btn2]').removeCls(cls_btn);
                        me.up('container').down('[name=btn3]').removeCls(cls_btn);
                        me.up('container').down('[name=btn4]').removeCls(cls_btn);
                        if (nv > 0 & nv < 5) {
                            me.up('container').down('[name=btn' + nv + ']').addCls(cls_btn);
                        }
                        oDefaults.enPeriod = nv;
                        saveState('enperiod', nv);
                        form.onFill(0);
                    },
                    afterrender: function () {
                        let me = this;
                        me.up('container').down('[name=btn1]').removeCls(cls_btn);
                        me.up('container').down('[name=btn2]').removeCls(cls_btn);
                        me.up('container').down('[name=btn3]').removeCls(cls_btn);
                        me.up('container').down('[name=btn4]').removeCls(cls_btn);
                        if (oDefaults.enPeriod > 0 & oDefaults.enPeriod < 5) {
                            me.up('container').down('[name=btn' + oDefaults.enPeriod + ']').addCls(cls_btn);
                        }
                    }
                }
            },
            {
                xtype: 'button',
                text: 'I квартал',
                name: 'btn1',
                cls: 'btn-unite-start blue-btn',
                listeners: {
                    'click': function () {
                        this.up('container').down('[name=kvartal]').setValue(1);
                    }
                }
            },
            {
                xtype: 'button',
                text: 'Полугодие',
                name: 'btn2',
                listeners: {
                    'click': function () {
                        this.up('container').down('[name=kvartal]').setValue(2);
                    }
                }
            },
            {
                xtype: 'button',
                text: '9 месяцев',
                name: 'btn3',
                listeners: {
                    'click': function () {
                        this.up('container').down('[name=kvartal]').setValue(3);
                    }
                }
            },
            {
                xtype: 'button',
                text: 'Год',
                name: 'btn4',
                cls: 'btn-unite-end',
                listeners: {
                    'click': function () {
                        this.up('container').down('[name=kvartal]').setValue(4);
                    }
                }
            }
        ]
    }
);
