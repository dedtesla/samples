Ext.define('Buh.view.singletax.FormCalcExpense', {
    extend: 'Ext.form.Panel',
    requires: ['Buh.classes.container.SingleTaxPeriod'],
    alias: 'widget.singleTaxFormCalcExpense',
    initComponent: function () {
        let me = this;

        let _tbar = {
            xtype: 'toolbar',
            name: 'tbarTop',
            dock: 'top',
            items: [
                {
                    text: 'Заполнить',
                    cls: 'grey-btn',
                    handler: function () {
                        let me = this, panel = me.up('panel');

                        function _check() {
                            if ((panel.getForm().findField('p1_dohod').getValue() * 1) + (panel.getForm().findField('p1_rashod').getValue() * 1) <= 0) {
                                Ext.define('winform', {
                                    extend: 'winEditDoc',
                                    width: 600,
                                    modal: true,
                                    layout: 'fit',
                                    items: Ext.create('Ext.form.Panel', {
                                        title: 'Внимание',
                                        layout: {
                                            type: 'vbox',
                                            align: 'stretch'
                                        },
                                        defaults: {
                                            labelWidth: 120,
                                            labelAlign: 'right',
                                            style: 'margin : 0px',
                                            flex: 1,
                                            xtype: 'textfield'
                                        },
                                        items: [
                                            {
                                                xtype: 'displayfield',
                                                value: 'К сожалению, мы не нашли операций в Книге доходов и расходов и не смогли рассчитать налог автоматически'
                                            }
                                        ],
                                        dockedItems: [{
                                            xtype: 'toolbar',
                                            dock: 'bottom',
                                            ui: 'footer',
                                            items: [
                                                {
                                                    text: 'Заполнить книгу',
                                                    xtype: 'greenbuttonsimple',
                                                    handler: function () {
                                                        this.up('window').close();
                                                        Ext.getCmp('main_winSDPay').close();
                                                        createNewEl('mn1-1-11', 'Книга доходов и расходов', 'kndrWin', '1');
                                                    },
                                                },
                                            ]
                                        }]
                                    })
                                });

                                let win = Ext.create('winform');
                                win.show();
                            }
                        }

                        function _fn() {
                            setTimeout(function () {
                                _check();
                            }, 1000);
                            panel.onFill(1);
                        }

                        // _fn();
                        panel.onFill(1);
                    }
                },
                Ext.create('Buh.classes.container.SingleTaxPeriod'),
                {
                    xtype: 'button',
                    text: "Справка-расчет",
                    icon: _icons.print,
                    menu: [
                        {
                            text: "Скачать XLS",
                            handler: function () {
                                if (isPayed()) {
                                    crmEvent('1pgb_buh', 'raschusnpechat', false, false);
                                    this.up('toolbar').fireEvent('printxls');
                                }
                            }
                        },
                        {
                            text: "Скачать PDF",
                            handler: function () {
                                if (isPayed()) {
                                    this.up('toolbar').fireEvent('printpdf');
                                }
                            }
                        }
                    ]
                }
            ]
        };

        Ext.apply(this, {
            tbar: _tbar,
            items: [
                {
                    cls: 'container-pad',
                    layout: 'column',
                    defaults: {
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        border: 0
                    },
                    items: [
                        {
                            columnWidth: 0.5,
                            defaults: {
                                labelAlign: 'right',
                                xtype: 'numberfield',
                                decimalPrecision: 0,
                                hideTrigger: true,
                                labelWidth: 345
                            },
                            title: 'Заполните информацию для расчета',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'p1_doh_m_ras',
                                    hidden: true
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'p1_torg',
                                    hidden: true
                                },
                                {
                                    xtype: 'textfield',
                                    name: 'p2_ip_0',
                                    hidden: true
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Доходы, руб', 0),
                                    name: 'p1_dohod',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Расходы, руб', 1),
                                    name: 'p1_rashod',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Убытки прошлых лет, перенесенные на текущий период, руб', 2),
                                    name: 'p1_ubytok',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Доход свыше 150 млн. руб', 3),
                                    name: 'dohod_ext',
                                    xtype: 'gbs_combo',
                                    editable: false,
                                    forceSelection: true,
                                    value: '0',
                                    readOnly: true,
                                    store: [
                                        ['0', 'Нет'],
                                        ['1', 'Да']
                                    ],
                                    labelSeparator: "",
                                    listeners: {
                                        change: function () {
                                            me.refresh();
                                        }
                                    }
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Численность сотрудников свыше 100 чел.', 5),
                                    name: 'employees_ext',
                                    xtype: 'gbs_combo',
                                    editable: false,
                                    forceSelection: true,
                                    value: '0',
                                    store: [
                                        ['0', 'Нет'],
                                        ['1', 'Да']
                                    ],
                                    labelSeparator: "",
                                    listeners: {
                                        change: function () {
                                            me.refresh();
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columnWidth: 0.5,
                            defaults: {
                                labelAlign: 'right',
                                xtype: 'numberfield',
                                // xtype: 'gbsnumberfield',
                                decimalPrecision: 0,
                                hideTrigger: true,
                                labelWidth: 365
                            },
                            title: 'Расчет',
                            items: [
                                {
                                    xtype: 'textfield',
                                    name: 'p2_kbk_en',
                                    hidden: true
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Налоговая база', 6),
                                    name: 'p1_nalog_baza',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: "",
                                    useThousandSeparator: true,
                                    thousandSeparator: " "
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Ставка налога', 7),
                                    name: 'p1_stavka_en',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: "",
                                    cls: 'input-procent',
                                    labelWidth: 435,
                                    decimalPrecision: 2
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Налог, начисленный с начала года', 10),
                                    name: 'p1_summa_en',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Минимальный налог за год', 11),
                                    name: 'p1_summa_min_nalog',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Авансовые платежи, начисленные<br>за прошлые периоды', 12),
                                    name: 'p1_nach_pred_period',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                },
                                {
                                    fieldLabel: me.setFieldLabel('Налог к уплате за текущий период', 13),
                                    name: 'p1_nalog_to_pay',
                                    fieldStyle: 'text-align:right;',
                                    readOnly: true,
                                    labelSeparator: ""
                                }
                            ]
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
                        text: 'Сохранить',
                        xtype: 'greenbuttonsimple',
                        scope: this,
                        handler: this.onSave
                    },
                    {
                        text: 'Отмена',
                        xtype: 'button',
                        scope: this,
                        handler: this.onCancel
                    }
                ]
            }]
        });

        this.callParent();
    },
    listeners: {
        afterrender: function (panel) {
            let me = this, bar = me.down('[name=tbarTop]'), _win = Ext.getCmp('main_winSDPay');

            bar.add(
                [
                    '->',
                    {
                        xtype: 'component',
                        id: 'lblTaxEn',
                        width: 150,
                        html: '<span class="txt-grey">' + _win.taxModes[_win.taxMode] + ' (' + _win.taxStavka + '%)' + '</span>',
                        name: 'lbl-tax'
                    }
                ]
            );
        }
    },
    onFill: function (_mod) {
        let me = this, form = me.getForm(), win = Ext.getCmp('main_winSDPay'),
            tabbar = win.down('tabpanel').tabBar;

        form.load({
            url: dir_start_buh_ + 'fillen21.php',
            params: {
                kvartal: oDefaults.enPeriod,
                year: win._year,
                taxmod: win.taxMode,
                employeesExt: form.findField('employees_ext').getValue(),
                extTax: form.findField('employees_ext').getValue(),
                tax: win.taxStavka,
                mod: _mod,
                deflator: win.deflator,
                fixsum: win.fixSum
            },
            success: function (frm, resp) {
                form.setValues(resp.data);
                me.refresh();
                Ext.getCmp('endolgpereplata').setValue(resp.result.data.perepl)
            }
        });
    },
    onSave: function () {
        let me = this, form = me.getForm(), win = Ext.getCmp('main_winSDPay'),
            tabbar = win.down('tabpanel').tabBar;

        form.submit({
            submitEmptyText: false,
            url: dir_start_buh_ + 'en_sav.php',
            params: {'p2_ip_0': form.findField('p2_ip_0').getValue(), 'year': win._year}
        });
    },
    onCancel: function () {
        this.up('window').close();
    },
    refresh: function () {
        let win = Ext.getCmp('main_winSDPay');

        if (win != _dummy) {
            let me = this, form = me.getForm(),
                coeff = win.deflator, limitSum = win.fixSum * coeff, limitSumText = win.fixSumText * coeff,
                taxStavka = win.taxStavka, taxStavkaExt = win.taxStavkaExt[0],
                incomeExt = form.findField('dohod_ext').getValue() * 1,
                employeesExt = form.findField('employees_ext').getValue() * 1,
                kv = form.findField('kvartal').getValue();

            let d = form.findField('p1_dohod').getValue() * 1;
            let s = taxStavka;
            if (d > limitSum || employeesExt == 1 || incomeExt == 1) {
                s = taxStavkaExt;
            }

            form.findField('dohod_ext').labelEl.update(me.setFieldLabel('Доход свыше ' + limitSumText + ' млн. руб', 3));

            if (d < limitSum && incomeExt == 0 && employeesExt == 0) {
                form.findField('p1_nalog_baza').labelEl.update(me.setFieldLabel('Налоговая база (основная ставка)', 6));
                form.findField('p1_stavka_en').labelEl.update(me.setFieldLabel('Ставка налога (основная)', 7));
                form.findField('p1_stavka_en').setValue(taxStavka);
                form.findField('p1_summa_en').labelEl.update(me.setFieldLabel('Налог, начисленный с начала года', 10));
            } else {
                form.findField('p1_nalog_baza').labelEl.update(me.setFieldLabel('Налоговая база (повышенная ставка)', 8));
                form.findField('p1_stavka_en').labelEl.update(me.setFieldLabel('Ставка налога (повышенная)', 9));
                form.findField('p1_stavka_en').setValue(taxStavkaExt);
                form.findField('p1_summa_en').labelEl.update(me.setFieldLabel('Налог, начисленный с начала года', 10));
            }
        }
    },
    setFieldLabel: function (value, idx) {
        let labelTexts, askText, button = '';

        labelTexts = [
            'Программа заполняет автоматически по данным Раздела 1 Книги доходов и расходов.',
            'Программа заполняет автоматически по данным Раздела 1 Книги доходов и расходов.',
            'Программа заполняет автоматически по данным Раздела 3 Книги доходов и расходов.',
            'Программа определит сама по данным Раздела 1 Книги доходов и расходов.',
            'Проставьте признак самостоятельно  для правильного расчета суммы вычета по взносам. По умолчанию стоит значение &laquo;Да&raquo;.',
            'Проставьте признак самостоятельно  для правильного расчета суммы налога. По умолчанию стоит значение &laquo;Нет&raquo;.',
            'Программа рассчитывает автоматически.',
            'Программа подставляет из раздела Учетная политика.',
            'Программа рассчитывает автоматически.',
            'Программа автоматически подставляет повышенную ставку. Повышенная ставка применяется для всех организаций и ИП с того периода, в котором произошло хотя бы одно из двух событий:<br>' +
            '<ul><li>среднесписочная численность сотрудников превысила 100 чел.</li><li>доходы превысили лимит, который считается как 150 млн.руб умножить на коэффициент-дефлятор отчетного года</li></ul>',
            'Программа рассчитывает автоматически.',
            'Программа рассчитывает автоматически.',
            'Программа заполняет автоматически . Значение равно значению поля &laquo;Налог к уплате за текущий период&raquo; раздела &laquo;Расчет и уплата УСН за предыдущий период&raquo;.',
            'Программа рассчитывает автоматически как разницу между налогом, начисленным с начала года (или минимальным налогом за год) и значением поля &laquo;Авансовые платежи, начисленные за прошлые периоды&raquo;.'
        ];

        button = Ext.String.format('<a class="ico-faq-small tooltip-container" data-qtip="{0}"></a>', labelTexts[idx]);
        return iif(idx == 13, '<span class="color-green-bold">' + value + '</span>', '<span>' + value + '</span>') + button;
    },
    download: function() {

    }

});
