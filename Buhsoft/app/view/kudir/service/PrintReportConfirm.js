Ext.define('Buh.view.kudir.service.PrintReportConfirm', {
    extend: 'winEditDoc',
    requires: ['Buh.classes.container.DateInterval'],
    modal: true,
    width: 600,
    btn1: 'Распечатать',
    btn2: 'Скачать XLS',
    btn3: 'Отмена',
    title: 'Отчет о списании товаров',
    msg: '',
    fn1: '',
    initComponent: function () {
        let me = this;

        Ext.define('msg.Form', {
            extend: 'gbs.window.Form',

            initComponent: function () {
                Ext.apply(this, {
                    title: me.title,
                    items: [
                        {
                            xtype: 'container',
                            cls: 'container-align',
                            items: [{
                                xtype: 'contdateinterval'
                            }]
                        },
                        {
                            xtype: 'label',
                            name: 'lblSum1',
                            html: 'Сумма неоплаченных отгрузок на 1 января'
                        },
                        {
                            xtype: 'container',
                            cls: 'container-align',
                            items: [
                                {
                                    'xtype': 'textfield',
                                    'name': 'sum1',
                                    'value': 0,
                                    'width': 140
                                }
                            ]
                        },
                        {
                            xtype: 'label',
                            name: 'lblSum2',
                            html: 'Сумма неоплаченных товаров на 1 января'
                        },
                        {
                            xtype: 'container',
                            cls: 'container-align',
                            items: [
                                {
                                    'xtype': 'textfield',
                                    'name': 'sum2',
                                    'value': 0,
                                    'width': 140
                                }
                            ]
                        }
                    ],
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
                                cls: 'grey-btn',
                                scope: this,
                                handler: this.onBtn2
                            },
                            {
                                text: me.btn3,
                                scope: this,
                                handler: this.onCancel
                            }
                        ]
                    }]
                });

                this.callParent();
            },
            onBtn1: function () {
                if (isPayed()) {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }

                    let me = this, form = me.getForm(),
                        dt1 = me.down('contdateinterval').down('#kf_date_beg').getValue(),
                        dt2 = me.down('contdateinterval').down('#kf_date_end').getValue(),
                        sum1 = form.findField('sum1').getValue(),
                        sum2 = form.findField('sum1').getValue();

                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + "frm_kndr_tovar.php?d_beg=" + dtoc(dt1) + "&d_end=" + dtoc(dt2)
                            + "&sum1=" + sum1 + "&sum2=" + sum2 + '&type_doc_convert=pdf&directprint=true'
                    });

                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                }
                this.up('window').close();
            },
            onBtn2: function () {
                if (isPayed()) {
                    let me = this, form = me.getForm(),
                        dt1 = me.down('contdateinterval').down('#kf_date_beg').getValue(),
                        dt2 = me.down('contdateinterval').down('#kf_date_end').getValue(),
                        sum1 = form.findField('sum1').getValue(),
                        sum2 = form.findField('sum1').getValue();

                    window.location.href = dir_start_buh_ + "frm_kndr_tovar.php?d_beg=" + dtoc(dt1) + "&d_end=" + dtoc(dt2)
                        + "&sum1=" + sum1 + "&sum2=" + sum2;
                }
                this.up('window').close();
            },
            onCancel: function () {
                this.up('window').close();
            }
        });

        Ext.apply(me, {
            items: Ext.create('msg.Form')
        });

        me.callParent();
    },
    listeners: {
        afterrender: function () {
            let me = this,
                cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
                dt1 = cbPeriod.periodStartDate, dt2 = cbPeriod.periodEndDate,
                year = cbPeriod.getYear();

            me.down('contdateinterval').down('#kf_date_beg').setValue(dt1);
            me.down('contdateinterval').down('#kf_date_end').setValue(dt2);
            me.down('[name=lblSum1]').el.dom.innerHTML = 'Сумма неоплаченных отгрузок на 1 января ' + year + ' года';
            me.down('[name=lblSum2]').el.dom.innerHTML = 'Сумма неоплаченных товаров на 1 января ' + year + ' года';
        }
    }
});
