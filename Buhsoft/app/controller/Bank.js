Ext.define('Buh.controller.Bank', {
    extend: 'Ext.app.Controller',
    requires: [
        'Buh.classes.common.NaznPl'
    ],

//    requires : [],
    refs: [
        {
            ref: 'winBankEdit',
            selector: 'editbank'
        },
        {
            ref: 'regPlt',
            selector: 'editbank [name=reg_plt]'
        },
        {
            ref: 'prRas',
            selector: 'editbank three_select'
        },

    ],
    edit: 1,
    loadSet: 0,
    fieldSetValue: 0,
    taskNaznPl: null,
    taskCheckField: null,
    loadData: null,
    mask: null,
    id_j_dr: 0,
    id_j_dr_nam: '',
    f0: '',
    _args: {},
    date_20211001: new Date(2021, 9, 1),
    f0Exclude_20211001: ['09', '10', '11', '12'],
    f3Exclude_20211001: ['ТР', 'ПР', 'АП', 'АР'],
    init: function () {
        this.control({

            'editbank': {
                afterRender: this.winRender, // Окно создалось обработаем
                onScroll: this.onScroll, // Окно скроллится
                close: this.onClose, // Окно закрыли
                fillData: this.fillData, // Заполнение данных
            },

            'editbank three_select': {
                change: this.setPrRas // Переустановка полей в зависимости от приход / расход
            },

            'editbank [name=reg_plt]': {
                select: this.setRegPlt // Переустановка полей в зависимости от вида операций
            },

            'editbank [name=jdoc]': {
                select: this.changeDoc // Смена документа и с ним номера
            },

            'editbank [name=summav]': {
                change: this.checkSummav,
//                blur : this.arrangeSumma,
//                change: this.setNds // Смена НДС
            },

            'editbank [name=nds_id]': {
                select: this.setNds // Смена НДС
            },

            'editbank [name=avans]': {
                select: this.showFieldNDS // Показать поля НДС
            },

            'editbank [name=n_doc]': {
                change: this.formCheck, // Изменились данные в форме, проверить
            },
            'editbank [name=df]': {
                change: function() {
                    this.changeDoc.apply(this, arguments),
                    this.dateCheck.apply(this, arguments);
                    this.formCheck.apply(this, arguments);
                }, // Изменились данные в форме, проверить
            },

            'editbank [name=id_analit]': {
                change: this.formCheck, // Изменились данные в форме, проверить
            },

            'editbank [name=id_analit2]': {
                change: this.setNaznPl, // Изменились данные в форме, проверить
            },

            'editbank [name=id_analit_]': {
                change: this.formCheck, // Изменились данные в форме, проверить
            },

            'editbank [name=id_analit__]': {
                change: this.formCheck, // Изменились данные в форме, проверить
            },

            /*
                        'editbank [name=rs_my_other]': {
                            blur: this.formCheck, // Изменились данные в форме, проверить
                        },
            */


            'editbank [name=id_sp_analit]': {
                change: this.analit1Sprav // Смена справочника первой аналитики
            },

            'editbank [name=id_sp_analit2]': {
                change: this.analit2Sprav // Смена справочника второй аналитики
            },


            'editbank sprav_tool[name=analit1]': {
                select: this.analit1Select // Смена первой аналитики
            },

            'editbank sprav_tool[name=analit2]': {
                select: this.analit2Select // Смена первой аналитики
            },

            'editbank [name=rs_our]': {
                select: this.filterRs,      // Спрятать расечтный счет, который выбран вверху
            },


            'editbank [name=id_j_pr]': {
                change: this.termLoan,      // Изменили срок кредита
            },

            'editbank [name=kassa_id]': {
                select: this.setKassaSc,      // Выбрали кассу

            },

            'editbank [name=rs_my_other]': {
                select: this.setBankSc,      // Выбрали наш банк для операции банк - банк

            },

            'editbank [name=sc]': {
                select: this.selScSsc,   // Выбрали счет в комбо

            },

            'editbank [name=nalog_vid]': {
                select: this.vidNalogFilt,         // Фильтр списка видов налогов

            },
            'editbank [name=nalog_vid_kbk]': {
                select: this.setBankKBK,         // В зависимости от вида налога стваится свой КБК

            },

            'editbank [name=nalog_id]': {
                select: this.vidNalogFillDefault   // Заполнение полей для уплаты налога по дефолту
            },

            'editbank [name=vid_return]': {
                select: this.changeReturn // Смена вида возмещения
            },

            'editbank [name=f3]': {
                select: this.showBase,   // Показать документ - основание

            },


            'editbank [name=f5]': {
                select: this.nalogPeriodSet,   // Выбор видимости комбобоксов по налоговому периоду

            },
            'editbank [name=_f6]': {
                select: this.showDocNumber,   // Показать номер документа - основания
            },
            'editbank [name=_f7]': {
                select: this.dateNalogBase,         // Дата документа-основания

            },
            'editbank [name=f14_1]': {
                select: this.nalogPeriodFillField,   // Заполнение поля с налоговым периодом

            },

            'editbank [name=f14_2]': {
                select: this.nalogPeriodFillField,   // Заполнение поля с налоговым периодом

            },

            'editbank [name=f14_3]': {
                select: this.nalogPeriodFillField,   // Заполнение поля с налоговым периодом

            },

            'editbank [name=f14_4]': {
                select: this.nalogPeriodFillField,   // Заполнение поля с налоговым периодом

            },

            'editbank [name=f14_5]': {
                select: this.nalogPeriodFillField,   // Заполнение поля с налоговым периодом

            },

            'editbank button[action=compare]': {
                click: this.taxCompare, // Открыть налоговую дял сравнения текстов

            },


            'editbank button[name=btn_add_rs_people]': {
                click: this.addRsPeople // Заполнить РС сотрудника через форму зарплаты
            },


            'editbank button[action=focusfield]': {
                click: this.focusField // Фокус на пустое поле
            },

            'editbank button[action=close_add_panel]': {
                click: this.closeAddPanel // Скрыть дополнительную панель
            },
            'editbank button[action=show_add_panel]': {
                click: this.showAddPanel // Показать дополнительную панель
            },

            'editbank button[action=save]': {
                click: this.save // Сохранить
            },
            'editbank button[action=close_window]': {
                click: this.closeWin // закрыть окно
            },


            'editbank [action=save_print]': {
                click: this.saveAndPrint // Сохранить + Печать
            },

            'editbank [action=save_download_xls]': {
                click: this.saveAndDownloadXls // Сохранить + Скачать xls
            },

            'editbank [action=close_req_panel]': {
                click: this.hideReqPanel // Скрыть панель с реквизитами
            },

            'editbank [action=open_req]': {
                click: this.editRequisites // Редактировать реквизиты
            },

            'editbank [action=show_req_panel]': {
                click: this.openRequisites // Открыть реквизиты платежа
            },

            'editbank [action=move_to_zarpl]': {
                click: this.goToZp // Перейти в зарплату
            },


        });

    },

    analit1Sprav: function () { // Смена справочника первой аналитики
        var win = this.getWinBankEdit(),
            an_s1 = win.down('[name=id_sp_analit]').getValue(),
            rpl = this.getRegPlt().getValue() * 1,
            s1 = win.down('sprav_tool[name=analit1]'),
            s11 = win.down('sprav_tool[name=analit11]'),
            nv = arguments[1],
            ov = arguments[2],
            op = win.down('three_select').getValue();
        s1.setNewSprav(an_s1);
        s11.setNewSprav(an_s1);

        if (an_s1 == 11)
            if (op == 1) {
                s1.setNewSprav(111);
                s11.setNewSprav(111);
            } else {
                s1.setNewSprav(112);
                s11.setNewSprav(112);
            }

        if (this.loadSet != 1)
            if (nv != ov && (nv != 12 && ov != 13) && (nv != 13 && ov != 12)) {
                s1.setValueSilent(0, '');
                s11.setValueSilent(0, '');
                win.down('sprav_tool[name=analit2]').setFilter("");
                win.down('sprav_tool[name=analit21]').setFilter("");
            }

        win.down('cont_vert[name=cnt-analit1]').setVisible(an_s1 > 0 && (rpl != 8 && rpl != 7));
        win.down('cont_vert[name=cnt-analit11]').setVisible(an_s1 > 0 && (rpl == 8 || rpl == 7));
        win.down('[name=analit11]').setEmptyText(globalArAnalit[an_s1]);

    },

    analit2Sprav: function () { // Смена справочника первой аналитики
        var win = this.getWinBankEdit(),
            an_s2 = win.down('[name=id_sp_analit2]').getValue(),
            rpl = this.getRegPlt().getValue() * 1,
            nv = arguments[1],
            ov = arguments[2],
            s2 = win.down('sprav_tool[name=analit2]'),
            s21 = win.down('sprav_tool[name=analit21]');
        s2.setNewSprav(an_s2);
        s21.setNewSprav(an_s2);
        if (this.loadSet != 1)
            if (nv != ov) {
                s2.setValueSilent(0, '');
                s21.setValueSilent(0, '');
            }
        win.down('cont_vert[name=cnt-analit2]').setVisible(an_s2 > 0 && rpl != 8 && an_s2 != 16);
        win.down('cont_vert[name=cnt-analit21]').setVisible(an_s2 > 0 && rpl == 8 && an_s2 != 16);
        win.down('[name=analit21]').setEmptyText(globalArAnalit[an_s2]);
    },

    winRender: function () {
        // Окно создалось обработаем
        var me = this;
        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);
        me.onScroll();
    },

    analit1Select: function (rec) {
        // Смена первой аналитики
        var me = this,
            win = this.getWinBankEdit(),
            sp_analit1 = win.down('[name=id_sp_analit]').getValue();
        if (sp_analit1 == 6) {
            win.down('[name=analit2]').setFilter('org_id=' + rec.data.id);
            win.down('[name=analit2]').org_id = rec.data.id;
            win.down('[name=analit2]').org_nam = rec.data.name;
            win.down('[name=rs_contra]').setFilter('org_id=' + rec.data.id);
            win.down('[name=rs_contra]').org_id = rec.data.id;
            win.down('[name=rs_contra]').org_nam = rec.data.naim;

            _ajax(dir_start_buh_ + 'form.php',
                {action: 'readContraInfo', id: rec.data.id},
                function (_ret) {
                    var rec = Ext.decode(_ret)
                    win.down('[name=rs_contra]').setValue(rec.rs.id, rec.rs.sc);
//                    win.down('[name=analit2]').setValue(rec.dog.id, rec.dog.nms);
                });
        }

        if (sp_analit1 == 12 || sp_analit1 > 130) {
            me.readTaxOfficeData(sp_analit1, rec.data.id);
        }


        if (sp_analit1 == 7) {
            win.down('[name=rs_people]').setFilter('org_id=' + rec.data.id);
            _ajax(dir_start_buh_ + 'form.php',
                {action: 'read', sprav: 7, id: rec.data.id},
                function (_ret) {
                    var rec = Ext.decode(_ret)
                    if (rec.data.useracc != "") {
                        win.down('[name=rs_people]').setValue(rec.data.useracc, rec.data.useracc);
                        win.down('[name=rs_people]').setMinus();
                    }
                });

        }
        this.getLastDiR();

    },


    analit2Select: function (rec) {
        this.getLastDiR();
    },

    getLastDiR: function () {
        var me = this,
            win = me.getWinBankEdit(),
            rpl = me.getRegPlt().getValue() * 1,
            op = win.down('three_select').getValue(),
            sp_analit1 = win.down('[name=id_sp_analit]').getValue(),
            sp_analit2 = win.down('[name=id_sp_analit2]').getValue(),
            s1 = win.down('sprav_tool[name=analit1]').getValue(),
            s2 = win.down('sprav_tool[name=analit2]').getValue();

        if (!(sp_analit1 == 6 && sp_analit2 == 15) || rpl==1)
            return;

        _ajax(dir_start_buh_ + 'bankpay_proc.php',
            {
                action: 'readLastOper',
                typ_oper: op,
                reg_plt: rpl,
                an1: s1,
                an2: s2
            }, function (ans) {
                var rec = Ext.decode(ans);
                if (rec.id > 0)
                    win.down('[name=dir_combo]').setValue(rec.id_j_dr, rec.id_j_dr_nam);
                else
                    win.down('[name=dir_combo]').setValue(me.id_j_dr, me.id_j_dr_nam);
            });


    },

    onScroll: function () {
        // Окно скроллится

        if (this.getWinBankEdit() == undefined)
            return;

        if (!this.getWinBankEdit().rendered)
            return;
        var win = this.getWinBankEdit(),
            toolbar = win.down('toolbar'),
            body = Ext.getBody(),
            bodyHeight = body.getViewSize().height,
            scrollPosition = body.getScroll(),
            parent = toolbar.ownerCt,
            pos = parent.getPosition(),
            posinwin = toolbar.getPosition(true),
            height = parent.getHeight(),
            tbheight = toolbar.getHeight() - 1,
            maxtop = height - tbheight,
            top = bodyHeight - pos[1] + scrollPosition.top - tbheight,
            y = Math.min(top, maxtop);

        toolbar.setPosition({x: null, y: y});

    },

    save: function () {
        // Сохранение
        var me = this,
            win = me.getWinBankEdit(),
            loadData = me.loadData,
            form = win.down('form'),
            values = form.getValues(),
            id_analit2 = values.id_analit2 || "0",
            op = win.down('three_select').getValue(),
            id_oper = (op == 1 ? 3 : 4),
            pr = win.down('#prov').getValue(),
            _dt = win.down('datefield[name=df]').getValue(),
            notValidField = win.query('textfield{isValid()===false}');

        let _f0 = win.down('[name=f0]').getValue();
        if (_f0 != null && _f0.length > 2)
            win.down('[name=f0]').setValue(_f0.substring(0, 2));

        var _submit = function(params) {
            let options = Ext.apply({
                id_oper: id_oper,
                prov: pr ? 1 : 0
            }, params || {});
            if (notValidField.length == 0)
                win.down('button[action=save]').disable();

            options.yearDatabase = currYear;

            var toDisable = win.query('field');
            Ext.Array.each(
                toDisable,
                function (fld) {
                    fld.enable();
                }
            );

            form.submit({
                params: options,
                submitEmptyText: false,

                //url: dir_start_buh_ + 'bankpaysav.php',
                //url: dir_start_buh_ + 'bankpaysav.php',
                url: dir_start_buh_ + "bankpay/savePayment/",
                success: function (form, action) {
                    var _frm = Ext.getCmp('bankMainSceern');
                    gb247.fireEvent('addPaySalary', this);
                    if (win._args.callback == Ext.emptyFn || win._args.callback == _dummy) {
                        let _grid = _frm.down('grid'),
                            _dt1 = _frm.down('datefield[name=dat_doc1]').getValue(),
                            _dt2 = _frm.down('datefield[name=dat_doc2]').getValue(),
                            params = {
                                period_dat_doc1: (_dt1 > _dt ? _dt : _dt1),
                                period_dat_doc2: (_dt2 < _dt ? _dt : _dt2)
                            };

                        oTotalGrid.grd125 = action.result.id;
                        _grid.resetFilter(params, function() {
                            _grid.scrollTo(action.result.id)
                        });

                        //467
                        var actionName = '';
                        startBankPP = win.startBankPP;
                        editBankPP = win.editBankPP;
                        copyBankPP = win.copyBankPP;
                        if (startBankPP > 0) {
                            startEventTime = startBankPP;
                            if (op == 1) {
                                actionName = 'BankCome';
                            } else if (op == 2) {
                                actionName = 'BankFlow';
                            }
                        } else if (editBankPP > 0) {
                            startEventTime = editBankPP;
                            if (op == 1) {
                                actionName = 'BankComeEdit';
                            } else if (op == 2) {
                                actionName = 'BankFlowEdit';
                            }
                        } else if (copyBankPP > 0) {
                            startEventTime = copyBankPP;
                            if (op == 1) {
                                actionName = 'BankComeCopy';
                            } else if (op == 2) {
                                actionName = 'BankFlowCopy';
                            }
                        }

                        if ((typeof startBankPP != "undefined") && (typeof editBankPP != "undefined") && (typeof copyBankPP != "undefined")) {
                            if (actionName != '') {
                                var d = new Date();
                                duration = Math.round((d.getTime() - startEventTime) / 1000);
                                if (duration > 0) {
                                    crmEventDoc('1pgb_buh', actionName, action.result.id, 0, duration);
                                }
                            }
                        }
                        ///467
                        win.close();
                    }
                    else {


                        var _fieldVal = form.getFieldValues();
                        _fieldVal.id = action.result.id;
                        win.callback(_fieldVal);
//                    _frm.down('grid').store.load();
                        win.close();

                    }
                }
            });
        }

        //GBS-12358
        if(win._args.id && loadData.have_sd > 0 &&
            (loadData.df != values.df ||
                Number.parseFloat(loadData.summa || 0).toFixed(2) != Number.parseFloat(values.summav || 0).toFixed(2) ||
                loadData.id_analit != values.id_analit ||
                loadData.id_analit2 != id_analit2 ||
                loadData.id_oper != id_oper) ||
            ((loadData != null && loadData.reg_plt != undefined) &&
                loadData.reg_plt == '1' && loadData.reg_plt != values.reg_plt)
        ) {
            var w_ask = _win_ask({
                _title: 'Удалится прикрепление к сделкам',
                _items: [{
                    'xtype': 'label',
                    'html': 'После внесенных изменений удалится прикрепление платежки к сделкам и исправятся проводки. При необходимости, прикрепите платеж заново.'
                }],
                _btn_ok: 'Продолжить',
                _fn: function() {
                    _submit.call(this, {
                        clear_trades: 1
                    })
                },
                scope: this
            });
            w_ask.show();
        } else {
            _submit.call(this);
        }
    },

    saveAndPrint: function () {
        // Сохранение + Печать/Скачать
        var win = this.getWinBankEdit(),
            form = win.down('form'),
            op = win.down('three_select').getValue(),
            pr = win.down('#prov').getValue(),
            _dt = Ext.Date.format(win.down('datefield[name=df]').getValue(), 'Y-m-d'),
            notValidField = win.query('textfield{isValid()===false}');

        var toDisable = win.query('field');
        Ext.Array.each(
            toDisable,
            function (fld) {
                fld.enable();
            }
        );

        form.submit({
            params: {
                id_oper: op == 1 ? 3 : 4,
                prov: pr ? 1 : 0,
                yearDatabase: currYear
            },
            submitEmptyText: false,
            url: dir_start_buh_ + "bankpay/savePayment/",
            success: function (form, action, msg) {
                gb247.fireEvent('addPaySalary', this);
                var _frm = Ext.getCmp('bankMainSceern');
                if (win._args.callback == Ext.emptyFn) {
                    var _grid = _frm.down('grid');
                    _dt1 = Ext.Date.format(_frm.down('datefield[name=dat_doc1]').getValue(), 'Y-m-d');
                    _dt2 = Ext.Date.format(_frm.down('datefield[name=dat_doc2]').getValue(), 'Y-m-d');
                    if (_dt1 > _dt) {
                        _frm.down('datefield[name=dat_doc1]').setValue(_dt);
                        _grid.store.proxy.extraParams.dat1 = _dt;
                    }
                    if (_dt2 < _dt) {
                        _frm.down('datefield[name=dat_doc2]').setValue(_dt);
                        _grid.store.proxy.extraParams.dat2 = _dt;
                    }

                    oTotalGrid.grd125 = action.result.id;

                    //467
                    var actionName = '';
                    startBankPP = win.startBankPP;
                    editBankPP = win.editBankPP;
                    copyBankPP = win.copyBankPP;
                    if (startBankPP > 0) {
                        startEventTime = startBankPP;
                        if (op == 1) {
                            actionName = 'BankCome';
                        } else if (op == 2) {
                            actionName = 'BankFlow';
                        }
                    } else if (editBankPP > 0) {
                        startEventTime = editBankPP;
                        if (op == 1) {
                            actionName = 'BankComeEdit';
                        } else if (op == 2) {
                            actionName = 'BankFlowEdit';
                        }
                    } else if (copyBankPP > 0) {
                        startEventTime = copyBankPP;
                        if (op == 1) {
                            actionName = 'BankComeCopy';
                        } else if (op == 2) {
                            actionName = 'BankFlowCopy';
                        }
                    }

                    if ((typeof startBankPP != "undefined") && (typeof editBankPP != "undefined") && (typeof copyBankPP != "undefined")) {
                        if (actionName != '') {
                            var d = new Date();
                            duration = Math.round((d.getTime() - startEventTime) / 1000);
                            if (duration > 0) {
                                crmEventDoc('1pgb_buh', actionName, action.result.id, 0, duration);
                            }
                        }
                    }
                    ///467
                    _frm.down('grid').store.load();
                    win.close();
                }
                else {

                    //_frm.down('grid').store.load();
                    var _fieldVal = form.getFieldValues();
                    _fieldVal.id = action.result.id;
                    win.callback(_fieldVal);
                    win.close();

                }

                var id = action.result.id;

                if (Ext.get('iFramePrintDirect') != _dummy) {
                    Ext.get('iFramePrintDirect').remove();
                }

                var printFrame = Ext.create("Ext.ux.IFrame", {
                    id: 'iFramePrintDirect',
                    src: dir_start_buh_ + "bankpay_add_prev_p.php?type_doc_convert=pdf&id=" + id + "&directprint=true",
                    cls: 'x-hidden',
                    style: {
                        display: "none"
                    },
                    renderTo: document.body
                });

                var iFrame = printFrame.el.dom.firstChild.contentWindow;
                iFrame.focus();
                iFrame.print();

            }
        });

    },

    saveAndDownloadXls: function () {
        // Сохранение + Скачать xls
        var win = this.getWinBankEdit(),
            form = win.down('form'),
            op = win.down('three_select').getValue(),
            pr = win.down('#prov').getValue(),
            _dt = Ext.Date.format(win.down('datefield[name=df]').getValue(), 'Y-m-d'),
            notValidField = win.query('textfield{isValid()===false}');

        var toDisable = win.query('field');
        Ext.Array.each(
            toDisable,
            function (fld) {
                fld.enable();
            }
        );

        form.submit({
            params: {
                id_oper: op == 1 ? 3 : 4,
                prov: pr ? 1 : 0,
                yearDatabase: currYear
            },
            submitEmptyText: false,
            url: dir_start_buh_ + "bankpay/savePayment/",
            success: function (form, action, msg) {
                var _frm = Ext.getCmp('bankMainSceern');
                gb247.fireEvent('addPaySalary', this);
                if (win._args.callback == Ext.emptyFn) {
                    var _grid = _frm.down('grid');
                    _dt1 = Ext.Date.format(_frm.down('datefield[name=dat_doc1]').getValue(), 'Y-m-d');
                    _dt2 = Ext.Date.format(_frm.down('datefield[name=dat_doc2]').getValue(), 'Y-m-d');
                    if (_dt1 > _dt) {
                        _frm.down('datefield[name=dat_doc1]').setValue(_dt);
                        _grid.store.proxy.extraParams.dat1 = _dt;
                    }
                    if (_dt2 < _dt) {
                        _frm.down('datefield[name=dat_doc2]').setValue(_dt);
                        _grid.store.proxy.extraParams.dat2 = _dt;
                    }

                    oTotalGrid.grd125 = action.result.id;

                    //467
                    var actionName = '';
                    startBankPP = win.startBankPP;
                    editBankPP = win.editBankPP;
                    copyBankPP = win.copyBankPP;
                    if (startBankPP > 0) {
                        startEventTime = startBankPP;
                        if (op == 1) {
                            actionName = 'BankCome';
                        } else if (op == 2) {
                            actionName = 'BankFlow';
                        }
                    } else if (editBankPP > 0) {
                        startEventTime = editBankPP;
                        if (op == 1) {
                            actionName = 'BankComeEdit';
                        } else if (op == 2) {
                            actionName = 'BankFlowEdit';
                        }
                    } else if (copyBankPP > 0) {
                        startEventTime = copyBankPP;
                        if (op == 1) {
                            actionName = 'BankComeCopy';
                        } else if (op == 2) {
                            actionName = 'BankFlowCopy';
                        }
                    }

                    if ((typeof startBankPP != "undefined") && (typeof editBankPP != "undefined") && (typeof copyBankPP != "undefined")) {
                        if (actionName != '') {
                            var d = new Date();
                            duration = Math.round((d.getTime() - startEventTime) / 1000);
                            if (duration > 0) {
                                crmEventDoc('1pgb_buh', actionName, action.result.id, 0, duration);
                            }
                        }
                    }
                    ///467

                    _frm.down('grid').store.load();
                    win.close();
                }
                else {

//                    _frm.down('grid').store.load();
                    var _fieldVal = form.getFieldValues();
                    _fieldVal.id = action.result.id;
                    win.callback(_fieldVal);
                    win.close();

                }
                _ajax(dir_start_buh_ + 'bankpay_add_prev_p.php', {'id': action.result.id},
                    function () {
                        window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + action.result.id + "&type=6";
                    }
                );


            }
        });

    },

    focusField: function (b) {
        // Фокус на пустое поле
        var win = this.getWinBankEdit();
        win.down('[name=' + b.fname + ']').focus();

    },

    formCheck: function () {
        if(this.preventFormCheck === true) {
            return;
        }
        var nameEditedField = "all";
        if (arguments[0] != undefined)
            nameEditedField = arguments[0].name;
        if (nameEditedField.indexOf('id_analit') == 0)
            nameEditedField = 'analit1';
        // Изменились данные в форме, проверить
//        if (this.fieldSetValue==1) return;
        var me = this,
            win = me.getWinBankEdit(),
            toolbar = win.down('toolbar'),
            arFld = [],
            layout = [
                {name: 'n_doc', text: 'Номер документа'},
                {name: 'df', text: 'Дата документа'},
                {name: 'summav', text: 'Сумма'},
            ],
            kolErrorPrev = 0,
            kolError = 0;

        if (!win.isVisible()) return;
        arFld[''] = [];
        arFld[1] = [];
        arFld[2] = [];

        arFld[1][1] = [
            {name: 'analit1', text: 'Плательщик'},
        ];
        arFld[1][6] = [
            {name: 'df', text: 'Касса организации'},
        ];

        arFld[1][5] = [
            {name: 'rs_my_other', text: 'Другой расчетный счет'},
        ];

        arFld[1][14] = [
            {name: 'analit1', text: 'Плательщик'},
        ];

        arFld[1][19] = [
            {name: 'analit1', text: 'Плательщик'},
        ];
        arFld[1][11] = [
            {name: 'analit1', text: 'Плательщик'},
        ];
        arFld[1][12] = [
            {name: 'analit1', text: 'Плательщик'},
        ];

        arFld[1][3] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];


        arFld[1][2] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];
        arFld[1][4] = [
            {name: 'analit1', text: 'Налоговая или фонд'},
        ];
        arFld[1][15] = [
            {name: 'analit1', text: 'Плательщик'},
        ];
        /*
                arFld[1][7] = [
                    {name: 'analit1_', text: 'Прочие доходы и расходы'},
                ];
        */
        arFld[1][13] = [
            {name: 'analit1', text: 'Плательщик'},
        ];
        /*
                arFld[1][8] = [
                    {name: 'analit11', text: 'Аналитика 1'},
                ];
        */
        arFld[2][1] = [
            {name: 'analit1', text: 'Получатель'},
        ];
        arFld[2][6] = [
            {name: 'df', text: 'Касса организации'},
        ];

        arFld[2][5] = [
            {name: 'rs_my_other', text: 'Другой расчетный счет'},
        ];

        arFld[2][14] = [
            {name: 'analit1', text: 'Получатель'},
        ];
        arFld[2][11] = [
            {name: 'analit1', text: 'Получатель'},
        ];
        arFld[2][12] = [
            {name: 'analit1', text: 'Получатель'},
        ];

        arFld[2][10] = [
            {name: 'analit1', text: 'Получатель'},
        ];

        arFld[2][17] = [
            {name: 'analit1', text: 'Получатель'},
        ];

        arFld[2][2] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];
        arFld[2][4] = [
            {name: 'analit1', text: 'Налоговая или фонд'},
        ];
        arFld[2][3] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];
        arFld[2][2] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];
        arFld[2][19] = [
            {name: 'analit1', text: 'Сотрудник'},
        ];

        arFld[2][15] = [
            {name: 'analit1', text: 'Получатель'},
        ];
        arFld[2][13] = [
            {name: 'analit1', text: 'Получатель'},
        ];
        /*
                arFld[2][8] = [
                    {name: 'analit11', text: 'Аналитика 1'},
                ];
        */
        if (arFld[win.down('three_select').getValue()][win.down('[name=reg_plt]').getValue()])
            layout = Ext.Array.merge(layout, arFld[me.getPrRas().getValue()][me.getRegPlt().getValue()]);

        if (nameEditedField != 'all') {
            var find = false;
            Ext.each(layout, function (fld, index) {
                if (fld.name == nameEditedField) {
                    find = true;
                }
            });
            if (!find) {
                return;
            }
        }
        if (me.taskCheckField != null)
            me.taskCheckField.cancel();

        me.taskCheckField = new Ext.util.DelayedTask(function () {

            toolbar.down('[name=errordata]').removeAll();
            toolbar.down('[action=save]').enable();
            toolbar.down('[action=print]').enable();

            Ext.each(layout, function (fld, index) {
                var val = win.down('[name=' + fld.name + ']').getValue();
                if (Ext.Array.contains(['', 0, null, '0.00', '0'], val)) {
                    kolErrorPrev++;
                }
            });


            Ext.each(layout, function (fld, index) {
                var val = win.down('[name=' + fld.name + ']').getValue();
                if (Ext.Array.contains(['', 0, null, '0.00', '0'], val)) {

                    kolError++;
                    if (kolError == 1) {
                        toolbar.down('[name=errordata]').add({
                            xtype: 'label',
                            cls: 'btn-sel-blue color-orange',
                            text: 'Не введено:'
                        });
                        var b = {
                            xtype: 'tbspacer',
                        };
                        toolbar.down('[name=errordata]').add(b);
                    }
//                if (kolError > 1) {
                    var b = {
                        xtype: 'tbspacer',
                    };
                    toolbar.down('[name=errordata]').add(b);
//                }

                    var b = {
                        xtype: 'button',
                        action: 'focusfield',
                        componentCls: 'x-toolbar-item',
                        text: fld.text + (kolErrorPrev > kolError ? ',' : ''),
                        fname: fld.name,
                        cls: 'btn-sel-blue color-orange',
                    };
                    toolbar.down('[name=errordata]').add(b);
                    toolbar.down('[action=save]').disable();
                    toolbar.down('[action=print]').disable();
                }
            });
            win.down('[name=text_reg_plt]').setVisible(kolError > 0);

            me.setNaznPl();
            let datDoc = win.down('[name=df]').getValue();
            win.down('[name=sc]').store.proxy.extraParams.yearRequest = Ext.Date.format(datDoc, 'Y');

            if (datDoc < Ext.Date.parse('05/01/2022', 'm/d/Y')) {
                win.down('[name=zp_kod_nazn_pl]').getStore().loadData([
                    ['1', '1 — перевод доходов, в отношении которых установлены ограничения размеров удержания'],
                    ['2', '2 — перевод доходов, на которые не может быть обращено взыскание'],
                    ['3', '3 — перевод доходов, к которым ограничения по обращению взыскания не применяются']
                ]);

                win.down('[name=cnt-nalog-np]').down('buttonask').tipText = '<b>Код 1</b> ставьте при переводе зарплаты и других доходов, по которым есть ограничение по сумме взысканий на основании статьи 99 Закона от 02.10.2007 № 229-ФЗ. Например, премии, отпускные, пособия по временной нетрудоспособности.<br>' +
                    '<b>Код 2</b> указывайте при выплате доходов, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ. Например, когда переводите подотчетные, детские пособия, пособия по беременности и родам и др.<br>' +
                    '<b>Код 3</b> используйте при переводе доходов, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ. В частности, ставьте код при переводе алиментов на несовершеннолетних детей.';

            } else {
                win.down('[name=zp_kod_nazn_pl]').getStore().loadData([
                    ['1', '1 - перевод доходов, в отношении которых установлены ограничения размеров взыскания'],
                    ['2', '2 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер периодических выплат'],
                    ['3', '3 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер периодических выплат'],
                    ['4', '4 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер единовременных выплат'],
                    ['5', '5 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер единовременных выплат']
                ]);

                win.down('[name=cnt-nalog-np]').down('buttonask').tipText = '<b>Код 1</b> ставьте при переводе зарплаты и других доходов, по которым есть ограничение по сумме удержаний на основании статьи 99 Закона от 02.10.2007 № 229-ФЗ. Например, премии, отпускные, пособия по временной нетрудоспособности.<br>' +
                    '<b>Код 2</b> указывайте при выплате доходов, которые имеют характер периодических выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                    '<b>Код 3</b> используйте при переводе доходов, которые имеют характер периодических выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ. В частности, ставьте код при переводе алиментов на несовершеннолетних детей.<br>' +
                    '<b>Код 4</b> указывайте при выплате доходов, которые имеют характер единовременных выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                    '<b>Код 5</b> используйте при переводе доходов, которые имеют характер единовременных выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ.';
            }

            Ext.defer(function () {
                me.onScroll();
            }, 100);
        });

        me.taskCheckField.delay(50);
    },

    fieldReset: function () {
        // Переустановка полей в зависимости от изменения одного из них
        this.setPrRas();
    },

    setPrRas: function () {
//        this.suspendEvents(false);
        this.fieldSetValue = 1;
        this.rplChanged = false;

        var win = this.getWinBankEdit(),
            dtKatPl = [], // Категории платежа
            dtDocs = [], // Доступные документы
            typ_oper = win.down('three_select').getValue(),
            rpl = win.down('[name=reg_plt]').getValue()
        ;
//        win.hide();
        dtKatPl[1] =
            [['1', 'Оплата от покупателя'],                              //
                ['6', 'Поступление из кассы'],                              //
                ['9', 'Поступление оплаты банковской картой'],              //
                ['5', 'Перевод со счета на счет'],                          //
                ['14', 'Поступление от прочих контрагентов'],               //
                ['10', 'Получение займа, кредита'],                         //
                ['11', 'Зачисление средств по выданному займу'],            //
                ['12', 'Возврат от продавца'],                              //
                ['3', 'Возврат от подотчетного лица'],                      //
                ['2', 'Возврат займа сотрудником'],                         //
                ['4', 'Возврат налога или взноса'],                         //
                ['20', 'Возмещение из ФСС'],                                //
                ['15', 'Посредническое вознаграждение'],                    //
                ['7', 'Начисление процентов от банка'],                     //
                ['13', 'Взнос в уставный капитал'],                         //
                ['8', 'Прочие платежи']];

        dtKatPl[2] =
            [['1', 'Оплата поставщику'],                                 //
                ['6', 'Снятие наличных с расчетного счета'],                //
                ['7', 'Списание комиссии банка'],                           //
                ['2', 'Выплата заработной платы'],                          //
                ['4', 'Уплата налога или взноса'],                          //
                ['3', 'Выдача подотчетному лицу '],                         //
                ['5', 'Перевод со счета на счет'],                          //
                ['14', 'Перечисление прочим контрагентам'],                 //
                ['12', 'Возврат покупателю'],                               //
                ['10', 'Погашение займа, кредита'],                         //
                ['11', 'Выдача займа контрагентам'],                        //
                ['19', 'Выдача займа сотруднику'],                          //
                ['17', 'Выплата по агентскому договору'],                   //
                ['8', 'Прочие платежи']];

//      win.down('[name=reg_plt]').bindStore(tDoc);


        win.down('[name=reg_plt]').getStore().loadData(dtKatPl[typ_oper]);

        if (!Ext.Array.contains(['1', '2', '3', '4', '5', '6', '7', '8', '10', '11', '12', '14'], rpl)) // зеркальный массив нужен
            if (rpl == '20') {
                win.down('[name=reg_plt]').setValue('4');
                this.rplChanged = true;
                if (win._args.model == 'zp_nalog') {
                    win.down('[name=nalog_id]').setValue(win._args.nalog_id);
                    win.down('[name=nalog_vid]').setValue(win._args.nalog_vid);
                    this.rplChanged = false;
                }
            }
            else {
                win.down('[name=reg_plt]').setValue('1');
                this.rplChanged = true;
            }
        else
            win.down('[name=reg_plt]').setValue(rpl);
        if (rpl == '7')
            this.analit1Sprav(); // Принудительная смена аналитики для комисси банка / процентов от банка

        win.down('[name=dir_combo]').store.proxy.extraParams.filt = ['0', '1', '2'][typ_oper];
        win.down('[name=dir_combo]').typ_dir = typ_oper;
        win.down('[name=cnt-dir]').setTitle(['', 'Вид прихода для КУДИР', 'Вид расхода для КУДИР'][typ_oper]);

        var t_avans = ['', 'При прикреплении аванса к продажам будут <br>' +
        'сформированы проводки на ванс с выделением<br>' +
        'НДС и автоматически создан счет фактура на аванс',
            'При прикреплении аванса к покупкам будут <br>' +
            'сформированы проводки на ванс с выделением<br>' +
            'НДС и автоматически создан счет фактура на аванс'];
        win.down('[name=tip_avans]').tipText = t_avans[win.down('three_select').getValue()];

        var t_oktmo = ['', 'ОКТМО Получателя средств', 'ОКТМО плательщика'];
        win.down('[name=btnOKTMO]').tipText = t_oktmo[win.down('three_select').getValue()];

        win.down('[action=print]').setVisible(win.down('three_select').getValue() == 2);

        if (this.rplChanged) {
            win.down('[name=nalog_vid]').setValue('1');
            win.down('[name=avans]').setValue('0');
        }
        this.setRegPlt();
        this.fieldSetValue = 0;
//        this.resumeEvents( );
//        win.show();

    },

    showFieldNDS: function () {
        var win = this.getWinBankEdit(),
            ndsAcc = [];
        ndsAcc[1] = ['1', '14', '15', '8'];
        ndsAcc[2] = ['1', '12', '14', '17', '8'];
        if (Ext.Array.contains(ndsAcc[win.down('three_select').getValue()], win.down('[name=reg_plt]').getValue()))
            win.down('[name=cnt-nds]').show();
        else
            win.down('[name=cnt-nds]').hide();
        if (win.down('[name=avans]').getValue() == '1' && buh_nalog_mode == 1)
            win.down('[name=cnt-avans]').show();
        else
            win.down('[name=cnt-avans]').hide();
        var sc = win.down('[name=sc]').getValue();
        win.down('[name=cnt-go-zp]').hide();

        if (win.down('[name=avans]').getValue() == '1') {
            if (win.down('three_select').getValue() == '1') {
                if (sc != '62.1')
                    win.down('[name=sc]').setValueSilent('62.1', '62.1');
            }
            else {
                if (sc != '60.1')
                    win.down('[name=sc]').setValueSilent('60.1', '60.1');
            }
        }
        else {
            if (win.down('three_select').getValue() == '1') {
                if (sc == '62.1')
                    win.down('[name=sc]').setValueSilent('62.2', '62.2');
            }
            else {
                if (sc == '60.1')
                    win.down('[name=sc]').setValueSilent('60.2', '60.2');
            }
        }
        this.setNds();
        this.onScroll();

    },

    setRegPlt: function () {
        var me = this,
            win = this.getWinBankEdit(),
            oper = win.down('three_select').getValue(),
            rpl = win.down('[name=reg_plt]').getValue(),
            flt = "" + rpl + "" + oper,
            accFlt = [],
            rplDir = [],
            dir_fill = 120,
            oRplSc = this.getRegPltAcc(oper, rpl),
            sc = win.down('[name=sc]'),
            scProxy = sc.store.proxy;

        accFlt['1'] = [];
        accFlt['1'][1] = '11';
        accFlt['1'][2] = '12';
        rplDir['1'] = [];
        rplDir['2'] = [];
        rplDir['1']['1'] = 3;
        rplDir['1']['7'] = 22;
        rplDir['1']['9'] = 90;
        rplDir['1']['14'] = 5;
        rplDir['1']['15'] = 77;

        rplDir['2']['1'] = 119;
        rplDir['2']['12'] = 116;
        rplDir['2']['7'] = 88;
        rplDir['2']['4'] = 118;
        rplDir['2']['2'] = 41;
        rplDir['2']['14'] = 36;
        win.down('[name=cnt-open-req]').hide();
        if (this.loadSet == 0) {
            win.down('[name=jdoc]').setValue(['0', '80', '3'][win.down('three_select').getValue()]);
            if (oper == 1) {
                if (rpl == '6' || rpl == '13')
                    win.down('[name=jdoc]').setValue('5'); // Взнос наличными
                if (rpl == '7')
                    win.down('[name=jdoc]').setValue('84'); // Банковский ордер
            }
            else {
                if (rpl == '6' || rpl == '7')
                    win.down('[name=jdoc]').setValue('84'); // Банковский ордер
            }
        }

        scProxy.extraParams.pay_id = (me._args && me._args.id ? me._args.id : null);
        scProxy.extraParams.filt = flt;
        scProxy.extraParams.query = '';

        if (rpl == '1' && currYear <= 2020)
            win.down('[name=avans]').show();
        else
            win.down('[name=avans]').hide();

        this.showFieldNDS();

        if (rplDir[oper][rpl] != undefined)
            dir_fill = rplDir[oper][rpl];

        if (this.loadSet == 0) {
            if (buh_nalog_mode != 1 &&
                !(win._args.model == 'zp_nalog' && this.preventSetRegPltKndr === true)) {
                _ajax(dir_start_buh_ + 'kndr_proceed.php',
                    {task: 'getOrigin', id: dir_fill},
                    function (_ret) {
                        var rec = Ext.decode(_ret)
                        win.down('[name=dir_combo]').setValue(rec.id, rec.name);
                        me.id_j_dr = rec.id;
                        me.id_j_dr_nam = rec.name;

                    });
            }
            win.down('[name=sc]').setValueSilent(oRplSc.sc, oRplSc.sc);
            win.down('[name=id_sp_analit]').setValue(oRplSc.s1);
            win.down('[name=id_sp_analit2]').setValue(oRplSc.s2);
            win.down('[name=cnt-analit11]').setTitle("Аналитика счета " + oRplSc.sc);
        }
        // Скрываем и показываем поля в зависимости от reg_plt
        var ar_contra = ['1'],
            ar_people = ['2', '3', '19'],
            ar_nalog = ['4'],
            ar_bank = ['5'],
            ar_kassa = ['6'],
            ar_zaem = ['10', '11'],
            ar_agent = ['12', '13', '14', '15', '17'];

        var ar_cnt = ['cnt-analit1',
            'cnt-analit2',
            'cnt-analit11',
            'cnt-analit12',
            'cnt-analit21',
            'cnt-rs-contra',
            'cnt-contra-info',
            'cnt-zaem',
            'cnt-kassa',
            'cnt-bank',
            'cnt-nalog',
            'cnt-nalog2',
            'cnt-nalog3',
            'cnt-nalog4',
            'cnt-nalog-oktmo',
            'cnt-nalog-kpp',
            'cnt-nalog5',
            'cnt-nalog6',
            'cnt-nalog-np',
            'cnt-add-field-kbk',
            'cnt-rs-people',
            'cnt-add-field',
            'cnt-zp-turn',
        ];

        var ar_cnt_1_4 = ['cnt-analit1',
            'cnt-analit2',
            'cnt-rs-contra',
//            'cnt-nalog-oktmo',
        ];

        var ar_cnt_1_3 = ['cnt-analit1',
            'cnt-analit2',
        ];

        var ar_cnt_2 = ['cnt-analit1',
        ];

        var ar_cnt_4_2 = ['cnt-analit1',
            'cnt-nalog',
            'cnt-nalog2',
            'cnt-nalog3',
            'cnt-nalog-oktmo',
            'cnt-nalog-kpp',
            'cnt-add-field',
            'cnt-nalog5',
            'cnt-nalog6'];

        var ar_cnt_4_1 = ['cnt-analit1',
            'cnt-nalog',
        ];

        if (win._args.model == 'zp_nalog') {
            ar_cnt_4_2 = ['cnt-analit1',
                'cnt-nalog2',
                'cnt-nalog3',
                'cnt-nalog-oktmo',
                'cnt-nalog-kpp',
                'cnt-add-field',
                'cnt-nalog5',
                'cnt-nalog6'];

            ar_cnt_4_1 = ['cnt-analit1',
            ];

        }
        var ar_cnt_5 = [
            'cnt-bank',
        ];

        var ar_cnt_6 = [
            'cnt-kassa',
        ];

        var ar_cnt_7_1 = ['cnt-analit11'];
        var ar_cnt_7_2 = ['cnt-analit11'];

        var ar_cnt_8 = ['cnt-analit11',
            'cnt-analit21'];


        var ar_cnt_10_3 = ['cnt-analit1',
            'cnt-analit2',
            'cnt-zaem',
        ];

        var ar_cnt_10_4 = ['cnt-analit1',
            'cnt-analit2',
            'cnt-rs-contra',
            'cnt-zaem',
        ];

        var ar_cnt_17 = ['cnt-analit1',
            'cnt-analit2',
            'cnt-rs-contra'
        ];

        var ar_cnt_20 = ['cnt-analit1',
            'cnt-nalog4',
        ];


        // прячем
        for (var i = 0; ar_cnt.length > i; i++) {
            if (win.down('[name=' + ar_cnt[i] + ']') != undefined)
                win.down('[name=' + ar_cnt[i] + ']').hide();
        }
        // показываем что надо
        var _frm = win.down('form'),
            ar_show = [],
            exclEnvd = win.down('[name=cnt-summa-exclude]'),
            exclEnvdHint = win.down('[name=exclude-hint]'),
            docBank = win.down('form');

        switch (true) {
            case ar_contra.indexOf(rpl) != -1:
                if (oper == 1)
                    ar_show = ar_cnt_1_3;
                else
                    ar_show = ar_cnt_1_4;

                docBank.down('[name=cnt-analit1]').thisTitle('Организация');
                docBank.down('[name=cnt-analit2]').thisTitle('Договор');
                break;

            case  ar_people.indexOf(rpl) != -1 :
                ar_show = ar_cnt_2;
                docBank.down('[name=cnt-analit1]').thisTitle('Сотрудник');
                docBank.down('[name=cnt-analit2]').thisTitle('');
                break;

            case  ar_zaem.indexOf(rpl) != -1  :
                if (oper == 1)
                    ar_show = ar_cnt_10_3;
                else
                    ar_show = ar_cnt_10_4;
                docBank.down('[name=cnt-analit1]').thisTitle('Организация');
                docBank.down('[name=cnt-analit2]').thisTitle('Договор');

                break;

            case  ar_nalog.indexOf(rpl) != -1  :

                if (oper == 2)
                    ar_show = ar_cnt_4_2;
                else
                    ar_show = ar_cnt_4_1;
                docBank.down('[name=cnt-analit1]').thisTitle('Организация');
                docBank.down('[name=cnt-analit2]').thisTitle('Договор');
                if (this.rplChanged)
                    docBank.down('[name=nalog_vid]').fireEvent("select", docBank.down('[name=nalog_vid]'));
                this.setBankKBK();
                if ((buh_envd_ > 0 || buh_have_patent_ > 0) && win._args.model == 'zp_nalog') {
                    exclEnvd.show();
                    exclEnvdHint.show();
                }
                break;

            case  ar_bank.indexOf(rpl) != -1  :
                ar_show = ar_cnt_5;
                if (docBank.down('[name=id]').getValue() == 0) {
                    var recBank = win.down('[name=rs_my_other]').store.getAt(0);
                    if (recBank != undefined) {
                        win.down('[name=rs_my_other]').setValue(recBank.raw.id, recBank.raw.nms);
                    }
                }
                //
                me.filterRs();
                win.down('[name=cnt-bank]').setTitle(oper == 1 ? "Перевод со счета " /*+ our_org_name*/ : "Перевод на счет " /*+ our_org_name*/);
                break;

            case  ar_kassa.indexOf(rpl) != -1  :
                ar_show = ar_cnt_6;
                var rec = docBank.down('[name=kassa_id]').store.getAt(0);
                docBank.down('[name=kassa_id]').setValue(rec);

                break;

            case  rpl == 8  :
                ar_show = ar_cnt_8;
                docBank.down('[name=cnt-analit1]').thisTitle('Аналитика 1');
                docBank.down('[name=cnt-analit2]').thisTitle('Аналитика 2');

                break;

            case  rpl == 7 :
                if (oper == 1) {
                    ar_show = ar_cnt_7_1;
                    if (this.loadSet != 1)
                        win.down('[name=analit11]').setValue(13, 'В виде процентов, полученных по договорам займа, кредита, банковского счета');
                }
                else {
                    ar_show = ar_cnt_7_2;
                    if (this.loadSet != 1)
                        win.down('[name=analit11]').setValue(82, 'Расходы на услуги банков');
                }
                docBank.down('[name=cnt-analit11]').thisTitle('Прочие доходы и расходы');

                break;

            case  rpl == 20 :
                ar_show = ar_cnt_20;

                docBank.down('[name=cnt-analit11]').thisTitle('Прочие доходы и расходы');
                this.changeReturn();
                break;

            case  ar_agent.indexOf(rpl) != -1  :
                ar_show = ar_cnt_17;
                docBank.down('[name=cnt-analit1]').thisTitle('Организация');
                docBank.down('[name=cnt-analit2]').thisTitle('Договор');

                break;
        }
        for (var i = 0; ar_show.length > i; i++)
            if (docBank.down('[name=' + ar_show[i] + ']') != undefined)
                docBank.down('[name=' + ar_show[i] + ']').show();

        if (oper == 2) {
            docBank.down('[name=cnt-analit1]').thisTitle('Получатель')
            if (['2', '3'].indexOf(rpl) != -1) {
                docBank.down('[name=cnt-nalog-np]').show();
                docBank.down('[name=cnt-zp-turn]').show();
                if (me.loadSet == 0)
                    docBank.down('[name=zp_kod_nazn_pl]').setValue(rpl == '3' ? '2' : '1');

            }
            if (rpl == '2' && docBank.down('[name=id]').getValue() == 0) {
                docBank.down('[name=f12]').setValue('3');
                docBank.down('[name=f12_]').setValue('3');
                docBank.down('[name=cnt-go-zp]').show();
            }
        }
        if (oper == 1) {
            docBank.down('[name=cnt-analit1]').thisTitle('Плательщик')
            docBank.down('[name=cnt-rs-contra]').hide();
        }
        if (Ext.Array.contains(['2', '19', '3'], rpl)) {
            docBank.down('[name=cnt-analit1]').thisTitle('Сотрудник');
            if (oper == 2 && have_zarplata == 1)
                docBank.down('[name=cnt-rs-people]').show();
        }

        if (rpl == 4 || rpl == 20) {
            docBank.down('[name=cnt-analit1]').thisTitle('Налоговая или фонд');
            //GBS-13651. Значение по умолчанию только для новых п/п.
            if (win._args.id == 0) {
                win.down('[name=f2]').setValue(my_oktmo);
            }
        }

        if (oper == 2 && rpl == 4) { // тут будет наращивание условий
            win.down('[name=cnt-open-req]').show();
            if (this.loadSet == 0) {
                me.vidNalogFillDefault(win.down('[name=nalog_id]'));
            }
        }
        docBank.down('[name=f24_info]').setVisible(rpl == 4);

        this.corrSpAnalitForTaxes();

        docBank.down('[name=jdoc]').fireEvent('select');

        me.fillLastTax();
        if (win._args.model == 'zp_nalog') {
            if (Ext.Array.contains(['21', '22', '35'], (me.loadData || win._args).nalog_id)) {
                win.down('[name=reg_plt]').getStore().filterBy(function (rec) {
                    return rec.data.field1 == '4' || rec.data.field1 == '20';
                });
            }
        }

        if (buh_is_org != 1) {
            win.down('[name=cnt-nalog-kpp]').hide();
        }

        this.setJDoc();
        this.setRsKassaTitle();
        this.formCheck();
        this.hideReqPanel()
    },

    setNds: function () {
        // Смена НДС
        var me = this,
            win = this.getWinBankEdit(),
            _nds_id = win.down('[name=nds_id]').getValue() * 1,
            _sum = win.down('[name=summav]').getValue();

        win.down('[name=summandsv]').setVisible(_nds_id != 3 && _nds_id != 4);

        if (_nds_id > 5 || _nds_id < 1) _nds_id = 4;

        var _stav = arNDSstav[_nds_id - 1][1],
            sumBNds = _sum / (1 + _stav),
            sumNds = _sum - sumBNds.toFixed(2);
        sumNds = sumNds.toFixed(2);
        if (this.loadSet != 1)
            win.down('[name=summandsv]').setValue(sumNds);
        this.setNaznPl();
    },

    setKassaSc: function () {
        // Выбрали кассу
        var me = this,
            win = this.getWinBankEdit(),
            value = win.down('[name=kassa_id]').getValue(),
            rec = win.down('[name=kassa_id]').findRecordByValue(value),
            sc = '';
        if (rec != null)
            sc = rec.data.id_sc;
        win.down('[name=sc]').setValue(sc, sc);


    },

    setBankSc: function () {
        // Выбрали наш банк для операции банк - банк
        var
            args = arguments[0],
            me = this,
            win = this.getWinBankEdit(),
            store = win.down('[name=rs_my_other]').store,
            rec = store.findRecord('id', win.down('[name=rs_my_other]').getValue()),
            sc = '';

        if (rec == null) return;
        sc = rec.raw.id_sc;
        win.down('[name=sc]').setValue(sc, sc);
        this.formCheck();
    },

    selScSsc: function () {
        // Выбрали счет в комбо
        var
            win = this.getWinBankEdit(),
            rec = win.down('[name=sc]').recOrigin,
            val = win.down('[name=sc]').getValue();
        if (rec != undefined) {
            win.down('[name=cnt-analit11]').setTitle("Аналитика счета " + val);
            win.down('[name=id_sp_analit]').setValue(rec.data.analit1);
            win.down('[name=id_sp_analit2]').setValue(rec.data.analit2);
            this.corrSpAnalitForTaxes();
            win.down('[name=id_sp_analit]').fireEvent('change');
            win.down('[name=id_sp_analit2]').fireEvent('change');
        }

    },

    corrSpAnalitForTaxes: function () {
        // Корректировка первой аналитики при выборе уплаты налогов
        var win = this.getWinBankEdit(),
            sp = 12;
        if (win.down('[name=reg_plt]').getValue() == '4') {
            if (win.down('[name=nalog_vid]').getValue() != '1') {
                switch (win.down('[name=nalog_id]').getValue()) {
                    case '24':
                    case '25':
                    case '28':
                    case '31':
                    case '32':
                    case '33':
                    case '34':
                        sp = 131;
                        break;
                    case '21':
                        sp = 133;
                        break;
                    case '23':
                    case '26':
                        sp = 132;
                        break;
                    case '35':
                    case '22':
                        sp = 134;
                        break;
                }
            }
            win.down('[name=id_sp_analit]').setValue(sp);
        }

    },

    /***********************************/

    setOuterValues: function () {
        var me = this,
            win = this.getWinBankEdit(),
            _args = this._args;

        if (_args.reg_plt != undefined) {
            win.down('[name=reg_plt]').setValue(_args.reg_plt);
            win.down('[name=reg_plt]').fireEvent('select');
        }

        if (_args.nalog_vid != undefined) {
            win.down('[name=nalog_vid]').setValue(_args.nalog_vid);
            win.down('[name=nalog_vid]').fireEvent('select', win.down('[name=nalog_vid]'));
        }
        if (_args.nalog_id != undefined) {
            win.down('[name=nalog_id]').setValue(_args.nalog_id);
            win.down('[name=nalog_id]').fireEvent('select', win.down('[name=nalog_id]'));
        }

        if (_args.summav != undefined)
            win.down('[name=summav]').setValue(_args.summav);

        if (_args.summav != undefined)
            win.down('[name=summav]').setValue(_args.summav);

        if (_args.f5 != undefined) {
            win.down('[name=f5]').setValue(_args.f5);
            win.down('[name=f5]').fireEvent('select', win.down('[name=f5]'));
        }

        var fill = function () {
            if (_args.f0 != undefined)
                win.down('[name=f0]').setValue((buh_status == 2 && win.down('[name=df]').getValue() >= me.date_20211001 &&
                (!_args.f0 || Ext.Array.contains(me.f0Exclude_20211001, _args.f0)) ? '13' : _args.f0));

            if (_args.f2 != undefined)
                win.down('[name=f2]').setValue(_args.f2);

            if (_args.f14 != undefined || _args.nalog_penja != undefined) {
                win.down('[name=f14]').setValue(_args.f14);
                let aPeriod = _args.f14.split('.', 2);
                if (aPeriod[1] != undefined){
                    win.down('[name=f14_4]').setValue('' + aPeriod[1]);
                }
            }
/*
            if (_args.nalog_penja != undefined)
                win.down('[name=f14]').setValue(_args.f14);
*/
            if (_args.zp_podr_kpp != undefined) {
                win.down('[name=zp_podr_kpp]').setValue(_args.zp_podr_kpp);
            }

            if (_args.kv != undefined) {
                var _kv = (_args.kv < 10 ? "0" : "") + _args.kv;
                switch(_args.f5) {
                    case 'КВ':
                        win.down('[name=f14_2]').setValue(_kv);
                        win.down('[name=f14_2]').fireEvent('select', win.down('[name=f14_2]'));
                        break;
                    case 'МС':
                        win.down('[name=f14_1]').setValue(_kv);
                        win.down('[name=f14_1]').fireEvent('select', win.down('[name=f14_1]'));
                        break;
                    case 'ПЛ':
                        win.down('[name=f14_3]').setValue(_kv);
                        win.down('[name=f14_3]').fireEvent('select', win.down('[name=f14_3]'));
                        break;
/*
                    case 'ГД':
                        GBS-13541
                        win.down('[name=f14_4]').setValue(_kv);
                        win.down('[name=f14_4]').fireEvent('select', win.down('[name=f14_4]'));
                        break;
*/
                    case 'ДТ':
                        win.down('[name=f14_5]').setValue(_args.kv);
                        win.down('[name=f14_5]').fireEvent('select', win.down('[name=f14_5]'));
                        break;
                }
            }

            if (_args.rsmy_id == undefined) {
                win.down('[name=cnt-rs-cnt]').show();
                var rec_bank = Ext.data.StoreManager.lookup('cbBankId').findRecord( "main", "1");
                win.down('[name=rs_our]').setValue(rec_bank.data.id, rec_bank.data.name);
            }
            me.onScroll();
        }

        Ext.defer(fill, 750);
    },


    setModes: function () {
        var me = this,
            win = me.getWinBankEdit(),
            _args = me._args;

        // Вид банка в зваисимости от режима
        if (_args.model == 'nalog') {
            win.down('three_select').hide();
            win.down('[name=cnt-regplt]').hide();
            win.down('[name=cnt-nalog]').hide();
            win.down('[name=cnt-rs-cnt]').show();
            win.down('[name=cnt-rs-cnt]').show();
            win.down('[name=nalog_vid_kbk]').disable();
            if (me.loadSet == 0) {
                if (_args.nalog_vid_kbk != undefined)
                    win.down('[name=nalog_vid_kbk]').setValue(_args.nalog_vid_kbk);
                else
                    win.down('[name=nalog_vid_kbk]').setValue('1');
                win.down('[name=nalog_vid_kbk]').fireEvent('select');
            }
            else
                win.down('[name=nalog_vid_kbk]').setValue(me.loadData.nalog_vid_kbk);
            win.down('bankform').setTitle(_args.title);

            //убрал, выполняется при вызове fillData@win.down('three_select').setValue => setJDoc
            /*var dtDocs = [];
            dtDocs[1] = ['80', '4'];
            dtDocs[2] = ['3', '4'];
            win.down('[name=jdoc]').getStore().filterBy(function (rec) {
                return Ext.Array.contains(dtDocs[win.down('three_select').getValue()], rec.data.id);
            });*/
        } else if (_args.model == 'zp_nalog') {
            let _nalog_id = (me.loadData || _args).nalog_id;
            if (Ext.Array.contains(['21', '22', '35'], _nalog_id)) {
                win.down('[name=reg_plt]').getStore().filterBy(function (rec) {
                    return rec.data.field1 == '4' || rec.data.field1 == '20';
                });
            } else {
                win.down('[name=cnt-regplt]').hide();
            }
            if (_nalog_id == '25' &&
                buh_status == 2) { //Взнос ОПС + ИП
                win.down('[name=cnt-nalog]').show();
            } else {
                win.down('[name=cnt-nalog]').hide();
            }
            win.down('[name=cnt-rs-cnt]').show();
//            win.down('[name=cnt-rs-cnt]').show();
            win.down('[name=nalog_vid_kbk]').disable();
            if (me.loadSet == 0) {
                if (_args.nalog_vid_kbk != undefined)
                    win.down('[name=nalog_vid_kbk]').setValue(_args.nalog_vid_kbk);
                else
                    win.down('[name=nalog_vid_kbk]').setValue('1');
                win.down('[name=nalog_vid_kbk]').fireEvent('select');
            } else {
                win.down('[name=nalog_vid_kbk]').setValue(me.loadData.nalog_vid_kbk);
            }
            win.down('bankform').setTitle(_args.title);

            //убрал, выполняется при вызове fillData@win.down('three_select').setValue => setJDoc
            /*var dtDocs = [];
            dtDocs[1] = ['80', '4'];
            dtDocs[2] = ['3', '4'];
            win.down('[name=jdoc]').getStore().filterBy(function (rec) {
                return Ext.Array.contains(dtDocs[win.down('three_select').getValue()], rec.data.id);
            });*/
        }

        this.onScroll();

    },


    /***********************************/

    setRsKassaTitle: function () {
        // Заголовки для счета и кассы
        var me = this,
            win = this.getWinBankEdit();
        if (!Ext.getCmp('bankSet')) return;

        var rc = Ext.getCmp('bankSet').store.findRecord('id', win.down('[name=rsmy_id]').getValue()),
            prefix = ['0', 'На счет ', 'Со счета '][win.down('three_select').getValue()];
        if (rc == null) return;

        win.down('[name=from_rs]').update(prefix + rc.data.name);
        win.down('[name=from_rs1]').update(prefix + rc.data.name);
        win.down('[name=cnt-kassa]').setTitle(['0', 'Из кассы', 'В кассу'][win.down('three_select').getValue()]);


    },

    /***********************************/

    fillData: function (_args) {
        // Заполнение данных
        var me = this,
            d = new Date(),
            _args = arguments[0],
//            sDoc = this.getStore('Buh.store.VPDocs'),
            win = this.getWinBankEdit(),
            year = new Date().getFullYear(),
            dat = new Date(),
            searchCid = _args.searchCid || null,
            searchCname = _args.searchCname || null,
            showExl = _args.showExl || null;

        win.startBankPP = d.getTime();
        win.editBankPP = d.getTime();
        win.copyBankPP = d.getTime();

        win.down('[name=kassa_id]').store.clearFilter(true);

        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);

        win.down('[name=jdoc]').bindStore(storeGlobalVDoc);
        win._args = _args;

        if (buh_nalog_mode != 1 && showExl != null) {
            win.down('[name=cnt-summa-exclude]').show();
            win.down('[name=exclude-hint]').show();
        }
        else {
            win.down('[name=cnt-summa-exclude]').hide();
            win.down('[name=exclude-hint]').hide();
        }

        if (buh_nalog_mode != 1)
            win.down('[name=cnt-dir]').show();
        else
            win.down('[name=cnt-dir]').hide();

        this.loadSet = 0;
        this.skipNaznPl = false;
        this._args = _args;
        if (_args == undefined) {
            _args = {rsmy_id: 1, dat: dat, oper: 1, id: 0};
        }
        win.callback = _args.callback || Ext.emptyFn;

        if (_args.id == 0) {
            if ('model' in win._args &&
                win._args.model == 'zp_nalog') {

                //https://jira.action-media.ru/browse/GBS-8094
                if (Ext.Array.contains(['21', '22', '35'], win._args.nalog_id)) {
                    var vid_return = win.down('[name=vid_return]');
                    switch (win._args.nalog_id) {
                        case '21':
                            vid_return.setValue('1');
                            break;
                        case '22':
                            vid_return.setValue('2');
                            break;
                        case '35':
                            vid_return.setValue('3');
                            break;
                    }
                    vid_return.setReadOnly(true);
                }
            }

            // GBS-9509 отключаем множественные запросы кбк, налоговая, номер документа
            me.preventLoadKbk = true;
            me.preventFillLastTax = true;
            me.preventChangeDoc = true;
            me.preventSetRegPltKndr = true;
            me.preventFormCheck = true;

            me.vidNalogFilt();
            win.down('[name=rs_our]').setValue(_args.rsmy_id || 0, _args.rsmy_nam || '');
            win.down('three_select').setValue(_args.oper == undefined ? 1 : _args.oper);

            win.down('[name=df]').setValue(_args.dat || dat);
            win.down('bankform').setTitle("Добавление банковского платежа");

            this.setRsKassaTitle();
            _ajax(dir_start_buh_ + 'bankpay_proc.php',
                {
                    action: 'readLast'
                }, function (ans) {
                    // GBS-9509
                    me.preventSetRegPltKndr = false;
                    me.preventChangeDoc = false;

                    var rec = Ext.decode(ans);
                    me.regFSS = rec.fssnumb;
                    if (rec.id > 0)
                        win.down('[name=nds_id]').setValue('' + rec.nds_id);
                    else
                        win.down('[name=nds_id]').setValue(buh_nalog_mode == 1 ? '5' : '4');
                    win.down('[name=zp_podr_kpp]').setValue(rec.zp_podr_kpp);

                    me.f0 = rec.f0;
                    win.down('[name=f0]').setValue(rec.f0);
                    me.setOuterValues();

                    // GBS-9509  вызываем явным образом. после того как все данные загружены, дополнительно загружаем данные,
                    // так как ранее отключили множественные запросы, возникающие из-за
                    // срабатывания ивентов
                    me.preventFillLastTax = false;
                    me.fillLastTax();
                    me.setModes();
                    me.showFieldNDS();

                    me.preventLoadKbk = false;
                    me.setBankKBK();

                    if (searchCid != null && searchCname != null) {
                        win.down('[name=analit1]').setValueSilent(searchCid, searchCname);

                    }

                    win.show();

                    // GBS-9509 проверка формы после того как все данные будут загружены
                    let runner = new Ext.util.TaskRunner();
                    let task = runner.newTask({
                        run: function() {
                            let loading = false;
                            Ext.Object.each(Ext.Ajax.requests, function(key, request) {
                                if(Ext.Ajax.isLoading(request)) {
                                    loading = true;
                                    return false;
                                }
                            }, this);
                            if(!loading) {
                                me.preventFormCheck = false;
                                me.formCheck();
                                task.destroy();
                            }
                        },
                        interval: 100
                    });
                    task.start();
//                    me.arrangeSumma();
                });
            var el = Ext.getBody();
            el.addCls('window-modal-open');
        } else {
            this.loadSet = 1;
            win.down('bankform').setTitle("Редактирование банковского платежа");
            win.down('form').load({
                url: dir_start_buh_ + 'getbankpay.php',
                params: {'id': _args.id, 'rsmy_id': _args.rsmy_id},
                success: function (f, d, typ) {
                    var isCopy = (me._args._copy != undefined && me._args._copy != 0),
                        rec = d.result.data;
                    let prov = win.down('#prov');

                    me.loadData = rec;
                    win.down('three_select').setValue((rec.id_oper == 3 || rec.id_oper == 15) ? 1 : 2);
                    win.down('[name=avans]').setValue(rec.avans);
                    win.down('[name=reg_plt]').setValue(rec.reg_plt);
                    win.down('[name=analit1]').setValueSilent(rec.id_analit, rec.analit);
                    win.down('[name=analit2]').setFilter('org_id=' + rec.id_analit);
                    win.down('[name=analit2]').setValueSilent(rec.id_analit2, rec.analit2);

                    win.down('[name=analit11]').setValueSilent(rec.id_analit, rec.analit);
                    win.down('[name=analit21]').setValueSilent(rec.id_analit2, rec.analit2);

//                    win.down('[name=analit12]').setValueSilent(rec.id_analit, rec.analit);

                    win.down('[name=rs_contra]').setFilter('org_id=' + rec.id_analit);
                    win.down('[name=rs_contra]').setValueSilent(rec.rs_id, rec.rs_org);
                    win.down('[name=rs_people]').setFilter('org_id=' + rec.id_analit);
                    win.down('[name=rs_people]').setValue(rec.useracc, rec.useracc);
                    win.down('[name=dir_combo]').setValue(rec.id_j_dr, rec.id_j_dr_nam);
                    me.f0 = rec.f0;

                    win.down('[name=f10]').setValue(iif(rec.f10 == undefined || Ext.String.trim(rec.f10) == '', 0, rec.f10));

                    win.down('[name=sc]').setValueSilent(rec.corr_sc, rec.corr_sc);
                    if (rec.reg_plt == 5) {
                        me.filterRs();
                        win.down('[name=rs_my_other]').setValue(rec.org_id, rec.corr_sc + " - " + rec.rs_my);
                    }
                    if (rec.reg_plt == 6)
                        win.down('[name=kassa_id]').setValue(ret.org_id);
                    prov.setValue(rec.prov);
                    if(currYear > 2020 && rec.have_sd > 0) {
                        if(rec.prov == 0) {
                            prov.setValue(1);
                        }
                        prov.setDisabled(true);
                    }
                    win.down('[name=f12_]').setValue(rec.f12);
                    /**************/

                    if (rec.reg_plt == 4) {

                        var arNalPer = rec.f14.split('.');
                        win.down('[name=f14_4]').setValue(arNalPer[1]);
                        switch (win.down('[name=f5]').getValue()) {
                            case 'МС':
                                win.down('[name=f14_1]').setValue(arNalPer[0]);
                                break;
                            case 'КВ':
                                win.down('[name=f14_2]').setValue(arNalPer[0]);
                                break;
                            case 'ПЛ':
                                win.down('[name=f14_3]').setValue(arNalPer[0]);
                                break;
                            case 'ДТ':
                                win.down('[name=f14_4]').setValue(arNalPer[2]);
                                win.down('[name=f14_5]').setValue(rec.f14);
                                break;
                        }
                        win.down('[name=f14]').setValue(rec.f14);
                        me.nalogPeriodSet(win.down('[name=f5]'));
                        me.dateNalogBase(win.down('[name=_f7]'));

                        if(rec._f6) {
                            win.down('[name=cnt-f6]').show();
                        }
                    }

                    if (rec.id_sp_analit == 12 || rec.id_sp_analit > 130 || rec.id_sp_analit == 13 || rec.id_sp_analit == 6) {
                        me.readTaxOfficeData(rec.typ_nalog, rec.id_analit);
                    }

                    /*************/
                    win.down('[name=id_sp_analit]').fireEvent('change');
                    win.down('[name=id_sp_analit2]').fireEvent('change');
                    me.setRegPlt();
                    me.corrSpAnalitForTaxes();
                    me.setModes();
                    var rec_bank = Ext.data.StoreManager.lookup('cbBankId').findRecord('id', win.down('[name=rs_our]').getValue());

                    // GBS-11980. Поисковый запрос.
                    if (rec_bank == null) {
                        rec_bank = Ext.data.StoreManager.lookup('cbBankId').findRecord( "main", "1");
                    }

                    win.down('[name=rs_our]').setValueSilent(rec_bank.data.id, rec_bank.data.name);

                    // GBS-11980. Поисковый запрос.
                    if (_args.searchCid > 0) {
                        win.down('[name=analit1]').setValue(_args.searchCid);
                        win.down('[name=analit1]').fireEvent('change');
                    }

                    if (isCopy) {
                        //Назначение платежа не меняется
                        me.skipNaznPl = true;

                        //Убираем сумму НДС из назначения платежа
                        if(rec.summandsv !== undefined &&
                            Ext.String.trim(rec.summandsv)) {
                            win.down('[name=nazn]').setValue(rec.nazn.replace(" "+ rec.summandsv, ""));
                        }
                        //Дата текущая
                        win.down('[name=df]').setValue(dat);
                        win.down('[name=id]').setValue(0);
                        win.down('bankform').setTitle("Копирование банковского платежа");
                        me.changeDoc();
                    }
                    me.setRsKassaTitle();
                    me.vidNalogFilt();

                    if (rec.read_only == 1) {
                        me.disableFieldsZp();
                    }
                    var rec_bank1 = Ext.data.StoreManager.lookup('cbBankId').findRecord('id', rec.org_id);
                    if (rec_bank1 != null)
                        win.down('[name=rs_my_other]').setValueSilent(rec_bank1.data.id, rec_bank1.data.name);

//                    me.arrangeSumma();

                    me.loadSet = 0;
                    Ext.defer(function () {
                        if (isCopy) {
                            me.skipNaznPl = true;
                        }
                        win.show();
                        me.formCheck();
                    }, 250);
                }
            });
        }
