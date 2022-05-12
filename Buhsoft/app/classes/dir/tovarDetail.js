Ext.define('Buh.classes.dir.tovarDetail', {
    extend: 'Ext.grid.Panel',
    xtype: 'tovarDetail',
    name: 'explain',
    viewConfig: {
        getRowClass: function (record, rowIndex, rowParams, store) {
            let win = this.up('tovarDetail');
            if (win.source_id == record.data.id) {
                return 'grid-row_green';
            }
        },
    },
    height: 600,
    tbar: [
        {
            xtype: 'gbs_combo',
            name: 'oper',
            editable: false,
            forceSelection: true,
            width: 190,
            value: '0',
            store: [
                ['0', 'Все типы операций'],
                ['1', 'Покупка'],
                ['2', 'Оплата'],
                ['3', 'Продажа'],
                ['4', 'Постоплата']
            ],
            listeners: {
                'select': function (cmb, rec, idx) {
                    this.up('tovarDetail').gridFilter();
                }
            }
        }, {
            xtype: 'green-cbox',
            boxLabel: 'Показать все операции по поставке',
            boxLabelAlign: 'after',
            name: 'showAll',
            width: 350,
            listeners: {
                change: function () {
                    this.up('tovarDetail').gridFilter();
                }

            }

        }, {
            xtype: 'tbfill'
        }, {
            xtype: 'button',
            text: "Распечатать",
            menu: [
                {
                    text: 'Справка-расчет в XLS',
                    handler: function () {
                        let me = this.up('grid');
                        window.location.href = dir_start_buh_ + 'frm_dir_tovar_explain.php' +
                            '?yearDatabase=' + currYear +
                            '&source=' + me.source +
                            '&source_id=' + me.source_id;
                    }

                }, {
                    text: 'Справка-расчет в PDF',
                    handler: function () {
                        let me = this.up('grid');
                        window.location.href = dir_start_buh_ + 'frm_dir_tovar_explain.php' +
                            '?yearDatabase=' + currYear +
                            '&source=' + me.source +
                            '&type_doc_convert=pdf' +
                            '&source_id=' + me.source_id;
                    }


                }


            ]
        }


    ],
    store: {
        fields: ['id', {
            name: 'dat',
            type: 'date'
        }, 'suma',
            'sumands',
            'sumapay',
            'sumapaynds',
            'price',
            'price_nds',
            'sklad_id',
            'oper_buy',
            'oper_pay',
            'oper_sale',
            'oper_move',
            'oper_after_pay',
            'sumasd',
            'sumandssd',
            'kol_buy',
            'kol_sale',
            'pay_by_doc',
            'sum_of_payed',
            'sum_of_payed_nds',
            'sum_not_payed',
            'procent_of_deal',
            'procent_of_payed',
            'sklad_name',
            'doc_of_oper',
            'id_sb',
            'id_pay_oper',
            'id_pay_doc',
            'kol_znak'
        ],
        proxy: {
            type: 'ajax',
            reader: {
                type: 'json',
                root: 'data',
            },
            api: {
                read: dir_start_buh_ + 'bookincomexpence/epxlainSale/'
            },
        }
    },
    columns: [{
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {
        xtype: 'datecolumn',
        text: 'Дата',
        format: 'd.m.y',
        dataIndex: 'dat',
        width: 90,
        renderer: function (org, column, record) {
            return '<span class="txt-grey">' + Ext.Date.format(record.get('dat'), 'd.m.y') + "</span>";
        }

    }, {
        text: 'Операция',
        dataIndex: 'id',

        //width: 300,
        flex: 1,
        renderer: function (grid, column, record) {
            let text = "";
            if (record.data.oper_buy == 1) {
                text = "<b>Покупка</b><br>"
                    + record.data.doc_of_oper
                    + " на сумму " + record.data.sumasd;
                if (record.data.sumandssd > 0)
                    text +=
                        "<br>(НДС " + record.data.sumandssd + ")";
                if (record.data.procent_of_deal < 1) {
                    let prc_text = record.data.procent_of_deal * 100;
                    text +=
                        "<br>Доля в поставке (" + prc_text.toFixed(2) + " %)";
                }
            }
            if (record.data.oper_sale == 1) {
                text = "<b>Продажа</b><br>"
                    + record.data.doc_of_oper
                    + " на сумму " + record.data.sumasd;
                if (record.data.sum_not_payed > 0) {
                    text +=
                        "<br>Продано, но не оплачено на " + record.data.sum_not_payed;
                }
            }
            if (record.data.oper_pay == 1) {

                if (record.data.procent_of_payed == 1) {
                    text = "<b>Полная оплата</b><br>";
                }
                else {
                    let payPrc = record.data.procent_of_payed * 100;
                    text = "<b>Оплата частичная </b><br>";
                }
                text += record.data.doc_of_oper +
                    " на сумму " + record.data.pay_by_doc;
            }
            if (record.data.oper_move == 1) {
                text = "Перемещение на ";
            }
            if (record.data.oper_move == -1) {
                text = "Перемещение со ";
            }
            if (record.data.oper_after_pay == 1) {
                text = "<b>Постоплата</b><br>";
                text += "Реализованный товар списан на расходы по факту оплаты";
            }

            return '<a class="link-darkgray">' + text + '</a>';
        }
    }, {
        text: 'Количество',
        dataIndex: 'suma',
        width: 120,
        renderer: function (grid, column, record) {
            let text = "";
            if (record.data.oper_buy == 1 || record.data.oper_move == 1) {
                text = "<font color='#3DA63B'>+" + (record.data.kol_buy * 1).toFixed(record.data.kol_znak) + "</font>";
            }
            if (record.data.oper_sale == 1) {

                text = "<font color='#2386FF'>-" + (record.data.kol_sale * 1).toFixed(record.data.kol_znak) + "</font>";
            }
            if (record.data.oper_move == -1) {
                text = "<font color='#2386FF'>-" + (-record.data.kol_sale * 1).toFixed(record.data.kol_znak) + "</font>";
            }
            return text;
        }
    }, {
        text: 'Склад',
        hidden: true,
        dataIndex: 'sklad_name',
        width: 200,
        renderer: function (grid, column, record) {
            let text = record.data.sklad_name;
            if (record.data.oper_pay == 1 || record.data.oper_after_pay == 1) {
                text = "";
            }
            return text;
        }
    }, {
        text: 'Сумма',
        dataIndex: 'suma',
        width: 90,
        renderer: function (grid, column, record) {
            let text = "-";
            if (record.data.oper_buy == 1) {
                text = record.data.suma * 1;
                text = text.toFixed(2);
            }
            if (record.data.oper_sale == 1) {
                text = record.data.price * record.data.kol_sale * 1;
                text = text.toFixed(2);
            }
            if (record.data.oper_pay == 1) {
                text = record.data.sumapay * 1;
                text = text.toFixed(2);
                if (record.data.procent_of_deal < 1) {
                    let prc_text = record.data.procent_of_deal * 1,
                        tip = "Сумма оплаты за товар " + record.data.pay_by_doc + " x " + prc_text.toFixed(2) + " = " + text;
                    column.tdAttr = 'data-qtip="' + tip + '"';
                }
            }
            return columnBlue(text);
        }
    }, {
        text: 'Сумма НДС',
        dataIndex: 'sumandssd',
        width: 90,
        renderer: function (grid, column, record) {
            let text = "-";
            if (record.data.oper_buy == 1) {
                text = record.data.sumands;
            }
            if (record.data.oper_pay == 1) {
                text = record.data.sumapaynds;
            }
            if (text == 0)
                text = "-";

            return columnBlue(text);
        }
    }, {
        text: 'Списано',
        dataIndex: 'suma',
        width: 90,
        renderer: function (grid, column, record) {
            let text = "-", sum = 0;
            if (record.data.oper_sale == 1) {
                sum = (record.data.sum_of_payed * 1 - record.data.sum_of_payed_nds * 1) * 1;
            }
            if (record.data.oper_after_pay == 1) {
                sum = (-record.data.sum_not_payed * 1 + record.data.sum_of_payed_nds * 1) * 1;
            }
            if (sum != 0) {
                text = sum.toFixed(2);
            }
            return columnBlue(text);
        }
    }, {
        text: 'Списан НДС',
        dataIndex: 'sumandssd',
        width: 90,
        renderer: function (grid, column, record) {
            let text = "-", sum = 0;
            if (record.data.oper_sale == 1) {
                sum = (record.data.sum_of_payed_nds) * 1;
            }
            if (record.data.oper_after_pay == 1) {
                sum = (-record.data.sum_of_payed_nds) * 1;
            }
            if (sum != 0) {
                text = sum.toFixed(2);
            }
            return columnBlue(text);
        }
    }, {
        xtype: 'actioncolumn',
        width: 30,
        tdCls: 'vert-menu_btn',
        items: [{

            handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                let menu = this.up('grid').menu;
                menu.rec = rec;
                menu.showAt(e.getXY()[0] - 190, e.getXY()[1]);
            }

        }]
    }],
    bbar: {
        xtype: 'toolbar',
        cls: 'bottom-itog',
        items: [
            {
                xtype: 'label',
                width: 70,
                text: ''
            }, {
                xtype: 'label',
                width: 270,
                name: 'itog',
                text: 'Итого'
                                    }, {
                xtype: 'label',
                width: 70,
                name: 'sum_spis',
                text: '0.00'
            }, {
                xtype: 'label',
                width: 70,
                name: 'sum_spis_nds',
                text: '0.00'
            }, {
                xtype: 'label',
                width: 30,
                text: ''
            }
        ]
    },

    menu: Ext.create('Ext.menu.Menu', {
        rec: null,
        cls: 'style2018 menu-gray',
        items: [{
            text: 'Перейти к операции',
            name: 'menuCardOpen',
            icon: _icons.send,
            handler: function (_inp) {
                let me = this,
                    menu = this.up('menu'),
                    recMenu = menu.rec,
                    rec = {'data': {source: 0}};

                if (recMenu.data.oper_buy == 1) {
                    rec.data.source = 1;
                    rec.data.source_id = recMenu.data.id_sb;
                }
                if (recMenu.data.oper_sale == 1) {
                    rec.data.source = 2;
                    rec.data.source_id = recMenu.data.id_sb;
                }
                if (recMenu.data.oper_pay == 1) {
                    rec.data.source = recMenu.data.id_pay_oper;
                    rec.data.source_id = recMenu.data.id_pay_doc;
                }
                if (rec.data.source > 0) {
                    joManager.openSource(rec);
                }
            }
        }]
    }),

    listeners: {
        itemcontextmenu: function (v, rec, it, ind, e, eo) {
            e.stopEvent();
            this.menu.rec = rec;
            this.menu.showAt(e.getXY());
        },
        cellclick: function (view, cell, colindex, record, row, rowindex, e, eopt) {
            if (colindex == 2 && e.target.nodeName == 'A') {
                this.menu.rec = record;
                this.menu.down('[name=menuCardOpen]').handler();
            }

        },


    },

    gridFilter: function () {
        let me = this,
            win = me,
            s = 0,
            s_nds = 0,
            val1 = me.down('[name=oper]').getValue(),
            val2 = me.down('[name=showAll]').getValue(),
            store = me.store;

        store.filterBy(function (r) {
            let ret = false;
            if (val2)
                ret = true;
            else
                ret = Ext.Date.format(r.get('dat'), 'Y-m-d') <= win.date.substr(0, 10);

            if (ret) {
                if (val1 == 0)
                    ret = true;
                else if (r.get('oper_buy') == 1 && val1 == 1)
                    ret = true;
                else if (r.get('oper_pay') == 1 && val1 == 2)
                    ret = true;
                else if (r.get('oper_sale') == 1 && val1 == 3)
                    ret = true;
                else if (r.get('oper_after_pay ') == 1 && val1 == 4)
                    ret = true;
                else
                    ret = false;
            }
            if (ret) {
                if (r.data.oper_sale == 1) {
                    s += r.data.sum_of_payed * 1;
                }
                if (r.data.oper_after_pay == 1) {
                    s += -r.data.sum_not_payed * 1;
                }
                if (r.data.oper_sale == 1) {
                    s_nds = r.data.sum_of_payed_nds * 1;
                }
                if (r.data.oper_after_pay == 1) {
                    s_nds = -r.data.sum_of_payed_nds * 1;
                }

            }
            return ret;

        });
        win.down('[name=sum_spis]').setText(s.toFixed(2));
        win.down('[name=sum_spis_nds]').setText(s_nds.toFixed(2));
    },

    gridFilter: function () {
        let me = this,
            win = me,
            s = 0,
            s_nds = 0,
            val1 = me.down('[name=oper]').getValue(),
            val2 = me.down('[name=showAll]').getValue(),
            store = me.store;

        store.filterBy(function (r) {
            let ret = false;
            if (val2)
                ret = true;
            else
                ret = Ext.Date.format(r.get('dat'), 'Y-m-d') <= win.date.substr(0, 10);

            if (ret) {
                if (val1 == 0)
                    ret = true;
                else if (r.get('oper_buy') == 1 && val1 == 1)
                    ret = true;
                else if (r.get('oper_pay') == 1 && val1 == 2)
                    ret = true;
                else if (r.get('oper_sale') == 1 && val1 == 3)
                    ret = true;
                else if (r.get('oper_after_pay ') == 1 && val1 == 4)
                    ret = true;
                else
                    ret = false;
            }
            if (ret) {
                if (r.data.oper_sale == 1) {
                    s += r.data.sum_of_payed * 1;
                }
                if (r.data.oper_after_pay == 1) {
                    s += -r.data.sum_not_payed * 1;
                }
                if (r.data.oper_sale == 1) {
                    s_nds = r.data.sum_of_payed_nds * 1;
                }
                if (r.data.oper_after_pay == 1) {
                    s_nds = -r.data.sum_of_payed_nds * 1;
                }

            }
            return ret;

        });
        s -= s_nds;
        win.down('[name=sum_spis]').setText(s.toFixed(2));
        win.down('[name=sum_spis_nds]').setText(s_nds.toFixed(2));
    },

    load: function () {
        let me = this,
            store = this.store,
            fn = function (ans) {
                let ret = Ext.decode(ans);
                //me.down('[name=ttl1]').update("Расходы на приобретение товаров: " + ret.data.name);
                if (ret.data.id_sb != 0) {
                    me.up("window").down('[name=ttl2]').update(ret.data.dat + " " + " Поставщик " + ret.data.org_name +
                        " " + ret.data.dog_name/* + " " + ret.data.doc_of_oper*/);
                } else {
                    me.up("window").down('[name=ttl2]').update("Входящий остаток");
                }

            };
        _ajax(
            dir_start_buh_ + 'bookincomexpence/epxlainSaleCard/',
            {
                'yearDatabase': currYear,
                'source': me.source,
                'source_id': me.source_id
            },
            fn
        );
        store.proxy.extraParams =
            {
                'yearDatabase': currYear,
                'source': me.source,
                'source_id': me.source_id
            };
        store.load({
            callback: function (records, operation, success) {
                let add = store.getProxy().reader.jsonData;
                me.gridFilter();
            }
        });


    }

});



