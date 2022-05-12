Ext.define('Buh.classes.sprav.Tool', {

    constructor: function () {
        Ext.apply(this, arguments);
        this.addEvents({
            fillstore: true,
            change: true
        });
        this.callParent(arguments);
        arg = arguments[0] || [];
        this._args = arg;
        if (arg != undefined) {
            this.getComponent('title_').update(arg.fieldLabel || '');
            if (arg.fieldLabel == _dummy) this.getComponent('title_').hide();
            this.haveFilter = arg.haveFilter || false;
            this.filterExp = arg.filterExp || '';
            this.callBack = arg.callBack || null;
            if (this.fid != _dummy) {
                this.getComponent('id').name = this.fid;
                this.relayEvents(this.getComponent('id'), ['change']);
            }
            if (this.fnm != _dummy)
                this.getComponent('text_').name = this.fnm;
            if (this.allowBlank != _dummy)
                this.getComponent('text_').allowBlank = this.allowBlank;
            if (this.selectOnFocus != _dummy)
                this.getComponent('text_').selectOnFocus = this.selectOnFocus;

            if (arg.listWidth != _dummy)
                this.listWidth = arg.listWidth;

            this.getComponent('text_').emptyText = (arg.emptyText || "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0438\u043b\u0438 \u0434\u043e\u0431\u0430\u0432\u044c\u0442\u0435"); //Выберите или добавьте
            this.getComponent('text_').minChars = arg.minChars;
            this.getComponent('text_').setEditable(arg.editable);
            this.getComponent('btnAdd').setText(arg.btnTitle || "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c"); //Добавить @GBS-9878
            if (this.haveFilter && this.filterExp == '') {
                this.setFilterEmpty();
            }
            this.showAdd = arg.showAdd != _dummy ? arg.showAdd : true;
            this.menuOff = arg.menuOff != _dummy ? arg.menuOff : false;
        }

        var me = this, fld_model;
        me.owner = this.up('window');

        switch(me.id_sprav) {
            case 2005:
            case 2007:
                fld_model = [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                    {type: 'string', name: 'nms'},
                    'analit1', 'analit2', 'analit3'
                ];
                break;
            case 151:
                fld_model = [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                    {type: 'string', name: 'nms', convert: function(v, record) {
                        return (record.get('id') > 0 ? "\u0414\u043e\u0433\u043e\u0432\u043e\u0440 "+ v : v) //Договор
                    }}
                ];
                break;
            default:
                fld_model = [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                    {type: 'string', name: 'nms'}

                ];
        }

        if (!this.store) {
            this.store = Ext.create('Ext.data.Store', {
                proxy: {
                    type: 'ajax',
                    url: dir_start_buh_ + 'getcbsprav.php/' + me.id_sprav,
                    extraParams: {'filt': ''},
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                },
                fields: fld_model,
                autoLoad: false
            });
        }
        this.store.on('load', function() {
            me.fireEvent('fillstore')
        })
    },
    /*****************/
    xtype: 'sprav_tool',
    id_sprav: 0,
    haveFilter: false,
    filterExp: '',
    callBack: null,
    menuOff: false,
    rec: null,
    _args: null,
    /**********************/

    owner: null,
    extend: 'Ext.container.Container',
    flex: 1,
    layout: 'hbox',
    store: null,
    listConfig: {},//minWidth: 500, minHeight: 200
    win: '',
    shortText: false,
    oldVal : '',
    oldValName : '',
    shortTextLength: 0,
    shortTextTrailingLength: 4,
    shortTextDelimiter: ' ... ',
    lineWrap: false,
    editable: true,
    minChars: 4,
    btnAddWidth: null,
    items: [
        {
            'xtype': 'component',
            'itemId': 'title_',
            'width': 150,
            'html': ''
        },
        {
            'xtype': 'button',
            'icon': _icons.plus_grey,
            'text': 'Добавить',
            'itemId': 'btnAdd',
            'textAlign': 'left',
            'hidden': true,
            'width': 106,
            'handler': function () {
                this.up('container').btnAdd();
            }
        },
        {
            'xtype': 'textfield',
            'hidden': true,
            'itemId': 'id',
            'name': 'id',
            'value': 0,
            'setNewValue': function (_val) {
                var container = this.up('container');
                this.setValue(_val);
                var _text = container.down('#text_').getValue();
                container.fireEvent('select', container.rec);
                this.fireEvent('blur');
                if (container.callBack != null) {
                    let rec = container.rec;
                    container.callBack(rec, rec ? (container.store.getById(rec.data.id) || rec) : null); // надо бы rec сюда зафигачить
                }
            }
        },
        {
//            'xtype': 'gbs_combo',
            'xtype': 'combo',
            'cls': ' field-combo-button',
            'labelSeparator': '',
            'msgTarget': 'none',
            'name': 'text_',
            'itemId': 'text_',
            enableKeyEvents: true,
            'flex': 1,
            'listeners': {
                change: function () {
                    if (this.up('window') != _dummy) {
                        this.up('window').modified = true;
                    }
                },
                keyup: function (t, e, eOpts) {
                    this.up('sprav_tool').fillStore();
                },
                blur: function (inp, recs, e) {
                    this.collapse();
                    if (this.allowBlank && !this.getValue()) {
                        this.up('sprav_tool').getComponent('id').setNewValue(null);
                        this.up('sprav_tool').getComponent('text_').setValue('');
                    }
                },
                //поменял focus => click потому что если стоит editable: false, ивент не срабатывает
                click: function (t, e, opt) {
                    if (!t.readOnly) {
                        let me = this;
                        me.expand();
                        me.picker.id_sprav = t.up('sprav_tool').id_sprav;
                        me.picker.setWidth(520);
                    }
                },
                expand: function () {
                    let cnt = this.up('sprav_tool');
                    cnt.oldVal = this.getValue();
                }
            },
            createPicker: function () {
                var me = this,
                    fld = null,
                    picker,
                    w = me.up('sprav_tool');
                if (w.id_sprav == 2005 || w.id_sprav == 2007) {
                    w.store.on('load', function () {
                        let idx = me.getValue() ? this.findExact('nms', me.getValue()) : -1,
                            rc = idx !== -1 ? this.getAt(idx) : false,
                            selModel;
                        if (rc) {
                            selModel = picker.getSelectionModel();
                            selModel.select(rc, false, true);
                            selModel.setLastFocused(rc);
                        }
                    });
                    fld = [
                        {text: 'Id', dataIndex: 'id', hidden: true},
                        {
                            text: 'Text', dataIndex: 'nms', flex: 1, renderer: function (grid, column, record) {
                            return (record.data.id) + " &mdash; " + (record.data.name);
                        }
                        },
                    ];
                }
                if (w.id_sprav == 502) {
                    fld = [
                        {text: 'Id', dataIndex: 'id', hidden: true},
                        {
                            text: 'Text', dataIndex: 'nms', flex: 1, renderer: function (grid, column, record) {
                            var s = record.data.nms,
                                ar = s.match(/.{1,4}/g),
                                v = s != "" ? ar.join(' ') : '';

                            return s;
                        }
                        },
                    ];
                }
                /*
                */
                picker = Ext.create('Buh.classes.combo.RowPicker', Ext.apply({
                    id_sprav: w.id_sprav,
                    owner: w,
                    grd: me.up('grid'),
                    store: w.store,
                    fld: fld,
                    cls: 'null-window up_layer new-dropdown_menu grid-cell-wrap' + (w.lineWrap ? ' grid-cell-wrap' : ''),
                    btnSpravShow: w.btnSpravShow != undefined ? w.btnSpravShow : true,
                    btnAddShow: w.btnAddShow != undefined ? w.btnAddShow : true,
                    btnAddText: w.btnAddText != undefined ? w.btnAddText : undefined,
                    spravBtn: function (win) {
                        var fldVal = w.getComponent('id'),
                            fldText = w.getComponent('text_');

                        if (w.id_sprav == 3 || w.id_sprav == 4 || w.id_sprav == 41 || w.id_sprav == 5) {
                            var _input = {
                                _task: "find",
                                _id_oper: 0,
                                _grid: null,
                                _sprav: w.id_sprav,
                                _sklad: null,
                                _date: null,
                                _block: buh_nalog_mode != 1,
                                _store: null,
                                onSelect: function (st) {
                                    let rec = st.getAt(0);
                                    w.setValue(rec.data.items_id, rec.data.name + ", " + rec.data.edizm_na);
                                }
                            };
                            openSpravTotal(_input);
                        } else if (w.id_sprav >= 800 && w.id_sprav < 900) {
                            var winTree = editTreeSprav(w.id_sprav - 800, 'Группы', fldVal.id, fldText.id);
                            winTree.show();
                        }
                        else if (w.id_sprav == 541) {

                            var winVDR = Ext.create('Buh.view.sprav.Dir.Window'),
                                d = {};
                            d.callback = function (_args) {
                                fldVal.setValue(_args.data.id);
                                fldText.setValue(_args.data.name);
                            };
                            winVDR.fireEvent('showWin', {
                                'patent': (buh_have_patent_ > 0 ? 1 : 0 ),
                                'typ_oper': (w.typ_dir == 1 ? 2 : 0),
                                'select': 0,
                                'vid': w.typ_dir,
                                'filter': 0,
                                'inviter': d
                            });
                        }
                        else if (w.id_sprav == 12 || w.id_sprav == 121 || w.id_sprav == 13 || w.id_sprav == 131 || w.id_sprav == 132 || w.id_sprav == 133 || w.id_sprav == 134) {
                            Ext.getCmp('mainWin6').selTreeStart = "-10";
                            let callback = '';
                            if (w.id_sprav == 121) {
                                callback = function (rec) {
                                    let c = Ext.getCmp(fldVal.id).up('container'),
                                        n = rec.data.kod + " - " + rec.data.nms,
                                        v = rec.data.id;
                                    c.setValue(v, n);
                                };
                            }
                            Ext.getCmp('mainWin6').showWin(fldVal.getValue(), true, fldVal.id, fldText.id, callback, filt, false);
                            Ext.defer(function () {
                                Ext.getCmp('mainWin6').selTreeAfterShow();
                            }, 500);
                        } else if (w.id_sprav == 503) {
                            resetMn();
                            openRSmy({
                                extraParams: {
                                    id_sprav: w.id_sprav,
                                },
                                afterchange: function (action, result) {
                                    if (oDefaults.bank == result.id) {
                                        oDefaults.bank_id_sc = result.data.id_sc;
                                        oDefaults.bank_name = result.data.nms;
                                    }
                                    w.setValue(result.id, result.data.nms);
                                    w.setMinus();
                                    this.hide();
                                }
                            });
                        } else if (w.id_sprav == 504) {
                            resetMn();
                            openRSmy({
                                extraParams: {
                                    id_sprav: w.id_sprav,
                                },
                                afterchange: function (action, result) {
                                    if (oDefaults.bank == result.id) {
                                        oDefaults.bank_id_sc = result.data.id_sc;
                                        oDefaults.bank_name = result.data.nms;
                                    }
                                    w.setValueSilent(result.id, result.data.nms);
                                }
                            });
                        }
                        else if (w.id_sprav == 11 || w.id_sprav == 111 || w.id_sprav == 112) {
                            Ext.getCmp('mainWin' + 11).showWin(fldVal.getValue(), true, fldVal.id, fldText.id, '', filt, false);
                        }
                        else if (w.id_sprav == 11 || w.id_sprav == 111 || w.id_sprav == 112) {
                            Ext.getCmp('mainWin' + 11).showWin(fldVal.getValue(), true, fldVal.id, fldText.id, '', filt, false);
                        }
                        else if (w.id_sprav == 15 || w.id_sprav == 151) {
                            var filt = '';
                            if (w.org_id != undefined) {
                                filt = "org_id=" + w.org_id;
                                Ext.getCmp('mainWin15').org_id = w.org_id;
                                Ext.getCmp('mainWin15').org_nam = w.org_nam;
                            }
                            Ext.getCmp('mainWin15').showWin(fldVal.getValue(), true, fldVal.id, fldText.id, '', filt, false);
                        }
                        else {
                            Ext.getCmp('mainWin' + w.id_sprav).showWin(fldVal.getValue(), true, fldVal.id, fldText.id, '', filt, false);
                        }


                    },
                    spravAddBtn: function (win) {
                        this.owner.btnAdd();
                    },
                    callback: function (rec) {
                        this.owner.rec = rec;
                        this.owner.recOrigin = rec;
                        this.owner.setValue(rec.data.id, rec.data.nms);
                        this.owner.lostFocus();

                    }
                }, w.listConfig));
                return picker;
            },


        }

    ],
    fillStore: function () {
        var me = this,
            sv = this.getComponent('text_').getValue();
        me.store.proxy.extraParams.query = sv;
        me.store.load();
    },

    lostFocus: function () {
//        this.getComponent('text_').setEditable(false);
    },

    setEmptyText: function (_text) {
        var me = this,
            v = me.getComponent('text_');
        Ext.apply(v, {emptyText: _text});
        v.applyEmptyText();

    },

    listeners: {
        render: function () {
            var me = this;
            /*
                        me.owner = this.up('window'),
                            fld_model = [
                                {type: 'string', name: 'id'},
                                {type: 'string', name: 'name'},
                                {type: 'string', name: 'nms'}

                            ];
                        if (me.id_sprav == 2005) {
                            fld_model = [
                                {type: 'string', name: 'id'},
                                {type: 'string', name: 'name'},
                                {type: 'string', name: 'nms'},
                                'analit1', 'analit2', 'analit3'
                            ];
                        }

                        if (me.id_sprav == 502) {
                            fld_model = [
                                {type: 'string', name: 'id'},
                                {type: 'string', name: 'name'},
                                {type: 'string', name: 'nms'}
                            ];
                        }
                        this.store = Ext.create('Ext.data.Store', {
                            proxy: {
                                type: 'ajax',
                                url: dir_start_buh_ + 'getcbsprav.php/' + me.id_sprav,
                                extraParams: {'filt': ''},
                                reader: {
                                    type: 'json',
                                    root: 'data'
                                }
                            },
                            fields: fld_model,
                            autoLoad: false
                        });
            */
            this.getComponent('text_').setWidth(me.getWidth());
            this.down('button').setWidth(me.getWidth() - 10);


        },

    },

    /******************************************************************************************/
    /******************************************************************************************/
    /******************************************************************************************/
    /*                     Методы кастомные                                                   */
    /******************************************************************************************/
    /******************************************************************************************/
    /******************************************************************************************/
    setOff: function () {
        this.getComponent('text_').disable();

    },

    setOn: function () {
        this.getComponent('text_').enable();

    },

    setNewSprav: function (_id) {
        this.id_sprav = _id;
        this.store.proxy.url = dir_start_buh_ + 'getcbsprav.php/' + _id;

    },

    setMinus: function () {
        this.getComponent('text_').show();
        this.down('button').hide();

    },

    setPlus: function (btnText, width) {
//        var wdth = this.getComponent('text_').up('container').getWidth();
        let _button = this.getComponent('btnAdd');
        this.getComponent('text_').hide();
        if (btnText) {
            _button.setText(btnText);
        }
        if (width !== null) {
            _button.setWidth(width || 106);
        }
        _button.show();
    },

    setValueSilent: function (_id, _nm) {

        var rec = {};
        rec.data = {id: _id, name: _nm};
        this.rec = rec;
        this.getComponent('text_').setValue(this.shortText ? this.setShortText(_nm) : _nm);
        this.getComponent('id').setValue(_id);

    },

    setValue: function (_id, _nm) {
        var rec = {};
        rec.data = {id: _id, name: _nm};
        this.rec = rec;
        this.getComponent('text_').setValue(this.shortText ? this.setShortText(_nm) : _nm);
        this.getComponent('id').setNewValue(_id);

    },

    isEmptyField: function () {
        if (this.getComponent('id').getValue() != 0)
            return true;
        else
            return false;

    },

    focus: function () {
        if (this.down('button').isVisible())
            this.btnAdd();
        else
            this.getComponent('text_').focus();
    },

    getValue: function () {
        return this.getComponent('id').getValue();

    },

    getRawValue: function () {
        return this.getComponent('text_').getRawValue();

    },

    setFilter: function (_val, callBackAdd) {
        if (!this.haveFilter) return;
        var me = this;
        this.filterExp = _val;
        if (this.filterExp != '') {
            this.setValueSilent(0, '');
            this.getComponent('text_').setReadOnly(false);
            this.getComponent('text_').removeCls('uni-combo-off');
            this.getComponent('text_').addCls('field-combo-button');
            this.store.proxy.extraParams = {filt: _val};
            this.store.load({
                callback: function (records, operation, success) {
                    if (me.btnAddShow !== false && (records == null || records.length == 0))
                        me.setPlus(null, me.btnAddWidth || null);
                    else
                        me.setMinus();
                    if (callBackAdd != undefined)
                        callBackAdd(records);
                }
            });
        }
        else
            this.setFilterEmpty();
    },

    btnAdd: function () {
        var me = this;
        if (me.id_sprav == 6) {
            Ext.getCmp('spravContra6').openEditOuter({
                id: 0, 'grp': 0, 'sprav': 6,
                callback: function (_inp) {
                    me.setValue(_inp.id, _inp.name);
                }
            });
        }
        if (me.id_sprav == 7) {
            Ext.getCmp('spravSort7').openEditOuter({
                id: 0, 'grp': 0, 'sprav': 7,
                callback: function (_inp) {
                    me.setValue(_inp.data.id, _inp.data.name);
                }
            });
        }

        if (me.id_sprav == 12 || me.id_sprav == 121 || me.id_sprav == 13 || me.id_sprav == 131 || me.id_sprav == 132 || me.id_sprav == 133 || me.id_sprav == 134) {
            var _mode = (me.id_sprav == 134) ? 'fond' : 'tax';
            //var _mode = 'tax';
            var winTax = Ext.create('Buh.view.taxoffice.Edit');
            winTax.open({
                id: 0, mode: _mode, callback: function (_inp) {
                    me.setValue(_inp.data.id, _inp.data.name);
                }
            });
        }

        if (me.id_sprav == 15 || me.id_sprav == 151) {
            Ext.getCmp('spravdogwin15').openEditOuter({
                id: 0, 'grp': 0, 'sprav': 15,
                callback: function (_inp) {
                    me.setValue(_inp.data.id, _inp.data.nms);
                    me.setMinus();
                }
            });
            Ext.getCmp('spravdogwin15').down('[name=org_id]').setValue(me.org_id);
            Ext.getCmp('spravdogwin15').down('[name=org_nam]').setValue(me.org_nam);
        }
        if (me.id_sprav == 25) {
            Ext.getCmp('spravSklad25').openEditOuter({
                id: 0, 'grp': 0, 'sprav': 25,
                callback: function (_inp) {
                    me.setValue(_inp.data.id, _inp.data.nms);
                    me.setMinus();
                }
            });
        }
        if (me.id_sprav == 502) {
            ar = me.filterExp.split("=");
            var winRsEditCustom = Ext.create('wineditrecord', {'panelitems': pnlRsEdit_custom});
            var vals = {'sprav': 22, 'org_id': ar[1]};
            winRsEditCustom.openEdit({
                'values': vals,
                callback: function (_inp) {
                    _ajax(dir_start_buh_ + 'sp_rs_add_p.php', _inp, function (_ret) {
                        var ans = Ext.decode(_ret);
                        me.setValue(ans.data.id, ans.data.nms);
                        me.setMinus();
                    });
                }
            });
        }

        /*if (me.id_sprav == 503) {
            _fn_load = function (_frm, _id) {
                _frm.getForm().reset();
                _frm.getForm().load({
                    url: dir_start_buh_ + 'form.php',
                    params: {
                        'action': 'read',
                        'sprav': 222,
                        'id': 0
                    },
                    success: function (form, action) {
                        res = action.result.data;
                        _frm.down('[name=id_sc]').setReadOnly(false);
                    }
                });
            }

            _fn_save = function (_frm) {
                rsc = _frm.down('[name=sc]').getValue();
                if (rsc.match(/^\d{20}$/) == null) {
                    var win_warn_rsmy = Ext.create('win_warnRsMy');
                    win_warn_rsmy.show();
                    return;
                }

                _frm.submit({
                    url: dir_start_buh_ + 'sp_rs_add_p.php',
                    success: function (form, action) {
                        res = action.result;
                        if (res.text == "Error_id_sc")
                            _alert_win("Ошибка сохранения", 'Такой субсчет уже используется для банка.');
                        else {
                            w.owner.setValue(res.data.id, res.data.nms);
                            _frm.up('window').hide();
                        }
                    }
                });
            }

            Ext.getCmp('winEdit222_1').openEdit(0, _fn_load, _fn_save);
            Ext.getCmp('spravPanel_winEdit222_1').setTitle('Новый расчетный счет');

        } */

        if (me.id_sprav == 503 || me.id_sprav == 504) {
            _fn_load = function (_frm, _id) {
                _frm.getForm().reset();
                _frm.getForm().load({
                    url: dir_start_buh_ + 'form.php',
                    params: {
                        'action': 'read',
                        'sprav': 222,
                        'id': 0
                    },
                    success: function (form, action) {
                        res = action.result.data;
                        _frm.down('[name=cnt-sc-sel]').show();
                        _frm.down('[name=cnt-sc-show]').hide();

                        let id_sc_combo = _frm.down('[name=id_sc]');
                        id_sc_combo.store.load();
                        id_sc_combo.lastQuery = "";
                        me.setMinus();
                        //id_sc_combo.setReadOnly(false);
                    }
                });
            }

            _fn_save = function (_frm) {
                rsc = _frm.down('[name=sc]').getValue();
                if (rsc.match(/^\d{20}$/) == null) {
                    var win_warn_rsmy = Ext.create('win_warnRsMy');
                    win_warn_rsmy.show();
                    return;
                }

                _frm.submit({
                    url: dir_start_buh_ + 'sp_rs_add_p.php',
                    params: {
                        id_sprav: 504
                    },
                    success: function (form, action) {
                        res = action.result;
                        //Ошибка сохранения
                        //Такой субсчет уже используется для банка.
                        if (res.text == "Error_id_sc")
                            _alert_win("\u041e\u0448\u0438\u0431\u043a\u0430 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f", '\u0422\u0430\u043a\u043e\u0439 \u0441\u0443\u0431\u0441\u0447\u0435\u0442 \u0443\u0436\u0435 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0441\u044f \u0434\u043b\u044f \u0431\u0430\u043d\u043a\u0430.');
                        else {
                            var oldRec = me.store.getById(res.data.id);
                            if (oldRec) {
                                me.store.remove(me.store.getById(res.data.id));
                            }
                            me.store.add(res.data);
                            me.setValue(res.data.id, res.data.nms);
                            _frm.up('window').hide();
                        }
                    }
                });
            }

            Ext.getCmp('winEdit222_1').openEdit(0, _fn_load, _fn_save);
            Ext.getCmp('spravPanel_winEdit222_1').setTitle('\u041d\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0447\u0435\u0442\u043d\u044b\u0439 \u0441\u0447\u0435\u0442'); //Новый расчетный счет
        }

        if (me.id_sprav == 550) {

            var arFilt = me.filterExp.split('=');

            var win = me.up('window');

            Zik.card.useraccEdit({
                loaddata: true,
                id_employee: arFilt[1],
                callback: function (success, record) {
                    if (record.get("useracc") != "") {
                        win.down('[name=rs_people]').setValue(record.get("useracc"), record.get("useracc"));
                        win.down('[name=rs_people]').setMinus();
                    }
                }
            });


        }

        if (me.id_sprav == 541) {

            var win = me.up('window');
            var winVDR = Ext.create('Buh.view.sprav.Dir.Window'),
                d = {};
            d.callback = function (_inp) {
                me.setValue(_inp.data.id, _inp.data.name);
            }
            winVDR.fireEvent('addVdrWin', {
                'patent': (buh_have_patent_ > 0 ? 1 : 0 ),
                'select': 0, //_recGrid.data.id_j_dr,
                'vid': (me.typ_dir * 1 + 1),
                'filter': 0,
                'inviter': d
            });


        }


        if (me.id_sprav == 2005 || me.id_sprav == 2007) {

            var win_sc_edit = sc_sscEdit(_dummy, {
                aftersave: function (ret) {
                    me.setValue(ret.sc_ssc, ret.sc_ssc);
                    var win = me.up('window');
                    if (win.down('[name=id_sp_analit]'))
                        win.down('[name=id_sp_analit]').setValue(ret.sp_analit1);
                    if (win.down('[name=id_sp_analit2]'))
                        win.down('[name=id_sp_analit2]').setValue(ret.sp_analit2);
                }
            });
            var sc_edit = "" + me.getValue();
            if (sc_edit != '') {
                var arsc = sc_edit.split('.');
                win_sc_edit.down('[name=sc]').setValue(arsc[0]);
            }
        }


    },


    setFilterEmpty: function () {
        this.getComponent('text_').setValue(this._args.filterMask || "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u0435 \u0441\u0442\u0430\u0440\u0448\u0435\u0433\u043e \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u0430"); //'Выберите значение старшего контрола'
        this.getComponent('text_').setReadOnly(true);
        this.getComponent('text_').addCls('uni-combo-off');
        this.getComponent('text_').removeCls('field-combo-button');

    },

    setShortText: function (txt) {
        if (txt) {
            const _length = txt.length;
            if (this.shortTextLength && _length > this.shortTextLength) {
                let leadingLength = this.shortTextLength - this.shortTextDelimiter.length - this.shortTextTrailingLength;
                if (leadingLength > 0) {
                    txt = txt.substr(0, leadingLength) + this.shortTextDelimiter + txt.substr(_length - this.shortTextTrailingLength);
                }
            }
        }
        return txt;
    }
    /******************************************************************************************/
    /******************************************************************************************/
    /******************************************************************************************/
    /*                     Методы кастомные конец                                             */
    /******************************************************************************************/
    /******************************************************************************************/
    /******************************************************************************************/

});


