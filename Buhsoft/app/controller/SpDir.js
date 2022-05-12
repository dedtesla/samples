Ext.define('Buh.controller.SpDir', {
    extend: 'Ext.app.Controller',
    /*
    requires : [
                'Buh.classes.common.Values'
                ],
    */
    refs: [

        {
            ref: 'win',
            selector: 'spravdir'
        },
        {
            ref: 'grid',
            selector: 'spravdir grid'
        },
        {
            ref: 'editor',
            selector: 'editdir'
        },
        {
            ref: 'btnOk',
            selector: 'spravdir button[action=select]'
        }
    ],

    init: function () {
        this.control({
            'spravdir': {
                showWin: this.showWin,
                close: this.closeWin,
                addVdrWin: this.addVdrWin, // Добавление вида ДиР напрямую
            },

            'spravdir button[action=addvdr]': {
                click: this.addRecord, // Добавление строки ДиР
            },

            'spravdir grd_sprav_dir': {
                editRecord: this.editRecord, // Редактирование строки ДиР
                deleteRecord: this.deleteRecord, // Удаление строки ДиР
            },


            'spravdir threeselect': {
                switch: this.changeVidDir, // Фильтрация ДИР по виду доход/расход/патент
            },

            'spravdir combo': {
                select: this.filterVid, // Фильтрация ДИР по данным фильтра и аналитики
            },

            'spravdir fld_find': {
                change: this.filterVid, // Фильтрация ДИР по данным фильтра и аналитики
            },

            'spravdir button[action=select]': {
                click: this.selectVdr, // Выбрать вид ДиР из справочника
            },

            'spravdir button[action=cancel]': {
                click: this.closeVdr, // Закрыть справочник
            },

            'spravdir grid': {
                itemcontextmenu: this.contextMenu, // Контекстное меню для грида ДиР
                itemdblclick: this.selectVdr, // Выбрать вид ДиР из справочника
                select: this.selRowDir, // Выбор строки грида ДиР
            },

            'editdir threeselect': {
                switch: this.fillRazdel, // Заполнить разделы ДиР в окне редактирования

            },

            'editdir button[action=save]': {
                click: this.editSave, // Сохранить вид ДиР

            },

        });
    },

    showWin: function () {

        var _args = arguments[0],
            win = this.getWin(),
            grid = this.getGrid(),
            combo = win.down('combo'),
            startVid = 1;
        win.filter = 0;
        win.typ_oper = 0;
        win.select = -1;
        if (_args.patent == undefined || _args.patent == 0) {
            startVid = 2;
            win.down('three_select').showButtons([2, 3]);
        }
        if (_args.select != undefined) {
            startVid = ((_args.vid * 1 + 1) > 3 ? 1 : _args.vid * 1 + 1);
            win.filter = _args.filter;
            win.select = _args.select;
            win.typ_oper = _args.typ_oper * 1;
            win.down('combo_analit').hide();
            win.down('[name=tbVDR]').show();
            if (win.typ_oper == 2 && _args.patent == 1) {
                win.down('three_select').show();
                win.down('three_select').showButtons([1, 2]);
            }
            else {
                if (_args.notHide == _dummy)
                    win.down('three_select').hide();
            }

        }


        win.down('three_select').setValue(startVid);
        win.inviter = _args.inviter || null;
        combo.bindStore(CommonVals.getDRAnalit(1));
        this.changeVidDir(startVid);

        win.show();

    },

    closeWin: function () {

        if (Ext.getCmp('btnForAddPatentFomDir'))
            Ext.getCmp('btnForAddPatentFomDir').destroy();


    },

    changeVidDir: function (_vid) { // Фильтрация ДИР по виду доход/расход/патент
        var win = this.getWin(),
            grid = this.getGrid();
        win.down('combo').setValue("-1");
        win.down('fld_find').setValue("");
        win.down('combo').store.clearFilter();
        if (_vid == 2) {
            win.down('combo').store.filterBy(function (rc) {
                return (rc.data.id != 32 && rc.data.id != 31 && rc.data.id != 2);
            });
        }
        if (_vid == 3) {
            win.down('combo').store.filterBy(function (rc) {
                return (rc.data.id != 41);
            });
        }
        if (win.select >= 0) {
            var t = new CommonVals(),
                title = '';
            if (win.filter > 0)
                title = t.getTextAnalit(win.filter) + ": выбор " + ['патента', 'дохода', 'расхода'][_vid - 1] + " для КУДИР";
            else
                title = "Выбор " + ['патента', 'дохода', 'расхода'][_vid - 1] + " для КУДИР";
            win.down('form').setTitle(title);
        }
        grid.store.proxy.extraParams = {tab: 2002, 'd_r_': this.getTypVdr(_vid)};

        grid.store.load({
            callback: function () {
                if (win.select > 0) {
                    var rec = grid.store.findRecord('id', win.select);
                    grid.getSelectionModel().select(rec);
                    win.select = 0;
                }
                if (win.typ_oper > 0) {
                    var filt = Ext.create('Buh.classes.sprav.DiR'),
                        arrFiltVid = filt.getArrFilter(win.typ_oper);
                    if (win.filter > 0)
                        var grdClone = Ext.clone(grid.store);
                    grdClone.filterBy(function (rec_) {
                        if (Ext.Array.indexOf(arrFiltVid[win.filter], rec_.data.id_orig) != -1 ||
                            ((rec_.data.id_orig * 1) == 0 && rec_.data.id_analit2 == win.filter) ||
                            ((rec_.data.d_r_ * 1) == 3 && win.typ_oper == 2))
                            return true;
                        else
                            return false;
                    });

                    grid.store.filterBy(function (rec_) {
                        p1 = Ext.Array.indexOf(arrFiltVid[win.filter], rec_.data.id_orig) != -1;
                        p2 = ((rec_.data.id_orig * 1) == 0 && rec_.data.id_analit2 == win.filter);
                        p3 = ((rec_.data.read_onl * 1) == 2 && grdClone.find('id_gr', rec_.data.id_gr) > -1);
                        p4 = ((rec_.data.d_r_ * 1) == 3 && win.typ_oper == 2);
                        if (p1 ||
                            p2 ||
                            p3 ||
                            p4)
                            return true;
                        else
                            return false;

                    });
                }
            }
        });

        if (_vid == 1) {
            this.getGrid().columns[2].hide();

            if (this.getGrid().store.count() == 0 && !Ext.getCmp('btnForAddPatentFomDir')) {
                var button = Ext.create('Ext.button.Button', {
                    id: 'btnForAddPatentFomDir',
                    cls: 'btn-sel-blue',
                    text: "Добавить в личном кабинете"
                    , floating: true
                    , renderTo: Ext.getBody(),
                    handler: function () {
                        linksExtrn('mn5-3-11', '');
                        this.destroy();
                    }
                });
                button.setZIndex(4000000);
            }

        }
        else {
            this.getGrid().columns[2].show();
            if (Ext.getCmp('btnForAddPatentFomDir'))
                Ext.getCmp('btnForAddPatentFomDir').destroy();
        }

    },

    getTypVdr: function (_v) {
// Тип ДиР от номера кнопки
        var _v1 = _v * 1;
        switch (_v1) {
            case 1 :
                return 3;
                break
            case 2 :
                return 1;
                break
            case 3 :
                return 2;
                break
        }
    },

    filterVid: function () { // Фильтрация ДИР по данным фильтра и аналитики
        var store = this.getGrid().store,
            combo = this.getWin().down('combo').getValue(),
            text = this.getWin().down('fld_find').getValue().toUpperCase();

        store.filterBy((function (r) {
            var t1 = t2 = true;
            if (combo >= 0) {
                t1 = r.get('id_analit2') == combo;
            }
            if (Ext.String.trim(text) != "") {
                t2 = (r.get('name').toUpperCase()).indexOf(text) >= 0;
            }

            if (t1 & t2)
                return true;
            else
                return false;
        }));

    },

    addRecord: function () {  // Добавление строки ДиР
        var page = this.getWin().down('three_select').getValue(),
            win = Ext.create('Buh.view.sprav.Dir.Edit'),
            rec = this.getGrid().getSelectionModel().getSelection()[0];
        if (this.getWin().filter != 0)
            win.filter = this.getWin().filter;
        this.editDiR(win, page, rec, 0);

    },

    editRecord: function () { // Редактирование строки ДиР
        var page = this.getWin().down('three_select').getValue(),
            win = Ext.create('Buh.view.sprav.Dir.Edit'),
            rec = this.getGrid().menu.rec;
        this.editDiR(win, page, rec, 1);
    },

    deleteRecord: function (rec) { // Удаление строки ДиР
        var store = this.getGrid().store;
        var fn_del = function () {
            _ajax(dir_start_buh_ + 'proces.php', {'act': 'delkdr', 'id': rec.data.id}, function () {
                store.remove(rec)
            });
        }
        _confirmDel(fn_del);

    },

    addVdrWin: function () { // Добавление вида ДиР напрямую

        var _args = arguments[0];
        _p0 = _args.patent;
        _p1 = _args.select;
        _p2 = _args.vid;
        _p3 = _args.filter;
        _p4 = _args.inviter;
        _page = _args.vid;

        var win = Ext.create('Buh.view.sprav.Dir.Edit');
        win.inviter = _args.inviter;
        win.filter = _args.filter;
        this.editDiR(win, _page, null, 0);
    },

    editDiR: function (win, _page, _rec, _mode) {
// Открыть окно редактирования ДиР
        var gr = _rec != null ? _rec.data.id_gr : 0;
        win.show();
        win.down('[name=id_analit2]').bindStore(CommonVals.getDRAnalit(3));
        win.down('three_select').setValue(_page);
        win.down('three_select').hide();
        if (_mode != 0) {
            win.down('[name=id]').setValue(_rec.data.id);
            win.down('[name=id_gr]').setValue(_rec.data.id_gr);
            win.down('[name=id_analit2]').setValue(_rec.data.id_analit2);
            win.down('[name=name]').setValue(_rec.data.name);
            this.fillRazdel(_page, gr);
        }
        else {
            if (_page != 3 && buh_nalog_mode == 2) {
                win.down('three_select').showButtons([1, 2]);
                win.down('three_select').show();
            }
            win.down('[name=id_analit2]').setValue((win.filter * 1) > 0 ? win.filter : '5');
            win.down('[name=id_analit2]').setDisabled((win.filter * 1) > 0);
//            win.down('[name=id_analit2]').setReadOnly((win.filter * 1) > 0);
            win.down('[name=id]').setValue(0);
            win.down('[name=id_gr]').setValue(0);
            win.down('[name=name]').setValue("");
            this.fillRazdel(_page, gr);
        }

    },


    fillRazdel: function (_r, _v) {
        // Заполнить разделы ДиР в окне редактирования
        var combo = this.getEditor().down('[name=id_gr_]'),
            id = this.getEditor().down('[name=id]').getValue(),
            ar_title = new Array(),
            store = Ext.create('Buh.store.VidDirRazd');

        if (_r == 2) {
            this.getEditor().down('[name=id_analit2]').store.filterBy(function (rc) {
                return (rc.data.id != 32 && rc.data.id != 31 && rc.data.id != 2);
            });
        }
        if (_r == 3) {
            this.getEditor().down('[name=id_analit2]').store.filterBy(function (rc) {
                return (rc.data.id != 41);
            });
        }

        ar_title[0] = new Array();
        ar_title[1] = new Array();
        ar_title[0][1] = "Добавление патента";
        ar_title[0][2] = "Добавление дохода";
        ar_title[0][3] = "Добавление расхода";
        ar_title[1][1] = "Редактирование патента";
        ar_title[1][2] = "Редактирование дохода";
        ar_title[1][3] = "Редактирование расхода";
        this.getEditor().down('form').setTitle(ar_title[(id == 0 ? 0 : 1)][_r]);
        this.getEditor().setPatent(_r);
        store.proxy.extraParams = {tab: 2002, d_r_: this.getTypVdr(_r), razdel: 1};
        store.load({
            callback: function (records, operation, success) {
                combo.bindStore(store);
                if (parseInt(_v) == 0 || isNaN(parseInt(_v))) {
                    var rec = store.getAt(0);
                    combo.setValue(rec.data.id_gr);
                }
                else
                    combo.setValue(_v);
            }
        });

    },

    editSave: function () {
        // Сохранить вид ДиР

        var win = this.getEditor(),
            form = win.down('form'),
            d_r_ = this.getTypVdr(form.down('[name=d_r_]').getValue()),
            grid = this.getGrid(),
            an2 = form.down('[name=id_analit2]').getValue(),
            cb = win.down('[name=id_gr_]'),
            rec = cb.store.findRecord('id_gr', cb.getValue());
        form.submit({
            url: dir_start_buh_ + 'form.php',
            params: {
                'action': 'savekdr',
                'name_gr': rec.data.name_gr,
                'id_pgr': rec.data.id_pgr,
                'id_gr_': rec.data.id_gr_,
                'id_analit2': an2,
                'd_r': d_r_,
                'acc': ''
            },
            success: function (form, action) {
                /*
                   let d = new Date();
                   let endAddSd = d.getTime();
                   let duration = (endAddSd - startAddSd) / 1000;
                   crmEventDoc('buh', '5b639164ce9f4f42', 0, 0, duration);
                */
                var ret = eval(action.result);

                if (win.inviter == undefined) {
                    grid.store.reload();
                }
                else {
                    win.inviter.callback(ret);
                }
                win.close();
            }
        });


    },

    selectVdr: function () {
        // Выбрать вид ДиР из справочника
        var win = this.getWin(),
            grid = this.getGrid(),
            rec = grid.getSelectionModel().getSelection()[0];
        if (rec != undefined && rec.data.read_onl != 2) {
            let result = win.inviter.callback(rec);
            if(result !== false) {
                this.getWin().close();
            }
        }

    },

    closeVdr: function () {
        // Закрыть справочник
        this.getWin().close();
    },

    contextMenu: function (v, rec, it, ind, e, eo) {
        // Контекстное меню для грида ДиР
        e.stopEvent();
        if (rec.get('read_onl') == 2)
            return;
        var grid = this.getGrid();
        grid.menu.grd = grid;
        grid.menu.rec = rec;

        if ((rec.data.id_orig * 1) == 0) {
            grid.menu.showAt(e.getXY());
        }
        else {
            Ext.create('Ext.tip.ToolTip', {
                html: 'Изменять и удалять можно только добавленные доходы и расходы',
                dismissDelay: 0,
                showDelay: 0,
            }).showAt(e.getXY());

        }


    },

    selRowDir: function (sm, rec, ind, e) {
        // Выбор строки грида ДиР
        if (rec.get('read_onl') == 2)
            this.getBtnOk().disable();
        else
            this.getBtnOk().enable();
    }


});
