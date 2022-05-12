Ext.define('Buh.controller.Buy', {
    extend: 'Ext.app.Controller',
    taskSetReward: null,
    refs: [

        {
            ref: 'winBuy',
            selector: 'winbuycard'
        },

        {
            ref: 'gridSost',
            selector: 'winbuycard grid[name=grd_sostav]'
        }
    ],
    init: function () {
        this.control({

            'winbuycard': {
                show: this.showWin,
                fillWindow: this.fillWindow, // Заполнение сделки данными,
                fillSostavGrid: this.fillSostavGrid, // Заполнение сделки данными,
                sostavchange: this.sostavChange, // Изменился состав сделки
                komisChanged: this.setKomisMode // Изменился вид сдекли комиссиия / нет
            },

            'winbuycard [name=facturadat]': {
                select: this.setDatDeal, // Изменить дату сделки
                change: this.datDealChanged,
            },

            'winbuycard button[name=n_doc]': {
                click: this.editHeaderDeal, // Редактировать шапку сделки
                mouseover: this.setGold, // Выделить шапку желтым
                mouseout: this.unSetGold, // Удрать выделение шапки желтым
            },

            'winbuycard button[name=l1]': {
                mouseover: this.setGold, // Выделить шапку желтым
                mouseout: this.unSetGold, // Удрать выделение шапки желтым
            },

            'winbuycard button[name=video_button] menu': {
                click: this.menuHandler // подсказка по video
            },

            'winbuycard button[name=help_button] menu': {
                click: this.menuHandler, // подсказка по ?
                beforeshow: this.menuBeforeShow
            },

            'winbuycard button[name=close_button]': {
                click: this.closeWin, // закрыть окно сделки
            },

            'winbuycard grid': {
                beforeedit: this.beforeEditSostav // Перед редактированием грида с составом
            },

            'winbuycard grid[name=grd_sostav]': {
                selecttype: this.setTypeRow, // Выбрать тип номенклатуры
                selectsc: this.setDiR, // Задать Дир в зависимости от счета и вида аналитики
            },

            'winbuycard #tabKomisDeal [name=komit]': {
                select: this.fillKomitDogovor, // заполнить договора для выбранного контрика
            },


            'winbuycard #tabKomisDeal [name=summa]': {
                change: this.setAgetntData, // Сменяется поле в комиссии
            },

            'winbuycard #tabKomisDeal [action=gotoagent]': {
                click: this.goToAgent, // В закладку со отчетами агентов
            },

            'winbuycard #tabKomisDeal [name=principal], winbuycard #tabKomisDeal [name=id_dog_komis], winbuycard #tabKomisDeal [name=dat]': {
                change: this.setAgetntData, // Сменяется поле в комиссии
            },

            'winbuycard #tabKomisDeal [name=way_calc_reward], winbuycard #tabKomisDeal [name=nds_id], winbuycard #tabKomisDeal [name=percent]': {
                change: this.setAgetntData, // Сменяется поле в комиссии
            },

            'winbuycard #tabKomisDeal': {
                refreshStatus: this.setAgetntRewardStatus, // Обновляем статус панели с вознаграждением
            },

        })
    },

    fillSostavGrid:function () {
        var winSbEdit = this.getWinBuy(),
            grdSD = Ext.getCmp('docsGrid' + winSbEdit.id_tab),
            _recGrid = winSbEdit.recGrid,
            grdSostav = winSbEdit.down('#grd_sostav'),
            An = Ext.create('Buh.classes.common.Values');

        grdSostav.store.proxy.extraParams = {tab: 101, id_sb: _recGrid.data.id};
        grdSostav.store.load(function (records, operation, success) {
            if (records.length == 0) {
                _ajax(
                    dir_start_buh_ + 'form.php',
                    {'action': ((_recGrid.data.TYP_OPER * 1) == 1) ? 'lastBuy' : 'lastSale'},
                    function (_ans) {
                        var res = Ext.decode(_ans);

                        if (_recGrid.data.TYP_OPER == 1 && res.npp == 41) {
                            res.npp = '31';
                            res.id_sprav = "3";
                            res.id_sc = '20.1';
                        }

                        if (_recGrid.data.TYP_OPER == 2 && (res.npp == 31 || res.npp == 32)) {
                            res.npp = '41';
                            res.id_sprav = "4";
                            res.id_sc = '90.1';
                        }
                        if (_recGrid.data.B_TYPE != 4 && _recGrid.data.B_TYPE != 5)
                            winSbEdit.down('[name=grd_sostav]').store.insert(records.length, {
                                'npp': res.npp,
                                'id': 0,
                                'id_oper': _recGrid.data.id,
                                'an_typ': An.getTextAnalit(res.npp),
                                'double': 0,
                                'nomenkl': '',
                                'nds_id': (winSbEdit.nalog_mode == 1 ? '5' : '4'),
                                'id_sc': res.id_sc,
                                'id_sprav': res.id_sprav,
                                'suma': 0,
                                'cena': 0,
                                'cenabnds': 0,
                                'sumands': 0,
                                'sumabnds': 0
                            });
                        winSbEdit.dontClose = false;
                        grdSD.resumeEvents();
                    }
                );
            }
            else {
                var res = records[records.length - 1].data;

                if (_recGrid.data.B_TYPE != 4 && _recGrid.data.B_TYPE != 5)
                    winSbEdit.down('[name=grd_sostav]').store.insert(records.length, {
                        'npp': res.npp,
                        'id': 0,
                        'id_oper': _recGrid.data.id,
                        'an_typ': An.getTextAnalit(res.npp),
                        'double': 0,
                        'nomenkl': '',
                        'nds_id': (winSbEdit.nalog_mode == 1 ? '5' : '4'),
                        'id_sc': res.id_sc,
                        'id_sprav': res.id_sprav,
                        'suma': 0,
                        'cena': 0,
                        'cenabnds': 0,
                        'sumands': 0,
                        'sumabnds': 0
                    });
                winSbEdit.dontClose = false;
                grdSD.resumeEvents();
            }
            let countOfLeftovers = 0;
            Ext.Array.each(records, function (_r) {
                countOfLeftovers ++;
                if (countOfLeftovers>30){
                    return false;
                }
                _r.set('an_typ', An.getTextAnalit(_r.get('npp')));
                _ajax(
                    dir_start_buh_ + "salesbook_proceed.php",
                    {
                        'task': 'getOstat',
                        'sc':_r.data.id_sc,
                        'id_sprav': _r.data.id_sprav,
                        'items_id': _r.data.items_id,
                        'sklad_id':_recGrid.data.SKLAD_ID ,
                        'dat':_recGrid.data.dat_ship,
                        'typ_doc': _recGrid.data.TYP_OPER,
                        'id_doc': _recGrid.data.id,
                    },
                    function (_ans) {
                        let ans = Ext.decode(_ans, false);
                        if (winSbEdit.fifo==1) {
                            _r.set('ost', ans.ostat);
                        } else{
                            _r.set('ost', ans.ostat+_r.data.kol);
                        }
                        grdSostav.getView().refresh();
                    }
                );
            });
            winSbEdit.down('[name=grd_sostav]').view.refresh();
            if (_recGrid.data.id_j_dr == 0) {
                _recGrid.data.vdr = 'В книге не отражать';
            }
            winSbEdit.down('#grd_dir').view.refresh();
        });

    },

    fillWindow: function () {
        // Заполнение сделки данными
        var winSbEdit = this.getWinBuy(),
            grdPay = winSbEdit.down('#gridPay'),
            grdTrace = winSbEdit.down('#gridTrace'),
            grdEDO = winSbEdit.down('#grdEDO'),
            grdProv = winSbEdit.down('#grdProv'),
            grdDoc = winSbEdit.down('#gridDoc'),
            grdSD = Ext.getCmp('docsGrid' + winSbEdit.id_tab),
            _recGrid = winSbEdit.recGrid,
            An = Ext.create('Buh.classes.common.Values'),
            helpBtn = winSbEdit.down('[name=help_button]'),
            gridTrace = winSbEdit.down('#gridTrace'),
            videoBtn = winSbEdit.down('[name=video_button]');

        // Запрет на закрытие кликом вне окна
        winSbEdit.dontClose = true;
        if (buh_show_col != 1) {
            winSbEdit.down('#grd_sostav').columns[1].hide();
        }
        else {
            winSbEdit.down('#grd_sostav').columns[1].show();
        }


        // Вешаем тултипы
        let tipPosition = function () {
            let x = this.target.getX();
            let y = this.target.getY();
            return [x - (this.getWidth() - this.target.getWidth()), this.target.getHeight() + y + 1];
        }
        let beforeTipShow = function () {
            return !(helpBtn.menu.isVisible() || videoBtn.menu.isVisible());
        }
        winSbEdit.down('[name=help_button]')._tip = Ext.create('Ext.tip.ToolTip', {
            target: helpBtn.getId(),
            html: 'Инструкции в справочной системе Бухсофт',
            listeners: {
                beforeshow: beforeTipShow
            },
            getTargetXY: tipPosition
        });
        winSbEdit.down('[name=video_button]')._tip = Ext.create('Ext.tip.ToolTip', {
            target: videoBtn.getId(),
            html: 'Видеоинструкции',
            listeners: {
                beforeshow: beforeTipShow
            },
            getTargetXY: tipPosition
        });

        // грузим гриды
        if (currYear>2020) {
            grdTrace.store.proxy.extraParams = {
                id_sb: _recGrid.data.id,
                typ_oper: _recGrid.data.TYP_OPER,
                yearDatabase: currYear
            };
            grdTrace.store.load(function (records, operation, success) {
                grdTrace.store.insert(records.length, {
                    'id': 0,
                    'id_sb': _recGrid.data.id,
                    'id_sprav': 0,
                    'items_id': 0,
                    'kol': 0
                });
            });
        }

        this.fillSostavGrid();

        grdPay.store.proxy.extraParams = {id_sb: _recGrid.data.id};
        grdPay.store.load();
        grdEDO.store.proxy.extraParams = {id: _recGrid.data.id};
        grdEDO.store.load();

        winSbEdit.down('#grd_dir').store.proxy.extraParams = {tab: 101, id_sb: _recGrid.data.id};
        winSbEdit.down('#grd_dir').store.load();

        grdProv.store.proxy.extraParams = {tab: 150, id_sb: _recGrid.data.id, t_sb: _recGrid.data.TYP_OPER};
        grdProv.store.load();

        grdDoc.store.proxy.extraParams = {tab: 112, id_sb: _recGrid.data.id};
        grdDoc.store.on('load',
            function (store, records) {
                if (winSbEdit.nalog_mode != 1 &&
                    winSbEdit.nalog_mode != 2 &&
                    !(winSbEdit.nalog_mode == 0 & gl_obj_nal == 2)) return;
                if (currYear < 2021) {
                    if (winSbEdit.down('[name=btnAddSFA]'))
                        winSbEdit.down('[name=btnAddSFA]').hide();

                    Ext.Array.each(records, function (rec) {
                        if (rec.data.typ_doc == 4 || rec.data.typ_doc == 18) winSbEdit.down('[name=btnAddSFA]').show();
                    });
                }
                else {
                    let haveAvans = 0;
                    grdProv.store.each(function (rec) {
                        if (Ext.Array.contains(['60.1', '76.10'], rec.data.sc_c) ||
                            Ext.Array.contains(['62.1', '76.10'], rec.data.sc_d))
                            haveAvans++;
                    });
                    if (haveAvans > 0)
                        winSbEdit.down('[name=btnAddSFA]').show();
                    else
                        winSbEdit.down('[name=btnAddSFA]').hide();
                }
            });

        // Заполнение полей и заголовков
        var dt = _recGrid.data.FACTURADAT
        var contr = Ext.Date.format(dt, 'd') * 1 + ' ' + Date.monthNamesShort[dt.getMonth()] + ' ' + Ext.Date.format(dt, 'Y');// +" "+_recGrid.data.org_nam;
        if (_recGrid.data.dog_nam != "")
            contr += "  &#183;  Договор " + _recGrid.data.dog_nam;
        else
            contr += "  &#183;  Без договора ";

        if (_recGrid.data.sklad_name != "")
            contr += "  &#183;  " + _recGrid.data.sklad_name;

        if (_recGrid.data.TYP_OPER == 2 && (_recGrid.data.B_TYPE == 1 || _recGrid.data.B_TYPE == 3)) {
            var _pref = _recGrid.data.B_TYPE == 1 ? "Комитент" : 'Принципал',
                _nm = _recGrid.data.principal_name != "" ? _recGrid.data.principal_name : "не указан";
            contr += "  &#183;  " + _pref + " " + _nm;
        }

        if (_recGrid.data.B_TYPE == 4 || _recGrid.data.B_TYPE == 5) {
            winSbEdit.down('[name=btn_komis]').show();
//             winSbEdit.down('#btnSendCheck').hide();
            winSbEdit.down('#btnCopySb').hide();
        }

        if (winSbEdit._inp_par._mode != 1)
            winSbEdit.down('#title').setText(_recGrid.data.org_id != 0 ? _recGrid.data.org_nam : "Без контрагента");
        else {
            winSbEdit.down('#title').setText(winSbEdit._inp_par._id_tab == 100 ? "Новая покупка" : "Новая продажа");
            winSbEdit.down('[name=n_doc]').addCls('b-head-btn-nolink')
        }

        if ((_recGrid.data.PRICE_ID * 1) > 0) {
            winSbEdit.down('#title').update("Счет-фактура корректировочный от ");
            winSbEdit.down('#btnAddPay').hide();
            winSbEdit.down('#btnCopySb').hide();
            winSbEdit.down('#btnAddDoc').hide();
        }

        winSbEdit.down('[name=l1]').setText(contr);
        winSbEdit.down('[name=org_id]').setValue(_recGrid.data.org_id);

        if (_recGrid.data.org_id != 0 || winSbEdit._inp_par._mode != 1) {
            winSbEdit.down('[name=org_warning]').hide();
        }
        if (_recGrid.data.org_id != 0) {
            winSbEdit.down('[name=org_nam]').setValue(_recGrid.data.org_nam);
            winSbEdit.down('[name=buyOrgDog]').setFilter('org_id=' + _recGrid.data.org_id);
            winSbEdit.down('[name=buyOrgDog]').org_id = _recGrid.data.org_id;
            winSbEdit.down('[name=buyOrgDog]').org_nam = _recGrid.data.org_nam;
            winSbEdit.down('[name=dog_id]').setValue(_recGrid.data.id_dog);
            winSbEdit.down('[name=dog_nam]').setValue(_recGrid.data.dog_nam || "Без договора");
        }

        winSbEdit.down('[name=facturadat]').setValue(_recGrid.data.FACTURADAT);
        winSbEdit.down('[name=sklad_id]').setValue(_recGrid.data.SKLAD_ID);
        winSbEdit.down('[name=sklad_nam]').setValue(_recGrid.data.sklad_name);
        this.setKomisMode(_recGrid.data.B_TYPE, false);

        var d = new Date();

        winSbEdit.startPodborTime = d.getTime();


        var me = this;
        win = me.getWinBuy();
//         var  btn = bsPanel.down('greenbutton');

        win.fillKomissionReward();
    },

    showWin: function (win) {

        var me = this,
            win = this.getWinBuy();
        facturadat = win.down('[name=facturadat]').getValue();
        storeGlobalSc.getCurrentPlan(Ext.Date.format(facturadat, 'Y'));

    },


    setDatDeal: function (dtf) {
        // Изменить дату сделки
        this.getWinBuy().updateRec(10);
    },

    datDealChanged:function (dtf) {
        // изменена дата сделки
        let winSbEdit = this.getWinBuy();

        winSbEdit.fifo = goodsPoliticArray[dtf.getValue().getFullYear()];
        winSbEdit.nalog_mode = taxPoliticArray[dtf.getValue().getFullYear()];
        //winSbEdit.down('#tabUsnoShow').setVisible(winSbEdit.nalog_mode!=1);
        winSbEdit.down('#tabUsnoShow').tab.setVisible(winSbEdit.nalog_mode!=1);
      //  this.getWinBuy().updateRec(10);
    },

    setGold: function (btn) {
        // Выдеклить желтым цветом шапку сделки
        var me = this,
            win = this.getWinBuy();

        if (this.getWinBuy().down('alt_container').state == 1) {
            me.getWinBuy().down('[name=l1]').addCls('buy_hover');
        }

    },


    unSetGold: function (btn) {
        // Снять выделение желтым цветом шапку сделки
        var me = this;
        me.getWinBuy().down('[name=l1]').removeCls('buy_hover');
    },

    editHeaderDeal: function (btn) {
        // Редактировать шапку сделки
        if (this.getWinBuy().down('alt_container').state == 1) {
            this.getWinBuy().down('[name=l1]').removeCls('buy_hover');
            this.getWinBuy().down('[name=n_doc]').addCls('b-head-btn-nolink')
//           this.getWinBuy().down('[name=n_doc]').removeCls('buy_hover');
            this.getWinBuy().down('alt_container').down('#switchBtn').handler();
        }
    },

    closeWin: function (btn) { // закрыть окно сделки
        this.getWinBuy().close();
    },

    menuHandler: function (menu, item, e, eOpts) {
        window.open(item.link);
    },

    menuBeforeShow: function (menu, eOpts) {
        let grid = this.getGridSost(), win = this.getWinBuy();
        let b_type = win.recGrid.data.B_TYPE || win.down('[name=b_type]').getValue();
        let commissionTypes = ['1', '3'];
        let isCommissionType = b_type && Ext.Array.contains(commissionTypes, b_type);

        // если комиссионные товары (b_type = 1 || 3), то показываем только соответствующий пункт меню item.b_type = 1,
        // иначе все остальные
        menu.items.each(function (item) {
            let isItemCommissionType = Ext.Array.contains(commissionTypes, item.b_type);
            (isCommissionType && isItemCommissionType) || !(isCommissionType || isItemCommissionType) ? item.show() : item.hide();
        }, this);
    },

    beforeEditSostav: function (editor, e, o) { // Перед редактированием грида с составом

        var grid = this.getGridSost(),
            curRec = grid.getSelectionModel().getSelection()[0],
            winSbEdit = this.getWinBuy(),
            win = this.getWinBuy();
        b_type = win.down('[name=b_type]').getValue();

        if (b_type == 4 || b_type == 5)
            return false;

        this.getWinBuy().fireEvent('startEditSostav');
        switch (e.field) {
            case 'an_typ':
                var _block = 0,
                    An = Ext.create('Buh.classes.common.Values');
                if (grid.store.count() > 1 && winSbEdit.nalog_mode != 1) {
                    _block = curRec.data.npp;
                }

                e.column.getEditor().setStoreTyp(this.getWinBuy().id_tab);
                e.column.getEditor().setAllowAn(_block);

                break

            case 'id_sc':

                var st = this.getStore('Buh.store.global.ScStore').getScFiltered(this.getWinBuy().id_tab == 100 ? 1 : 2, e.record.data.npp);
                e.column.getEditor().bindStore(st);

                if (b_type == 1 && (grid.store.count() > 2 || e.rowIdx == 1))  // Проверка на комиссию
                {
                    return false;
                }

                if (b_type == 3 && (grid.store.count() > 2 || e.rowIdx == 1))  // Проверка на комиссию
                {
                    return false;
                }

                if (b_type == 0 && (grid.store.count() > 2 || e.rowIdx == 1))  // Проверка на комиссию
                {
                    e.column.getEditor().store.filter([
                        {
                            filterFn: function (item) {
                                return item.get("sc_ssc") != '004.' && item.get("sc_ssc") != '002.1' && item.get("sc_ssc") != '76.6';
                            }
                        }
                    ]);
                }

                break
            case 'edizm_nam':
                var cEiName = e.column.getEditor();
                if (e.record.data.edizm_nam != null) {
                    cEiName.setValue(Ext.String.trim(" " + e.record.data.edizm_nam));
                    cEiName.setRawValue(Ext.String.trim(" " + e.record.data.edizm_nam));
                }
                else {
                    cEiName.setValue("");
                }
                cEiName.store.proxy.extraParams.query = "";
                cEiName.store.load();
                break
            default:
                break
        }
    },

    setTypeRow: function (rec) { // Выбрать тип номенклатуры
        var win = this.getWinBuy(),
            _recGrid = win.recGrid,
            grid = this.getGridSost(),
            An = Ext.create('Buh.classes.common.Values'),
            curRec = grid.getSelectionModel().getSelection()[0];
        curRec.set('npp', rec.data.id * 1);
        curRec.set('id_sprav', rec.data.id_sprav * 1);
        curRec.set('id_sc', An.getScAnalit(win.id_tab == 100 ? 1 : 2, rec.data.id));
        grid.plugins[0].startEdit(curRec, 2);

        this.setDiR();

    },

    setDiR: function () {
        //Задать Дир в зависимости от счета и вида аналитики
        var win = this.getWinBuy(),
            _recGrid = win.recGrid,
            grid = this.getGridSost(),
            curRec = grid.getSelectionModel().getSelection()[0];

        _ajax(
            dir_start_buh_ + 'salesbook_proceed.php',
            {
                task: 'setvdr',
                id_sb: _recGrid.data.id,
                sc: curRec.data.id_sc,
                sprav: curRec.data.npp * 1
            },
            function (_ans) {
                var ret = Ext.decode(_ans);
                _recGrid.data.id_j_dr = ret.data.id_j_dr;
                _recGrid.data.vdr = ret.data.vdr;
            }
        );


    },

    sostavChange: function () {
        // Изменился состав сделки
        var sb = 0,
            n = 0,
            s = 0,
            k = 0,
            sdKomis = 0,
            itTotal = 0,
            isAnOther = 0,
            isTovar = 0,
            isScOther = 0,
            is002 = 0,
            is004 = 0,
            g = this.getGridSost(),
            _recGrid = this.getWinBuy().recGrid;
        if (g == _dummy) {
            return false;
        }
        g.store.each(function (rec) {
            if (rec.data.nomenkl != "") {
                itTotal++;
                if (rec.data.id_sprav == 5)
                    isTovar++;
                else
                    isAnOther++;

                if (rec.data.id_sc == '004.')
                    is004++;
                else if (rec.data.id_sc == '002.1')
                    is002++;
                else
                    isScOther++;
                k += rec.data.kol * 1;
                sb += rec.data.sumabnds * 1;
                n += rec.data.sumands * 1;
                s += rec.data.suma * 1;
            }
        });
        var firstRec = g.store.getAt(0);
        lastRec = g.store.getAt(g.store.count() - 1);
        if (isTovar == itTotal && (is004 == itTotal || is002 == itTotal) && itTotal > 0) {
            sdKomis = 1;
            lastRec.set('id_sc', firstRec.data.id_sc);
        }
        else {
            sdKomis = 0;
            if (this.getWinBuy().down('[name=b_type]').getValue() == 1 && lastRec.data.id_sprav * 1 == 5) {
                lastRec.set('id_sc', '41.1');
            }
            if (this.getWinBuy().down('[name=b_type]').getValue() == 3 && lastRec.data.id_sprav * 1 == 4) {
                lastRec.set('id_sc', '90.1');
            }
        }
        this.getWinBuy().down('[name=b_type]').setValue(sdKomis);
        g.getView().refresh();
        g.down('#sostavIKol').update(k);
        g.down('#sostavI').update(ruFormat(s.toFixed(2)));
        g.down('#sostavIBnds').update(ruFormat(sb.toFixed(2)));
        g.down('#sostavInds').update(ruFormat(n.toFixed(2)));
        _recGrid.data.summa = s;
        _recGrid.data.summands = n;

    },


    setKomisMode: function (_inp, _mode) {
        var me = this,
            win = this.getWinBuy(),

            _recGrid = win.recGrid;
        if (_inp == undefined)
            _inp = this.getWinBuy().down('[name=b_type]').getValue();

        if ((win.down('[name=b_type]').getValue() * 1) == (_inp * 1)) return;
        win.down('[name=b_type]').setValue(_inp);

        if (_inp == 0 || _recGrid.data.TYP_OPER == 1) {
            win.down('tabpanel').child('#tabKomisDeal').tab.hide();
//           win.down('#tabKomisDeal').hide();
        }
        else {
            if (_inp == 1 || _inp == 3) {
                win.down('tabpanel').child('#tabKomisDeal').tab.show();

                if (_inp == 1)
                    var ttl = "Комиссионное вознаграждение";
                else
                    var ttl = "Агентское вознаграждение";

                win.down('tabpanel').child('#tabKomisDeal').setTitle(ttl);

                if (_recGrid.data.principal == 0)
                    win.down('tabpanel').child('#tabKomisDeal').tab.card.tab.addCls('color-orange');


            }

        }

        if (_inp == 1 || _inp == 3) {

            _recGrid.data.id_j_dr = 0;
            _recGrid.data.vdr = 'В книге не отражать';
            win.down('#grd_dir').view.refresh();

        }
        if (!_mode) return;

        var g = this.getGridSost(),
            sc_komis = '';
        if (g == _dummy) {
            return false;
        }
        g.store.each(function (rec) {
            if (sc_komis == '')
                sc_komis = rec.data.id_sc;
            else {
                if (_inp == 1) {
                    if (rec.data.id_sprav != 5) {
                        rec.set('id_sprav', 5);
                        rec.set('npp', 5);
                        rec.set('items_id', 0);
                    }
                    rec.set('id_sc', sc_komis);
                }
                else if (_inp == 3) {
                    if (rec.data.id_sprav != 4) {
                        rec.set('id_sprav', 4);
                        rec.set('npp', 42);
                        rec.set('items_id', 0);
                    }
                    rec.set('id_sc', sc_komis);
                }
                else {
                    if (rec.data.id_sc == '004.' || rec.data.id_sc == '002.1')
                        rec.set('id_sc', '41.1');
                    if (rec.data.id_sc == '76.6')
                        rec.set('id_sc', '90.1');
                }
            }

        });


        g.getView().refresh();

    },

    setAgetntData: function () {
        // Сменяется поле в комиссии
        var _args = arguments[0],
            me = this,
            win = this.getWinBuy(),
            _recGrid = win.recGrid,
            pnl = win.down('#tabKomisDeal');

        if (pnl.fillReward == 1 || (_args.name == 'summa' && pnl.down('[name=way_calc_reward]').getValue() != 3))
            return;
        if (me.taskSetReward != null)
            me.taskSetReward.cancel();

        me.taskSetReward = new Ext.util.DelayedTask(function () {
            var _par = {
                nakl_id: _recGrid.data.id,
                dat: Ext.Date.format(pnl.down('[name=dat]').getValue(), 'Y-m-d'),
                principal: pnl.down('[name=komit]').getValue(),
                id_dog_komis: pnl.down('[name=kom_dog]').getValue(),
                nds_id: pnl.down('[name=nds_id]').getValue(),
                percent: pnl.down('[name=percent]').getValue(),
                way_calc_reward: pnl.down('[name=way_calc_reward]').getValue(),
            };
            if (pnl.down('[name=way_calc_reward]').getValue() == 3) {
                _par.summa = pnl.down('[name=summa]').getValue();
            }

            if (pnl.down('[name=komit]').getValue() != 0) {
                win.down('tabpanel').child('#tabKomisDeal').tab.card.tab.removeCls('color-orange');
                _recGrid.data.principal = pnl.down('[name=komit]').getValue();
            }
            _ajax(dir_start_buh_ + 'agent_add.php ', _par,
                function (ret) {
                    var ans = Ext.decode(ret);
                    if (pnl.down('[name=way_calc_reward]').getValue() < 3) {
                        pnl.fillReward = 1;
                        pnl.down('[name=summa]').setValue((ans.reward * 1).toFixed(2));
                        pnl.fillReward = 0;

                    }
                    me.setAgetntRewardStatus(ans);
                }
            );

        });

        me.taskSetReward.delay(50);
    },

    setAgetntRewardStatus: function (ans) {
        // Обновляем статус панели с вознаграждением
        var me = this,
            win = this.getWinBuy(),
            winSbEdit = this.getWinBuy(),
            _recGrid = win.recGrid,
            pnl = win.down('#tabKomisDeal'),
            _way = pnl.down('[name=way_calc_reward]').getValue(),
            _nds = ans.rewardnds * 1,
            _org_id = pnl.down('[name=komit]').getValue();

        pnl.down('#setTheAgent').setVisible(_org_id == 0);
        pnl.down('#cont-reward').setVisible(_org_id != 0 && _way != 4);
        pnl.down('[name=c-prc]').setVisible(_way == 2);
        pnl.down('[name=summa]').setDisabled(_way != 3);
        pnl.down('#btnReport').setVisible(_way == 4);
        pnl.down('[name=c-nds]').setVisible(winSbEdit.nalog_mode == 1);
        pnl.down('#setComments').setVisible(_org_id != 0);
        pnl.down('[name=cnt-dat]').setVisible(_org_id != 0 && _way != 4);
        var noteText = "";
        if (pnl.down('[name=way_calc_reward]').getValue() == 1) {
            noteText = "(Цена продажи (" + (ans.rewarddata.sum_sd * 1).toFixed(2) + ") - Цена покупки(" + (ans.rewarddata.sum_buy * 1).toFixed(2) + ") = " + (ans.reward * 1).toFixed(2);
        }
        if (pnl.down('[name=way_calc_reward]').getValue() == 2) {
            noteText = "Цена продажи (" + (ans.rewarddata.sum_sd * 1).toFixed(2) + ") * " + (ans.rewarddata.percent * 1).toFixed(2) + " % = " + (ans.reward * 1).toFixed(2);
        }
        pnl.down('#setComments').update(noteText);
        pnl.down('[name=note]').update(_nds.toFixed(2));

    },

    goToAgent: function () {
        // В закладку со отчетами агентов
        document.getElementById("mn1-1-72").click();

    },

    fillKomitDogovor: function () {
        // заполнить договора для выбранного контрика
        var me = this,
            win = this.getWinBuy(),
            _recGrid = win.recGrid,
            pnl = win.down('#tabKomisDeal'),
            _way = pnl.down('[name=way_calc_reward]').getValue(),
            _org_id = pnl.down('[name=komit]').getValue();
        pnl.down('[name=kom_dog]').setFilter('org_id=' + _org_id);

    },


});
