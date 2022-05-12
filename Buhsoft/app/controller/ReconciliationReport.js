/**
 * Контроллер Акта сверки с контрагентом.
 *
 * Используется прототип app/classes/edo/Maintain.js
 *
 * @since 04.21
 */
Ext.define('Buh.controller.ReconciliationReport', {
    extend: 'Ext.app.Controller',
    cid: null,
    sender: {},
    recipient: {},
    stateLastContragents: {},
    contraEdoStatus: 0,
    contraEdoId: null,

    refs: [
        {
            ref: 'winMaster',
            selector: 'rrMasterWindow'
        },
        {
            ref: 'formMaster',
            selector: 'rrForm'
        }
    ],

    init: function () {
        let me = this;

        _ajax(
            dir_start_buh_ + 'enterprise/getById/',
            {id: userid},
            function (resp) {
                response = Ext.decode(resp);
                me.sender = response.data;
            }
        );

        me.stateLastContragents = me.readState('rrLastContragents');

        me.control({
            'rrMasterWindow': {
                afterRender: this.winRender,
                render: this.renderMaster,
                onScroll: this.winRender
            },

            /** Действия кнопок в тулбаре. */
            /** Скачать PDF */
            'rrForm toolbar button[action=downloadPdf]': {
                click: this.downloadPDF
            },
            /** Скачать XLS */
            'rrForm toolbar button[action=downloadXls]': {
                click: this.downloadXLS
            },
            /** Отправка */
            'rrForm': {
                goEDO: this.sendByEDO,
                goEmail: this.sendByEmail
            },
            /** Отмена */
            'rrForm toolbar button[action=cancelWindow]': {
                click: this.cancelWindow
            },

            /** Выбор контрагента/группы */
            'rrForm rrcontra_groups': {
                select: this.contragentSelect,
                change: this.contragentSelect
            },

            /** Выбор главного контрагента группы. */
            'rrForm gbs_combo[name=id_contra_main]': {
                select: this.contragentMainSelect,
                change: this.contragentMainSelect
            },

            /** Выбор договора. */
            'rrForm gbs_combo[name=rrAgreement]': {
                select: this.validateForm,
                change: this.validateForm
            },

            /** Выбор ответственного сотрудника. */
            'rrForm sprav_tool[name=otvc]': {
                select: this.responsibleSelect,
                change: this.responsibleSelect
            },

        })
    },

    renderMaster: function () {
        let me = this, win = me.getWinMaster(), edoMaint = Ext.create('Buh.classes.edo.Maintain');

        me.cid = win.contragent;
        win.lastContragents = me.stateLastContragents;

        if (me.cid !== null) {
            _ajax(
                dir_start_buh_ + 'contragent/readContragent/',
                {
                    id: me.cid,
                    echo: true
                },
                function (resp) {
                    let response = Ext.decode(resp);
                    me.recipient = response.data;
                    win.contragentName = me.recipient.naim;
                    win.down('rrcontra_groups').store.proxy.extraParams.id = me.cid;
                    win.down('rrcontra_groups').store.proxy.extraParams.lastSaved = Ext.encode(me.stateLastContragents);

                    win.down('rrcontra_groups').store.load(function() {
                        win.down('rrcontra_groups').setValue(win.contragent, win.contragentName);
                        me.contragentSelect();
                    });
                }
            );
        }
    },

    cancelWindow: function (el) {
        let me = this;
        me.setStatistics();

        let _popup = Ext.ComponentQuery.query('[itemId=edoBuyWindow]');
        if (_popup[0] != undefined) _popup[0].close();
        _popup = Ext.ComponentQuery.query('[itemId=edoInfoWindow]');
        if (_popup[0] != undefined) _popup[0].close();
        _popup = Ext.ComponentQuery.query('[itemId=edoInviteWindow]');
        if (_popup[0] != undefined) _popup[0].close();

        el.up('window').close();
    },

    winRender: function () {
        let me = this;
        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);
        me.onScroll();
    },

    /**
     * Фиксация завершения работы с Актом для статистики.
     */
    setStatistics: function () {
        if (startASV != _dummy && startASV > 0) {
            let d = new Date();
            endASV = d.getTime();
            duration = (endASV - startASV) / 1000;
            if (duration > 0) {
                crmEventDoc('1pgb_buh', 'AktSverkiSend', null, 0, duration);
            }
        }
    },

    /** Обработка выбора значения компонента "Контрагент или группы контрагентов". */
    contragentSelect: function () {
        let me = this, win = me.getWinMaster(),
            rec = win.down('rrcontra_groups').store.getById(win.down('rrcontra_groups').getValue());

        if (rec !== null) {
            win.down('[name=rrAgreement]').setDisabled(false);

            me.cid = rec.data.id;

            if (rec.data.isGroup == 1) {
                win.down('[name=cnt-contra_main]').show();

                win.down('[name=rrAgreement]').store.proxy.extraParams.grp = rec.data.id;
                win.down('[name=rrAgreement]').store.load(function () {
                    me.agreementSet(win.down('[name=rrAgreement]'), true);
                });

                win.down('[name=id_contra_main]').store.proxy.extraParams.grp = rec.data.id;
                win.down('[name=id_contra_main]').store.load(function () {
                    me.contragentMainSet(win.down('[name=id_contra_main]'));
                });
            } else {
                win.down('[name=cnt-contra_main]').hide();

                win.down('[name=rrAgreement]').store.proxy.extraParams.id = rec.data.id;
                win.down('[name=rrAgreement]').store.proxy.extraParams.grp = 0;
                win.down('[name=rrAgreement]').store.load(function () {
                    me.agreementSet(win.down('[name=rrAgreement]'));
                });
            }
        } else {
            if (me.cid !== undefined && me.cid != null) {
                win.down('[name=rrAgreement]').setDisabled(false);
                win.down('[name=rrAgreement]').store.proxy.extraParams.id = me.cid;
                win.down('[name=rrAgreement]').store.proxy.extraParams.grp = 0;
                win.down('[name=rrAgreement]').store.load(function () {
                    me.agreementSet(win.down('[name=rrAgreement]'));
                });
            }
        }

        me.validateForm();
    },

    /**
     * Обработка выбора значения компонента "Главный контрагент в группе".
     */
    contragentMainSelect: function () {
        let me = this;
        me.validateForm();
    },

    /**
     * Обработка выбора значения компонента "Ответственный за акт".
     */
    responsibleSelect: function () {
        let me = this, win = me.getWinMaster();
        me.saveState('aktSvOtv', win.down('[name=otvc]').getRawValue());
        me.validateForm();
    },

    /**
     * Обработка загрузки хранилища компонента "Договор".
     *
     * Идентификация спецэлементов списка:
     * 0 = "По всем договорам"
     * -1 = "По всем договорам с расчетами"
     * -10 = "Без договора"
     *
     * Кейсы:
     * 1. Договоров нет, в списке только "Без договора". Одинаково для групп и контрагентов.
     * Сразу выделяется, селект недоступен.
     * 2. Выбрана группа контрагентов и есть договора у членов группы.
     * Сразу выделяется "По всем договорам с расчетами" (-1).
     * 3. Выбран контрагент и есть договора.
     * Сразу выделяется "По всем договорам с расчетами" (-1).
     */
    agreementSet: function (cmp, bygrp = false) {
        let me = this;
        cmp.setValue(cmp.store.getAt(0).data.id);
        cmp.disabled = iif(cmp.store.data.items.length == 1, true, false);
    },

    /**
     * Обработка загрузки хранилища компонента "Главный контрагент в группе".
     * Если в группе один контрагент, он сразу выбирается.
     * */
    contragentMainSet: function (cmp) {
        let me = this;
        cmp.setValue(iif(cmp.store.data.items.length == 1, cmp.store.getAt(0).data.id, ''));
        me.validateForm();
    },

    validateForm: function () {
        let me = this, win = me.getWinMaster(), form = me.getFormMaster(),
            cbContragent = form.down('rrcontra_groups'),
            cbContragentMain = form.down('[name=id_contra_main]'),
            cbAgreement = form.down('[name=rrAgreement]');

        if (cbContragent.getValue() > 0 && cbAgreement.getValue().length > 0) {
            if (form.down('[name=cnt-contra_main]').isVisible()) {
                if (cbContragentMain.getValue() > 0) {
                    me.setRecipient(cbContragentMain.getValue());
                } else return false;
            } else {
                me.setRecipient(cbContragent.getValue());
            }
        }
    },

    setRecipient: function (id) {
        let me = this, form = me.getFormMaster();

        _ajax(
            dir_start_buh_ + 'contragent/readContragent/',
            {
                id: id,
                echo: true
            },
            function (resp) {
                response = Ext.decode(resp);
                me.recipient = response.data;
                form.setReady();
            }
        );
    },

    reportProcessing: function (filetype) {
        let me = this, win = me.getWinMaster(), _id,
            cbContragentRec = win.down('rrcontra_groups').store.getById(win.down('rrcontra_groups').getValue()),
            cbContragentMain = win.down('[name=id_contra_main]'),
            cbAgreementVal = win.down('[name=rrAgreement]').getValue().join(','),
            isGrp = 0,
            dateBegin = Ext.Date.format(Ext.getCmp('periodRR_dat_doc1').getValue(), 'd.m.Y'),
            dateEnd = Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'd.m.Y'),
            responsibleStaff = win.down('[name=otvc]').getRawValue(),
            fillMeOnly = win.down('[name=fillMeOnly]').getValue();

        if (win.callFrom == 100) {
            if (filetype == 'pdf') {
                crmEvent('buh', '2CA21B09-DF19-4DCB-B16C-3F60B01D786D', false, false);
            } else if (filetype == 'xls') {
                crmEvent('buh', '861495D9-ED89-4B6B-A552-9C190AA5875E', false, false);
            }
        } else if (win.callFrom == 110) {
            if (filetype == 'pdf') {
                crmEvent('buh', 'F939D1EB-80EE-4BE9-9495-9539514A58C7', false, false);
            } else if (filetype == 'xls') {
                crmEvent('buh', '306EA235-0F73-4A3F-B658-E4730E3515B3', false, false);
            }
        } else {
            if (filetype == 'pdf') {
                crmEvent('buh', 'E079488F-E2CD-42B8-B214-9FCE96549AE6', false, false);
            } else if (filetype == 'xls') {
                crmEvent('buh', '53651F32-005C-4FAB-8A2E-9D66BDB0DF21', false, false);
            }
        }

        if (cbContragentRec !== null) {
            isGrp = cbContragentRec.data.isGroup;
        }

        _id = iif(isGrp == 1 && win.down('[name=cnt-contra_main]') && cbContragentMain.getValue() > 0,
            cbContragentMain.getValue(),
            me.cid);

        let _fn = function (_grp) {
            let query = "contragent=" + _id;
            query += "&group=" + iif(_grp.length, _grp, 0);
            query += "&datebegin=" + dateBegin;
            query += "&dateend=" + dateEnd;
            query += "&otv=" + responsibleStaff + "";
            query += "&meOnly=" + fillMeOnly;
            query += "&agreements=" + Ext.encode(cbAgreementVal);
            query += "&filetype=" + filetype;

            window.location.href = dir_start_buh_ + "/frm_akt_sv_21.php?" + query;
        }

        if (isGrp == 1) {
            _ajax(dir_start_buh_ + 'contragent/readContragentsByGroup/',
                {
                    grp: cbContragentRec.data.id,
                    idOnly: 1,
                    // yearDatabase: Ext.getCmp('periodRR_dat_doc2').getValue()
                    yearDatabase: Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'Y')
                },
                function (resp) {
                    let r = Ext.decode(resp);
                    if (r.data.length) {
                        let grp = [];
                        Ext.each(r.data, function (e) {
                            grp.push(e.id);
                        });
                        _fn(grp.join(','));
                    }
                }
            );
        } else {
            _fn({});
        }

        win.close();
    },

    downloadPDF: function () {
        let me = this;
        me.reportProcessing('pdf');
    },

    downloadXLS: function () {
        let me = this;
        me.reportProcessing('xls');
    },

    sendByEmail: function () {
        let me = this, _win = me.getWinMaster(), win, _id,
            cbContragentRec = _win.down('rrcontra_groups').store.getById(_win.down('rrcontra_groups').getValue()),
            cbContragentMain = _win.down('[name=id_contra_main]'),
            cbAgreementVal = _win.down('[name=rrAgreement]').getValue(),
            isGrp = 0, fio = [], messageText = '', addressee = '', query = '',
            datebegin = Ext.Date.format(Ext.getCmp('periodRR_dat_doc1').getValue(), 'd.m.Y'),
            dateend = Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'd.m.Y');

        if (_win.callFrom == 100) {
            crmEvent('buh', '52680EF1-4E26-4E57-9012-22AA02ACA905', false, false);
        } else if (_win.callFrom == 110) {
            crmEvent('buh', '0BFCB02E-DFD2-4C6E-A532-F1AF31109C73', false, false);
        } else {
            crmEvent('buh', '840226D4-A7BB-42EE-9E16-9B7BBEF6DD87', false, false);
        }

        if (cbContragentRec != null) isGrp = cbContragentRec.data.isGroup;

        _id = iif(isGrp == 1 && _win.down('[name=cnt-contra_main]') && cbContragentMain.getValue() > 0,
            cbContragentMain.getValue(), me.cid);

        if (isGrp == 1) {
            _ajax(dir_start_buh_ + 'contragent/readContragentsByGroup/',
                {
                    grp: cbContragentRec.data.id,
                    idOnly: 1,
                    // yearDatabase: Ext.getCmp('periodRR_dat_doc2').getValue()
                    yearDatabase: Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'Y')
                },
                function (resp) {
                    let r = Ext.decode(resp);
                    if (r.data.length) {
                        let grp = [];
                        Ext.each(r.data, function (e) {
                            grp.push(e.id);
                        });

                        grp.join(',');

                        query = "contragent=" + _id;
                        query += "&group=" + Ext.encode(iif(_grp.length, _grp, null));
                        query += "&datebegin=" + Ext.Date.format(Ext.getCmp('periodRR_dat_doc1').getValue(), 'd.m.Y');
                        query += "&dateend=" + Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'd.m.Y');
                        query += "&otv=" + _win.down('[name=otvc]').getRawValue() + "";
                        query += "&meOnly=" + _win.down('[name=fillMeOnly]').getValue();
                        query += "&agreements=" + Ext.encode(cbAgreementVal);
                        query += "&filetype=pdf";
                        query += "&email=1";

                        if (me.recipient.fio1 != null && me.recipient.fio1.length) fio[0] = me.recipient.fio1;
                        if (me.recipient.fio2 != null && me.recipient.fio2.length) fio[1] = me.recipient.fio2;
                        if (me.recipient.fio3 != null && me.recipient.fio3.length) fio[2] = me.recipient.fio3;

                        if (!fio.length) fio = me.recipient.dir.split(' ');
                        addressee = iif(fio[1] != undefined && fio[2] != undefined, ', ' + fio[1] + ' ' + fio[2], '');

                        messageText = 'Здравствуйте' + addressee + '!\n' +
                            'Направляем Вам Акт сверки взаиморасчетов, составленный за период с ' + datebegin +
                            ' по ' + dateend + '.\n' +
                            'Просим Вас подписать акт в 5-дневный срок и вернуть его по электронной почте на адрес ' +
                            me.sender.email + '.\n' +
                            'При наличии разногласий просим приложить скан-копии подтверждающих документов ' +
                            '(накладных, счетов-фактур, актов и проч.)\n' +
                            'Если мы не получим подписанный акт или разногласия по нему через 5 дней, то признаем\n' +
                            'сальдо расчетов подтвержденным.\n\n' +
                            'С уважением,\n' + me.sender.dirdolgn + ' ' + me.sender.briefname + '\n' + me.sender.dirfio;

                        messageTpl = 'Здравствуйте, %ADDRESSEE%!\n' +
                            'Направляем Вам Акт сверки взаиморасчетов, составленный за период с %DATEBEGIN% по %DATEEND%.\n' +
                            'Просим Вас подписать акт в 5-дневный срок и вернуть его по электронной почте на адрес %EMAIL%.\n' +
                            'При наличии разногласий просим приложить скан-копии подтверждающих документов ' +
                            '(накладных, счетов-фактур, актов и проч.)\n' +
                            'Если мы не получим подписанный акт или разногласия по нему через 5 дней, то признаем\n' +
                            'сальдо расчетов подтвержденным.\n\n' +
                            'С уважением,\n%POSTNAME% %COMPANY%\n%DIRECTORFIO%';

                        win = Ext.create('Buh.classes.window.EmailWindow', {
                            data: {
                                recipient: me.recipient.naim,
                                recipientEmail: me.recipient.e_mail,
                                lastName: iif(fio[0] != undefined, fio[0], ''),
                                firstName: iif(fio[1] != undefined, fio[1], ''),
                                middleName: iif(fio[2] != undefined, fio[2], ''),
                                sender: me.sender.briefname,
                                senderEmail: me.sender.email,
                                subject: 'Акт сверки для ' + me.recipient.naim,
                                message: messageText,
                                messageTpl: messageTpl,
                                fileName: '"Акт сверки ' + datebegin + ' - ' + dateend + '"',
                                file: '',
                                fileTypes: {
                                    pdf: true,
                                    xls: true,
                                    doc: false
                                },
                                action: dir_start_buh_ + "/frm_akt_sv_21.php?" + query
                            }
                        });

                        me.setStatistics();
                        _win.close();
                        win.show();
                    }
                }
            );
        } else {
            query = "contragent=" + _id;
            query += "&datebegin=" + Ext.Date.format(Ext.getCmp('periodRR_dat_doc1').getValue(), 'd.m.Y');
            query += "&dateend=" + Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'd.m.Y');
            query += "&otv=" + _win.down('[name=otvc]').getRawValue() + "";
            query += "&meOnly=" + _win.down('[name=fillMeOnly]').getValue();
            query += "&agreements=" + Ext.encode(cbAgreementVal);
            query += "&email=1";

            if (me.recipient.fio1 != null && me.recipient.fio1.length) fio[0] = me.recipient.fio1;
            if (me.recipient.fio2 != null && me.recipient.fio2.length) fio[1] = me.recipient.fio2;
            if (me.recipient.fio3 != null && me.recipient.fio3.length) fio[2] = me.recipient.fio3;

            if (!fio.length) fio = me.recipient.dir.split(' ');
            addressee = iif(fio[1] != undefined && fio[2] != undefined, ', ' + fio[1] + ' ' + fio[2], '');

            messageText = 'Здравствуйте' + addressee + '!\n' +
                'Направляем Вам Акт сверки взаиморасчетов, составленный за период с ' + datebegin +
                ' по ' + dateend + '.\n' +
                'Просим Вас подписать акт в 5-дневный срок и вернуть его по электронной почте на адрес ' +
                me.sender.email + '.\n' +
                'При наличии разногласий просим приложить скан-копии подтверждающих документов ' +
                '(накладных, счетов-фактур, актов и проч.)\n' +
                'Если мы не получим подписанный акт или разногласия по нему через 5 дней, то признаем\n' +
                'сальдо расчетов подтвержденным.\n\n' +
                'С уважением,\n' + me.sender.dirdolgn + ' ' + me.sender.briefname + '\n' + me.sender.dirfio;

            messageTpl = 'Здравствуйте, %ADDRESSEE%!\n' +
                'Направляем Вам Акт сверки взаиморасчетов, составленный за период с %DATEBEGIN% по %DATEEND%.\n' +
                'Просим Вас подписать акт в 5-дневный срок и вернуть его по электронной почте на адрес %EMAIL%.\n' +
                'При наличии разногласий просим приложить скан-копии подтверждающих документов ' +
                '(накладных, счетов-фактур, актов и проч.)\n' +
                'Если мы не получим подписанный акт или разногласия по нему через 5 дней, то признаем\n' +
                'сальдо расчетов подтвержденным.\n\n' +
                'С уважением,\n%POSTNAME% %COMPANY%\n%DIRECTORFIO%';

            win = Ext.create('Buh.classes.window.EmailWindow', {
                data: {
                    recipient: me.recipient.naim,
                    recipientEmail: me.recipient.e_mail,
                    lastName: iif(fio[0] != undefined, fio[0], ''),
                    firstName: iif(fio[1] != undefined, fio[1], ''),
                    middleName: iif(fio[2] != undefined, fio[2], ''),
                    sender: me.sender.briefname,
                    senderEmail: me.sender.email,
                    subject: 'Акт сверки для ' + me.recipient.naim,
                    message: messageText,
                    messageTpl: messageTpl,
                    fileName: '"Акт сверки ' + datebegin + ' - ' + dateend + '"',
                    file: '',
                    action: dir_start_buh_ + "frm_akt_sv_21.php?" + query,
                    fileTypes: {
                        pdf: true,
                        xls: true,
                        doc: false
                    },
                }
            });

            me.setStatistics();
            _win.close();
            win.show();
        }
    },

    sendByEDO: function () {
        let me = this, win = me.getWinMaster(),
            btn = win.down('toolbar').down('button[name=sendBtn]'),
            refWindow = Ext.getCmp('mainWin6'),
            cbContragentRec = win.down('rrcontra_groups').store.getById(win.down('rrcontra_groups').getValue()),
            cbContragentMain = win.down('[name=id_contra_main]'),
            cbAgreementVal = win.down('[name=rrAgreement]').getValue(), fio = [],
            datebegin = Ext.Date.format(Ext.getCmp('periodRR_dat_doc1').getValue(), 'd.m.Y'),
            dateend = Ext.Date.format(Ext.getCmp('periodRR_dat_doc2').getValue(), 'd.m.Y'),
            edoMaint = Ext.create('Buh.classes.edo.Maintain'),
            haveEDO, url, _id, isGrp = 0;

        edoMaint.access(aktionid.config.appid, aktionid.token);
        edoMaint.checkEdoStatus(function(_stateEdo) {
            haveEDO = _stateEdo;
        });

        if (win.callFrom == 100) {
            crmEvent('buh', '1E07FE6C-7507-4544-B84B-D3D4439FEB56', false, false);
        } else if (win.callFrom == 110) {
            crmEvent('buh', 'F939D1EB-80EE-4BE9-9495-9539514A58C7', false, false);
        } else {
            crmEvent('buh', 'D209BB74-D45C-49A3-A130-5A01AF777556', false, false);
        }

        if (cbContragentRec != null) isGrp = cbContragentRec.data.isGroup;

        _id = iif(isGrp == 1 && win.down('[name=cnt-contra_main]') && cbContragentMain.getValue() > 0,
            cbContragentMain.getValue(), me.cid);

        edoMaint.getContraStatus(userid, _id, function(_stateContraEdo, _contraEdoId) {
            me.contraEdoStatus = parseInt(_stateContraEdo);
            me.contraEdoId = parseInt(_contraEdoId);
        });

        if (haveEDO == true && me.contraEdoStatus == 1) {
            // У клиента, и у контрагента подключен ЭДО. Выполняется отправка неформализованного документа.
            url = dir_start_buh_ + "/frm_akt_sv_21.php?";
            url += "contragent=" + _id;
            url += "&datebegin=" + datebegin;
            url += "&dateend=" + dateend;
            url += "&otv=" + win.down('[name=otvc]').getRawValue() + "";
            url += "&meOnly=" + win.down('[name=fillMeOnly]').getValue();
            url += "&agreements=" + Ext.encode(cbAgreementVal);
            url += "&filetype=pdf&edo=1";

            _ajax(url, {timeout: 180000, async: false}, function (resp) {
                let response = Ext.decode(resp);
                if (response.file.length) {
                    _ajax(dir_start_buh_ + 'edo/sendfile',
                        {
                            aai: aktionid.config.appid,
                            eat: aktionid.token,
                            userid: userid,
                            curryear: currYear,
                            cid: me.cid,
                            ceid: me.contraEdoId,
                            id_dsb: -1,
                            document: response.file,
                            postname: response.filename,
                            doc_type: 'pdf'
                        },
                        function (resp) {
                            let answ = Ext.decode(resp, true);
                            if (answ.answer == true) {
                                me.setStatistics();
                                win.close();
                                if (refWindow != undefined) refWindow.close();
                                Ext.get(document.body).unmask();
                                eval(answ.str);
                            } else {
                                _alert_win('Отправка файла', answ.message);
                            }
                        });
                }
            });
        } else if (haveEDO == true && me.contraEdoStatus == 0 && me.contraEdoId == 0) {
            // У клиента подключен ЭДО, контрагент без ЭДО.
            edoMaint.showInfoWin("Контрагент не подключен к ЭДО. Отправьте файл электронной почтой.", 'red', btn, 'bl-tl');
        } else if (haveEDO == true && me.contraEdoStatus == 0 && me.contraEdoId != 0) {
            // У клиента есть ЭДО и активное подключение. У контрагента есть ЭДО, но нет активного подключения.
            edoMaint.inviteToEdoContra(btn, me.cid, me.contraEdoId, me.contraEdoStatus, 'bl-tl');
        } else if (haveEDO == true && me.contraEdoStatus == 2 && me.contraEdoId != 0) {
            // У клиента, и у контрагента подключен ЭДО. Контрагенту отправлено приглашение к ЭДО.
            edoMaint.showInfoWin("Контрагенту отправлено приглашение начать ЭДО. Отправьте файл электронной почтой.", 'green', btn, 'bl-tl');
        } else if (haveEDO == undefined || haveEDO == false) {
            // У клиента нет ЭДО. Перенаправление на сайт, на страницу покупки ЭДО.
            me.setStatistics();
            if (refWindow != undefined && refWindow.isVisible()) edoMaint.connectToEdo(btn, 'bl-tl', win);
            else edoMaint.connectToEdo(btn, 'bl-tl', win, true);
        }
    },

    readState: function (namefield) {
        let me = this;

        if (namefield !== undefined) {
            _ajax(
                dir_start_buh_ + 'states/read/',
                {
                    userid: userid,
                    yearDatabase: currYear,
                    namefield: namefield
                },
                function (resp) {
                    response = Ext.decode(resp);
                    me.stateLastContragents = Ext.decode(response.data);
                });
        }
    },

    saveState: function (namefield, data) {
        let me = this;

        if (namefield != undefined && data != undefined) {
            _ajax(
                dir_start_buh_ + 'states/save/',
                {
                    userid: userid,
                    yearDatabase: currYear,
                    namefield: namefield,
                    data: data
                },
                function (resp) {
                    me.stateLastContragents = me.readState('rrLastContragents');
                });
        }
    },

});