//       var sss =  Ext.getBody().mask();
//       sss.addCls("new-mask-window");
    },

    disableFieldsZp: function () {

        var me = this,
            d = new Date(),
            _args = arguments[0],
            sDoc = this.getStore('Buh.store.VPDocs'),
            win = this.getWinBankEdit(),
            dat = new Date(),
            toDisable = win.query('field'),
            arZpFieldsEnabled = [
                'n_doc',
                'nazn',
                'zp_kod_nazn_pl',
                'f12_',
                'dir_combo',
                'rs_people',
            ];
        Ext.Array.each(
            toDisable,
            function (fld) {
                if (!Ext.Array.contains(arZpFieldsEnabled, fld.name)) {
                    var allowDisable = true;
                    Ext.Array.each(
                        arZpFieldsEnabled,
                        function (el) {
                            if (fld.up('[name=' + el + ']'))
                                allowDisable = false;
                        });

                    fld.setDisabled(allowDisable);

                }
            }
        );

        win.down('three_select').hide();
        win.down('#prov').hide();


    },


    getRegPltAcc: function (_oper, _rpl) {
        var oRpl = [],
            win = this.getWinBankEdit(),
            sc_bank = '51.1',
            rec = win.down('[name=rs_my_other]').store.getAt(0);
        oRpl[1] = [];
        oRpl[2] = [];
        if (rec != undefined)
            sc_bank = rec.raw.id_sc;

        oRpl[1][1] = {sc: '62.2', s1: 6, s2: 15};
        oRpl[1][6] = {sc: '50.1', s1: 0, s2: 0};
        oRpl[1][9] = {sc: '55.1', s1: 0, s2: 0};
        oRpl[1][5] = {sc: sc_bank, s1: 0, s2: 0};
        oRpl[1][14] = {sc: '76.7', s1: 6, s2: 15};
        oRpl[1][10] = {sc: '66.1', s1: 6, s2: 15};
        oRpl[1][11] = {sc: '58.7', s1: 6, s2: 15};
        oRpl[1][12] = {sc: '62.2', s1: 6, s2: 15};
        oRpl[1][3] = {sc: '71.1', s1: 7, s2: 0};
        oRpl[1][2] = {sc: '70.1', s1: 7, s2: 0};
        oRpl[1][4] = {sc: '68.1', s1: 6, s2: 0};
        oRpl[1][15] = {sc: '76.1', s1: 6, s2: 15};
        oRpl[1][7] = {sc: '91.1', s1: 11, s2: 0};
        oRpl[1][13] = {sc: '75.1', s1: 6, s2: 15};
        oRpl[1][8] = {sc: '60.2', s1: 6, s2: 15};
        oRpl[1][20] = {sc: '69.1', s1: 134, s2: 15};

        oRpl[2][1] = {sc: '60.2', s1: 6, s2: 15};
        oRpl[2][6] = {sc: '50.1', s1: 0, s2: 0};
        oRpl[2][2] = {sc: '70.1', s1: 7, s2: 0};
        oRpl[2][4] = {sc: '68.1', s1: 6, s2: 0};
        oRpl[2][3] = {sc: '71.1', s1: 7, s2: 0};
        oRpl[2][5] = {sc: sc_bank, s1: 0, s2: 0};
        oRpl[2][7] = {sc: '91.2', s1: 11, s2: 0};
        oRpl[2][14] = {sc: '76.7', s1: 6, s2: 15};
        oRpl[2][12] = {sc: '62.2', s1: 6, s2: 15};
        oRpl[2][10] = {sc: '66.1', s1: 6, s2: 15};
        oRpl[2][11] = {sc: '58.7', s1: 6, s2: 15};
        oRpl[2][19] = {sc: '73.1', s1: 7, s2: 0};
        oRpl[2][17] = {sc: '60.2', s1: 6, s2: 15};
        oRpl[2][8] = {sc: '60.2', s1: 6, s2: 15};

        return oRpl[_oper][_rpl];

    },

    filterRs: function () {
        // Спрятать расечтный счет, который выбран вверху
        var me = this,
            win = this.getWinBankEdit(),
            rs = win.down('[name=rs_our]').getValue();

        win.down('[name=rs_my_other]').setFilter('id<>' + rs);

    },

    termLoan: function () {      // Изменили срок кредита
        var me = this,
            win = this.getWinBankEdit(),
            tl = win.down('[name=loanterm]').getValue();

        if (tl.id_j_pr == undefined)
            return;

        if (win.down('[name=id]').getValue() == 0) {
            var sc = '',
                rp = win.down('[name=reg_plt]').getValue();
            if (rp == '10')
                if (tl.id_j_pr == '1')
                    sc = '66.1';
                else
                    sc = '67.1';
            else if (tl.id_j_pr == '1')
                sc = '58.7';
            else
                sc = '58.6';

            win.down('[name=sc]').setValue(sc, sc);
        }
    },


    vidNalogFilt: function () {
        // Фильтр списка видов налогов

        var me = this,
            win = this.getWinBankEdit(),
            nalog_vid = win.down('[name=nalog_vid]');
        if (me.loadSet == 1) {
            nalog_vid.setValue(me.loadData.nalog_vid);
        }

        var nVznos = nalog_vid.getValue();
        nalog_vid.setReadOnly(false);

        if('model' in win._args &&
            win._args.model == 'zp_nalog' &&
            (me.loadData || win._args).nalog_id == '25' && buh_status == 2) { //Взнос ОПС + ИП
            win.down('[name=nalog_id]').store.filterBy(function(r) {
                return (r.get('id') == 25 || r.get('id') == 28);
            });
            nalog_vid.setReadOnly(true);
        } else {
            win.down('[name=nalog_id]').store.filterBy(function (r) {
                var c1 = (r.get('n_vz') == nVznos),
                    c2 = true,
                    c3 = ((!r.get('untilYear') || r.get('untilYear') >= currYear) && r.get('fromYear') <= currYear);

                if (buh_status == 1 && (Ext.Array.contains(['25', '26', /*'27',*/ '28', '35'], r.get('id'))))
                    c2 = false;

                return c1 && c2 && c3;
            });
        }
        //set default values if not from nalog opened
        if (nVznos == '1') {
            if (me.loadSet == 0) {
                win.down('[name=nalog_id]').setValue('1');
                me.vidNalogFillDefault(win.down('[name=nalog_id]'));
            } else {
                win.down('[name=nalog_id]').setValue(me.loadData.nalog_id);
            }

            win.down('[name=nalog_vid_kbk]').store.filterBy(function (r) {
                return r.get('field2') != 'По взносу';
            });
        } else {
            if (me.loadSet == 0) {
                win.down('[name=nalog_id]').setValue('21');
                me.vidNalogFillDefault(win.down('[name=nalog_id]'));
            } else {
                win.down('[name=nalog_id]').setValue(me.loadData.nalog_id);
            }

            win.down('[name=nalog_vid_kbk]').store.filterBy(function (r) {
                return r.get('field2') != 'По налогу';
            });
        }
        if (this._args.model != 'nalog') {
            if (me.loadSet == 0)
                win.down('[name=nalog_vid_kbk]').setValue('1');
            else
                win.down('[name=nalog_vid_kbk]').setValue(me.loadData.nalog_vid_kbk);
        }

//       docBank.fireEvent('select');
        this.corrSpAnalitForTaxes();
        this.setBankKBK();
//        this.fillLastTax();
//        this.setNaznPl();

    },

    vidNalogFillDefault: function (combo) {
        // Заполнение полей для уплаты налога по дефолту
        let me = this, win = this.getWinBankEdit(), docBank = win;

        /** GBS-11569 */
        let dateForTax = new Date;
        let quarterForTax = Math.floor((dateForTax.getMonth() + 3) / 3);
        let monthForTax = dateForTax.getMonth();
        let currYear = 2021;
        if (win.down('[name=df]').getValue()!=null) {
            currYear = win.down('[name=df]').getValue().getFullYear();
            dateForTax = win.down('[name=df]').getValue();
            quarterForTax = Math.floor((dateForTax.getMonth() + 3) / 3);
            monthForTax = dateForTax.getMonth();
        }
        let yearForTax = iif(monthForTax === 0, currYear - 1, currYear);


        switch (parseInt(combo.getValue())) {
            case 1:
                // Налог по УСН
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                }/* else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }*/
                break;
            case 2:
                // Налог на прибыль (ФБ)
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                } else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }
                break;
            case 3:
                // ЕНВД
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_3]').setValue(currYear - 1);
                }
                break;
            case 4:
                // НДС
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_3]').setValue(currYear);
                }
                break;
            case 5:
                // Минимальный налог
                docBank.down('[name=f5]').setValue('ГД');
                docBank.down('[name=f14_4]').setValue(currYear - 1);
                break;
            case 7:
                // Транспортный налог
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                } else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }
                break;
            case 8:
                // На имущество
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                } else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }
                break;
            case 9:
                // Земельный налог
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                } else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }
                break;
            case 10:
                // Водный налог
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_3]').setValue(currYear - 1);
                }
                break;
            case 11:
                // Налог на прибыль (РБ)
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                } else if (quarterForTax === 4) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear);
                }
                break;
            case 12:
                // ЕСХН
                if (Ext.Array.contains([3, 4], quarterForTax)) {
                    docBank.down('[name=f5]').setValue('ПЛ');
                    docBank.down('[name=f14_3]').setValue('01');
                    docBank.down('[name=f14_4]').setValue(currYear);
                } else {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                }
                break;
            case 13:
                // Госпошлина
                docBank.down('[name=f5]').setValue('');
                docBank.down('[name=f14]').allowBlank = true;
                break;
            case 14:
                // НДФЛ 13
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 15:
                // НДФЛ 15
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 21:
                // Взнос на социальное страхование
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 22:
                // Взнос в ФСС на травматизм
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 23:
                // Взнос на медицинское страхование
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 24:
                // Взнос на пенсионное страхование
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 25:
                // ОПС фикс взнос ИП
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                }
                break;
            case 26:
                // ОМС фикс взнос ИП
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                }
                break;
            case 27:
                // Торговый сбор
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_3]').setValue(currYear - 1);
                }
                break;
            case 28:
                // ОПС 1% фикс взнос ИП
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_3]').setValue(currYear - 1);
                }
                break;
            case 31:
                // ОПС по доптарифу (без спецоценки, список 2)
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 32:
                // ОПС по доптарифу (без спецоценки, список 1)
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 33:
                // ОПС по доптарифу (спецоценка, список 2)
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 34:
                // ОПС по доптарифу (спецоценка, список 1)
                monthForTax = iif(monthForTax === 0, '12', iif(monthForTax < 10, '0' + monthForTax, monthForTax));
                docBank.down('[name=f5]').setValue('МС');
                docBank.down('[name=f14_1]').setValue(monthForTax);
                docBank.down('[name=f14_4]').setValue(yearForTax);
                break;
            case 35:
                // ФСС добровольный взнос ИП
                if (Ext.Array.contains([2, 3, 4], quarterForTax)) {
                    quarterForTax -= 1;
                    docBank.down('[name=f5]').setValue('КВ');
                    docBank.down('[name=f14_2]').setValue('0' + quarterForTax);
                    docBank.down('[name=f14_3]').setValue(currYear);
                } else if (quarterForTax === 1) {
                    docBank.down('[name=f5]').setValue('ГД');
                    docBank.down('[name=f14_2]').setValue('04');
                    docBank.down('[name=f14_4]').setValue(currYear - 1);
                }
                break;
        }

        this.nalogPeriodSet(docBank.down('[name=f5]'));

        if (combo.getValue() == 35) {
            win.down('[name=nalog_vid_kbk]').setValue('1')
            win.down('[name=nalog_vid_kbk]').disable();
        } else {
            win.down('[name=nalog_vid_kbk]').enable();
        }

        this.setBankKBK();
        this.corrSpAnalitForTaxes();
        me.fillLastTax();
        this.changeSummav();
