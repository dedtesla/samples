Ext.define('Buh.classes.managers.buhManager', {
    open: false,
    d1: '',
    d2: '',
    dFilt1: '',
    dFilt2: '',
    provId: 0,
    typDoc: 0,
    dealId: 0,
    source: 0,
    docId: 0,
    origin: 0,
    boolOpenDoc: false,
    mn: '1',
    yr: '0',
    id_os: 0,
    tree: null,
    allowLoadBank: true,
    task: '',
    period: '',
    periodVal: null,
    dateRanges: null,
    callback: null,
    taskAction: null,
    disableFilter: false,
    rsmyId: null,
    name: null,

    openTab: function (_rec) {
        let me = this,
            sprav = 0;

        me.source = _rec.source;
        me.docId = _rec.source_id;
        me.task = _rec.task || '';
        me.subTab = _rec.subTab || 100;
        me.period = _rec.period || '';
        me.periodVal = _rec.periodVal || null;
        me.callback = _rec.callback || null;
        me.taskAction = _rec.taskAction || null;
        me.taskData = _rec.taskData || null;
        me.dFilt1 = _rec.dFilt1;
        me.dFilt2 = _rec.dFilt2;
        me.disableFilter = _rec.disableFilter || false;
        me.rsmyId = _rec.rsmyId || null;
        me.name = _rec.searchCname || null;
        me.callback = _rec.callback || null;

        me.setPeriod();

        let _input = {},
            _fn = null,
            tabName = '',
            gridName = '';

        switch (me.source) {
            case 1:
            case 2:
                let gridName2 = '';
/*
                if (me.callback != null && 1==2) {
                    if (typeof me.callback == 'function') {
                        me.callback.call(this, grid);// error
                    } else {
                        eval(me.callback);
                    }
                 } else {
*/

                    // Сделки
                    if (me.source == 1) {
                        tabName = "mn1-1-01";
                        gridName2 = 'docsGrid100';
                    } else {
                        tabName = "mn1-1-02";
                        gridName2 = 'docsGrid110';
                    }

                    document.getElementById(tabName).click();

                    _fn = function () {
                        let grid = Ext.getCmp(gridName2),
                            store = grid.store,
                            panel = grid.up('panel'),
                            filterCount = 2;

                        let flt = [
                            {
                                name: "dat_doc1",
                                value: Ext.Date.format(me.d1, 'Y-m-d'),
                                init: Ext.Date.format(me.d1, 'Y-m-d'),
                                id: "periodSBFilter_dat_doc1"
                            },
                            {
                                name: "dat_doc2",
                                value: Ext.Date.format(me.d2, 'Y-m-d'),
                                init: Ext.Date.format(me.d2, 'Y-m-d'),
                                id: "periodSBFilter_dat_doc2"
                            },
                            {
                                name: "org_id",
                                value: me.docId,
                                init: "0",
                                id: ""
                            },
                            {
                                name: "org_nam",
                                value: _rec.name,
                                init: undefined,
                                id: ""
                            }
                        ];

                        switch (me.task) {
                            case 'filter':
                                if (me.taskAction != _dummy) {
                                    Ext.each(me.taskAction, function (val) {
                                        if (val.xtraParam == 'id_sprav') store.proxy.extraParams.id_sprav = val.value;
                                        else if (val.xtraParam == 'id_analit') store.proxy.extraParams.id_analit = val.value;

                                        flt.push(
                                            {
                                                name: val.name,
                                                value: val.value,
                                                init: val.init,
                                                id: val.id
                                            }
                                        );

                                        filterCount++;
                                    });
                                } else if (me.taskData != _dummy) {
                                    store.proxy.extraParams.nm = me.taskData;
                                }
                                break;
                            case 'edit':
                                let _win = Ext.getCmp('winSbCard');
                                me.disableFilter = true;
                                if (_win) {
                                    _win.close();
                                }
                                break;
                        }

                        if (!me.disableFilter && filterCount) {
                            let _btn = panel.down('#btnMainFilt');
                            _btn.filt = flt;
                            _btn.setText("<i>" + filterCount + "</i>Р¤РёР»СЊС‚СЂ");
                            _btn.setIcon("");
                            _btn.addCls('ico_number');
                        }

                        store.proxy.extraParams.dat1 = Ext.Date.format(me.d1, 'Y-m-d');
                        store.proxy.extraParams.dat2 = Ext.Date.format(me.d2, 'Y-m-d');

                        store.load({
                            callback: function () {
                                switch (me.task) {
                                    case 'add':
                                        panel.down('#btnAddSB').org_id = me.docId;
                                        panel.down('#btnAddSB').org_nam = _rec.name;
                                        panel.down('#btnAddSB').handler();
                                        if (me.taskAction == 10) {
                                            /** GBS-11937. Открытие вкладки Документы в карточке сделки. */
                                            // Добавить счет-фактуру исходящий
                                            // Добавить ТОРГ-12 исходящий
                                            // Добавить акт выполненных работ исходящий
                                            // Добавить акт оказанных услуг исходящий
                                            // Добавить доверенность
                                            _fnAddDoc = function () {
                                                let _win = Ext.getCmp('winSbCard');
                                                _win.down('[name=tbPanel]').setActiveTab(3);
                                            }
                                            Ext.defer(_fnAddDoc, 200);
                                        } else if (me.taskAction == 20) {
                                            // Оприходовать/Реализовать товар (me.taskData = 5)
                                            // Оприходовать канцтовары (me.taskData = 3)
                                            // Оприходовать/Реализовать материал (me.taskData = 3)
                                            // Оприходовать/Реализовать основное средство (me.taskData = 1)
                                            // Оприходовать/Реализовать НМА (me.taskData = 2)
                                            // Оприходовать РБП (me.taskData = 32)
                                            // Реализовать продукцию (me.taskData = 4)
                                            _fnSetSostavType = function () {
                                                let _win = Ext.getCmp('winSbCard'),
                                                    _grid = _win.down('[name=grd_sostav]'),
                                                    _store = _grid.store,
                                                    _recGrid = _win.recGrid,
                                                    _values = Ext.create('Buh.classes.common.Values');

                                                _store.load(
                                                    function (records, operation, success) {
                                                        _ajax(
                                                            dir_start_buh_ + 'form.php',
                                                            {'action': ((_recGrid.data.TYP_OPER * 1) == 1) ? 'lastBuy' : 'lastSale'},
                                                            function (_ans) {
                                                                _store.insert(records.length, {
                                                                    'npp': me.taskData,
                                                                    'id': 0,
                                                                    'id_oper': _recGrid.data.id,
                                                                    'an_typ': _values.getTextAnalit(me.taskData),
                                                                    'double': 0,
                                                                    'nomenkl': '',
                                                                    'nds_id': (buh_nalog_mode == 1 ? '5' : '4'),
                                                                    'id_sc': _values.getScAnalit(me.source, me.taskData),
                                                                    'id_sprav': me.taskData,
                                                                    'suma': 0,
                                                                    'cena': 0,
                                                                    'cenabnds': 0,
                                                                    'sumands': 0,
                                                                    'sumabnds': 0
                                                                });

                                                                _store.removeAt(1);
                                                            }
                                                        );
                                                    }
                                                );

                                                _grid.view.refresh();
                                            }

                                            Ext.defer(_fnSetSostavType, 500);
                                        }
                                        break;
                                    case 'edit':
                                        let rec = grid.store.getById(me.docId);
                                        if (rec) {
                                            grid.getSelectionModel().select(rec, false, true)
                                            grid.fireEvent('celldblclick', null, null, null, rec, null, null, null, null, function (sdCard) {
                                                if (me.subTab && sdCard) {
                                                    let panel = sdCard.down('tabpanel');
                                                    if (panel) {
                                                        panel.setActiveTab(me.subTab)
                                                    }
                                                }
                                            });
                                        }
                                    default:
                                        if (me.callback != null) {
                                            if (typeof me.callback == 'function') {
                                                me.callback.call(this, grid);
                                            } else {
                                                eval(me.callback);
                                            }
                                        }
                                }
                            }
                        });

                        panel.down('#dat1_ap').setRawValue(Ext.Date.format(me.d1, panel.down('#dat1_ap').format));
                        panel.down('#dat2_ap').setRawValue(Ext.Date.format(me.d2, panel.down('#dat2_ap').format));
                        if (me.task == 'filter' && me.taskData != _dummy) {
                            panel.down('[name=contraFilt]').setValue(me.taskData.find);
                        }
                    }

                    Ext.defer(_fn, 500);
                    break;
                // }
            case 3:
                //Банк
                me.allowLoadBank = false;
                me.docId = me.docId || 0;

                document.getElementById("mn1-1-03").click();

                _fn = function (_ans) {
                    let ans = Ext.decode(_ans),
                        panel = Ext.getCmp('bankMainSceern'),
                        grid = panel.down('grid'),
                        rsCombo = panel.down('[name=bankSet]'),
                        currRsMy = "" + rsCombo.getValue(),
                        store = panel.down('grid').store,
                        params = {
                            period_dat_doc1 : Ext.Date.format(me.d1, 'Y-m-d'),
                            period_dat_doc2 : Ext.Date.format(me.d2, 'Y-m-d')
                        };

                    if (ans.rsmy_id > 0 && ans.rsmy_id != currRsMy) {
                        rsCombo.setValueSilent(currRsMy, ans.rs_name);
                    }

                    grid.resetFilter(params, function () {
                        panel.down('[name=text_filt]').setValue('');
                        panel.down('[name=text_filt]').setValue(_rec.searchCname);
                        me.allowLoadBank = true;

                        switch(me.task) {
                            case 'add':
                            case 'edit':
                                let _callback = function (_args) {
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(0);
                                    });
                                    grid.store.reload();
                                }

                                let data = {
                                    'id': 0,
                                    'oper': 1,
                                    'dat': oDefaults.date,
                                    'rsmy_id' : Ext.getCmp('bankSet').getValue(),
                                    'rsmy_nam' : Ext.getCmp('bankSet').getRawValue() ,
                                    'callback': _callback,
                                    'searchCid' : me.docId,
                                    'searchCname' : me.name
                                };

                                let win = Ext.create('Buh.view.bank.Edit');
                                win.open(data);
/*
                                _fnWait = function () {
                                    let _callback = function (_ans) {
                                        store.load();
                                    }

                                    bankEdit({
                                        _id: 0,
                                        oper: me.taskAction,
                                        df: oDefaults.date,
                                        rsmy_id : Ext.getCmp('bankSet').getValue(),
                                        rsmy_nam : Ext.getCmp('bankSet').getRawValue() ,
                                        searchCid : me.docId,
                                        searchCname : me.name,
                                        callback : _callback
                                    });
                                }

                                Ext.defer(_fnWait, 300);
*/
                                break;
                            case 'find':
                                oTotalGrid.grd125 = me.docId;
                                grid.scrollTo(me.docId)
                                break;
                            default:
                                if (me.taskAction == 10) {
                                    // Загрузить выписку клиент-банка
                                    let _btn = Ext.ComponentQuery.query('filefield[name=filename]');
                                    _btn[0].fileInputEl.dom.click();
                                } else if (me.taskAction == 20) {
                                    // Реестр банковских документов
                                    // Печать исходящих платежных документов
                                    // Анализ счета
                                    // Оборотно-сальдовая ведомость по счету
                                    // Карточка счета
                                    let _bank = panel.down('[name=bankSet]').getValue();
                                    PrnAnSchOSV_New(panel, _bank);
                                }
                        }

                        if (me.callback != null) {
                            if(typeof me.callback == 'function') {
                                me.callback.call(this, grid);
                            } else {
                                eval(me.callback);
                            }
                        }
                    });
                }

                _ajax(
                    dir_start_buh_ + 'buhmanager/locatefirst/',
                    {
                        'source': 'bank',
                        'org_id': _rec.source_id,
                        yearDatabase: currYear
                    },
                    _fn
                );

                break;

            case 4:
                me.allowLoadKassa = false;
                me.docId = me.docId || 0;

                document.getElementById("mn1-1-04").click();

                _fn = function (_ans) {
                    let ans = Ext.decode(_ans),
                        panel = Ext.getCmp('kassaMainScreen'),
                        rsCombo = panel.down('[name=kassaSet]'),
                        currRsMy = "" + rsCombo.getValue(),
                        store = panel.down('grid').store;

                    panel.down('#dat1_ap').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                    panel.down('#dat2_ap').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                    store.proxy.extraParams.tab = 120;
                    store.proxy.extraParams.dat1 = Ext.Date.format(me.d1, 'Y-m-d');
                    store.proxy.extraParams.dat2 = Ext.Date.format(me.d2, 'Y-m-d');
                    if (ans.kassa_id > 0)
                        store.proxy.extraParams.kassa_id = ans.kassa_id;

                    store.load({
                        callback: function () {
                            panel.down('[name=text_filt]').setValue('');
                            panel.down('[name=text_filt]').setValue(_rec.name);
                            me.allowLoadKassa = true;

                            if (me.task == 'add' || me.task == 'edit') {
                                kassaEdit(me.docId);
                                let _frm = docKassaBottom.getForm();
                                _frm.findField('id_oper').setValue(iif(me.taskAction > 0, me.taskAction, 5));
                            } else {
                                if (me.taskAction == 10) {
                                    kasBook();
                                } else if (me.taskAction == 20) {
                                    openPrinORD();
                                }
                            }
                        }
                    });

                }

                _ajax(
                    dir_start_buh_ + 'buhmanager/locatefirst/',
                    {'source': 'kassa', 'org_id': _rec.source_id},
                    _fn
                );
                break;

            case 5:
                // Авансовые отчеты
                document.getElementById("mn1-1-05").click();
                if (me.taskAction == 10) {
                    createAO();
                } else if (me.taskAction == 20) {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }
                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + "./frm_ao_ree.php?dbeg=" + dtoc(Ext.getCmp('periodAO_dat_doc1').getValue()) + "&dend=" + dtoc(Ext.getCmp('periodAO_dat_doc2').getValue()) + "&directprint=true",
                    });
                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                }
                break;

            case 6:
                // Производство
                document.getElementById("mn1-1-06").click();

                let panel = Ext.getCmp('PRMainScreen');

                if (me.taskAction == 10) {
                    // Добавить норму производства
                    prodNormaEdit(0);
                } else if (me.taskAction == 20) {
                    // Списать материалы
                    panel.down('[name=bottomTabs]').setActiveTab(1);

                    if (me.task == 'filter') {
                        let gridName = 'docsGrid655',
                            grid = Ext.getCmp(gridName),
                            store = grid.store;

                        Ext.getCmp('periodPr1_dat_doc1').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                        Ext.getCmp('periodPr1_dat_doc2').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                        grid.store.proxy.extraParams = {
                            'task': 'LIST',
                            'filter': 1,
                            'type': '',
                            'date_b': Ext.Date.format(me.d1, 'Y-m-d'),
                            'date_e': Ext.Date.format(me.d2, 'Y-m-d'),
                            'analit': me.taskData.analit,
                            'prod': me.taskData.find
                        }

                        grid.store.load();

                    }
                    if (me.task == 'open') {
                        let gridName = 'docsGrid655',
                            grid = Ext.getCmp(gridName),
                            store = grid.store;

                        Ext.getCmp('periodPr1_dat_doc1').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                        Ext.getCmp('periodPr1_dat_doc2').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                        grid.store.proxy.extraParams = {
                            'task': 'LIST',
                            'filter': 1,
                            'type': '',
                            'date_b': Ext.Date.format(me.d1, 'Y-m-d'),
                            'date_e': Ext.Date.format(me.d2, 'Y-m-d'),
                        }

                        grid.store.load(function (records, operation, success) {
                            if (me.callback != null)
                                me.callback(grid);
                        });

                    }

                } else if (me.taskAction == 30) {
                    // Выпустить продукцию
                    panel.down('[name=bottomTabs]').setActiveTab(2);

                    if (me.task == 'filter') {
                        let gridName = 'docsGrid656',
                            grid = Ext.getCmp(gridName),
                            store = grid.store;

                        Ext.getCmp('periodPr1_dat_doc1').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                        Ext.getCmp('periodPr1_dat_doc2').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                        grid.store.proxy.extraParams = {
                            'task': 'LIST',
                            'filter': 1,
                            'type': '',
                            'date_b': Ext.Date.format(me.d1, 'Y-m-d'),
                            'date_e': Ext.Date.format(me.d2, 'Y-m-d'),
                            'analit': me.taskData.analit,
                            'prod': me.taskData.find
                        }

                        grid.store.load();
                    }
                    if (me.task == 'open') {
                        let gridName = 'docsGrid656',
                            grid = Ext.getCmp(gridName),
                            store = grid.store;

                        Ext.getCmp('periodPr1_dat_doc1').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                        Ext.getCmp('periodPr1_dat_doc2').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                        grid.store.proxy.extraParams = {
                            'task': 'LIST',
                            'filter': 1,
                            'type': '',
                            'date_b': Ext.Date.format(me.d1, 'Y-m-d'),
                            'date_e': Ext.Date.format(me.d2, 'Y-m-d'),
                        }

                        grid.store.load(function (records, operation, success) {
                            if (me.callback != null)
                                me.callback(grid);
                        });

                    }

                } else if (me.taskAction == 40) {
                    // Незавершенное производство
                    let dt = new Date;
                    panel.down('[name=bottomTabs]').setActiveTab(3);
                    panel.down('[name=period]').setValue("" + (dt.getMonth() + 1));
                }
                break;

            case 7:
                // Расчет амортизации
                tabName = "mn1-1-07";
                document.getElementById(tabName).click();

                if (me.task == 'filter') {
                    let panel = Ext.getCmp('mainPanelAmort'),
                        grid = panel.down('[name=bottomTabs]').down('gridpanel'),
                        dt = new Date;

                    panel.down('[name=bottomTabs]').setActiveTab(0);

                    let _cbMonth = panel.down('[name=bottomTabs]').down('[name=mon]');
                    _cbMonth.setValue('' + (dt.getMonth() + 1));

                    if (me.taskData.find != _dummy) {
                        let _find = panel.down('[name=bottomTabs]').down('[xtype=field_find]');
                        _find.setValue(me.taskData.find);
                    }

                    grid.store.proxy.extraParams = {
                        mn: me.taskData.month,
                        yr: currYear,
                        nmfilt: me.taskData.find
                    };
                    grid.store.load();
                }
                break;

            case 9:
                // Журнал операций и отчеты
                tabName = "mn1-1-09";
                document.getElementById(tabName).click();

                if (me.taskAction == 10) {
                    // Добавить операцию
                    joEdit(0);
                    let panel = Ext.getCmp('scFEdit');
                    let _d = new Date();
                    panel.down('form').down('[name=dat]').setValue(Ext.Date.format(_d, 'Y-m-d'));
                } else if (me.taskAction == 15) {
                    // Выделить операцию
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(0);
                    let _fn = function () {
                        Ext.getCmp('periodJO_dat_doc1').setValue(me.dFilt1);
                        Ext.getCmp('periodJO_dat_doc2').setValue(me.dFilt2);
                        let grid = Ext.getCmp("docsGrid500"),
                            store = grid.store;
                        store.proxy.extraParams = {
                            tab: 500,
                            dat1: me.dFilt1,
                            dat2: me.dFilt2,
                        };

                        store.load({
                            callback: function () {
                                let rec = store.getById(me.docId);
                                Ext.getCmp("docsGrid500").getSelectionModel().select(rec);
                            }
                        });
                    }

                    Ext.defer(_fn, 1000);


                } else if (me.taskAction == 20) {
                    // Оборотно-сальдовая ведомость
                    let panel = Ext.getCmp('joMainSceern');

                    let _fn = function () {
                        panel.down('[name=headerPanel]').setActiveTab(1);

                        let _cb = Ext.getCmp('sc_sscOSVFilt'),
                            grid = Ext.getCmp('treePlanScOSV'),
                            store = grid.store, _subFn,
                            _cbDBeg = Ext.getCmp('periodOSV_dat_doc1'),
                            _cbDEnd = Ext.getCmp('periodOSV_dat_doc2');

                        _cb.setValue(me.taskData.sc);

                        me.d1 = new Date(currYear, 0, 1);
                        me.d2 = new Date(currYear, 11, 31);
                        _cbDBeg.setValue(me.d1);
                        _cbDEnd.setValue(me.d2);

                        store.proxy.extraParams = {
                            sc: me.taskData.sc_ssc,
                            collapse: panel.down('[name=collapse_sdo]').getValue(),
                            dbeg: Ext.Date.format(_cbDBeg.getValue(), 'Y-m-d'),
                            dend: Ext.Date.format(_cbDEnd.getValue(), 'Y-m-d')
                        };

                        _subFn = function () {
                            store.load({
                                callback: function () {
                                    let _rootNodes = store.tree.root.childNodes,
                                        sbd = sbc = obd = obc = sed = sec = 0;

                                    if (_rootNodes.length > 0) {
                                        _rootNodes.forEach(function (data) {
                                            sbd += data.data.sbd * 1;
                                            sbc += data.data.sbc * 1;
                                            obd += data.data.obd * 1;
                                            obc += data.data.obc * 1;
                                            sed += data.data.sed * 1;
                                            sec += data.data.sec * 1;
                                        });
                                    }

                                    panel.down('[name=osv_total_sbd]').setValue((sbd).toFixed(2));
                                    panel.down('[name=osv_total_sbc]').setValue((sbc).toFixed(2));
                                    panel.down('[name=osv_total_obd]').setValue((obd).toFixed(2));
                                    panel.down('[name=osv_total_obc]').setValue((obc).toFixed(2));
                                    panel.down('[name=osv_total_sed]').setValue((sed).toFixed(2));
                                    panel.down('[name=osv_total_sec]').setValue((sec).toFixed(2));

                                    grid.getSelectionModel().select(0);
                                }
                            });
                        }

                        Ext.defer(_subFn, 1000);
                    }

                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 30) {
                    // Карточка счета
                    let panel = Ext.getCmp('joMainSceern');

                    me.d1 = new Date(currYear, 0, 1);
                    me.d2 = new Date(currYear, 11, 31);
                    let scName = me.taskData.sc.split(' ');
                    let _fn = function () {
                        panel.down('[name=headerPanel]').setActiveTab(2);

                        crmEvent('buh', '99b190e9984cc65e', false, false);

                        let _subFn = function () {
                            let _constrain = 'tab2',
                                _sc_ssc_Data = {},
                                _sc_ssc_Obj = {
                                    sc_ssc: me.taskData.sc_ssc + '.',
                                    sc_ssc_name: scName[1],
                                    sc_ssc_an_1: 0,
                                    sc_ssc_an_1_name: '',
                                    sc_ssc_an_2: 0,
                                    sc_ssc_an_2_name: '',
                                    sc_ssc_an_2_id: -1,
                                    sc_ssc_an_2_name: '',
                                    level: 1
                                };

                            cardSc(
                                _constrain,
                                _sc_ssc_Obj,
                                _sc_ssc_Data,
                                me.d1,
                                me.d2
                            );
                        }

                        Ext.defer(_subFn, 2000);
                    }

                    Ext.defer(_fn, 4000);
                } else if (me.taskAction == 40) {
                    // Главная книга
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(3);
                    win_jocheckperiod();
                } else if (me.taskAction == 50) {
                    // Анализ счета
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(3);
                    analitSc();
                } else if (me.taskAction == 60) {
                    // Расшифровка бухгалтерской отчетности
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(3);
                    let _btn = panel.down('[name=headerPanel]').down('[name=bookpanel]').down('[name=btnPrintJSF_JO]');
                    printJSF_JO('frm_buh_ras_1.php');
                } else if (me.taskAction == 70) {
                    // Расшифровка бух. отчетности для МП
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(3);
                    printJSF_JO('frm_buh_ras_m_1.php');
                } else if (me.taskAction == 80) {
                    // Скачать отчёт для импорта остатков
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(3);
                    window.location.href = dir_start_buh_ + "./frm_osv_rep_imp.php";
                } else if (me.taskAction == 90) {
                    // НМА.Журнал операций
                    // ОС.Журнал операций
                    let panel = Ext.getCmp('joMainSceern');
                    panel.down('[name=headerPanel]').setActiveTab(0);

                    if (me.task == 'filter') {
                        let gridName = 'docsGrid500',
                            grid = Ext.getCmp(gridName),
                            store = grid.store,
                            _frm = Ext.getCmp('joMainSceern').getForm();

                        _frm.findField('dat_doc1').setValue(Ext.Date.format(me.d1, 'Y-m-d'));
                        _frm.findField('dat_doc2').setValue(Ext.Date.format(me.d2, 'Y-m-d'));

                        _fn = function () {
                            store.proxy.extraParams = {
                                setfilt: 1,
                                tab: 500,
                                dat1: Ext.Date.format(me.d1, 'Y-m-d'),
                                dat2: Ext.Date.format(me.d2, 'Y-m-d')
                            };

                            if (me.taskData.sc_d1 != _dummy && me.taskData.sc_d1 != false) {
                                store.proxy.extraParams.sc_d1 = me.taskData.sc_d1;
                            }

                            if (me.taskData.an_d11 != _dummy) {
                                store.proxy.extraParams.an_d11 = me.taskData.an_d11;
                            }

                            if (me.taskData.sc_c1 != _dummy && me.taskData.sc_c1 != false) {
                                store.proxy.extraParams.sc_c1 = me.taskData.sc_c1;
                            }

                            if (me.taskData.an_c11 != _dummy) {
                                store.proxy.extraParams.an_c11 = me.taskData.an_c11;
                            }

                            store.removeAll();
                            store.load();
                        }

                        Ext.defer(_fn, 1000);
                    }
                } else if (me.taskAction == 100) {
                    // Закрыть счета
                    if (currYear < 2021) {
                        closeSc();
                    } else {
                        let winClSc = Ext.create('Buh.classes.closesc.Window');
                        winClSc.showWin();
                    }
                }
                break;

            case 10:
                // Журнал документов
                document.getElementById("mn1-1-10").click();
                break;

            case 11:
                // Книга доходов и расходов
                document.getElementById("mn1-1-11").click();

                if (me.taskAction == 10) {
                    // Заполнить книгу
                    kndrFill();
                } else if (me.taskAction == 20) {
                    // Распечатать книгу
                    if (gl_obj_nal != 2 && gl_obj_nal != 3) {
                        window.location.href = dir_start_buh_ + "./frm_kndr.php";
                    } else {
                        window.location.href = dir_start_buh_ + "./frm_kndr_eshn.php";
                    }
                } else if (me.taskAction == 30) {
                    // Посмотреть отчет о списании товаров в Книгу
                    kndrBook();
                } else if (me.taskAction == 40) {
                    // Заполнение КУДиР из УСН
                    let _fn = function() {
                        let win = Ext.getCmp('mainPanelKudir'),
                            btn = win.down('[action=fillbook]');

                        btn.fireEvent('click', btn);
                    }

                    Ext.defer(_fn, 500);
                }
                break;

            case 12:
                // НКО
                document.getElementById("mn1-1-12").click();

                if (me.taskAction == 10) {
                    // Добавить начисление
                    addNach();
                } else if (me.taskAction == 20) {
                    // 	Поступление средств
                    let panel = Ext.getCmp('NKOMainScreen');
                    panel.down('[name=bottomTabs]').setActiveTab(1);
                    addPost(0);
                }
                break;

            case 13:
                // Расчет и уплата налога УСН
                document.getElementById("_mn1-1-13").click();

                if (me.taskAction == 10) {
                    // Уплатить налог
                    _fn = function () {
                        win = Ext.getCmp('main_winSDPay');
                        win.down('tabpanel').setActiveTab(2);
                    }
                    Ext.defer(_fn, 500);
                }
                break;

            case 15:
                // Уплата налогов
                // let _f5, _f14, _kv;
                let _arr_nalog_bank = {'2': '2', '3': '11', '1': '4', '7': '7', '8': '27', '4': '8', '5': '9', '6': '10'};

                let _arr_nalog_bank_text = {
                    '2': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u043f\u0440\u0438\u0431\u044b\u043b\u044c\u0020\u0424\u0411',
                    '3': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u043f\u0440\u0438\u0431\u044b\u043b\u044c\u0020\u0420\u0411',
                    '1': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u041d\u0414\u0421',
                    '7': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u0422\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433',
                    '8': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u0422\u043e\u0440\u0433\u043e\u0432\u044b\u0439\u0020\u0441\u0431\u043e\u0440',
                    '4': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u043e',
                    '5':  '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u0417\u0435\u043c\u0435\u043b\u044c\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433',
                    '6': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043d\u0430\u043b\u043e\u0433\u0430\u0020\u002d\u0020\u0412\u043e\u0434\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433'
                };

                let _arr_penja_bank_text = {
                    '2': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u043f\u0440\u0438\u0431\u044b\u043b\u044c\u0020\u0424\u0411',
                    '3': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u043f\u0440\u0438\u0431\u044b\u043b\u044c\u0020\u0420\u0411',
                    '1': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u041d\u0414\u0421',
                    '7': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u0422\u0440\u0430\u043d\u0441\u043f\u043e\u0440\u0442\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433',
                    '8': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u0422\u043e\u0440\u0433\u043e\u0432\u044b\u0439\u0020\u0441\u0431\u043e\u0440',
                    '4': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u041d\u0430\u043b\u043e\u0433\u0020\u043d\u0430\u0020\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u043e',
                    '5': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u0417\u0435\u043c\u0435\u043b\u044c\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433',
                    '6': '\u0423\u043f\u043b\u0430\u0442\u0430\u0020\u043f\u0435\u043d\u0438\u0020\u002d\u0020\u0412\u043e\u0434\u043d\u044b\u0439\u0020\u043d\u0430\u043b\u043e\u0433',};

                document.getElementById("mn1-1-15").click();

                if (me.taskAction == null) {
                    // Открыть раздел
                    // Уплатить НДС
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    panel[0].down('tabpanel').setActiveTab(0);
                    panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);
                } else if (me.taskAction == 1) {
                    // Открыть раздел НДС
                    // Начислить
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    panel[0].down('tabpanel').setActiveTab(0);
                    panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);

                    let grid = panel[0].down('grid');
                    let _fn = function() {
                        _ajax(dir_start_buh_ + 'nalog_nach.php', {vn: 1, id: 0}, function () {
                            grid.store.reload();
                        });
                    }
                    Ext.defer(_fn, 500);
                } else if (me.taskAction == 2) {
                    // Открыть раздел НДС
                    // Пени
                    // Выделить текущий квартал
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]'),
                        dt = new Date,
                        quarter = Math.floor((dt.getMonth() + 3) / 3);

                    panel[0].down('tabpanel').setActiveTab(0);

                    let _fn = function() {
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);
                        panel[0].down('grid[name=gridPenja1]').getSelectionModel().select(quarter - 1);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 3) {
                    // Открыть раздел НДС
                    // Пени
                    // Добавить оплату
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    panel[0].down('tabpanel').setActiveTab(0);

                    let _fn = function () {
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);

                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                            grid = panel[0].down('grid[name=gridPenja1]');

                        let _subFn = function () {
                            grid.getSelectionModel().select(quarter - 1);
                            /**
                             * _vn - метка налога
                             * 1 - НДС
                             */
                            let rec = grid.getSelectionModel().getSelection()[0];
                            let _f14 = '0' + (rec.data.period - 12) + "." + currYear;
                            let _vn = 1;
                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': _vn,
                                    'dat': Ext.Date.format(_args.df, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 1,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    let _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    // grdPen12.store.load();
                                });
                            }

                            let _f5 = '\u041a\u0412';
                            let _kv = rec.data.period - 12;

                            if (_vn > 1 && _vn < 8 && rec.data.period == 16) {
                                _f5 = '\u0413\u0414';
                                _f14 = '00.' + currYear;
                                _kv = currYear;
                            }

                            bankEdit({
                                '_id': 0,
                                'id_oper': 4,
                                'df': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[_vn],
                                'f5': _f5,
                                'f14': _f14,
                                'f3': '\u0422\u041f',
                                'summav': rec.data.penja,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'nalog_penja': 1,
                                'nalog_vid_kbk': '2',
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'title': _arr_penja_bank_text[_vn],
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'model': 'nalog',
                                'kv': _kv
                            });
                        }

                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 4) {
                    // Открыть раздел НДС
                    // Добавить платеж
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');

                    let _fn = function() {
                        panel[0].down('tabpanel').setActiveTab(0);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);

                        let grid = panel[0].down('grid');
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                        qrtIndex = iif(quarter - 2 >= 0, quarter - 2, 0);
                        grid.getSelectionModel().select(qrtIndex);

                        let _subFn = function() {
                            let rec = grid.getSelectionModel().getSelection()[0],
                                _f14 = '0' + (rec.data.period - 12) + "." + currYear;

                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': 1,
                                    'dat': Ext.Date.format(_args.dat, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 0,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    var _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    grdNal12.store.reload();
                                });
                            }

                            let data = {
                                'id': 0,
                                'oper': 2,
                                'dat': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[1],
                                'f5': '\u041a\u0412',
                                'f14': _f14,
                                'f3': 'ТП',
                                'summav': rec.data.nach,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'nalog_penja': 0,
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'title' : _arr_nalog_bank_text[1],
                                'model': 'nalog',
                                'kv': rec.data.period - 12
                            };

                            let win = Ext.create('Buh.view.bank.Edit');
                            win.open(data);
                        }
                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 1500);
                } else if (me.taskAction == 10) {
                    // Начислить налог на прибыль в федеральный бюджет
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(1);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);
                    }
                    Ext.defer(_fn, 1500);
                } else if (me.taskAction == 11) {
                    // Открыть раздел Налог на прибыль в федеральный бюджет
                    // Пени
                    // Выделить текущий квартал
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    panel[0].down('tabpanel').setActiveTab(1);

                    let _fn = function() {
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);
                        panel[0].down('grid[name=gridPenja1]').getSelectionModel().select(quarter - 1);
                    }
                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 12) {
                    // Открыть раздел налог на прибыль в федеральный бюджет
                    // Добавить платеж
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    let _fn = function() {
                        panel[0].down('tabpanel').setActiveTab(1);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);

                        let grid = panel[0].down('grid');
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                            qrtIndex = iif(quarter - 2 >= 0, quarter - 2, 0);

                        grid.getSelectionModel().select(qrtIndex);

                        let _subFn = function () {
                            let rec = grid.getSelectionModel().getSelection()[0];
                            let _f14 = '0' + (rec.data.period - 12) + "." + currYear;
                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': 2,
                                    'dat': Ext.Date.format(_args.df, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 0,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    let _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    // grdNal22.store.load();
                                });
                            }

                            if (rec.data.period < 16) {
                                _f5 = '\u041a\u0412';
                                _kv = rec.data.period - 12;
                            } else {
                                _f5 = '\u0413\u0414';
                                _f14 = '00.' + currYear;
                                _kv = currYear;
                            }

                            bankEdit({
                                '_id': 0,
                                'id_oper': '4',
                                'df': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[2],
                                'f5': _f5,
                                'f14': _f14,
                                'f3': '\u0422\u041f',
                                'summav': rec.data.nach,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'title': _arr_nalog_bank_text[2],
                                'nalog_penja': 0,
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'model': 'nalog',
                                'kv': _kv
                            });
                        }
                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 13) {
                    // Открыть раздел налог на прибыль в федеральный бюджет
                    // Открыть вкладку Пени
                    // Добавить платеж
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    let _fn = function () {
                        panel[0].down('tabpanel').setActiveTab(1);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);

                        let grid = panel[0].down('grid');
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                            qrtIndex = iif(quarter - 2 >= 0, quarter - 2, 0);

                        grid.getSelectionModel().select(qrtIndex);

                        let _subFn = function () {
                            grid.getSelectionModel().select(quarter - 1);

                            /**
                             * _vn - метка налога
                             * 2 - Налог на прибыль в ФБ
                             */
                            let rec = grid.getSelectionModel().getSelection()[0];
                            let _f14 = '0' + (rec.data.period - 12) + "." + currYear;
                            let _vn = 2;
                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': _vn,
                                    'dat': Ext.Date.format(_args.df, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 1,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    let _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    // grdPen12.store.load();
                                });
                            }

                            let _f5 = '\u041a\u0412';
                            let _kv = rec.data.period - 12;

                            if (_vn > 1 && _vn < 8 && rec.data.period == 16) {
                                _f5 = '\u0413\u0414';
                                _f14 = '00.' + currYear;
                                _kv = currYear;
                            }

                            bankEdit({
                                '_id': 0,
                                'id_oper': 4,
                                'df': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[_vn],
                                'f5': _f5,
                                'f14': _f14,
                                'f3': '\u0422\u041f',
                                'summav': rec.data.penja,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'nalog_penja': 1,
                                'nalog_vid_kbk': '2',
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'title': _arr_penja_bank_text[_vn],
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'model': 'nalog',
                                'kv': _kv
                            });
                        }
                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 20) {
                    // Начислить налог на прибыль в региональный бюджет
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    let _fn = function() {
                        panel[0].down('tabpanel').setActiveTab(2);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);
                    }
                    Ext.defer(_fn, 1000);
                } else if (me.taskAction == 22) {
                    // Открыть раздел налог на прибыль в региональный бюджет
                    // Добавить платеж
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');

                    let _fn = function() {
                        panel[0].down('tabpanel').setActiveTab(2);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(0);

                        let grid = panel[0].down('grid');
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                            qrtIndex = iif(quarter - 2 >= 0, quarter - 2, 0);

                        grid.getSelectionModel().select(qrtIndex);

                        let _subFn = function () {
                            let rec = grid.getSelectionModel().getSelection()[0];
                            let _f14 = '0' + (rec.data.period - 12) + "." + currYear;

                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': 3,
                                    'dat': Ext.Date.format(_args.df, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 0,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    let _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    // grid.store.load();
                                });
                            }

                            if (rec.data.period < 16) {
                                _f5 = '\u041a\u0412';
                                _kv = rec.data.period - 12;
                            } else {
                                _f5 = '\u0413\u0414';
                                _f14 = '00.' + currYear;
                                _kv = currYear;
                            }

                            bankEdit({
                                '_id': 0,
                                'id_oper': '4',
                                'df': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[3],
                                'f5': _f5,
                                'f14': _f14,
                                'f3': '\u0422\u041f',
                                'title' : _arr_nalog_bank_text[3],
                                'summav': rec.data.nach,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'nalog_penja': 0,
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'model': 'nalog',
                                'kv': _kv
                            });
                        }
                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 21) {
                    // Открыть раздел Налог на прибыль в региональный бюджет
                    // Пени
                    // Выделить текущий квартал
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    panel[0].down('tabpanel').setActiveTab(2);

                    let _fn = function() {
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);
                        panel[0].down('grid[name=gridPenja1]').getSelectionModel().select(quarter - 1);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 23) {
                    // Открыть раздел Налог на прибыль в региональный бюджет
                    // Открыть вкладку Пени
                    // Добавить оплату
                    let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                    let _fn = function () {
                        panel[0].down('tabpanel').setActiveTab(2);
                        panel[0].down('tabpanel').down('tabpanel').setActiveTab(1);

                        let grid = panel[0].down('grid');
                        let dt = new Date, quarter = Math.floor((dt.getMonth() + 3) / 3),
                            qrtIndex = iif(quarter - 2 >= 0, quarter - 2, 0);

                        grid.getSelectionModel().select(qrtIndex);

                        let _subFn = function () {
                            grid.getSelectionModel().select(quarter - 1);
                            /**
                             * _vn - метка налога
                             * 3 - Налог на прибыль в РБ
                             */
                            let rec = grid.getSelectionModel().getSelection()[0];
                            let _f14 = '0' + (rec.data.period - 12) + "." + currYear;
                            let _vn = 3;
                            let _callback = function (_args) {
                                let _inp = {
                                    'yr': currYear,
                                    'kv': rec.data.period,
                                    'vn': _vn,
                                    'dat': Ext.Date.format(_args.df, 'd.m.Y'),
                                    'number': _args.n_doc,
                                    'summa': _args.summav,
                                    'rsmy_id': _args.rsmy_id,
                                    'org_id': _args.id_analit,
                                    'pol_id': _args.id_analit,
                                    'jdoc': _args.jdoc,
                                    'penja': 1,
                                    'typ_pay': 1,
                                    'id_bank_pay': _args.id
                                };

                                _ajax(dir_start_buh_ + 'nalog_pay_add.php', _inp, function () {
                                    let _row = rec.index;
                                    grid.store.load(function () {
                                        grid.getSelectionModel().select(_row);
                                    });
                                    // grdPen12.store.load();
                                });
                            }

                            let _f5 = '\u041a\u0412';
                            let _kv = rec.data.period - 12;

                            if (_vn > 1 && _vn < 8 && rec.data.period == 16) {
                                _f5 = '\u0413\u0414';
                                _f14 = '00.' + currYear;
                                _kv = currYear;
                            }

                            bankEdit({
                                '_id': 0,
                                'id_oper': 4,
                                'df': oDefaults.date,
                                'reg_plt': '4',
                                'nalog_id': _arr_nalog_bank[_vn],
                                'f5': _f5,
                                'f14': _f14,
                                'f3': '\u0422\u041f',
                                'summav': rec.data.penja,
                                'nds_id': '4',
                                'f0': org_status,
                                'callback': _callback,
                                'nalog_penja': 1,
                                'nalog_vid_kbk': '2',
                                'f2': my_oktmo,
                                'id_j_dr': oDefaults.dr_nalog,
                                'title': _arr_penja_bank_text[_vn],
                                'bank_other_nm_id_j_dr': '\u041d\u0430\u043b\u043e\u0433\u0438\u002c\u0020\u0441\u0431\u043e\u0440\u044b\u002c\u0020\u043f\u043e\u0448\u043b\u0438\u043d\u044b',
                                'model': 'nalog',
                                'kv': _kv
                            });
                        }
                        Ext.defer(_subFn, 1000);
                    }
                    Ext.defer(_fn, 3000);
                } else if (me.taskAction == 30) {
                    // Уплатить налог на имущество
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(3);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 40) {
                    // Уплатить земельный налог
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(4);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 50) {
                    // Уплатить водный налог
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(5);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 60) {
                    // Уплатить транспортный налог
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(6);
                    }
                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 70) {
                    // Уплатить торговый сбор
                    let _fn = function() {
                        let panel = Ext.ComponentQuery.query('[name=placeNalogPay]');
                        panel[0].down('tabpanel').setActiveTab(7);
                    }
                    Ext.defer(_fn, 2000);
                }
                break;

            case 17:
                // Склад
                tabName = "mn1-1-17";
                document.getElementById(tabName).click();

                if (me.taskAction == null) {
                    let panel = Ext.getCmp('skladMainPanel');
                    panel.down('[name=bottomTabs]').setActiveTab(0);
                } else if (me.taskAction == 10) {
                    // Посмотреть остатки
                    let panel = Ext.getCmp('skladMainPanel');
                    panel.down('[name=bottomTabs]').setActiveTab(1);
                } else if (me.taskAction == 20) {
                    // Посмотреть обороты
                    let panel = Ext.getCmp('skladMainPanel'),
                        gridName = 'docsGrid549',
                        grid = Ext.getCmp(gridName),
                        store = grid.store,
                        _constrain = 'tab2';

                    if (me.task == 'filter' || me.task == 'edit') {
                        if (me.task == 'filter') {
                            let _d = new Date;
                            me.d1 = new Date(currYear, _d.getMonth(), 1);
                            me.d2 = new Date(currYear, _d.getMonth() + 1, 0);
                        } else if (me.task == 'edit') {
                            me.d1 = new Date(currYear, 0, 1);
                            me.d2 = new Date(currYear, 11, 31);
                        }

                        if (me.taskData.id_sprav != _dummy) {
                            if (me.taskData.id_sprav == 5) {
                                let _btn = Ext.ComponentQuery.query('[name=btnTov_Oboroti]');
                                _btn[0].up('container').down('[name=vdrTovMat1]').setValue(2);
                            } else if (me.taskData.id_sprav == 3) {
                                let _btn = Ext.ComponentQuery.query('[name=btnMat_Oboroti]');
                                _btn[0].up('container').down('[name=vdrTovMat1]').setValue(3);
                            } else if (me.taskData.id_sprav == 4) {
                                let _btn = Ext.ComponentQuery.query('[name=btnProd_Oboroti]');
                                _btn[0].up('container').down('[name=vdrTovMat1]').setValue(4);
                            }
                        }

                        store.clearFilter(true);

                        Ext.getCmp('periodSklad_oboroti_dat_doc1').setValue(me.d1);
                        Ext.getCmp('periodSklad_oboroti_dat_doc2').setValue(me.d2);

                        Ext.getCmp('sklad_all_date1').setValue(Ext.getCmp('periodSklad_oboroti_dat_doc2').getValue());
                        Ext.getCmp('periodSklad_dat_doc1').setValue(Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc1').getValue(), 'Y-m-d'));
                        Ext.getCmp('periodSklad_dat_doc2').setValue(Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc2').getValue(), 'Y-m-d'));

                        panel.filters.d1 = Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc1').getValue(), 'Y-m-d');
                        panel.filters.d2 = Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc1').getValue(), 'Y-m-d');

                        dbeg = Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc1').getValue(), 'Y-m-d');
                        dend = Ext.Date.format(Ext.getCmp('periodSklad_oboroti_dat_doc2').getValue(), 'Y-m-d');
                    }

                    panel.down('[name=bottomTabs]').setActiveTab(2);

                    let _fn = function () {
                        store.load(function (records, operation, success) {
                            let sn = store.getProxy().reader.jsonData.sn,
                                sp = store.getProxy().reader.jsonData.sp,
                                sr = store.getProxy().reader.jsonData.sr,
                                se = store.getProxy().reader.jsonData.se;

                            Ext.getCmp('ost_nach__Oboroti').setValue(toLocaleDigits(sn.toFixed(2)));
                            Ext.getCmp('prixod__Oboroti').setValue(toLocaleDigits(sp.toFixed(2)));
                            Ext.getCmp('rasxod__Oboroti').setValue(toLocaleDigits(sr.toFixed(2)));
                            Ext.getCmp('ostkon__Oboroti').setValue(toLocaleDigits(se.toFixed(2)));

                            if (me.task == 'filter' || me.task == 'edit') {
                                if (me.taskData.find != undefined) {
                                    store.filterBy(function (rc) {
                                        if (rc.data.name == me.taskData.find) return true;
                                        else return false;
                                    })
                                }

                                if (grid.store.data.length > 0) {
                                    grid.getSelectionModel().select(0);

                                    if (me.task == 'edit') {
                                        let rec = store.getAt(0);
                                        SkladCard(rec.data.id_tovar, _constrain, rec.data.id_sprav, rec.data.name, rec.data.edizm_id, '', '', rec);
                                    }
                                }
                            }
                        });
                    }

                    Ext.defer(_fn, 2000);
                } else if (me.taskAction == 30) {
                    // Оформить перемещение
                    openSkldaDoc(0, 10);
                } else if (me.taskAction == 40) {
                    // Провести инвентаризацию
                    openSkldaDoc(0, 13);
                    let win = Ext.ComponentQuery.query("#winSkladDocId")[0],
                        btn = win.down('[name=btnRashod]');
                    let _fn = function() {
                        btn.fireEvent('click', btn);
                    }
                    Ext.defer(_fn, 300);
                } else if (me.taskAction == 50) {
                    // Списать материалы (канцтовары)
                    if (currYear == 2020) {
                        openSkldaDoc(0, 0);
                    } else {
                        openSkldaDoc21(0, 0);
                    }
                }
                break;

            case 18:
                // Счета
                tabName = "mn1-1-18";
                document.getElementById(tabName).click();

                if (me.task == 'add') {
                    openAccountDoc({'id': 0});
                }
                break;
            case 19:
                tabName = "mn1-1-19";
                createNewEl(tabName,
                    '\u041a\u043d\u0438\u0433\u0430 \u043f\u043e\u043a\u0443\u043f\u043e\u043a \u0438 \u043f\u0440\u043e\u0434\u0430\u0436',
                    '(function(_div) { buysalebookWin.call(this, _div, '+ (me.subTab) +') })', '1');
                break;
            case 71:
                // Расходы будущих периодов
                tabName = "mn1-1-71";
                document.getElementById(tabName).click();

                let _panel = Ext.getCmp('mainPanelrbp'), gridName = 'docsGrid0',
                    grid = Ext.getCmp(gridName), store = grid.store, dt = new Date;

                _panel.down('[name=god]').suspendEvents();
                _panel.down('[name=mon]').suspendEvents();
                _panel.down('[name=mon]').setValue("" + (dt.getMonth() + 1));
                _panel.down('[name=god]').setValue("" + (currYear - 2018));
                _panel.down('[name=god]').resumeEvents();
                _panel.down('[name=mon]').resumeEvents();

                store.proxy.extraParams.mes = _panel.down('[name=mon]').getValue();
                store.proxy.extraParams.god = _panel.down('[name=god]').getValue();

                if (me.task == 'filter') {
                    store.proxy.extraParams.an_d1 = me.taskData.an_d1;
                }

                store.removeAll();
                store.load();

                break;

            case 72:
                // Акт сверки
                let d = new Date(), _contragent = null

                startASV = d.getTime();

                if (parseInt(currYear) > 2020) {
                    reconciliationReportMaster = Ext.create('Buh.view.reconciliationreport.Panel', {'contragent': _contragent});
                    reconciliationReportMaster.show();
                } else {
                    aktSv('', '');
                }
                break;

            case 73:
                // Новые доверенности.
                document.getElementById("mn1-1-91").click();

                if (me.taskAction == 10) {
                    let mainPanel = Ext.getCmp('dovMainScreen');
                    docDovEdit21(mainPanel, 0);
                }
                break;

            case 1301:
                // Бухгалтерия.Сервис.Импорт из прошлого года
                tabName = "_mn1-3-01";
                document.getElementById(tabName).click();
                break;

            case 1302:
                // Бухгалтерия.Сервис.Импорт из 1с
                tabName = "_mn1-3-02";
                document.getElementById(tabName).click();
                break;

            case 1306:
                // Еще.ЛК.Расчетные счета
                tabName = "_mn1-3-06";
                document.getElementById(tabName).click();

                if (me.task == 'add') {
                    let _button = Ext.ComponentQuery.query("#btnAddRsMy")[0];
                    _button.handler();
                }
                break;

            case 1307:
                // Бухгалтерия.Сервис.Импорт из ОФД
                tabName = "mn1-3-07";
                document.getElementById(tabName).click();
                break;

            case 5106:
                // Еще.Инструменты.Создать ярлык на рабочем столе
                tabName = "mn5-1-06";
                document.getElementById(tabName).click();
                break;

        }

    },


    openSprav: function (_rec) {
        let me = this;

        me.source = _rec.source;
        me.docId = _rec.source_id;
        me.task = _rec.task || '';
        me.period = _rec.period || '';
        me.periodVal = _rec.periodVal || null;
        me.callback = _rec.callback || null;
        me.name = _rec.searchName || null;

        let _input = {}, sprav = me.source, _fn, _subFn, grid, inputFind;
        switch (me.source) {
            case 1:
                //ОС
                _input = {
                    _task: 0,
                    _sprav: sprav,
                    _id: me.docId,
                    _edit: true
                };

                openSpravTotal(_input);

                // GBS-11937. Фикс открытия окна редактирования.
                _fn = function() {
                    grid = Ext.getCmp('gridSpravOverAll');
                    let inputFind = Ext.ComponentQuery.query('[itemId=fndField]'), rec;
                    inputFind[0].inputEl.dom.value = me.name;
                    grid.loadDataSprav();

                    _subFn = function() {
                        grid.getSelectionModel().select(0);
                        rec = grid.store.getAt(0);

                        Ext.getCmp(arrSpravEditor[1]).openEditOuter({
                            id: me.docId,
                            grp: 0,
                            sprav: sprav,
                            rec: rec
                        });
                    }

                    Ext.defer(_subFn, 500);
                }

                Ext.defer(_fn, 500);
                break;

            case 2:
                //НМА
                _input = {
                    _task: 0,
                    _sprav: sprav,
                    _id: me.docId,
                    _edit: true
                };

                openSpravTotal(_input);

                // GBS-11937. Фикс открытия окна редактирования.
                _fn = function() {
                    grid = Ext.getCmp('gridSpravOverAll');
                    let inputFind = Ext.ComponentQuery.query('[itemId=fndField]'), rec;
                    inputFind[0].inputEl.dom.value = me.name;
                    grid.loadDataSprav();

                    _subFn = function() {
                        grid.getSelectionModel().select(0);
                        rec = grid.store.getAt(0);

                        Ext.getCmp(arrSpravEditor[2]).openEditOuter({
                            id: me.docId,
                            grp: 0,
                            sprav: sprav,
                            rec: rec
                        });
                    }

                    Ext.defer(_subFn, 500);
                }

                Ext.defer(_fn, 500);
                break;

            case 3:
                //Материал
                //Услуга полученная (_rec.vid == 1)
                //РБП (_rec.vid == 2)
                if (_rec.vid == 1) sprav = 31;
                if (_rec.vid == 2) sprav = 32;
                _input = {
                    _task: 0,
                    _sprav: sprav,
                    _id: me.docId,
                    _edit: true
                };

                openSpravTotal(_input);

                if (me.task === 'add') {
                    _fn = function () {
                        Ext.getCmp(arrSpravEditor[3]).openEditOuter({
                            id: 0,
                            grp: 0,
                            sprav: sprav,
                            rec: null
                        });
                    }
                } else {
                    // GBS-11937. Фикс открытия окна редактирования.
                    _fn = function () {
                        grid = Ext.getCmp('gridSpravOverAll');
                        let inputFind = Ext.ComponentQuery.query('[itemId=fndField]'), rec;
                        inputFind[0].inputEl.dom.value = me.name;
                        grid.loadDataSprav();

                        _subFn = function () {
                            grid.getSelectionModel().select(0);
                            rec = grid.store.getAt(0);

                            Ext.getCmp(arrSpravEditor[3]).openEditOuter({
                                id: me.docId,
                                grp: 0,
                                sprav: sprav,
                                rec: rec
                            });
                        }

                        Ext.defer(_subFn, 500);
                    }
                }

                Ext.defer(_fn, 500);
                break;

            case 4:
                //Продукция
                //Услуга оказанная (_rec.vid == 1)
                if (_rec.vid == 1) sprav = 41;
                _input = {
                    _task: 0,
                    _sprav: sprav,
                    _id: me.docId,
                    _edit: true
                };

                openSpravTotal(_input);

                // GBS-11937. Фикс открытия окна редактирования.
                _fn = function() {
                    grid = Ext.getCmp('gridSpravOverAll');
                    let inputFind = Ext.ComponentQuery.query('[itemId=fndField]'), rec;
                    inputFind[0].inputEl.dom.value = me.name;
                    grid.loadDataSprav();

                    _subFn = function() {
                        grid.getSelectionModel().select(0);
                        rec = grid.store.getAt(0);

                        Ext.getCmp(arrSpravEditor[4]).openEditOuter({
                            id: me.docId,
                            grp: 0,
                            sprav: sprav,
                            rec: rec
                        });
                    }

                    Ext.defer(_subFn, 500);
                }

                Ext.defer(_fn, 500);
                break;

            case 5:
                //Товар
                _input = {
                    _task: 0,
                    _sprav: sprav,
                    _id: me.docId,
                    _edit: true
                };

                openSpravTotal(_input);

                _fn = function() {
                    // GBS-11937. Фикс открытия окна редактирования.
                    grid = Ext.getCmp('gridSpravOverAll');
                    let inputFind = Ext.ComponentQuery.query('[itemId=fndField]'), rec;
                    inputFind[0].inputEl.dom.value = me.name;
                    grid.loadDataSprav();

                    _subFn = function() {
                        grid.getSelectionModel().select(0);
                        rec = grid.store.getAt(0);

                        Ext.getCmp(arrSpravEditor[5]).openEditOuter({
                            id: me.docId,
                            grp: 0,
                            sprav: 5,
                            rec: rec
                        });
                    }

                    Ext.defer(_subFn, 500);
                }

                Ext.defer(_fn, 500);
                break;

            case 6:
                if (_rec.typ_contra == 1)
                    Ext.getCmp('mainWin6').selTreeStart = "-10";
                if (_rec.typ_contra > 1)
                    Ext.getCmp('mainWin6').selTreeStart = "-11";
                Ext.getCmp('mainWin6').openAfterSelect = true;
                Ext.getCmp('mainWin6').showWin(me.docId, false, '', '', '', '', false);
                break;

            case 9:
                // Виды деятельности
                document.getElementById('_mn1-2-11').click();
                break;

            case 11:
                // Аналитика 91 счета
                //GBS-11937. В меню пункт скрыт, открываем напрямую.
                // document.getElementById('_mn1-2-12').click();
                win11.showWin(0, false);
                break;

            case 15:
                // Договоры
                document.getElementById('_mn1-2-13').click();

                if (me.task == 'add') {
                    let _win = Ext.getCmp('mainWin15');
                    _win.showAddNewItem();
                }
                break;

            case 20:
                // Единицы измерения
                document.getElementById('_mn1-2-15').click();

                if (me.task == 'add') {
                    let _win = Ext.getCmp('mainWin20');
                    _win.showAddNewItem();
                }
                break;

            case 21:
                // Кассы
                document.getElementById('_mn1-2-14').click();
                break;

            case 25:
                // Склады
                //GBS-11937. В меню пункт скрыт, открываем напрямую.
                // document.getElementById('_mn1-2-16').click();
                win25.showWin(0, false);
                break;

            case 600:
                // Контрагенты
                document.getElementById('_mn1-2-08').click();
                break;

            case "planSc":
                // План счетов
                document.getElementById('_mn1-2-01').click();
                break;

            case "ostatki":
                // Остатки
                document.getElementById('_mn1-2-02').click();

                if (me.task == 10) {
                    let _fn = function () {
                        let win = Ext.getCmp('winTotalOstRef'),
                            grid = win.down('[name=tpOstat]').down('grid'),
                            rec = grid.store.findRecord('sc_ssc', '68.2');

                        if (rec) {
                            grid.getSelectionModel().select(rec, false, true)
                            grid.getView().focusRow(rec.index);
                            grid.editingPlugin.startEdit(rec.index, 7);
                        }
                    }

                    Ext.defer(_fn, 1000);
                } else if (me.task == 20) {
                    let _fn = function () {
                        let win = Ext.getCmp('winTotalOstRef'),
                            grid = win.down('[name=tpOstat]').down('grid'),
                            rec = grid.store.findRecord('sc_ssc', '68.1');

                        if (rec) {
                            grid.getSelectionModel().select(rec, false, true)
                            grid.getView().focusRow(rec.index);
                            grid.editingPlugin.startEdit(rec.index, 7);
                        }
                    }

                    Ext.defer(_fn, 1000);
                } else if (me.task == 30) {
                    let _fn = function () {
                        let win = Ext.getCmp('winTotalOstRef'),
                            grid = win.down('[name=tpOstat]').down('grid'),
                            rec = grid.store.findRecord('sc_ssc', '68.1');

                        if (rec) {
                            grid.getSelectionModel().select(rec, false, true)
                            grid.getView().focusRow(rec.index);
                            grid.editingPlugin.startEdit(rec.index, 6);
                        }
                    }

                    Ext.defer(_fn, 1000);
                }
                break;

            case "kdr":
                // Доходы/Расходы
                document.getElementById('_mn1-2-10').click();
                break;


            default:
                break;
        }

    },


    openSource: function (_rec) {
        var me = this;
        me.open = true;
        me.source = _rec.data.source;
        me.docId = _rec.data.source_id;
        me.origin = _rec.data.origin;
        me.provId = _rec.data.id;
        if (_rec.data.source == 1) {  // покупки

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 1, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-01').click();
                    if (Ext.getCmp('buyPanel_100'))
                        Ext.getCmp('buyPanel_100').refreshGrid();
                }
            );
        }

        if (_rec.data.source == 2) {  // продажи

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 2, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-02').click();
                    if (Ext.getCmp('buyPanel_110'))
                        Ext.getCmp('buyPanel_110').refreshGrid();
                }
            );
        }

        if (_rec.data.source == 3 || _rec.data.source == 4) {
            //Банк
            _ajax(
                dir_start_buh_ + 'jo_manager.php',
                {
                    'source': 3,
                    'source_id': _rec.data.source_id
                },

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-03').click();

                    if (Ext.getCmp('bankMainSceern'))
                        Ext.getCmp('bankMainSceern').refreshGrid();

                }
            );
        }

        //Касса
        if (_rec.data.source == 5 || _rec.data.source == 6) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 5, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-04').click();

                    if (Ext.getCmp('kassaMainScreen'))
                        Ext.getCmp('kassaMainScreen').refreshGrid();

                }
            );
        }

        if (_rec.data.source == 7) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 7, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.mn = "" + ans.data.mn;
                    me.id_os = ans.data.id_os;

                    if (Ext.getCmp('mainPanelAmort')) {
                        if (Ext.get(Ext.getCmp('mainPanelAmort').renderTo)) {
                            if (Ext.getCmp('mainPanelAmort').down('#tpAmort').getActiveTab().title != "Бухгалтерский учет")
                                Ext.getCmp('mainPanelAmort').down('#tpAmort').setActiveTab(0);
                            else
                                Ext.getCmp('mainPanelAmort').refresh();
                        }

                    }
                    document.getElementById('mn1-1-07').click();


                }
            );
        }

        if (_rec.data.source == 12) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 12, 'origin': _rec.data.origin, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;

                    if (Ext.getCmp('NKOMainScreen')) {
                        Ext.getCmp('NKOMainScreen').refresh(true);
                    }
                    document.getElementById('mn1-1-12').click();
                }
            );
        }

        if (_rec.data.source == 17) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 17, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.mn = "" + ans.data.mn;
                    me.yr = "" + ans.data.yr;
                    me.docId = ans.data.id;


                    if (Ext.getCmp('mainPanelrbp')) {
                        Ext.getCmp('mainPanelrbp').refresh();
                    }

                    document.getElementById('mn1-1-20').click();
                }
            );
        }

        if (_rec.data.source == 20) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 20, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;

                    if (Ext.getCmp('skladMainPanel')) {
                        Ext.getCmp('skladMainPanel').refreshGrid();
                    }
                    document.getElementById('mn1-1-17').click();
                }
            );
        }


        if (_rec.data.source == 22 || _rec.data.source == 23) {

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': _rec.data.source, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-06').click();

                    if (Ext.getCmp('PRMainScreen')) {
                        if (_rec.data.source == 22)
                            Ext.getCmp('PRMainScreen').down('[name=bottomTabs]').setActiveTab(1);
                        if (_rec.data.source == 23)
                            Ext.getCmp('PRMainScreen').down('[name=bottomTabs]').setActiveTab(2);

                    }
                }
            );
        }

        if (_rec.data.source == 24) {  // покупки

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 24, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-01').click();
                    if (Ext.getCmp('buyPanel_100'))
                        Ext.getCmp('buyPanel_100').refreshGrid();
                }
            );
        }


    },


    otherWindows: function (_rec) {

        let me = this,
            sprav = 0;
        me.source = _rec.source;
        me.docId = _rec.source_id;
        let _input = {},
            _fn = null;

        switch (me.source) {
            case 1:

                Ext.getCmp('mainWin6').showWin(me.docId, false);
                aktSv(me.docId, {id: me.docId, nms: _rec.name});
                break;
        }

    },

    printDoc: function (_rec, _printOnly = true) {
        let me = this, sprav = 0, _input = {}, _fn = null;

        me.source = _rec.source * 1;
        me.docId = _rec.source_id;

        _fn = function (_ans) {
            let me = this,
                ans = Ext.decode(_ans),
                rc = {};

            rc.data = ans;

            let funcPrint = function (rc, pict) {
                let me = this,
                    _pict = pict || '1',
                    _suffix = "&pict=" + _pict + (iif(rc.data.printOnly == true, "&type_doc_convert=pdf&directprint=true", ""));

                let printUrlsJson = {
                    '1': "frm_akt.php?id=" + rc.data.id,
                    '3': "frm_schet.php?id=" + rc.data.id,
                    '4': "frm_schetf_10.php?id=" + rc.data.id,
                    '5': "frm_nakl.bak.php?id=" + rc.data.id,
                    '6': "frm_nakl_tov.php?id=" + rc.data.id,
                    '7': "frm_nakl_mat.php?id=" + rc.data.id,
                    '8': "frm_schetf_av_10.php?id=" + rc.data.id,
                    '9': "frm_kvit.php?id=" + rc.data.id,
                    '10': "frm_dov.php?id=" + rc.data.id,
                    '15': "frm_ttn.php?id=" + rc.data.id,
                    '16': "frm_ks2.php?id=" + rc.data.id,
                    '17': "frm_ks3.php?id=" + rc.data.id,
                    '18': "frm_upd_10.php?id=" + rc.data.id,
                    '19': "frm_schetfc_10.php?id=" + rc.data.id,
                    '21': "frm_tov_check_action.php?id=" + rc.data.id,
                    '22': "frm_agreement.php?type_doc=" + rc.data.typ_doc + "&id=" + rc.data.id,
                    '23': "frm_agreement.php?type_doc=" + rc.data.typ_doc + "&id=" + rc.data.id,
                    '26': "frm_schetf_10.php?id=" + rc.data.id,
                    '27': "frm_schetf_10.php?id=" + rc.data.id,
                    '28': "frm_akt.php?id=" + rc.data.id,
                };

                let typeDocKeys = Object.keys(printUrlsJson);
                let typeDocValues = Object.values(printUrlsJson);
                let docTypeUrl = typeDocValues[Ext.Array.indexOf(typeDocKeys, rc.data.typ_doc)];

                if (docTypeUrl == _dummy) {
                    _alert_win('РћС€РёР±РєР°', 'РџРµС‡Р°С‚СЊ РґРѕРєСѓРјРµРЅС‚Р° РЅРµРґРѕСЃС‚СѓРїРЅР°.');
                    return false;
                }

                if (rc.data.printOnly == true) {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }

                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + docTypeUrl + _suffix
                    });

                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                } else {
                    window.location.href = dir_start_buh_ + docTypeUrl;
                }
            };

            funcPrint(rc, 1);
        }

        /*******************/
        switch (me.source) {
            case 1:
                _ajax(
                    dir_start_buh_ + 'buhmanager/givedocinfo/',
                    {
                        'id': me.docId,
                        'year': _rec.year || '2020'
                    },
                    _fn("{typ_doc: '" + _rec.typ_doc + "', id: " + me.docId + ", printOnly: " + _printOnly + "}")
                );

                break;
            case 2:
                _fn("{typ_doc: '18', id: " + me.docId + ", printOnly: " + _printOnly + "}");

                break;
            case 3:
                _fn("{typ_doc: '15', id: " + me.docId + ", printOnly: " + _printOnly + "}");

                break;
            case 4:
                _fn("{typ_doc: '22', id: " + me.docId + ", printOnly: " + _printOnly + "}");

                break;

            case 5:
                document.getElementById("mn1-1-05").click();
                _fn = function (_ans) {
                    let panel = Ext.getCmp('docsGrid653').up('panel'),
                        store = Ext.getCmp('docsGrid653').store;

                    panel.down('#dat1_ap').setValue(_rec.dat);
                    panel.down('#dat2_ap').setValue(_rec.dat);

                    store.proxy.extraParams.d_beg = _rec.dat;
                    store.proxy.extraParams.d_end = _rec.dat;

                    store.load({
                        callback: function () {
                            let r = store.getById(me.docId);
                            panel.down('grid').getView().select(r);

                        }
                    });

                }
                _fn({dat: _rec.dat, id: 95});
                break;
        }
    },

    openDocInDeal: function (_rec) {
        let me = this,
            dealsDoc = Ext.create('Buh.classes.managers.details.Deal', {owner: me});
        me.boolOpenDoc = true;
        dealsDoc.openDocInDeal(_rec);
    },

    setPeriod: function () {
        let me = this;

        me.dateRanges = Ext.create('Ext.data.Store', {
            fields: [
                {type: 'int', name: 'id'},
                {type: 'string', name: 'startMonth'},
                {type: 'string', name: 'startDay'},
                {type: 'string', name: 'endMonth'},
                {type: 'string', name: 'endDay'},
            ],
            data: [
                {id: 1, startMonth: 0, startDay: 1, endMonth: 2, endDay: 31},
                {id: 2, startMonth: 3, startDay: 1, endMonth: 5, endDay: 30},
                {id: 3, startMonth: 6, startDay: 1, endMonth: 8, endDay: 30},
                {id: 4, startMonth: 9, startDay: 1, endMonth: 11, endDay: 31},
                {id: 6, startMonth: 0, startDay: 1, endMonth: 5, endDay: 30},
                {id: 9, startMonth: 0, startDay: 1, endMonth: 8, endDay: 30},
                {id: 12, startMonth: 0, startDay: 1, endMonth: 11, endDay: 31}
            ]
        });

        _d = new Date();

        if (me.period == "m") {
            me.d1 = iif(me.periodVal == null,
                new Date(_d.getFullYear(), _d.getMonth(), '1'),
                new Date(_d.getFullYear(), me.periodVal, '1')
            );

            me.d2 = iif(me.periodVal == null,
                new Date(_d.getFullYear(), _d.getMonth() + 1, 0),
                new Date(_d.getFullYear(), parseInt(me.periodVal) + 1, 0)
            );
        } else {
            if (me.periodVal != null) {
                rec = me.dateRanges.findRecord('id', me.periodVal);
                if (rec) {
                    me.d1 = new Date(_d.getFullYear(), rec.get('startMonth'), rec.get('startDay'));
                    me.d2 = new Date(_d.getFullYear(), rec.get('endMonth'), rec.get('endDay'));
                }
            } else {
                rec = me.dateRanges.findRecord('id', 12);
                if (rec) {
                    me.d1 = new Date(_d.getFullYear(), rec.get('startMonth'), rec.get('startDay'));
                    me.d2 = new Date(_d.getFullYear(), rec.get('endMonth'), rec.get('endDay'));
                }
            }
        }

    },

    printBankOrder: function (rec, _printOnly) {
        let me = this, _fn = null;

        me.docId = rec.source_id;

        _fn = function (_ans) {
            let me = this,
                ans = Ext.decode(_ans),
                rc = {};

            rc = ans;

            let funcPrint = function (rc, pict) {
                let me = this,
                    _pict = pict || '1',
                    _suffix = "&pict=" + _pict + (iif(rc.printOnly == true, "&type_doc_convert=pdf&directprint=true", ""));

                if (rc.printOnly == true) {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }

                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + "bankpay_add_prev_p.php?type_doc_convert=pdf&id=" + rc.id + "&directprint=true",
                    });

                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                } else {
                    window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + rc.id + "&type=6";
                }
            };

            funcPrint(rc, 1);
        }

        _fn("{id: " + me.docId + ", printOnly: " + _printOnly + "}");
    },

    printCashOrder: function (rec, _typeOper) {
        let me = this, _fn = null;

        me.docId = rec.source_id;

        _fn = function (_ans) {
            let me = this,
                ans = Ext.decode(_ans),
                rc = {};

            rc = ans;

            let funcPrint = function (rc, pict) {
                let me = this,
                    _pict = pict || '1',
                    _suffix = "&pict=" + _pict + (iif(rc.printOnly == true, "&type_doc_convert=pdf&directprint=true", ""));

                if (rc.typeOper == 5) {
                    window.location.href = dir_start_buh_ + "./frm_pko.php?edit=" + rc.id;
                } else {
                    window.location.href = dir_start_buh_ + "./frm_rko.php?edit=" + rc.id;
                }
            };

            funcPrint(rc, 1);
        }

        _fn("{id: " + me.docId + ", typeOper: " + _typeOper + "}");
    }

});
