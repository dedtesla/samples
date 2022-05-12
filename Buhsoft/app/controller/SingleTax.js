/**
 * Контроллер единого налога от 21 года.
 * Новые проводки.
 * classes/prov/fillJoManager.php
 *
 * 12.20 - 01.21
 */
Ext.define('Buh.controller.SingleTax', {
    extend: 'Ext.app.Controller',
    taxMode: null,
    taxStavka: null,
    yearToCalcEN: 0,
    refs: [
        {
            ref: 'mainWin',
            selector: 'singleTaxWindow'
        },
        {
            ref: 'grdSingleTax',
            selector: 'singletaxgrid'
        },
        {
            ref: 'grdSingleTaxPay',
            selector: 'singletaxpaygrid'
        },
        {
            ref: 'formCalcExpense',
            selector: 'singleTaxFormCalcExpense'
        },
        {
            ref: 'formCalcIncome',
            selector: 'singleTaxFormCalcIncome'
        }
    ],
    init: function () {
        let me = this;

        _ajax(
            dir_start_buh_ + 'kudir_process.php',
            {
                action: 'readState',
                namefield: 'yeartocalcen'
            },
            function (response) {
                data = Ext.decode(response);

                me.yearToCalcEN = data.data.yeartocalcen;
                me.yearToCalcEN = iif(parseInt(me.yearToCalcEN) > 0, me.yearToCalcEN, currYearMax);

                me.taxMode = iif(taxObjNal['' + me.yearToCalcEN] == 1, 1, 0);
                me.taxStavka = taxUSNO['' + me.yearToCalcEN];
            });

        me.control({
            'singleTaxWindow': {
                afterRender: this.winRender,
                reloadSingleTax: this.renderSingleTax,
                render: this.renderSingleTax,
                onScroll: this.winRender
            },

            'singleTaxWindow tabpanel': {
                tabchange: this.tabChange
            },

            'singleTaxWindow gbs_combo_year': {
                select: this.yearChange
            },

            'singleTaxWindow tabpanel toolbar greenbutton[action=addEnPay]': {
                click: this.addEnPay
            },

            'singletaxpaygrid': {
                itemcontextmenu: this.contextMenu,
                edit: this.editPayment,
                downloadpaydoc: this.downloadPayDoc,
                deletepaydoc: this.deletePayDoc
            },

            'singleTaxFormCalcExpense toolbar[name=tbarTop]': {
                printxls: this.printXlS,
                printpdf: this.printPDF
            },

            'singleTaxFormCalcIncome toolbar[name=tbarTop]': {
                printxls: this.printXlS,
                printpdf: this.printPDF
            },

        })
    },

    renderSingleTax: function () {
        let me = this, win = Ext.getCmp('main_winSDPay');

        // me.yearToCalcEN = Ext.util.Cookies.get('yeartocalcen');
        // me.yearToCalcEN = iif(parseInt(me.yearToCalcEN) > 0, me.yearToCalcEN, currYearMax);
        // me.taxMode = iif(taxObjNal['' + me.yearToCalcEN] == 1, 1, 0);
        // me.taxStavka = taxUSNO['' + me.yearToCalcEN];

        me.yearToCalcEN = iif(parseInt(me.yearToCalcEN) > 0, me.yearToCalcEN, currYearMax);

        me.taxMode = iif(taxObjNal['' + me.yearToCalcEN] == 1, 1, 0);
        me.taxStavka = taxUSNO['' + me.yearToCalcEN];

        win._year = me.yearToCalcEN;
        win.taxStavka = me.taxStavka;
        win.taxMode = me.taxMode;
        win.setDeflator();
        win.renderPanel();

        Ext.util.Format.thousandSeparator = " ";

        let labelText = iif(me.yearToCalcEN == 2021,
                        "Программа подставляет автоматически сумму остатков со сч.68.1 и сч.68.25.",
                        "Программа подставляет автоматически сумму долга по итогам налогового периода из прошлогодней формы Уплата УСН.");
        labelText += "<br><br>Значение со знаком 'минус' означает переплату, со знаком 'плюс' - долг.";
        let button = Ext.String.format('<a class="ico-faq-small tooltip-container" data-qtip="{0}"></a>&nbsp;&nbsp;', labelText);

        let _add = [
            {
                xtype: 'gbs_combo_year',
                itemId: 'cmbYearEN',
                value: '' + me.yearToCalcEN
            },
            {
                xtype: 'tbfill'
            },
            {
                xtype: 'label',
                hidden: true,
                name: 'lbl-dolg',
                html: 'Долг/переплата за прошлые налоговые периоды ' + button
            },
            {
                xtype: 'textfield',
                hidden: true,
                width: 100,
                name: 'dolg',
                id: 'endolgpereplata',
                readOnly: true
            }
        ];

        let tabbar = win.down('tabpanel').tabBar;
        tabbar.add(_add);

        let _closeTool = Ext.widget({
            xtype: 'tool',
            type: 'close',
            cls: 'btn-close_window',
            handler: function () {
                win.close.call(win);
            }
        });

        win.add(_closeTool);

        let form = win.down('form')
        form.onFill(0);
    },

    yearChange: function() {
        let me = this, win = Ext.getCmp('main_winSDPay'),
            form, _lbl = Ext.getCmp('lblTaxEn'),
            cbYear = win.down('tabpanel').tabBar.down('gbs_combo_year');

        me.saveState('yeartocalcen', cbYear.getValue());
        me.yearToCalcEN = cbYear.getValue();
        win._year = me.yearToCalcEN;

        me.taxMode = win.taxMode = iif(taxObjNal['' + me.yearToCalcEN] == 1, 1, 0);
        me.taxStavka = win.taxStavka = taxUSNO['' + me.yearToCalcEN];

        if (_lbl != _dummy) {
            _lbl.el.dom.innerHTML = '<span class="txt-grey">' + win.taxModes[me.taxMode] + ' (' + me.taxStavka + '%)' + '</span>';
        }

        win.setDeflator();
        win.renderPanel();
        me.renderSingleTax();
        form = win.down('form');
        form.onFill(0);
        me.refreshGrdSingleTax();
    },

    tabChange: function (tp, nc, oc) {
        let me = this, win = Ext.getCmp('main_winSDPay'),
            form = win.down('form');

        if (nc.itemId == 2) {
            win.down('tabpanel').down('[name=lbl-dolg]').show();
            win.down('tabpanel').down('[name=dolg]').show();
            me.refreshGrdSingleTax();
        } else {
            win.down('tabpanel').down('[name=lbl-dolg]').hide();
            win.down('tabpanel').down('[name=dolg]').hide();
            form.onFill(0);
        }
    },

    cancelWindow: function (el) {
        el.up('window').close();
    },

    winRender: function () {
        let me = this;
        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);
        me.onScroll();
    },

    contextMenu: function (v, rec, it, ind, e, eo) {
        e.stopEvent();
        let me = this, grid = me.getGrdSingleTaxPay();

        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.menu.showAt(e.getXY());
    },

    saveCalcExpense: function() {
        let me = this, form = me.getFormCalcExpense();

        _ajax(dir_start_buh_ + 'en_sav.php',
            {
                'kvartal': oDefaults.enPeriod,
                'year': me.yearToCalcEN,
                'p1_dohod': form.getForm().findField('p1_dohod').getValue(),
                'p1_rashod': form.getForm().findField('p1_rashod').getValue(),
                'p1_stavka_en': form.getForm().findField('p1_stavka_en').getValue(),
                'p1_summa_en': form.getForm().findField('p1_summa_en').getValue(),
                'p1_torg': form.getForm().findField('p1_torg').getValue(),
                'p1_nach_pred_period': form.getForm().findField('p1_nach_pred_period').getValue(),
                'p1_nalog_to_pay': form.getForm().findField('p1_nalog_to_pay').getValue(),
                'p1_doh_m_ras': form.getForm().findField('p1_doh_m_ras').getValue(),
                'p1_ubytok': form.getForm().findField('p1_ubytok').getValue(),
                'p1_nalog_baza': form.getForm().findField('p1_nalog_baza').getValue(),
                'p1_summa_min_nalog': form.getForm().findField('p1_summa_min_nalog').getValue(),
                'p1_kbk_en': form.getForm().findField('p1_kbk_en').getValue(),
                'p1_kbk_min_nalog': form.getForm().findField('p1_kbk_min_nalog').getValue(),
                'dohod_ext': form.getForm().findField('dohod_ext').getValue(),
                'p2_ip_0': form.getForm().findField('p2_ip_0').getValue(),
                'employees_ext': form.getForm().findField('employees_ext').getValue()
            }, function () {
            });
    },

    saveCalcIncome: function() {
        let me = this, form = me.getFormCalcIncome();

        _ajax(dir_start_buh_ + 'en_sav.php',
            {
                'kvartal': oDefaults.enPeriod,
                'year': me.yearToCalcEN,
                'p2_dohod': form.getForm().findField('p2_dohod').getValue(),
                'p2_stavka_en': form.getForm().findField('p2_stavka_en').getValue(),
                'p2_summa_vznos': form.getForm().findField('p2_summa_vznos').getValue(),
                'p2_summa_vychet': form.getForm().findField('p2_summa_vychet').getValue(),
                'p2_nach_pred_period': form.getForm().findField('p2_nach_pred_period').getValue(),
                'p2_torg': form.getForm().findField('p2_torg').getValue(),
                'p2_doh_m_ras': form.getForm().findField('p2_doh_m_ras').getValue(),
                'p2_summa_en': form.getForm().findField('p2_summa_en').getValue(),
                'p2_summa_posob': form.getForm().findField('p2_summa_posob').getValue(),
                'p2_summa_en_total': form.getForm().findField('p2_summa_en_total').getValue(),
                'p2_kbk_en': form.getForm().findField('p2_kbk_en').getValue(),
                'p2_nalog_to_pay': form.getForm().findField('p2_nalog_to_pay').getValue(),
                'dohod_ext': form.getForm().findField('dohod_ext').getValue(),
                'p2_ip_0': form.getForm().findField('p2_ip_0').getValue(),
                'employees_ext': form.getForm().findField('employees_ext').getValue()
            }, function () {
            });
    },

    refreshGrdSingleTax: function () {
        let me = this, win = Ext.getCmp('main_winSDPay'),
            n_period = oDefaults.enPeriod - 1,
            grid = me.getGrdSingleTax();

        grid.store.proxy.extraParams = {
            kvartal: win.down('[name=kvartal]').getValue(),
            year: me.yearToCalcEN,
            taxobject: me.taxMode
        };

        grid.store.load(function (r, o, s) {
            grid.getSelectionModel().select(n_period);
        });
    },

    addEnPay: function () {
        let me = this, grdPay1 = me.getGrdSingleTax(), grdPay2 = me.getGrdSingleTaxPay();

        if (grdPay1.getSelectionModel().hasSelection()) {
            if (grdPay1.getSelectionModel().hasSelection()) {
                let rec = grdPay1.getSelectionModel().getSelection()[0];

                Ext.Ajax.request({
                    url: dir_start_buh_ + 'enpay_precheck.php',
                    params: {
                        year: rec.data.year,
                        kvart: rec.data.kvartal,
                    },
                    success: response => {
                        const res = Ext.JSON.decode(response.responseText);
                        let _callback = _args => {
                            Ext.Ajax.request({
                                url: dir_start_buh_ + 'enpay_add.php',
                                params: {
                                    id: 0,
                                    yr: rec.data.year,
                                    kv: rec.data.kvartal,
                                    dat: Ext.Date.format(_args.df, 'd.m.Y'),
                                    summa: _args.summav,
                                    rsmy_id: _args.rsmy_id,
                                    analit_name: _args.analit,
                                    org_id: _args.analit,
                                    from_pp: 1,
                                    id_bank_pay: _args.id,
                                    number: _args.n_doc,
                                },
                                success: response => {
                                    grdPay2.store.reload();
                                    grdPay1.store.reload();
                                }
                            });
                        }

                        bankEdit({
                            '_id': 0,
                            'id_oper': 4,
                            'df': oDefaults.date,
                            'reg_plt': '4',
                            'nalog_id': res.nalogId,
                            'f5': res.f5,
                            'f14': res.nalogPeriod,
                            'f3': 'ТП',
                            'summav': Math.round(rec.data.p1_nalog_to_pay),
                            'nds_id': '4',
                            'f0': org_status,
                            'callback': _callback,
                            'nalog_penja': 0,
                            'f2': my_oktmo,
                            'id_j_dr': res.id_j_dr,
                            'title': 'Уплата налога - Налог УСН',
                            'bank_other_nm_id_j_dr': res.bank_other_nm_id_j_dr,
                            'model': 'nalog',
                            'kv': rec.data.kvartal
                        });
                    }
                });
            }
        }
    },

    editPayment: function (record) {
        let me = this, grdPay1 = me.getGrdSingleTax(), grdPay2 = me.getGrdSingleTaxPay();
        const rec = record;

        let _callback = (_args) => {
            Ext.Ajax.request({
                url: dir_start_buh_ + 'enpay_edit.php',
                params: {
                    id: rec.data.id,
                    date: _args.df,
                    sum: _args.summav
                },
                success: response => {
                    grdPay2.store.reload();
                    grdPay1.store.reload();
                }
            });
        }

        bankEdit({
            '_id': rec.data.id_bank_pay,
            'title': 'Уплата налога - Налог УСН',
            'model': 'nalog',
            'callback': _callback
        });
    },

    downloadPayDoc: function (rec) {
        _ajax(
            dir_start_buh_ + 'bankpay_add_prev_p.php',
            {
                'id': rec.data.id_bank_pay
            },
            function () {
                window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + rec.data.id_bank_pay + "&type=6";
            }
        );
    },

    deletePayDoc: function (rec) {
        let me = this, grdPay1 = me.getGrdSingleTax(), grdPay2 = me.getGrdSingleTaxPay();

        _confirmDel(
            function () {
                Ext.Ajax.request({
                    url: dir_start_buh_ + 'enpay_del.php',
                    params: {
                        id: rec.data.id
                    },
                    success: function (response) {
                        let result = response.responseText;
                        grdPay2.store.remove(rec);
                        grdPay1.store.reload();
                    }
                });
            }
        );
    },

    printXlS: function() {
        let me = this;
        window.location.href = dir_start_buh_ + "frm_usn21.php?year=" + me.yearToCalcEN;
    },

    printPDF: function() {
        let me = this;
        window.location.href = dir_start_buh_ + "frm_usn21.php?type_doc_convert=pdf&year=" + me.yearToCalcEN;
    },

    saveState: function (namefield, data) {
        if (namefield != undefined) {
            _ajax(
                dir_start_buh_ + 'kudir_process.php',
                {
                    action: 'saveState',
                    namefield: namefield,
                    data: data
                }
            );
        }
    }

});
