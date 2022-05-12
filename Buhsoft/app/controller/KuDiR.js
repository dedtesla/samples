/**
 * Контроллер Книги Доходов и расходов 2020/2021.
 *
 * C 2021г. реализована бесшовность базы данных.
 * Все значения состояний портированы в базу данных (tr_states),
 * кукисы отменены.
 *
 * GBS-6829|GBS-8558|14108
 * 08.2020
 */
Ext.define('Buh.controller.KuDiR', {
    extend: 'Ext.app.Controller',
    taxMode: null,
    taxStavka: null,
    holdYear: null,
    holdPeriod: {},
    refs: [
        {
            ref: 'mainPanel',
            selector: 'kudirPanel'
        },
        {
            ref: 'tbarKudir',
            selector: 'kudirtbar'
        },
        {
            ref: 'winFilter',
            selector: 'kudirfilterwindow'
        },
        {
            ref: 'grdSection1',
            selector: 'kudirsection1grid'
        },
        {
            ref: 'grdReference',
            selector: 'kudirreferencegrid'
        },
        {
            ref: 'grdSection2',
            selector: 'kudirsection2grid'
        },
        {
            ref: 'grdSection3',
            selector: 'kudirsection3grid'
        },
        {
            ref: 'grdSection4',
            selector: 'kudirsection4grid'
        },
        {
            ref: 'grdSection5',
            selector: 'kudirsection5grid'
        },
        {
            ref: 'winEditor',
            selector: 'editkudirpopup'
        },
        {
            ref: 'winCardEditor',
            selector: 'editcardkudirpopup'
        },
    ],
    init: function () {
        let me = this, _year, _dt = new Date;

        _ajax(
            dir_start_buh_ + 'kudir_process.php',
            {
                action: 'readStatesAll'
            },
            function (response) {
                data = Ext.decode(response);
                _year = data.data.yeartohold;

                if (_year == '') {
                    _year = _dt.getFullYear();
                    me.saveState('yeartohold', _year);
                }

                me.holdYear = parseInt(_year);

                me.holdPeriod.kdrs1 = parseInt(data.data.kdrs1);
                me.holdPeriod.kdrs2 = parseInt(data.data.kdrs2);
                me.holdPeriod.kdrs4 = parseInt(data.data.kdrs4);
                me.holdPeriod.kdrs5 = parseInt(data.data.kdrs5);

                me.taxMode = iif(taxObjNal[_year] == 1, 1, 0);
                me.taxStavka = taxUSNO[_year];
       });

        me.control({
            'kudirPanel': {
                afterRender: this.winRender,
                reloadKudir: this.renderKudir,
                render: this.renderKudir,
                onScroll: this.winRender
            },

            'kudirPanel tabpanel': {
                tabchange: this.tabChange
            },

            // Кнопки панели инструментов
            'kudirtbar button[action=fillbook]': {
                click: this.fillKudir
            },
            'kudirtbar combo[action=setbookinterval]': {
                select: this.periodChange
            },
            'kudirtbar gbs_combo_year': {
                select: this.periodChange
            },
            'kudirtbar button[action=printbook]': {
                click: this.printBook
            },
            'kudirtbar button[action=checkbook]': {
                click: ''
            },
            'kudirtbar button[action=openfilterform]': {
                click: this.openFilter
            },
            'kudirtbar button[action=openaddbookrecord]': {
                click: this.addRecord
            },

            // Гриды на вкладках
            'kudirsection1grid': {
                itemcontextmenu: this.contextMenu,
                gotoDoc: this.goToDocument,
                rollback: this.rollbackChange,
                copy: this.copyRecord,
                goEditor: this.editRecord,
                exclude: this.excludeRecord,
                include: this.includeRecord,
                delete: this.deleteRecord,
                goExplain: this.explainRecord,
            },

            'kudirreferencegrid': {},

            'kudirsection2grid': {
                itemcontextmenu: this.contextMenu,
                gotoDoc: this.goToDocument,
                rollback: this.rollbackChange,
                copy: this.copyRecord,
                goEditor: this.editRecord,
                gotoReference: this.goToReference,
                exclude: this.excludeRecord,
                include: this.includeRecord,
                delete: this.deleteRecord,
            },

            'kudirsection3grid': {},

            'kudirsection4grid': {
                itemcontextmenu: this.contextMenu,
                gotoDoc: this.goToDocument,
                rollback: this.rollbackChange,
                copy: this.copyRecord,
                goEditor: this.editRecord,
                exclude: this.excludeRecord,
                include: this.includeRecord,
                delete: this.deleteRecord,
            },

            'kudirsection5grid': {
                itemcontextmenu: this.contextMenu,
                gotoDoc: this.goToDocument,
                rollback: this.rollbackChange,
                copy: this.copyRecord,
                goEditor: this.editRecord,
                exclude: this.excludeRecord,
                include: this.includeRecord,
                delete: this.deleteRecord,
            },

            // Форма добавления/редактирования
            'editkudirpopup': {
                afterRender: this.winRender,
                onScroll: this.winRender
            },
            'editkudirpopup button[action=gotoDoc]': {
                click: this.goToDocument
            },
            'editkudirpopup kudireditrecordbar button[action=saveeditor]': {
                click: this.saveRecord
            },
            'editkudirpopup kudireditrecordbar button[action=cancelwindow]': {
                click: this.cancelWindow
            },

            // Форма добавления/редактирования OC|НМА
            'editcardkudirpopup': {
                afterRender: this.winRender,
                onScroll: this.winRender
            },

        })
    },

    renderKudir: function () {
        let me = this, win = Ext.getCmp('mainPanelKudir'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            tp = Ext.getCmp('mainPanelKudir').down('tabpanel'),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

        tp.taxStavka = me.taxStavka + '%';
        tp.taxMode = me.taxMode;

        win.yearToHold = me.holdYear;
        win.periodToHold = eval('me.holdPeriod.kdrs' + tab);
        cbPeriod.year = me.holdYear;
        cbPeriod.reconfig(tab, eval('me.holdPeriod.kdrs' + tab));
        cbPeriod.defaultPeriod = cbPeriod.getValue();

        Ext.util.Format.thousandSeparator = " ";

        eval(me.thisMethod(tab));
    },

    tabChange: function (tp, nc, oc) {
        let me = this, win = Ext.getCmp('mainPanelKudir'),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

        Ext.getCmp('mainPanelKudir').reconfig(nc.itemId);

        if (nc.itemId == 3) cbPeriod.disable();
        else cbPeriod.enable();

        cbPeriod.reconfig(nc.itemId, eval('me.holdPeriod.kdrs' + nc.itemId));

        eval(me.thisMethod(nc.itemId));
        me.fireResize();
    },

    thisMethod: function(tab) {
        if (tab == 1) return 'me.loadSection1()';
        else if (tab == 10) return 'me.loadReference()';
        else if (tab == 2) return 'me.loadSection2()';
        else if (tab == 3) return 'me.loadSection3()';
        else if (tab == 4) return 'me.loadSection4()';
        else if (tab == 5) return 'me.loadSection5()';
    },

    periodChange: function () {
        let me = this,
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            year = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId, grid,
            win = Ext.getCmp('mainPanelKudir'),
            tp = Ext.getCmp('mainPanelKudir').down('tabpanel'),
            _lbl = Ext.getCmp('lblTaxUsno'),
            _taxMode = me.taxMode;

        me.holdYear = year.getValue();
        cbPeriod.year = me.holdYear;
        win.yearToHold = me.holdYear;
        eval('me.holdPeriod.kdrs' + tab + '=' + cbPeriod.getValue())
        // cbPeriod.defaultPeriod = cbPeriod.getValue();

        me.taxMode = iif(taxObjNal[cbPeriod.year] == 1, 1, 0);
        me.taxStavka = taxUSNO[cbPeriod.year];
        tp.taxStavka = me.taxStavka + '%';
        tp.taxMode = me.taxMode;

        if (_lbl != _dummy) {
            _lbl.el.dom.innerHTML = '<a class="link-darkgray" data-qtip="Изменить ставку">' + tp.taxStavka + ' (' + tp.taxModes[tp.taxMode] + ')' + '</a>';
        }

        me.saveState('yeartohold', me.holdYear);
        me.saveState('kdrs' + tab, cbPeriod.getValue());
        me.saveState('yeartocalcen', me.holdYear);

        Ext.getCmp('mainPanelKudir').reconfig(tab);
        cbPeriod.reconfig(tab, cbPeriod.getValue());

        if (me.taxMode == _taxMode) {
            if (tab == 10) grid = me.getGrdReference();
            else grid = eval('me.getGrdSection' + tab + '()');
            grid.store.removeAll();

            if (tab == 10) {
                grid.store.proxy.extraParams = {
                    action: 'readReference',
                    d_beg: cbPeriod.periodStartDate,
                    d_end: cbPeriod.periodEndDate,
                    year: year.getValue()
                };
            } else {
                grid.store.proxy.extraParams = {
                    action: 'readSection' + tab,
                    d_beg: cbPeriod.periodStartDate,
                    d_end: cbPeriod.periodEndDate,
                    period: cbPeriod.getValue(),
                    year: year.getValue()
                };
            }

            grid.store.load(function () {
                if (tab === 1) grid.calcTotals();
            });
        } else {
            window.location.reload();
        }
    },

    checkFilter: function (tab) {
        return Ext.decode(Ext.util.Cookies.get('kdrf' + tab));
    },

    configGridStoreWithFilter: function (tab, store, _period, conditions) {
        let me = this;

        if (_period.getValue() != conditions.kf_period && conditions.kf_period > 0) {
            _period.reconfig(tab, conditions.kf_period);
        }

        if (conditions.kf_id_contra != _dummy && parseInt(conditions.kf_id_contra) > 0) {
            store.proxy.extraParams.id_contra = conditions.kf_id_contra;
        }

        if (conditions.kf_sum1 != _dummy && parseFloat(conditions.kf_sum1) > 0) {
            store.proxy.extraParams.sum1 = conditions.kf_sum1;
        }

        if (conditions.kf_sum2 != _dummy && parseFloat(conditions.kf_sum2) > 0) {
            store.proxy.extraParams.sum2 = conditions.kf_sum2;
        }

        if (conditions.kf_doc_name != _dummy) {
            store.proxy.extraParams.short_name = conditions.kf_doc_name;
        }

        if (conditions.kf_n_doc != _dummy && conditions.kf_n_doc.length) {
            store.proxy.extraParams.n_doc = conditions.kf_n_doc.trim();
        }

        if (conditions.kf_op_type != _dummy && conditions.kf_op_type > 0) {
            store.proxy.extraParams.op_type = conditions.kf_op_type;
        }

        if (conditions.kf_id_sod != _dummy && conditions.kf_id_sod > 0) {
            store.proxy.extraParams.id_sod = conditions.kf_id_sod;
        }

        if (conditions.kf_id_op != _dummy && parseInt(conditions.kf_id_op) > 0) {
            store.proxy.extraParams.id_op = conditions.kf_id_op;
        }

        if (conditions.at_period_unit != _dummy) {
            store.proxy.extraParams.at_period_unit = conditions.at_period_unit;
        }

        if (conditions.at_year != _dummy) {
            store.proxy.extraParams.at_year = conditions.at_year;
        }

        if (conditions.d_beg != _dummy && conditions.d_end != _dummy) {
            store.proxy.extraParams.d_beg = conditions.d_beg;
            store.proxy.extraParams.d_end = conditions.d_end;
            store.proxy.extraParams.period = _period.getValue();
        } else {
            _period.reconfig(tab, eval('me.holdPeriod.kdrs' + tab));
            store.proxy.extraParams.d_beg = _period.periodStartDate;
            store.proxy.extraParams.d_end = _period.periodEndDate;
            store.proxy.extraParams.period = _period.getValue();
        }
    },

    loadSection1: function() {
        let me = this,
            grdSection1 = me.getGrdSection1(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            filterData = me.checkFilter(1);

        if (filterData != _dummy && filterData.count > 0) {
            grdSection1.store.proxy.extraParams = {};
            grdSection1.store.proxy.extraParams.action = 'readSection1';
            me.configGridStoreWithFilter(1, grdSection1.store, cbPeriod, filterData);
        } else {
            cbPeriod.reconfig(1, me.holdPeriod.kdrs1);
            grdSection1.store.proxy.extraParams = {action: 'readSection1', d_beg: cbPeriod.periodStartDate, d_end: cbPeriod.periodEndDate, period: cbPeriod.getValue()};
        }

        grdSection1.store.load(function() {
            grdSection1.calcTpl();
            grdSection1.calcTotals();
        });
    },

    loadSection2: function() {
        let me = this,
            grdSection2 = this.getGrdSection2(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

        cbPeriod.reconfig(2, me.holdPeriod.kdrs2);

        grdSection2.store.proxy.extraParams = {action: 'readSection2', d_beg: cbPeriod.periodStartDate, d_end: cbPeriod.periodEndDate};
        grdSection2.store.load();
    },

    loadSection3: function() {
        let me = this,
            grdSection3 = me.getGrdSection3(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

        cbPeriod.reconfig(3);
        grdSection3.store.load();
    },

    loadSection4: function() {
        let me = this,
            grdSection4 = me.getGrdSection4(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            filterData = me.checkFilter(4);

        if (filterData != _dummy && filterData.count > 0) {
            grdSection4.store.proxy.extraParams = {};
            grdSection4.store.proxy.extraParams.action = 'readSection4';
            me.configGridStoreWithFilter(4, grdSection4.store, cbPeriod, filterData);
        } else {
            cbPeriod.reconfig(4, me.holdPeriod.kdrs4);
            grdSection4.store.proxy.extraParams = {action: 'readSection4', d_beg: cbPeriod.periodStartDate, d_end: cbPeriod.periodEndDate, period: cbPeriod.getValue()};
        }

        grdSection4.store.load();
    },

    loadSection5: function() {
        let me = this,
            grdSection5 = me.getGrdSection5(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            filterData = me.checkFilter(5);

        if (filterData != _dummy && filterData.count > 0) {
            grdSection5.store.proxy.extraParams = {};
            grdSection5.store.proxy.extraParams.action = 'readSection5';
            me.configGridStoreWithFilter(5, grdSection5.store, cbPeriod, filterData);
        } else {
            cbPeriod.reconfig(5, me.holdPeriod.kdrs5);
            grdSection5.store.proxy.extraParams = {action: 'readSection5', d_beg: cbPeriod.periodStartDate, d_end: cbPeriod.periodEndDate};
        }

        grdSection5.store.load();
    },

    loadReference: function() {
        let me = this,
            grdRef = me.getGrdReference(),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

        cbPeriod.reconfig(10);
        grdRef.store.load();
    },

    fillKudir: function() {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            _btnFillKudir = Ext.getCmp('mainPanelKudir').down('toolbar').down('[itemId=btnFillKudir]'),
            year = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year'),
            sm1 = 0, sm2 = 0, _preset = {},
            grid = iif(tab != 10, eval('me.getGrdSection' + (tab) + '()'), me.getGrdReference());

        _btnFillKudir.setDisabled(true);
        cbPeriod.year = year.getValue();
        crmEvent('buh', '671D5FEF-3767-4A24-BDAC-1199A60EC313', false, false);

        kdirFilled = false;

        let fn = function (response) {
            let r = Ext.JSON.decode(response);

            if (kdirFilled == false) {
                let _confirm = Ext.create('Buh.view.kudir.service.ConditionalConfirm', {
                    msg: '',
                    d_beg: cbPeriod.periodStartDate,
                    d_end: cbPeriod.periodEndDate,
                    year: cbPeriod.year,
                    tax_mode: me.taxMode,
                    _data: r.data,
                    _grid: grid
                });
                _confirm.show();
            }
        }

        _ajax(dir_start_buh_ + 'kudir_process.php', {
            action: 'getFillPreset',
            d_beg: cbPeriod.periodStartDate,
            d_end: cbPeriod.periodEndDate,
            tax_mode: me.taxMode,
            year: cbPeriod.year
        }, fn);
    },

    contextMenu: function (v, rec, it, ind, e, eo) {
        e.stopEvent();
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()');

        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.getSelectionModel().select(rec);
        me.contextMenuConfig(grid, rec);
        grid.menu.showAt(e.getXY());
    },

    /**
     * Метод contextMenuConfig
     * Отрисовка меню грида 1,2,4,5 разделов.
     * См. описание https://conf.action-media.ru/pages/viewpage.action?pageId=208911041
     *
     * @param grid Активный грид
     * @param record Текущая запись
     */
    contextMenuConfig: function (grid, record) {
        let tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            rec = record.data;

        /**
         * Новый тип записи с расшифровкой.
         * По умолчанию скрытый.
         */
        grid.menu.down('[name=menuExplain]').hide(); //Расшифровка

        if (rec.auto == 2) {
            /** Автозаполненная запись. */
            grid.menu.down('[name=menuDelete]').hide(); //Удалить

            if (tab != 2) {
                /** Кроме 2 раздела. */
                grid.menu.down('[name=menuGoToCard]').hide(); //Открыть карточку
                grid.menu.down('[name=menuGoToRef]').hide(); //Перейти в справочник

                /** Новый тип записи с расшифровкой. */
                if (rec.id_op == 4) {
                    grid.menu.down('[name=menuExplain]').show(); //Расшифровка
                    grid.menu.down('[name=menuGoToDoc]').hide(); //Перейти к документу
                    grid.menu.down('[name=menuRollback]').hide(); //Отменить исправления
                    grid.menu.down('[name=menuGoEditor]').hide(); //Изменить
                } else {
                    if (rec.is_dirty == 1) {
                        /** Запись исправлена */
                        grid.menu.down('[name=menuRollback]').show(); //Отменить исправления
                        grid.menu.down('[name=menuGoToDoc]').hide(); //Перейти к документу
                    } else {
                        grid.menu.down('[name=menuGoToDoc]').show(); //Перейти к документу
                        grid.menu.down('[name=menuRollback]').hide(); //Отменить исправления
                    }
                    grid.menu.down('[name=menuGoEditor]').show(); //Изменить
                }
            } else {
                /** Только для Раздела 2. */
                grid.menu.down('[name=menuGoToDoc]').hide(); //Перейти к документу
                grid.menu.down('[name=menuRollback]').hide(); //Отменить исправления
                grid.menu.down('[name=menuGoEditor]').hide(); //Изменить
                grid.menu.down('[name=menuGoToRef]').show(); //Перейти в справочник
            }
        } else {
            /** Запись, добавленная вручную. */
            if (tab != 2) {
                /** Кроме 2 раздела. */
                grid.menu.down('[name=menuGoEditor]').show(); //Изменить
                grid.menu.down('[name=menuGoToCard]').hide(); //Открыть карточку
            } else {
                /** Только для Раздела 2. */
                grid.menu.down('[name=menuGoToCard]').show(); //Открыть карточку
                grid.menu.down('[name=menuGoEditor]').hide(); //Изменить
            }

            grid.menu.down('[name=menuRollback]').hide(); //Отменить исправления
            grid.menu.down('[name=menuGoToDoc]').hide(); //Перейти к документу
            grid.menu.down('[name=menuGoToRef]').hide(); //Перейти в справочник
            grid.menu.down('[name=menuDelete]').show(); //Удалить
        }

        if (rec.iskl == 1) {
            /** Запись исключена. */
            grid.menu.down('[name=menuCopy]').hide(); //Копировать
            grid.menu.down('[name=menuInclude]').show(); //Вернуть запись
            grid.menu.down('[name=menuExclude]').hide(); //Исключить
        } else {
            /** Запись не исключена. */
            if (rec.id_op == 4 || rec.source == 1000009) {
                /** Новый тип записи с расшифровкой + запись из сделки. */
                grid.menu.down('[name=menuCopy]').hide(); //Копировать
            } else {
                /** Любая другая запись. */
                grid.menu.down('[name=menuCopy]').show(); //Копировать
            }
            grid.menu.down('[name=menuExclude]').show(); //Исключить
            grid.menu.down('[name=menuInclude]').hide(); //Вернуть запись
        }
    },

    openFilter: function() {
        let me = this, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            win = Ext.create('Buh.view.kudir.filter.FilterWindow', {
                'tabId': tab,
                '_taxMode': me.taxMode,
                'data': iif(Ext.util.Cookies.get('kdrf' + tab) != _dummy, Ext.decode(Ext.util.Cookies.get('kdrf' + tab), {}))
            });

        if (tab == 1) {
            crmEvent('buh', '34D9D950-5B36-4C8A-9D55-96DD67B77787', false, false);
        } else if (tab == 4) {
            crmEvent('buh', 'BEEA9C08-F6E0-48D7-992E-9BCAA1F7880B', false, false);
        } else if (tab == 5) {
            crmEvent('buh', 'E8D542F3-641D-4577-BDF6-F1DC999DC4AD', false, false);
        }

        win.show();
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

    addRecord: function () {
        let me = this, tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            win = Ext.create('Buh.view.kudir.editor.EditorWindow', {'_action': 'add', '_tabId': tab, '_taxMode': me.taxMode});

        if (tab != 2) {
            if (tab == 1) {
                crmEvent('buh', 'C6F490F5-C570-4FEC-89B5-727EC5544B55', false, false);
            } else if (tab == 4) {
                crmEvent('buh', '1343FF45-9F8B-4E4F-B3A0-5C4AF6AE70B0', false, false);
            } else if (tab == 5) {
                crmEvent('buh', '967EED97-DFE8-4725-B250-0F4569DBE7EE', false, false);
            }

            win.show();
        }
    },

    editRecord: function (rec) {
        let me = this, tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId, _win, form;

        if (tab != 2) {
            _win = Ext.create('Buh.view.kudir.editor.EditorWindow', {'_action': 'edit', '_tabId': tab, '_data': rec.data, '_taxMode': me.taxMode})
            form = _win.down('form')
            me.fillForm(tab, form, rec);
        } else {
            let _owner = Ext.getCmp('mainPanelKudir'), _constrain = _owner._owner;
            _win = Ext.create('Buh.view.kudir.editor.CardEditorWindow', {'_action': 'edit', '_tabId': tab, '_data': rec.data, '_typeCard': 0, 'renderTo': _constrain})
            _win.on({
                activate: function (el) {
                    el.fireResize();
                }
            });
            Ext.EventManager.onWindowResize(_win.fireResize, _win);
        }
        _win.show();
    },

    fillForm: function (tab, form, record) {
        let rec = record;
        form.getForm().setValues(rec.data);
    },

    saveRecord: function() {
        let me = this, _recId = 0,
            win = me.getWinEditor(),
            form = win.down('form'),
            toolbar = win.down('toolbar'),
            oper_type = win.down('three_select').getValue(),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            notValidField = win.query('textfield{isValid()===false}'),
            grid = eval('me.getGrdSection' + (tab) + '()'),
            _options = grid.store.lastOptions, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            _selected = iif(grid.getSelectionModel().hasSelection() == true, grid.getSelectionModel().getSelection()[0], {}),
            _winFilter = me.getWinFilter(),
            _filterBtn = Ext.getCmp('mainPanelKudir').down('[name=filterButton]'),
            cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

        if (notValidField.length > 0) {
            notValidField[0].focus();
            return false;
        } else {
            toolbar.down('button[name=editor_save_btn]').disable();
        }

        form.submit({
            submitEmptyText: false,
            url: dir_start_buh_ + 'kudir_process.php',
            params: {
                action: 'save',
                year: cbYear.getValue()
            },
            success: function (form, action) {
                _recId = action.result.data.id;

                if (win.action === 'add') {
                    Ext.util.Cookies.set('kdrf' + tab, null, new Date(1970, 1, 1));
                    Ext.util.Cookies.clear('kdrf' + tab);

                    _filterBtn.filterData = {};
                    _filterBtn.filterCount = 0;
                    _filterBtn.setText("Фильтр");
                    _filterBtn.setIcon('/img/filter-icon.svg');
                    _filterBtn.removeCls('ico_number');
                    Ext.getCmp('mainPanelKudir').down('kudirtbar').doComponentLayout();

                    cbPeriod.reconfig(tab, 12);
                    grid.store.removeAll();
                    grid.store.proxy.extraParams = {
                        action: 'readSection' + tab,
                        d_beg: cbPeriod.periodStartDate,
                        d_end: cbPeriod.periodEndDate,
                        period: cbPeriod.getValue()
                    };

                    Ext.apply(_options, {
                        callback: function (records, options) {
                            let rec = grid.store.findRecord('id', _recId);
                            grid.getSelectionModel().select(rec);
                        }
                    });
                } else {
                    if (!_selected.length) {
                        Ext.apply(_options, {
                            callback: function (records, options) {
                                let rec = grid.store.findRecord('id', _recId);
                                grid.getSelectionModel().select(rec);
                            }
                        });
                    } else {
                        Ext.apply(_options, {
                            index: _selected.index,
                            callback: function (records, options) {
                                grid.getSelectionModel().select(options.index);
                            }
                        });
                    }
                }

                grid.store.reload(_options);
                if (tab === 1) {
                    if (_recId > 0) me.scrollTo(grid, _recId);
                    grid.calcTotals();
                }
                win.close();
            }
        });
    },

    scrollTo: function(grid, id) {
        let me = this, store = grid.store, selModel = grid.getSelectionModel(),
            record = store.getById(id), proxy = grid.store.proxy;

        if (record) {
            grid.verticalScroller.scrollTo(store.indexOf(record), false);
        } else {
            let _defaults = proxy.extraParams, _params;

            _params = _defaults.constructor();
            for (let attr in _defaults) {
                if (attr === 'action') _params[attr] = 'position';
                else _params[attr] = _defaults[attr];
            }

            _ajax(proxy.url, Ext.merge({}, _params, {id: id}), function (resp) {
                let response = Ext.decode(resp);
                if (response.position > 0) {
                    grid.verticalScroller.scrollTo(response.position, true);
                }
            });
        }
    },

    goToDocument: function (record) {
        //document.getElementById("mn1-1-03").click();
        buhManager.openTab({
            source: 3,
            source_id: record.data.id_doc,
            task: "find",
            period: "m",
            periodVal: Ext.Date.parse(record.data.date_orig, 'd.m.Y').getMonth().toString()
        });
    },

    goToReference: function (record) {
        buhManager.openSprav({source: 1, source_id: record.data.id});
    },

    rollbackChange: function (record) {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()'),
            _options = grid.store.lastOptions,
            _selected = iif(grid.getSelectionModel().hasSelection() === true, grid.getSelectionModel().getSelection()[0], {});

        if (record.data.id > 0) {
            _ajax(dir_start_buh_ + 'kudir_process.php',
                {
                    action: 'rollback',
                    id: record.data.id,
                    tab_id: tab,
                    source: record.data.source,
                    source_id: record.data.source_id
                },
                function (resp) {
                    if (!_selected.length) {
                        Ext.apply(_options, {
                            callback: function (records, options) {
                                let rec = grid.store.findRecord('id', record.data.id);
                                grid.getSelectionModel().select(rec);
                            }
                        });
                    } else {
                        Ext.apply(_options, {
                            index: _selected.index,
                            callback: function (records, options) {
                                grid.getSelectionModel().select(options.index);
                            }
                        });
                    }
                    grid.store.reload(_options);
                    if (tab === 1) grid.calcTotals();
                }
            );
        }
    },

    copyRecord: function (record) {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()'),
            _options = grid.store.lastOptions;

        if (record.data.id > 0) {
            _ajax(dir_start_buh_ + 'kudir_process.php',
                {
                    action: 'copy',
                    id: record.data.id,
                    tab: tab
                },
                function (resp) {
                    let response = Ext.decode(resp);
                    Ext.apply(_options, {
                        callback: function (records, options) {
                            let rec = grid.store.findRecord('id', response.data.id);
                            grid.getSelectionModel().select(rec);
                        }
                    });
                    // grid.store.reload(_options);
                    grid.store.load(_options);
                    if (tab === 1) grid.calcTotals();
                }
            );
        }
    },

    excludeRecord: function (record) {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()'),
            rec = record.data, msg, numDoc = '',
            _options = grid.store.lastOptions,
            _selected = iif(grid.getSelectionModel().hasSelection() === true, grid.getSelectionModel().getSelection()[0], {});

        if (rec.id > 0) {
            Ext.apply(_options, {
                index: _selected.index,
                callback: function (records, options) {
                    grid.getSelectionModel().select(options.index);
                }
            });

            if (tab == 1) {
                crmEvent('buh', '37251309-05A4-462D-8B5C-9235EDEF61E0', false, false);
            } else if (tab == 2) {
                crmEvent('buh', '81806B5A-5F56-4C08-9FA4-C7E2CE7090CB', false, false);
            } else if (tab == 4) {
                crmEvent('buh', '11988C3D-7648-4852-B80B-678AA2F25EB4', false, false);
            } else if (tab == 5) {
                crmEvent('buh', '880A1746-F1C9-427B-B1C1-0EDC121AE900', false, false);
            }

            if (rec.n_doc != null && rec.n_doc.length) {
                numDoc = iif(tab === 1 && rec.id_op == 4, rec.n_doc, ' №' + rec.n_doc + ' от ' + rec.doc_date);
            } else {
                numDoc = 'Без документа от ' + rec.doc_date;
            }

            msg = iif(tab !== 2,
                'Исключится запись ' + iif(rec.short_name !== _dummy && rec.short_name !== null, rec.short_name, '') +
                numDoc +
                iif(rec.operation != 'null' && rec.operation != _dummy, ' &mdash; ' + rec.operation, '') + '.',
                'Исключится запись ' + rec.name + '.');

            let _confirm = Ext.create('Buh.view.kudir.service.Confirm', {
                title: 'Исключить запись из Книги?',
                msg: msg,
                btn1: 'Исключить',
                fn1: function () {
                    _fn = function () {
                        grid.store.reload(_options);
                        if (tab === 1) grid.calcTotals();
                    };
                    _ajax(dir_start_buh_ + 'kudir_process.php', {
                            action: 'exclude',
                            id: rec.id,
                            id_op: rec.id_op,
                            source: rec.source,
                            source_id: rec.source_id
                        },
                        _fn);
                },
            });

            _confirm.show();
        }
    },

    includeRecord: function (record) {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()'),
            rec = record.data, _options = grid.store.lastOptions,
            _selected = iif(grid.getSelectionModel().hasSelection() === true, grid.getSelectionModel().getSelection()[0], {});

        if (rec.id > 0) {
            Ext.apply(_options, {
                index: _selected.index,
                callback: function (records, options) {
                    grid.getSelectionModel().select(options.index);
                }
            });

            _ajax(dir_start_buh_ + 'kudir_process.php',
                {
                    action: 'include',
                    id: rec.id,
                    id_op: rec.id_op,
                    source: rec.source,
                    source_id: rec.source_id
                },
                function (resp) {
                    grid.store.reload(_options);
                    if (tab === 1) grid.calcTotals();
                }
            );
        }
    },

    deleteRecord: function (record) {
        let me = this,
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = eval('me.getGrdSection' + tab + '()'),
            rec = record.data || record,
            _options = grid.store.lastOptions;

        if (rec.id > 0) {
            let docName = rec.short_name || rec.doc_name, msg, numDoc = '',
                _selectedIndex = iif(record.index > 0, record.index - 1, 0);

            Ext.apply(_options, {
                index: _selectedIndex,
                callback: function (records, options) {
                    grid.getSelectionModel().select(options.index);
                }
            });

            if (rec.n_doc != null && rec.n_doc.length) {
                numDoc = iif(tab === 1 && rec.id_op == 4, rec.n_doc, ' №' + rec.n_doc + ' от ' + rec.doc_date);
            } else {
                numDoc = 'Без документа от ' + rec.doc_date;
            }

            msg = iif(tab != 2,
                'Удалится запись ' + numDoc +
                iif(rec.operation != 'null' && rec.operation != _dummy, ' &mdash; ' + rec.operation, '') + '.',
                'Удалится запись ' + rec.name + '.');

            let _confirm = Ext.create('Buh.view.kudir.service.Confirm', {
                title: 'Удалить запись в Книге?',
                msg: msg,
                btn1: 'Удалить',
                fn1: function () {
                    _fn = function () {
                        grid.store.remove(record);
                        grid.store.reload(_options);
                        if (tab === 1) grid.calcTotals();
                    };
                    _ajax(dir_start_buh_ + 'kudir_process.php', {action: 'delete', id: rec.id, tab: tab}, _fn);
                },
            });

            _confirm.show();
        }
    },

    printBook: function () {
        let _printConfirm = Ext.create('Buh.view.kudir.service.PrintConfirm');
        _printConfirm.show();
    },

    fireResize: function () {
        let win = Ext.getCmp('mainPanelKudir'),
            size = Ext.getBody().getViewSize(),
            needheight = size.height,
            needwidth = size.width,
            tab = win.down('tabpanel').activeTab.itemId,
            gs = win.down('#grid' + tab),
            _popup = Ext.get('messageNewsNumber1'),
            _popSize = iif(_popup != undefined && localStorage.getItem("messageNewsNumber1") !== "invisible", 200, 0);

        win.setWidth(needwidth);
        win.setHeight(needheight-111-_popSize);
        if (gs != null) {
            gs.setHeight(needheight-270-_popSize);
            gs.setWidth(needwidth);
        }

        win.doLayout();
    },

    explainRecord: function(rec) {
        let winExplain = Ext.create('Buh.classes.dir.tovarGroupDetail', {
            source: rec.data.source,
            source_id: rec.data.source_id,
            date: rec.data.date,
            renderTo: Ext.getCmp('mainPanelKudir')._owner
        });
        winExplain.show();
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
