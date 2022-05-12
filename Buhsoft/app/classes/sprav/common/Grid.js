Ext.define('Buh.classes.sprav.common.Grid', {
    alternateClassName: ['spravGrid'],
    /*******************************************************************************/
    /*******************************************************************************/
    /*                                                                             */
    /*               grid                                                          */
    /*                                                                             */
    /*******************************************************************************/
    /*******************************************************************************/



    makeGrid: function (id_sprav, title, afields, have_tree, aFields, sm, loadProc) {
        let _id_sprav = id_sprav;
        /************     грид          ************************/

        /******    Колонки для грида   ****/

        aFields = this.getAFields(_id_sprav, aFields);


        /*********************
         *   toobars
         ****************/
        let tbGrd = this.toolbar(_id_sprav);

        /******************
         *    store
         **************/
        let gridStore = this.makeGridStore(_id_sprav, afields, loadProc);

        let grd = Ext.create('Ext.grid.Panel', {
            selModel: sm || {
                pruneRemoved: false
            },
            width: 600,
            height: 400,
            filt: '',
            cls: 'grid-multi-line',
            id: 'spravGrid' + _id_sprav,
            setId: function (pid) {
                this.up('window').itemId = pid;
            },
            store: gridStore,
            columns: aFields,
            tbar: tbGrd
        });
        gridStore.grid = grd;

        /**************************
         *  grid events
         **********************/
        this.gridEvents(grd, id_sprav)

        return grd;

    },

    /*******************************************************************************/
    /*******************************************************************************/
    /*                                                                             */
    /*               grid toobar                                                   */
    /*                                                                             */
    /*******************************************************************************/
    /*******************************************************************************/

    toolbar: function (_id_sprav) {
        let tbGrd = [
            {
                xtype: 'greenbutton',
                text: 'Добавить',
                hidden: _id_sprav == 21,
                handler: function () {
                    let grid = this.up('grid');
                    grid.fireEvent('addNewItemGrid');
                }
            },
            {
                xtype: 'button',
                cls: 'grey-btn',
                itemId: 'btnForImport',
                tooltip: 'Заполнить состав из файла Excell',
                hidden: (_id_sprav == 3 | _id_sprav == 4 | _id_sprav == 5 | _id_sprav == 6) ? false : true,
                icon: '/img/xls-icon.svg',
                handler: function () {
                    if (_id_sprav == 6) {
                        crmEvent('1pgb_buh', 'importexcelkontr', false, false);
                        importContra();
                    }
                    if (_id_sprav == 5) {
                        crmEvent('1pgb_buh', 'importexceltov', false, false);
                        importTovar();
                    }
                    if (_id_sprav == 3) {
                        crmEvent('1pgb_buh', 'importexcelmtrl', false, false);
                        openNomImp(3);
                    }
                    if (_id_sprav == 4) {
                        crmEvent('1pgb_buh', 'importexcelprod', false, false);
                        openNomImp(4);
                    }
                }
            },
            {
                text: 'Акт сверки',
                itemId: 'btnForAkt',
                hidden: _id_sprav != 6,
                handler: function () {
                    let me = this, grid = me.up('grid'), d = new Date(), data = {}, _contragent = null;

                    if (grid.getSelectionModel().hasSelection()) {
                        data = grid.getSelectionModel().getSelection()[0].data;
                        _contragent = data.id;
                    }

                        startASV = d.getTime();

                    if (parseInt(currYear) > 2020) {
                        reconciliationReportMaster = Ext.create('Buh.view.reconciliationreport.Panel', {'contragent': _contragent});
                        reconciliationReportMaster.show();
                    } else {
                        if (grid.getSelectionModel().hasSelection()) {
                        aktSv(grid.getSelectionModel().getSelection()[0].data.id, data);
                    }
                }
                }
            },
            {
                text: 'Печать',
                itemId: 'btnForPrint',
                icon: _icons.print,
                hidden: _id_sprav != 6,
                handler: function () {
                    let out = [];
                    for (var key in proxy_params) {
                        if (proxy_params.hasOwnProperty(key)) {
                            out.push(key + '=' + encodeURIComponent(proxy_params[key]));
                        }
                    }
                    window.location.href = dir_start_buh_ + "frm_spis_cont.php?" + out.join('&');
                }
            },
            {xtype: 'tbfill'},

        {
            text: 'Пригласить к ЭДО',
            itemId: 'maintEDO',
            cls: 'light_blue-btn',
            icon: _icons.edo_invite,
            hidden: true,//_id_sprav != 6,
            handler: function () {
                    let button = this, winSprav = this.up('window');

                    if (winSprav.haveEDO) {
                        crmEvent('buh', '2737D5DB-5198-4EC7-B48F-AF195B1369F1');
                        winSprav.mntEdo.inviteToEdoAll(button);
                    } else {
                        crmEvent('buh', '590A53EB-55F3-434D-9235-8DA876708650');
                        winSprav.mntEdo.connectToEdo(button);
                    }
            },
            sended:  function (res, cnt, aceid, err_msg) {
                let winSprav = this.up('window');

                if (res == true) {
                    if (cnt != 0) {
                        if(err_msg) {
                            err_msg = '<br>'+err_msg;
                        }
                        winSprav.mntEdo.showInfoWin("Отправлено " + cnt + " приглашени" + winSprav.mntEdo.ending(cnt) + " - подключение может занять несколько дней."+err_msg);
                        let  grid = Ext.getCmp('spravGrid6')
                        items = grid.store.data.items;
                        items.forEach(function (item, index) {
                            if (aceid.indexOf( item.data.contra_edo_id ) != -1) {
                                grid.store.data.items[item.index].data.edo_invite = '2';
                                grid.getView().refreshNode(item.index);
                            }
                        });
                    }
                    else {
                        winSprav.mntEdo.showInfoWin(err_msg, 'red');
                    }
                    } else {
                    winSprav.mntEdo.showInfoWin(cnt, 'red');
            }
                }
        },

            {
                xtype: 'field_find',
                emptyText: (_id_sprav == 15 ? 'Поиск по контрагенту' : 'Поиск'),
                timeout: null,
                width: 180,
                listeners: {
                    change: function (t, nv, ov, e) {
                        let _fld = this, win = this.up('window'), grid = this.up('grid'),
                            tree = win.down('treepanel');

                        if (this.timeout != null) {
                            clearTimeout(this.timeout);
                        }

                        _fn = function () {
                            let id_grp = -1;

                            if (tree.getSelectionModel().hasSelection()) {
                                id_grp = tree.getSelectionModel().getSelection()[0].data.id;
                            }

                            if (win.treeOff == 0) {
                                grid.store.proxy.extraParams = {
                                    sprav: _id_sprav,
                                    group: id_grp,
                                    nm: nv
                                };
                            } else {
                                grid.store.proxy.extraParams = {
                                    sprav: _id_sprav,
                                    group: -1,
                                    nm: nv
                                };
                            }

                            grid.store.load();
                            proxy_params = grid.store.proxy.extraParams;
                        };
                        this.timeout = setTimeout(_fn, 500);
                    }
                }
            },
        {
            text: '',
            itemId: 'refreshEdo',
            icon: '/img/refresh-grey.svg',
            tooltip: 'Обновить данные ЭДО',
            hidden: _id_sprav != 6,
            handler: function () {
                let me = this;
                _ajax(dir_start_buh_ + 'edo/clearbase',
                    {
                        aai: aktionid.config.appid,
                        eat: aktionid.token,
                        userid: userid,
                    },
                    function (resp) {

                        let grid = me.up('grid');
                        grid.store.load();
                    });
            }
        }


        ];

        if (_id_sprav == 23) {
            tbGrd = [{
                xtype: 'button',
                text: 'Все',
                id: 'eiused',
                hidden: false,
                width: 120,
                handler: function (cb, nv, ov, obj) {
                    let win = this.up('window'), fnd = win.down('field_find'),
                        grid = this.up('grid');

                    if (this.text == 'Все') {
                        this.setText('Только используемые');
                        grid.store.proxy.extraParams = {
                            sprav: _id_sprav,
                            filt: ' ifnull(b.id, 0)>0 ',
                            nm: fnd.getValue()
                        };
                        grid.store.load();
                    } else {
                        this.setText('Все');
                        grid.store.proxy.extraParams = {
                            sprav: _id_sprav,
                            filt: '',
                            nm: fnd.getValue()
                        };
                        grid.store.reload();
                    }
                }
            },
                {
                    xtype: 'field_find',
                    listeners: {
                        'change': function (t, nv, ov, e) {
                            let grid = this.up('grid');
                            proxy_params = grid.store.proxy.extraParams;

                            grid.store.filterBy((function (r) {
                                if ((r.get('nms').toUpperCase()).indexOf(nv.toUpperCase()) >= 0)
                                    return true;
                                else
                                    return false;
                            }));
                        }
                    }
                },
                {
                    xtype: 'button',
                    text: 'X',
                    tooltip: 'Отменить поиск',
                    handler: filterGrid23
                }];
        }

        if (_id_sprav == 9 | _id_sprav == 11) {
            tbGrd = [{xtype: 'tbfill'}];
        }

        return tbGrd;

    },


    /*******************************************************************************/
    /*******************************************************************************/
    /*                                                                             */
    /*               grid  store                                                   */
    /*                                                                             */
    /*******************************************************************************/
    /*******************************************************************************/


    makeGridStore: function (_id_sprav, afields, loadProc) {

        return Ext.create('Ext.data.Store', {
            firstload: false,
            allChecked: false,
            buffered: true,
            grid: null,
            trailingBufferZone: 10,
            leadingBufferZone: 10,
            pageSize: 80,
            extraParams: {sprav: _id_sprav, group: -1, nm: ''},
            proxy: {
                type: 'ajax',
                api: {
                    read: dir_start_buh_ + 'grid.php',
                    destroy: dir_start_buh_ + 'grid_del.php',
                    update: dir_start_buh_ + 'grid_upd.php',
                    create: dir_start_buh_ + 'grid_add.php'
                },
                reader: {
                    type: 'json',
                    root: 'data',
                    totalProperty: 'totalCount'
                }
            },
            writer: {
                type: 'json',
                writeAllFields: false,
                root: 'data'
            },
            fields: afields,

        listeners: {
            load: function (s, recs, success, e) {
                if (_id_sprav == 6 && !this.firstload) {
                    this.firstload = true;
                    this.checkGrid();
                }
                if (loadProc != null) {
                    loadProc();
                }
            },
            prefetch: function (th, records, successful, operation, eOpts) {
                if (_id_sprav == 6 && this.firstload) {
                    this.allChecked = false;
                }
            },
            datachanged: function (th, eOpts) {
                if (_id_sprav == 6 && this.firstload && !this.allChecked) {
                    th.checkGrid();
                }
            },
            remove: function (s, record, index, e) {
                let grid = this.grid, win = grid.up('window');
                Grd = s.data.items,
                    rc = grid.store.getAt(index - 1);
                if (rc != null) {
                    grid.getSelectionModel().select(index - 1);
                    win.itemId = rc.data.id;
                    } else {
                    win.itemId = 0;
                    }
            },
        },
        checkGrid: function () {
            if (_id_sprav == 6) {
                //this.suspendEvents();
                    let me = this, grid = this.grid, win = grid.up('window');

                //grid.suspendLayouts();

                Grd = this.data.items;
                Grd.forEach(function (item) {
                    if (item.data.state == '' && item.data.ogrn.length > 10) {
                        _ajax(
                            dir_start_buh_ + "contra_get_state.php",
                            {
                                'org_id': item.data.id
                            },
                            function (res) {
                                    let rc = Ext.decode(res, true);
                                item.data.state = rc.state;
                                grid.getView().refreshNode(item.index);
                            }
                        );
                    }
                });

                _fn = function () {
                    //grid.resumeLayouts();
                    wrapper = null;
                    me.allChecked = true;
                }
                let wrapper = new Wrapper(_fn);
                if (win.mntEdo != null)
                    win.mntEdo.checkContraStatus(userid, grid, win, wrapper);
            }
        }
        });

    },


    /****************************
     *   grid events
     ****************************/

    gridEvents: function (grd, _id_sprav) {

        grd.getSelectionModel().on('select', function (g, r, i, e) {
            let gridMenu = grd.up('window').gridMenu;
            if(gridMenu) {
                gridMenu.rec = r;
            }
        });


    grd.on({
        itemcontextmenu: function (grid, record, item, index, e, eOpts) {
            e.stopEvent();
            let gridMenu = grd.up('window').gridMenu;
            if(gridMenu) {
                gridMenu.rec = record;
                gridMenu.showAt(e.getXY());
            }
        },
        cellclick: function (t, td, cellIndex, record, tr, rowIndex, e, eOpts) {
            e.stopEvent();
            // edo
            if (cellIndex==8)   // Приглашение к ЭДО у контрагентов
            {
                let winSprav = this.up('window');
                    if (winSprav.haveEDO) {
                      winSprav.mntEdo.inviteToEdo(record);
                    } else {
                      winSprav.mntEdo.connectToEdoShort(td);
                    }
            }
        },

        celldblclick: function (g, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                let win = this.up('window'), menu = win.gridMenu;
            if (!win.toSel) {
                    if (_id_sprav != 9 && _id_sprav != 11) {
                        //editItemGrid();
                        menu.down('[action=edit]').handler(record);
                    }
            } else {
                win.down('grid').fireEvent('selectItemGrid');
            }
        },
        selectionchange: function (g, selected, eOpts) {
                let comp = this;
            if (comp.getSelectionModel().hasSelection()) {
                    let mainWin = this.up('window');
                mainWin.itemId = selected[0].data.id;
            }
        },

        addNewItemGrid: function () {
                let win = this.up('window'), tree = win.down('treepanel'), winTax,
            id_grp = (win.haveTree, 0, -1);

                if (tree.getSelectionModel().hasSelection()) {
                id_grp = tree.getSelectionModel().getSelection()[0].data.id;
                }

            switch (id_grp) {
                case -10:
                        winTax = Ext.create('Buh.view.taxoffice.Edit');
                    winTax.open({id: 0, mode: 'tax'});
                    break;
                case -11:
                        winTax = Ext.create('Buh.view.taxoffice.Edit');
                    winTax.open({id: 0, mode: 'fond'});
                    break;

                default:
                    editor = win.editor;
                    Ext.getCmp(editor).openEdit(0, id_grp, _id_sprav, 'spravGrid' + _id_sprav, null, '');
                    Ext.getCmp(editor).caller = null;
                    if (_id_sprav == 15 && win.org_id != undefined) {
                        Ext.getCmp(editor).down('[name=org_id]').setValue(win.org_id);
                        Ext.getCmp(editor).down('[name=org_nam]').setValue(win.org_nam);
                    }
                    break;
            }

        },

        selectItemGrid: function () {
                let win = this.up('window'), grid = this, tree = win.down('treepanel'),
                    menu = win.gridMenu, _mw = win;

            if (grid.getSelectionModel().hasSelection()) {
                    let rec = grid.getSelectionModel().getSelection()[0],
                        fld_id = _mw.fldId, fld_val = _mw.fldVal, id_to_select = 0;

                    if (_id_sprav != 1) {
                    id_to_select = rec.data.id;
                    } else {
                    id_to_select = rec.data.id_os;
                    }

                    if (id_to_select == 0) {
                        _alert_win('Отказано', 'Данный пункт не предназначен для выбора в качестве аналитики');
                    } else {
                        if (fld_id != '') {
                            let c = Ext.getCmp(fld_id).up('container'),
                                n = rec.data.nms,
                                v = 0;
                            c.rec = rec;
                            v = (_id_sprav != 1) ? rec.data.id : rec.data.id_os;
                            c.setValue(v, n);
                        }
                        _mw.hide();
                        if (_mw.afterAction != undefined && _mw.afterAction != '') {
                            _mw.afterAction(rec);
                    }
                    }
                } else if (_mw.old_id == _mw.itemId) {
                    _mw.hide();
                }
            },

            filterGrid: function () {
                let win = this.up('window'), grid = win.down('grid'),
                    fnd = win.down('field_find'),
                    tree = win.down('treepanel'),
                    menu = win.gridMenu;

                win.treePanelOff();
                let id_grp = -1;

                if (tree.getSelectionModel().hasSelection()) {
                    id_grp = tree.getSelectionModel().getSelection()[0].data.id;
                }

                if (win.treeOff == 0) {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        group: id_grp,
                        nm: fnd.getValue()
                    };
                } else {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        group: -1,
                        nm: fnd.getValue()
                    };
                }
                grid.store.load();
            },

            filterGridClr: function () {
                let win = this.up('window'),
                    grid = win.down('grid'),
                    fnd = win.down('field_find'),
                    tree = win.down('treepanel'),
                    menu = win.gridMenu;

                win.fnTreeOn();
                fnd.setValue('');
                let node = tree.store.getNodeById('0');
                tree.store.getNodeById(node.data.id).set('expanded', false);
                tree.store.sync();
                tree.view.refresh();
                if (win.treeOff == 0) {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        group: id_grp,
                        nm: fnd.getValue()
                    };
                } else {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        group: -1,
                        nm: fnd.getValue()
                    };
                }
                grid.store.load();
            },

            filterGrid23: function () {
                let win = this.up('window'), grid = win.down('grid'),
                    fnd = win.down('field_find');

                fnd.setValue('');
                if (Ext.getCmp('eiused').text == 'Все') {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        filt: '',
                        group: -1,
                        nm: fnd.getValue()
                    };
                } else {
                    grid.store.proxy.extraParams = {
                        sprav: _id_sprav,
                        filt: ' ifnull(b.id, 0)>0 ',
                        group: -1,
                        nm: fnd.getValue()
                    };
                }
                grid.store.load();
            },

        });


    },


    /********************
     *     column fields
     *********************/
    getAFields: function (_id_sprav, _col) {

        if (_col == null) {
            _col = [{
                text: 'id',
                dataIndex: 'id',
                hidden: true
            }, {
                text: 'Название',
                dataIndex: 'name',
                flex: 1
            }];
        }

    if (_id_sprav == 6)
        _col = [{
            text: 'id',
            dataIndex: 'id',
            hidden: true
        }, {
            xtype: 'rownumberer',
            width: 50,
            hidden: true,
            sortable: false
        }, {
            text: 'ТИП',
            hidden: true,
            dataIndex: 'type',
            width: 80,
            renderer: function (grid, column, record) {
                return ['', 'ПФР', 'ФОМС', 'ФСС'][record.get('type') * 1];
            }
        }, {
            text: 'Код',
            hidden: true,
            dataIndex: 'kod',
            width: 80,
        }, {
            text: '<b>Наименование</b>',
            dataIndex: 'nms',
            flex: 1,
            renderer: function (grid, column, record) {
                let _name = "<div style='white-space:normal !important;'>";
                _name += iif(record.get('our_org') == 1, "<b>" + record.get('naim') + "</b>", record.get('naim'));
                _name += iif(record.get('sanctions') == 1, "<div class='color-orange'>Под санкциями</div>",  "");
                return _name;
            }
        }, {
            text: '<b>ИНН</b>',
            dataIndex: 'inn',
            width: 120,
            renderer: function (grid, column, record) {
                return record.get('our_org') == 1 ? '<b>' + record.get('inn') + '</b>' : record.get('inn');
            }
        }, {
            text: '<b>Надежность</b>',
            dataIndex: 'inn',
            width: 100,
            align: 'center',
            renderer: function (org, column, record) {
                if (record.get('state') == 'R') {
                    return '<center><img src="../../img/contractor-state-danger.svg" width="25px" height="25px"/></center>';
                }
                if (record.get('state') == 'Y') {
                    return '<center><img src="../../img/contractor-state-warning.svg" width="25px" height="25px"/></center>';
                }
                if (record.get('state') == 'E') {
                    return '<center><img src="../../img/contractor-state-taboo.svg" width="25px" height="25px"/></center>';
                }
                if (record.get('state') == 'G') {
                    return '<center><img src="../../img/contractor-state-ok.svg" width="25px" height="25px"/></center>';
                }
                if (record.get('state') == 'E' || record.get('state') == '') {
                    return '';
                }

            }
        }, {
            text: 'Основная',
            dataIndex: 'main',
            width: 100,
            renderer: function (grid, column, record) {
                return record.get('main') == 1 ? '<img src="' + _icons.v_gr + '">' : '';
            }
        }, {
            text: 'ЭДО',
            //hidden: true,
            dataIndex: 'edo_invite',
            width: 60,
            align: 'center',
            renderer: function (grid, column, record) {
                    let txt = '', toolTip = "", es = record.get('edo_invite'), win = this.up('window');
                if (record.get('contra_edo_id') == 0  && es == 0) {
                    es = '-1';
                }
                if(record.get('our_org') == 1) {
                    es = null;
                }

                switch (es) {
                    case '-1':
                        txt = '<center><img src="' + _icons.edo_gray + '" width="25px" height="25px"/></center>';
                            if (win.haveEDO) {
                                //  - кликните для отправки приглашения по эл.почте
                                toolTip = "Нет информации о подключении";
                            } else {
                            toolTip = "Нет информации о подключении";
                            }
                        break;
                    case '0':
                        txt = '<center><img src="' + _icons.edo_blue + '" width="25px" height="25px"/></center>';
                            if (win.haveEDO) {
                            toolTip = "Контрагент подключен к ЭДО - кликните для отправки приглашения начать ЭДО";
                            } else {
                            toolTip = "Контрагент подключен к ЭДО";
                            }
                        break;
                    case '2':
                    case '3':
                        txt = '<center><img src="' + _icons.edo_quest + '" width="25px" height="25px"/></center>';
                        toolTip = "Контрагент подключен к ЭДО. Отправлено приглашение - подключение может занять несколько дней";
                        break;
                    case '1':
                        txt = '<center><img src="' + _icons.edo_green + '" width="25px" height="25px"/></center>';
                        toolTip = "Можно обмениваться документами через ЭДО";
                        break;
                }
                column.tdAttr = 'data-qtip="' + toolTip + '"';
                return txt;
            }
        }];

        if(_id_sprav != 9) {
            let act_col = {
                xtype: 'actioncolumn',
                width: 50,
                items: [{
                    tooltip: 'Операции с данными',
                    handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                        let win = this.up('window'), s = rec.data.sprav, menu = win.gridMenu,
                            m = rec.data.main;
                        menu.down('[text=Копировать]').setVisible(false);
                        menu.down('[text=Сделать основной]').setVisible(s == '12' && m == 0);
                        menu.rec = rec;
                        menu.showAt(e.getXY());
                    }
                }]
            };

            _col.push(act_col);
        }

        return _col;
    }
});

function Wrapper(callback)  {
    let value = false;
    this.set = function(v) {
        value = v;
        if (v)
            callback(this);
    }
    this.get = function() {
        return value;
    }
}