//        this.setNaznPl();
    },

    fillLastTax: function () {
        if(this.preventFillLastTax === true) {
            return;
        }
        var me = this,
            win = this.getWinBankEdit(),
            rpl = this.getRegPlt().getValue() * 1,
            docBank = win;
        if (me.loadSet != 1) {
            if (docBank.down('[name=id]').getValue() == 0 && (rpl == 4 || rpl == 20)) {
                // Выбор налоговой по умолчанию.
                var mod = win.down('[name=id_sp_analit]').getValue() == 134 ? 'fondfss' : 'readlast';
                _ajax(dir_start_buh_ + 'tax_of_proceed.php',
                    {action: mod},
                    function (_ret) {
                        var rec = Ext.decode(_ret)
                        win.down('[name=analit1]').setValue(rec.data.id, rec.data.name);
                    });
                this.nalogPeriodFillField();
            }
        }


    },


    setKBKBank: function () {
        var me = this,
            win = this.getWinBankEdit(),
            year = win.down('[name=df]').getValue().getFullYear(),
            id_oper = this.getPrRas().getValue(),
            reg_plt = this.getRegPlt().getValue();

        win.down('[name=dir_combo]').setValue(0, '');
        // выбор кбк в зависимости от
        if (id_oper == 2 && reg_plt == '4') {
            _ajax(dir_start_buh_ + 'kbk_get_by_payment_type.php', {
                nalog_vznos: win.down('[name=nalog_vid]').getValue(),
                year: year,
                n_type: win.down('[name=nalog_id]').getValue(),
                p_type: win.down('[name=nalog_vid_kbk]').getValue(),
            }, function (_data) {
                var res = Ext.JSON.decode(_data);
                win.down('[name=f1]').setValue(res.kbk);
                win.down('[name=dir_combo]').setValue(res.id_j_dr, res.id_j_dr_nam);
            });
        }
        this.nalogPeriodFillField();
    },

    nalogPeriodSet: function (combo) {
        // Выбор видимости комбобоксов по налоговому периоду
        var me = this,
            win = this.getWinBankEdit();
        win.down('[name=f14_1]').hide();
        win.down('[name=f14_2]').hide();
        win.down('[name=f14_3]').hide();
        win.down('[name=f14_4]').show();
        win.down('[name=f14_5]').hide();

        switch (combo.getValue()) {
            case 'МС':
                win.down('[name=f14_1]').show();
                break;
            case 'КВ':
                win.down('[name=f14_2]').show();
                break;
            case 'ПЛ':
                win.down('[name=f14_3]').show();
                break;
            case 'ГД':
                break;
            case 'ДТ':
                win.down('[name=f14_5]').show();
            default:
                win.down('[name=f14_4]').hide();
        }
        this.nalogPeriodFillField();
    },

    nalogPeriodFillField: function () {
        // Заполнение поля с налоговым периодом
        var me = this,
            win = this.getWinBankEdit(),
            f1 = '',
            f2 = win.down('[name=f14_4]').getValue(),
            combo = win.down('[name=f5]'),
            period = combo.getValue();
        switch (period) {
            case 'МС':
                f1 = win.down('[name=f14_1]').getValue();
                break;
            case 'КВ':
                f1 = win.down('[name=f14_2]').getValue();
                break;
            case 'ПЛ':
                f1 = win.down('[name=f14_3]').getValue();
                break;
            case 'ГД':
                f1 = '00';
                break;
            case 'ДТ':
                let f14_5 = win.down('[name=f14_5]'),
                    date = f14_5.getValue();
                if(!date) {
                    f14_5.setValue(date = new Date);
                }
                f1 = Ext.Date.format(date, 'd.m.Y');
                break;
        }
        if(period == 'ДТ') {
            win.down('[name=f14]').setValue(f1);
            win.down('[name=nalog_text]').update("Запись в платежке: " + f1);
        } else {
            win.down('[name=f14]').setValue(f1 + "." + f2);
            win.down('[name=nalog_text]').update("Запись в платежке: " + (period ? period + "." + f1 + "." + f2 : '0'));
        }
        this.setNaznPl();
        //this.changeSummav();
    },

    getNalogPeriodLastDate: function () {
        // Заполнение поля с налоговым периодом
        let lastDate = null,
            month = null,
            win = this.getWinBankEdit(),
            f2 = win.down('[name=f14_4]').getValue(),
            combo = win.down('[name=f5]');
        switch (combo.getValue()) {
            case 'МС':
                month = win.down('[name=f14_1]').getValue();
                break;
            case 'КВ':
                month = win.down('[name=f14_2]').getValue() * 3;
                break;
            case 'ПЛ':
                month = win.down('[name=f14_3]').getValue() * 6;
                break;
            case 'ГД':
                month = 12;
                break;
        }
        if(month) {
            lastDate = Ext.Date.format(new Date(f2, parseInt(month, 10), 0), 'Y-m-d');
        }
        return lastDate;
    },

    closeAddPanel: function () {
        // Скрыть дополнительную панель
        var me = this,
            win = this.getWinBankEdit();
        win.down('addbankform').hide();
        win.down('[name=cnt-add-field]').show();
        this.onScroll();
    },

    showAddPanel: function () {
        // Показать дополнительную панель
        var me = this,
            win = this.getWinBankEdit();
        win.down('addbankform').show();
        win.down('[name=cnt-add-field]').hide();
        this.onScroll();
    },

    setNaznPl: function () {
        // Назначение платежа в зависимости от значений полей. Заполняется только при id=0
        var me = this;
        if (me.taskNaznPl != null) {
            me.taskNaznPl.cancel();
        }
        me.taskNaznPl = new Ext.util.DelayedTask(function () {
            var win = me.getWinBankEdit(),
                id = win.down('[name=id]').getValue(),
                nds_id = win.down('[name=nds_id]').getValue() * 1,
                avans = win.down('[name=avans]').getValue() * 1,
                fNanz = win.down('[name=nazn]'),
                sumNds = win.down('[name=summandsv]').getValue() * 1,
                rec_return = win.down('[name=vid_return]').findRecordByValue(win.down('[name=vid_return]').getValue()),
                rpl = me.getRegPlt().getValue(),
                typ_op = me.getPrRas().getValue() * 1,
                completeNazn = '';

            if (!win.isVisible()) return;

            if (me.skipNaznPl === true || id != 0 || typ_op < 1) return;
            if (rpl == 20) {  // Возмещение из ФСС
                completeNazn = rec_return.data.namer;
            } else if (rpl != 4) {  // Для неналоговых платежей
                var stNazn = clsNaznPlat.getStoreNazn(typ_op, avans),
                    rec = stNazn.findRecord('id', rpl);
                if (rec != undefined)
                    completeNazn = rec.data.name;
                if (win.down('[name=id_sp_analit]').getValue() == 6 && win.down('[name=analit2]').getValue() > 0) {
                    completeNazn += " по договору " + win.down('[name=analit2]').getRawValue();
                }


                if (win.down('[name=cnt-nds]').isVisible())
                    completeNazn += clsNaznPlat.getTextNds(nds_id) + (sumNds > 0 ? " " + sumNds.toFixed(2) : '');
                else {
                    if (typ_op == 2 && rpl != 6)
                        completeNazn += ". Без налога НДС";
                }
            }
            else {  // Налоговые платежи
                completeNazn = me.compileNalogPurpose();
            }
            fNanz.setValue(completeNazn);

            /**** settitle ****/
            if (win._args.model == 'zp_nalog' && !win._args.title) {
                win.down('bankform').setTitle(me.setTitleZp());
            }
        });
        me.taskNaznPl.delay(50);

    },

    compileNalogPurpose: function () {
        // Назначение налогового платежа
        var text = '',
            me = this,
            args = me._args,
            win = this.getWinBankEdit(),
            f1 = '',
            txt_per = "",
            f2 = win.down('[name=f14_4]').getValue(),
            combo = win.down('[name=f5]'),      // период уплаты налога МС КВ ПЛ ГД
            nsp = win.down('[name=nalog_vid_kbk]').getValue(), // налог  / штраф / пеня
            vid = win.down('[name=nalog_id]').getValue(), // налог  / штраф / пеня
            oper = win.down('three_select').getValue(),
            arAvans = ['1', '2', '11', '8', '9', '7'],
            _avans = "",
            arNSP = [],
            yearEnding = "года",
            txtMon = '',
            fssCustomPurpose = (args.id == 0 && args.nalog_id == 22 && args.kv !== undefined && combo.getValue() === '0'),
            period = fssCustomPurpose ? 'МС' : combo.getValue();

        arNSP[1] = {'i': '', 'r': ' по '};
        arNSP[2] = {'i': 'Пени', 'r': 'Пени'};
        arNSP[3] = {'i': 'Штраф', 'r': 'Штраф'};

        switch (period) {
            case 'МС':
                f1 = fssCustomPurpose ? args.kv : win.down('[name=f14_1]').getValue() * 1;
                txt_per = Date.monthNames[f1 - 1];
                txtMon = Date.monthNames[f1 - 1];
                break;
            case 'КВ':
                f1 = win.down('[name=f14_2]').getValue();
                txt_per = f1 + " квартал";
                txtMon = f1 + " квартал";
                break;
            case 'ПЛ':
                f1 = win.down('[name=f14_3]').getValue();
                txt_per = f1 + " полугодие";
                txtMon = f1 + " полугодие";
                break;
            case 'ГД':
            default:
                f1 = '00';
                yearEnding = "год";
                break;
        }

        if (combo.getValue() != 'ГД' && win.down('[name=f3]').getValue() == "ТП" && Ext.Array.contains(arAvans, vid))
            _avans = "Авансовый платеж ";

        if (!Ext.Array.contains(['ТП', '', '0'], win.down('[name=f3]').getValue())) {
            var recOsn = win.down('[name=f3]').findRecordByValue(win.down('[name=f3]').getValue()),
                txt = recOsn.data.field2,
                arTxt = txt.split('&#8212;')[1],
                _avans = "П" + arTxt.slice(2);
        }

        var rec = win.down('[name=nalog_id]').findRecordByValue(win.down('[name=nalog_id]').getValue());
        if (rec == null) return;
        var t1 = _avans + (_avans == "" ? arNSP[nsp].i : arNSP[nsp].r) + " ";
        if (Ext.String.trim(t1) != "")
            var t2 = rec.data.named;
        else
            var t2 = rec.data.name;
        if (oper == 1) {
            t1 = "";
            t2 = "Возврат " + rec.data.namer;
        }
        if (oper == 2 && nsp == 1 && Ext.Array.contains(['6', '14', '15', '24', '21', '23', '22', '25', '26'], vid)) {
            switch(vid) {
                case '6':
                case '14':
                    text = "Налог на доходы физических лиц за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '15':
                    text = "Налог на доходы физических лиц по повышенной ставке 15% за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '21':
                    text = "Страховые взносы на обязательное социальное страхование за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '22':
                    text = "Страховые взносы на страхование от несчастных случаев и профзаболеваний в бюджет ФСС России за " + txtMon + " " + f2 + " " + yearEnding +
                        ". Регистрационный номер " + me.regFSS;
                    break;
                case '23':
                    text = "Страховые взносы на обязательное медицинское страхование за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '24':
                    text = "Страховые взносы на обязательное пенсионное страхование за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '25':
                    text = "Страховые взносы на обязательное пенсионное страхование в фиксированном размере за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '26':
                    text = "Страховые взносы на обязательное медицинское страхование в фиксированном размере за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
            }
        } else if (oper == 1 && nsp == 1 && Ext.Array.contains(['6', '14', '15', '24', '21', '23', '22', '25', '26'], vid)) {
            switch(vid) {
                case '6':
                case '14':
                    text = "Возврат налога на доходы физических лиц с зарплаты";
                    break;
                case '15':
                    text = "Возврат налога на доходы физических лиц по повышенной ставке 15% с зарплаты";
                    break;
                case '21':
                    text = "Возврат страховых взносов на обязательное социальное страхование";
                    break;
                case '22':
                    text = "Возврат страховых взносов на травматизм";
                    break;
                case '23':
                    text = "Возврат страховых взносов на обязательное медицинское страхование";
                    break;
                case '24':
                    text = "Возврат страховых взносов на обязательное пенсионное страхование";
                    break;
                case '25':
                    text = "Возврат страховых взносов на обязательное пенсионное страхование в фиксированном размере";
                    break;
                case '26':
                    text = "Возврат страховых взносов на обязательное медицинское страхование в фиксированном размере";
                    break;
            }
        } else if (oper == 2 && nsp == 1 && (vid > 30 && vid < 36)) {
            switch(vid) {
                case '31':
                    text = "Страховые взносы на страховую часть пенсии по доптарифу, который не зависит от спецоценки (Список 2) за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '32':
                    text = "Страховые взносы на страховую часть пенсии по доптарифу, который не зависит от спецоценки (Список 1) за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '33':
                    text = "Страховые взносы на страховую часть пенсии по доптарифу, который зависит от спецоценки (Список 1) за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '34':
                    text = "Страховые взносы на страховую часть пенсии по доптарифу, который зависит от спецоценки (Список 2) за " + txtMon + " " + f2 + " " + yearEnding;
                    break;
                case '35':
                    text = "Добровольные страховые взносы на обязательное социальное страхование на случай временной  нетрудоспособности и в связи с материнством за " + txtMon + " " + f2 + " " + yearEnding +
                        ". Рег. N " + me.regFSS;
                    break;
            }
        } else if (oper == 1 && nsp == 1 && (vid > 30 && vid < 36)) {
            switch(vid) {
                case '31':
                    text = "Возврат страховых взносов на страховую часть пенсии по доптарифу, который не зависит от спецоценки (Список 2)";
                    break;
                case '32':
                    text = "Возврат страховых взносов на страховую часть пенсии по доптарифу, который не зависит от спецоценки (Список 1)";
                    break;
                case '33':
                    text = "Возврат страховых взносов на страховую часть пенсии по доптарифу, который зависит от спецоценки (Список 1)";
                    break;
                case '34':
                    text = "Возврат страховых взносов на страховую часть пенсии по доптарифу, который зависит от спецоценки (Список 2)";
                    break;
                case '35':
                    text = "Возврат добровольных страховых взносов на обязательное социальное страхование на случай временной нетрудоспособности и в связи с материнством";
                    break;
            }
        } else if (oper == 2 && vid == '15') {
            if(nsp == 2) {
                text = "Пени по НДФЛ (повышенная ставка 15%) за " + txtMon + " " + f2 + " " + yearEnding;
            } else if(nsp == 3) {
                text = "Штраф по НДФЛ (повышенная ставка 15%) за " + txtMon + " " + f2 + " " + yearEnding;
            }
        }

        if(me.loadSet == 0 &&
            win._args.model == 'zp_nalog' &&
            win._args.nalog_id == 25) {
            switch(vid) {
                case '28':
                    text = "Страховые взносы на обязательное пенсионное страхование в фиксированном размере с дохода свыше 300 000 руб. за "+ f2 +" год";
                    break;
                default:
                    text = "Страховые взносы на обязательное пенсионное страхование в фиксированном размере за "+ txtMon +" "+ f2 +" "+ yearEnding;
            }
        }

        if(!text) {
            text = t1 + t2 + " за " + txt_per + " " + f2 + " г.";
        }

        return text;
    },


    addRsPeople: function () {
        // Заполнить РС сотрудника через форму зарплаты
        if (Zik == undefined)
            return;
        var me = this,
            win = this.getWinBankEdit(),
            id = win.down('[name=id_analit]').getValue();


        Zik.card.useraccEdit({
            loaddata: true,
            id_employee: id,
            callback: function (success, record) {
                if (record.get("useracc") != "") {
                    win.down('[name=rs_people]').setValue(record.get("useracc"));
                    win.down('[name=rs_people_cont]').setMinus();
                }
            }
        });
    },

    setBankKBK: function () {
        // Ставим КБК в зависимости от всякоразных настроек
        if (this.loadSet == 1 || this.preventLoadKbk === true)
            return;
        var me = this,
            win = this.getWinBankEdit(),
            docBank = win,
            id_oper = this.getPrRas().getValue(),
            reg_plt = me.getRegPlt().getValue(),
            nalog_id = win.down('[name=nalog_id]').getValue(),
            vid_kbk = win.down('[name=nalog_vid_kbk]').getValue(),
            v1 = win.down('[name=nalog_vid]').getValue(),
            v2 = win.down('[name=nalog_id]').getValue(),
            v3 = win.down('[name=nalog_vid_kbk]').getValue(),
            year = win.down('[name=df]').getValue().getFullYear(),
            rc = win.down('[name=nalog_id]').store.getById(v2),
            df = win.down('[name=df]');

        if (!(reg_plt == '4' /* && id_oper == 2*/)) return;

        win.down('[name=sc]').setValueSilent(rc.data.sc, rc.data.sc);

        if (v3 == '1')
            win.down('[name=f3]').setValue('ТП');
        else {
            win.down('[name=f3]').setValue('');
        }
        if (nalog_id == 25 || nalog_id == 26 || nalog_id == 28) {
            _ajax(dir_start_buh_ + 'winbank_set_details_fix_ip.php', {
                'nalog_id': nalog_id,
                'vid_kbk': vid_kbk
            }, function (_data) {
                res = eval("(" + _data + ")");
//                docBank.down('[name=f0]').setValue(res.field_101);
                win.down('[name=f0]').setValue((buh_status == 2 && df.getValue() >= me.date_20211001 &&
                (!me.f0 || Ext.Array.contains(me.f0Exclude_20211001, res.field_101)) ? '13' : res.field_101));

                docBank.down('[name=f2]').setValue(my_oktmo);
                docBank.down('[name=f3]').setValue('ТП');
                docBank.down('[name=f10]').setValue(res.field_22);
                docBank.down('[name=f12]').setValue(res.field_21);
                //docBank.down('[name=nazn]').setValue(res.nazn_plat);
                if (id_oper == 2)
                    win.down('[name=dir_combo]').setValue(res.id_j_dr, res.name_j_dr);
                else
                    win.down('[name=dir_combo]').setValue(dir_119, 'Не отражать в КУДиР');
                docBank.down('[name=f1]').setValue(res.field_109);

                me.setNaznPl();
            });
        }
        else {
            _ajax(dir_start_buh_ + 'kbk_get_by_payment_type.php', {
                nalog_vznos: v1,
                n_type: v2,
                p_type: v3,
                year: year
            }, function (_data) {
                var res = Ext.JSON.decode(_data);
                win.down('[name=f1]').setValue(res.kbk);
                if (id_oper == 2)
                    win.down('[name=dir_combo]').setValue(res.id_j_dr, res.id_j_dr_nam);
                else
                    win.down('[name=dir_combo]').setValue(dir_119, 'Не отражать в КУДиР');

                me.setNaznPl();
            });
        }
        if (me.taskNaznPl != null) {
            me.taskNaznPl.cancel();
            me.taskNaznPl = null;
        }

        if (nalog_id == 22) {
            win.down('[name=f0]').setValue('08');
            win.down('[name=f3]').setValue('');
        }
        else if (nalog_id == 6 || nalog_id == 14 || nalog_id == 15) {
            win.down('[name=f0]').setValue('02');
        }
        else {
            win.down('[name=f0]').setValue((buh_status == 2 && df.getValue() >= me.date_20211001 &&
            (!me.f0 || Ext.Array.contains(me.f0Exclude_20211001, me.f0)) ? '13' : me.f0));
        }
    },

    changeDoc: function () {
        if(this.preventChangeDoc === true) {
            return;
        }
        // Смена документа и с ним номера
        var me = this,
            win = this.getWinBankEdit(),
            id = win.down('[name=id]').getValue(),
            val = win.down('three_select').getValue(),
            year = win.down('[name=df]').getValue(),
            jdoc = win.down('[name=jdoc]').getValue() * 1;

        if (id == 0 && val == 2 && jdoc > 0) {
            _ajax(dir_start_buh_ + 'getnextnumber.php',
                {
                    kas_id: 0,
                    year: year.getFullYear(),
                    p_r: (val == 1 ? 3 : 4 ) * 1000 + jdoc
                },
                function (response) {
                    var ret = Ext.JSON.decode(response);
                    win.down('[name=n_doc]').setValue(ret.number);
                }
            );
        }

        if (id == 0 && val == 1) {
            win.down('[name=n_doc]').setValue("");
        }
        win.down('[action=print]').setVisible(jdoc == '3');

        if (year < Ext.Date.parse('05/01/2022', 'm/d/Y')) {
            win.down('[name=zp_kod_nazn_pl]').getStore().loadData([
                ['1', '1 — перевод доходов, в отношении которых установлены ограничения размеров удержания'],
                ['2', '2 — перевод доходов, на которые не может быть обращено взыскание'],
                ['3', '3 — перевод доходов, к которым ограничения по обращению взыскания не применяются']
            ]);

            win.down('[name=cnt-nalog-np]').down('buttonask').tipText = '<b>Код 1</b> ставьте при переводе зарплаты и других доходов, по которым есть ограничение по сумме взысканий на основании статьи 99 Закона от 02.10.2007 № 229-ФЗ. Например, премии, отпускные, пособия по временной нетрудоспособности.<br>' +
                '<b>Код 2</b> указывайте при выплате доходов, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ. Например, когда переводите подотчетные, детские пособия, пособия по беременности и родам и др.<br>' +
                '<b>Код 3</b> используйте при переводе доходов, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ. В частности, ставьте код при переводе алиментов на несовершеннолетних детей.';
        } else {
            win.down('[name=zp_kod_nazn_pl]').getStore().loadData([
                ['1', '1 - перевод доходов, в отношении которых установлены ограничения размеров взыскания'],
                ['2', '2 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер периодических выплат'],
                ['3', '3 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер периодических выплат'],
                ['4', '4 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер единовременных выплат'],
                ['5', '5 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер единовременных выплат']
            ]);

            win.down('[name=cnt-nalog-np]').down('buttonask').tipText = '<b>Код 1</b> ставьте при переводе зарплаты и других доходов, по которым есть ограничение по сумме удержаний на основании статьи 99 Закона от 02.10.2007 № 229-ФЗ. Например, премии, отпускные, пособия по временной нетрудоспособности.<br>' +
                '<b>Код 2</b> указывайте при выплате доходов, которые имеют характер периодических выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                '<b>Код 3</b> используйте при переводе доходов, которые имеют характер периодических выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ. В частности, ставьте код при переводе алиментов на несовершеннолетних детей.<br>' +
                '<b>Код 4</b> указывайте при выплате доходов, которые имеют характер единовременных выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                '<b>Код 5</b> используйте при переводе доходов, которые имеют характер единовременных выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ.';
        }
    },

    setJDoc: function() {
        var me = this,
            store,
            _args = me._args,
            win = this.getWinBankEdit(),
            dtDocs = [],
            id_oper = this.getPrRas().getValue(),
            reg_plt;

        if (_args.model &&
            (_args.model == 'nalog' ||
                _args.model == 'zp_nalog')) {
            dtDocs[1] = ['80', '4'];
            dtDocs[2] = ['3', '4'];
        } else {
            reg_plt = this.getRegPlt().getValue();

            if (currYear > 2020) { //@GBS-11077
                dtDocs[1] = ['0', '80', '4', '5', '84', '104'];
                dtDocs[2] = ['0', '3', '4', '77', '81', '84', '104'];

                switch (reg_plt) {
                    case '5':
                    case '14':
                        dtDocs[1].push('77');
                        break;
                    case '4':
                        dtDocs[2].push('105');
                    case '20':
                        dtDocs[1].push('105');
                        break;
                }
            } else {
                dtDocs[1] = ['0', '80', '4', '5', '84'];
                dtDocs[2] = ['0', '3', '4', '77', '81', '84'];
            }
        }
        storeGlobalVDoc.filterBy(function (rec) {
            return Ext.Array.contains(dtDocs[id_oper], rec.data.id);
        });
        if (this.loadSet == 0) {
            store = win.down('[name=jdoc]').store;
            let setFn = () => {
                win.down('[name=jdoc]').setValue(['0', '80', '3'][id_oper]);
            }
            if(store.isLoading()) { //@GBS-11077 глобальный сторе может быть еще не загрузил данные
                store.on('load', setFn, this, {
                    single: true
                });
            } else {
                setFn.call(this);
            }
        }
    },

    showBase: function () {
        var me = this,
            win = this.getWinBankEdit(),
            f5 = win.down('[name=f5]').getValue(),
            regplt = win.down('[name=reg_plt]').getValue() * 1;
        if (regplt == 4 && !Ext.Array.contains(['', '0', 'ТП'], f5))
            win.down('[name=cnt-nalog4]').show();
        else
            win.down('[name=cnt-nalog4]').hide();


    },

    closeWin: function () {
        // закрыть окно
        this.getWinBankEdit().close();
    },

    taxCompare: function () {
        // Открыть налоговую дял сравнения текстов

        var me = this,
            win = this.getWinBankEdit(),
            winTax = Ext.create('Buh.view.taxoffice.Edit');
        winTax.open({
            id: win.down('[name=analit1]').getValue(), mode: 'tax', startwin: 'compare',
            callback: function (ret) {
                win.down('[name=cnt-check]').hide();
                win.down('[name=analit1]').setValue(ret.data.id, ret.data.name);
            }
        });


    },

    checkSummav: function () {
        this.setNds();
        this.formCheck();

    },

    changeSummav: function() {
        var me = this,
            win = this.getWinBankEdit(),
            nalog_id = win.down('[name=nalog_id]');

        if(win.isVisible() &&
            me.loadSet == 0 &&
            win._args.model == 'zp_nalog' &&
            win._args.nalog_id == 25) {

            _ajax('/'+ currYear + '/zp/aj_uplata.php',
                {
                    task: "GETSUMMA",
                    fond: (nalog_id.getValue() == 28 ? "npfsip1" : "npfsip"),
                    f5: win.down('[name=f5]').getValue(),
                    date: this.getNalogPeriodLastDate()
                }, function (ans) {
                    let ret = Ext.decode(ans);
                    if(ret.success) {
                        win.down('[name=summav]').setValue(ret.data.summa);
                    }
                });
        }
    },

    changeReturn: function () {
        if (this.loadSet == 1)
            return;
        var me = this,
            win = this.getWinBankEdit(),
            rec = win.down('[name=vid_return]').findRecordByValue(win.down('[name=vid_return]').getValue());
        win.down('[name=sc]').setValueSilent(rec.data.sc, rec.data.sc);
        me.setNaznPl();
    },

    onClose: function () {
//        el.removeCls('window-modal-open');
    },

    hideReqPanel: function () {
        // Скрыть панель с реквизитами
        var me = this,
            win = this.getWinBankEdit(),
            oper = win.down('three_select').getValue(),
            win = this.getWinBankEdit(),
            regplt = win.down('[name=reg_plt]').getValue() * 1;
        win.down('bankformrequsites').hide();

        if (oper == 2 && regplt == 4)
            win.down('[name=cnt-open-req]').show();
    },

    editRequisites: function () {
        // Редактировать реквизиты
        var me = this,
            win = this.getWinBankEdit(),
            nal = win.down('[name=id_nalog]').getValue(),
            mod = win.down('[name=typ_nalog]').getValue();

        var winTax = Ext.create('Buh.view.taxoffice.Edit');
        winTax.open({
            id: nal, mode: mod == 12 ? 'tax' : 'fond', callback: function (_inp) {
                me.fillReqPanel(_inp.data, 1);
            }
        });


    },

    readTaxOfficeData: function (_id_sprav, _id) {
        var me = this,
            win = this.getWinBankEdit(),
            oper = win.down('three_select').getValue(),
            regplt = win.down('[name=reg_plt]').getValue() * 1;

        if (!(regplt == 4 && oper == 2)) return;

        _ajax(
            dir_start_buh_ + 'tax_of_proceed.php',
            {action: 'read', id: _id},
            function (_ret) {
                // if (!win.isVisible()) return;
                var ret = Ext.decode(_ret, true);
                win.down('[name=rs_contra]').setValue(ret.data.rs_id, ret.data.rs);
                var currState = ret.data,
                    reqpanel = win.down('bankformrequsites'),
                    newState = [];

                reqpanel.down('[name=id_nalog]').setValue(_id);
                reqpanel.down('[name=typ_nalog]').setValue(_id_sprav);
                me.fillReqPanel(currState, 0);

                if (ret.data.type == '0' && _id_sprav != 134) {
                    _ajax(dir_start_buh_ + "dadata.php?kod=" + currState.kod, {}, function (ret) {
                        var _ret = Ext.decode(ret, true) == null ? {} : Ext.decode(ret, true);
                        if (_ret.suggestions != undefined) {
                            var arr = _ret.suggestions;
                            newState = {};
                            Ext.Array.every(arr, function (rec) {
                                if (rec.data.code == currState.kod)
                                    newState = rec.data;
                            });
                            if (currState.rs == null)
                                currState.rs = '';
                            var _rs = currState.rs.replace(/\s+/g, '');
                            if (
                                currState.name != newState.name ||
                                currState.addr != newState.address ||
                                currState.inn != newState.inn ||
                                currState.kpp != newState.kpp ||
                                currState.recipient != newState.payment_name ||
                                currState.bik != newState.bank_bic ||
                                _rs.replace(" ", "") != newState.bank_account
                            )
                                win.down('[name=cnt-check]').show();
                            else
                                win.down('[name=cnt-check]').hide();
                        }
                    });
                }
            });
    },


    fillReqPanel: function (currState, afterFill) {
        // afterFill - 1 = не закрывать после заполнения
        // afterFill - 0 = не закрывать тольео если чего-то не хватает

        var me = this,
            win = this.getWinBankEdit(),
            reqpanel = win.down('bankformrequsites'),
            toOpen = false,
            p7 = reqpanel.down('[name=p7]');

        for (let i = 1; i <= 6; i++) {
            reqpanel.down('[name=p' + i + ']').removeCls('color-orange');
            reqpanel.down('[name=p' + i + ']').removeCls('txt-grey');
        }

        if (currState.recipient != "" && currState.recipient != null) {
            reqpanel.down('[name=p1]').update(currState.recipient);
            reqpanel.down('[name=p1]').addCls('txt-grey');
        } else {
            reqpanel.down('[name=p1]').update('Не указан');
            reqpanel.down('[name=p1]').addCls('color-orange');
            toOpen = true;
        }

        if (currState.inn != "" && currState.inn != null) {
            reqpanel.down('[name=p2]').addCls('txt-grey');
            reqpanel.down('[name=p2]').update(currState.inn);
        } else {
            reqpanel.down('[name=p2]').update('Не указан');
            reqpanel.down('[name=p2]').addCls('color-orange');
            toOpen = true;
        }

        if (currState.kpp != "" && currState.kpp != null) {
            reqpanel.down('[name=p3]').update(currState.kpp);
            reqpanel.down('[name=p3]').addCls('txt-grey');
        } else {
            reqpanel.down('[name=p3]').update('Не указан');
            reqpanel.down('[name=p3]').addCls('color-orange');
            toOpen = true;
        }

        if (currState.bank != "" && currState.bank != null) {
            reqpanel.down('[name=p4]').update(currState.bank);
            reqpanel.down('[name=p4]').addCls('txt-grey');
        } else {
            reqpanel.down('[name=p4]').update('Не указан');
            reqpanel.down('[name=p4]').addCls('color-orange');
            toOpen = true;
        }

        if (currState.bik != "" && currState.bik != null) {
            reqpanel.down('[name=p5]').update(currState.bik);
            reqpanel.down('[name=p5]').addCls('txt-grey');
        } else {
            reqpanel.down('[name=p5]').update('Не указан');
            reqpanel.down('[name=p5]').addCls('color-orange');
            toOpen = true;
        }

        if(p7) {
            if (currState.ks != "" && currState.ks != null) {
                reqpanel.down('[name=p6]').update(currState.ks);
                reqpanel.down('[name=p6]').addCls('txt-grey');
            } else {
                reqpanel.down('[name=p6]').update('Не указан');
                reqpanel.down('[name=p6]').addCls('color-orange');
                toOpen = true;
            }

            if (currState.rs != "" && currState.rs != null) {
                reqpanel.down('[name=p7]').update(currState.rs);
                reqpanel.down('[name=p7]').addCls('txt-grey');
            } else {
                reqpanel.down('[name=p7]').update('Не указан');
                reqpanel.down('[name=p7]').addCls('color-orange');
                toOpen = true;
            }
        } else {
            if (currState.rs != "" && currState.rs != null) {
                reqpanel.down('[name=p6]').update(currState.rs);
                reqpanel.down('[name=p6]').addCls('txt-grey');
            } else {
                reqpanel.down('[name=p6]').update('Не указан');
                reqpanel.down('[name=p6]').addCls('color-orange');
                toOpen = true;
            }
        }

        if (afterFill == 1) toOpen = true;
        reqpanel.setVisible(toOpen);
        win.down('[name=cnt-open-req]').setVisible(!toOpen);
    },

    openRequisites: function () {
        // Открыть реквизиты платежа
        var me = this,
            win = this.getWinBankEdit(),
            mode = win.down('[name=typ_nalog]').getValue() * 1,
            reqpanel = win.down('bankformrequsites');
        win.down('[action=open_req]').setVisible(mode == 12 || mode == 13);
        reqpanel.show();
        win.down('[name=cnt-open-req]').hide();
    },

    goToZp: function () {

        var me = this,
            win = this.getWinBankEdit();
        document.getElementById("mn2-1-12").click();
        win.close();
    },

    arrangeSumma: function () {
        var me = this,
            win = this.getWinBankEdit(),
            s = win.down('[name=summav]').getValue(),
            value = String(s).replace(',', '.');

        win.down('[name=summav]').setValue((value * 1).toFixed(2));

    },

    setTitleZp: function () {
        // Заголовки окна от вида
        var me = this,
            arTitle = [],
            text = '',
            win = this.getWinBankEdit(),
            rpl = me.getRegPlt().getValue() * 1,
            op = win.down('three_select').getValue(),
            nvid = win.down('[name=nalog_id]').getValue(),
            vid_ret = win.down('[name=vid_return]').getValue();
        arTitle['1'] = [];
        arTitle['2'] = [];
        arTitle['3'] = [];
        arTitle['1']['6'] = 'Возврат НДФЛ';
        arTitle['1']['14'] = 'Возврат НДФЛ';
        arTitle['1']['15'] = 'Возврат НДФЛ (15%)';
        arTitle['1']['21'] = 'Возврат взноса ОСС';
        arTitle['1']['22'] = 'Возврат взноса ФСС травматизм';
        arTitle['1']['23'] = 'Возврат взноса ОМС';
        arTitle['1']['24'] = 'Возврат взноса ОПС';
        arTitle['1']['25'] = 'Возврат взносов ОПС ИП за себя';
        arTitle['1']['26'] = 'Возврат взносов ОМС взносы ИП за себя';
        arTitle['1']['28'] = 'Возврат взносов ОПС (1%) ИП за себя';
        arTitle['1']['31'] = 'Возврат взноса ОПС (6%)';
        arTitle['1']['32'] = 'Возврат взноса ОПС (9%)';
        arTitle['1']['33'] = 'Возврат взноса ОПС по классу УТ (список 1)';
        arTitle['1']['34'] = 'Возврат взноса ОПС по классу УТ (список 2)';
        arTitle['1']['35'] = 'Возврат взносов ФСС (добр.)';

        arTitle['2']['6'] = 'Уплата НДФЛ';
        arTitle['2']['14'] = 'Уплата НДФЛ';
        arTitle['2']['15'] = 'Уплата НДФЛ (15%)';
        arTitle['2']['21'] = 'Уплата взносов ОСС';
        arTitle['2']['22'] = 'Уплата взносов ФСС травматизм';
        arTitle['2']['23'] = 'Уплата взносов ОМС';
        arTitle['2']['24'] = 'Уплата взносов ОПС';
        arTitle['2']['25'] = 'Уплата взносов ОПС взносы ИП за себя';
        arTitle['2']['26'] = 'Уплата взносов ОМС взносы ИП за себя';
        arTitle['2']['28'] = 'Уплата взносов ОПС (1%) взносы ИП за себя';
        arTitle['2']['31'] = 'Уплата взносов ОПС (6%)';
        arTitle['2']['32'] = 'Уплата взносов ОПС (9%)';
        arTitle['2']['33'] = 'Уплата взносов ОПС по классу УТ (список 1)';
        arTitle['2']['34'] = 'Уплата взносов ОПС по классу УТ (список 2)';
        arTitle['2']['35'] = 'Уплата взносов ФСС (добр.)';

        arTitle['3']['1'] = 'Возмещение из ФСС - ОСС';
        arTitle['3']['2'] = 'Возмещение из ФСС - Травматизм';
        arTitle['3']['3'] = 'Возмещение из ФСС - ФСС (добр.)';

        if (rpl != '20')
            text = arTitle[op][nvid];
        else
            text = arTitle['3'][vid_ret];

        return text;
    },
    dateNalogBase : function(combo) {
        var me = this,
            win = this.getWinBankEdit(),
            f7 = win.down('[name=f7]');

        f7.setVisible(combo.getValue() == '1');
    },
    dateCheck : function(date) {
        let win = this.getWinBankEdit(),
            f0 = win.down('[name=f0]'),
            f3 = win.down('[name=f3]'),
            cnt_f6 = win.down('[name=cnt-_f6]'),
            cntf6 = win.down('[name=cnt-f6]');

        if(date.getValue() >= this.date_20211001) {

            cnt_f6.show();
            cntf6.hide();

            f0.store.filterBy((r) => !Ext.Array.contains(this.f0Exclude_20211001, r.get('field1')));
            f3.store.filterBy((r) => !Ext.Array.contains(this.f3Exclude_20211001, r.get('field1')));

            f0.store.findRecord('field1', '13').set('field2', '13 - Физическое лицо, ИП, нотариус, адвокат, глава КФХ');
        } else {
            cnt_f6.hide();
            cntf6.show();
            f0.store.clearFilter();
            f3.store.clearFilter();

            f0.store.findRecord('field1', '13').set('field2', '13 - Физическое лицо')
        }

        this.setBankKBK()
    },
    showDocNumber: function(docType) {
        let win = this.getWinBankEdit(),
            cntf6 = win.down('[name=cnt-f6]');

        cntf6.setVisible(docType.getValue() || docType.isHidden())
    }
});
