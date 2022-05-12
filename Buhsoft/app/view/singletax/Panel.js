/**
 * Панель расчета и уплаты Единого налога.
 * Содержит сквозную, общую для всех вкладок, панель инструментов
 * и панель вкладок "Расчет" и "Уплата налога".
 *
 * С 2022 объект налогообложения и ставка ЕН привязаны к Учетной политике.
 *
 * 12.20 - 01.21
 * 02.2022
 */
Ext.define('Buh.view.singletax.Panel', {
    extend: 'winEditDoc',
    modal: true,
    width: 1100,
    y: 60,
    cls: 'style2018 sprav_window win_bottom w-white select_whited raschet-usn',
    layout: 'fit',
    alias: 'widget.singleTaxWindow',
    id: "main_winSDPay",
    taxMode: null,
    taxStavka: 0,
    taxModes: ['Доходы минус расходы', 'Доходы'],
    taxStavkaExt: [20, 8],
    deflator: 0,
    fixSum: 150000000,
    fixSumText: 150,
    _year: currYearMax,
    store: Ext.create('Buh.store.singletax.SingleTaxDeflatorStore'),
    initComponent: function () {
        let me = this, rec;

        me.store.load(function() {
            for (i = 1; i < me.store.data.length + 1; i++) {
                rec = me.store.getById(i);
                if (rec.data.year == me._year) {
                    me.deflator = rec.data.value;
                    return false;
                }
            }
        });

        let _tbar = {
            xtype: 'toolbar',
            name: 'tbarTop',
            dock: 'top',
            items: [
                {
                    xtype: 'greenbutton',
                    action: 'addEnPay'
                }
            ]
        }

        let _form = iif(me.taxMode == 1, 'Buh.view.singletax.FormCalcIncome', 'Buh.view.singletax.FormCalcExpense');

        Ext.apply(this, {
            items: [
                {
                    xtype: 'tabpanel',
                    title: 'Расчет и уплата УСН',
                    itemId: 'tpSingleTax',
                    name: 'bottomTabs',
                    items: [
                        {
                            title: 'Расчет',
                            itemId: iif(me.taxMode == 1, 1, 0),
                            layout: 'fit',
                            flex: 1,
                            items: [
                                Ext.create(_form)
                            ]
                        },
                        {
                            title: 'Уплата налога',
                            itemId: 2,
                            cls: 'container-align-middle',
                            layout: {
                                type: 'vbox',
                                align: 'stretch'
                            },
                            defaults: {
                                flex: 1
                            },
                            items: [
                                Ext.create('Buh.view.singletax.Grid'),
                                {
                                    xtype: 'panel',
                                    name: 'panelEnPay',
                                    cls: 'win-bottom-block',
                                    tbar: _tbar,
                                    title: 'Оплата',
                                    layout: 'fit',
                                    height: 210,
                                    items: [
                                        Ext.create('Buh.view.singletax.GridPay')
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        me.callParent();
    },
    setDeflator: function() {
        let me = this;

        for (i = 1; i < me.store.data.length + 1; i++) {
            rec = me.store.getById(i);
            if (rec.data.year == me._year) {
                me.deflator = rec.data.value;
                return false;
            }
        }
    },
    renderPanel: function() {
        let me = this,
            _form = iif(me.taxMode == 1, 'Buh.view.singletax.FormCalcIncome', 'Buh.view.singletax.FormCalcExpense');

        me.removeAll();

        let _tbar = {
            xtype: 'toolbar',
            name: 'tbarTop',
            dock: 'top',
            items: [
                {
                    xtype: 'greenbutton',
                    action: 'addEnPay'
                }
            ]
        }

        let _items = [
            {
                xtype: 'tabpanel',
                title: 'Расчет и уплата УСН',
                itemId: 'tpSingleTax',
                name: 'bottomTabs',
                items: [
                    {
                        title: 'Расчет',
                        itemId: iif(me.taxMode == 1, 1, 0),
                        layout: 'fit',
                        flex: 1,
                        items: [
                            Ext.create(_form)
                        ]
                    },
                    {
                        title: 'Уплата налога',
                        itemId: 2,
                        cls: 'container-align-middle',
                        layout: {
                            type: 'vbox',
                            align: 'stretch'
                        },
                        defaults: {
                            flex: 1
                        },
                        items: [
                            Ext.create('Buh.view.singletax.Grid'),
                            {
                                xtype: 'panel',
                                name: 'panelEnPay',
                                cls: 'win-bottom-block',
                                tbar: _tbar,
                                title: 'Оплата',
                                layout: 'fit',
                                height: 210,
                                items: [
                                    Ext.create('Buh.view.singletax.GridPay')
                                ]
                            }
                        ]
                    }
                ]
            }
        ];

        me.add(_items);
        me.doLayout();
    }

});
