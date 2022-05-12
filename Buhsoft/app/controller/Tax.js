Ext.define('Buh.controller.Tax', {
    extend: 'Ext.app.Controller',
    stopEvents: false,
    mode: '',
    callback: null,
    currState: null,
    newState: null,
    taskAsk: null,
    compareMode: false,
    modified: false,
    _args: null,
    refs: [
        {
            ref: 'win',
            selector: 'edittaxoffice'
        },

    ],

    init: function () {
        this.control({
            'edittaxoffice': {
                onScroll: this.onScroll, // Окно скроллится
                loadData: this.loadData, // загрузка данных и открфтие окна
                close: this.winClose, // обработка закрытия окна
            },

            'edittaxoffice #kod': {
                change: this.pickOrg, // Подбор значений по коду
                select: this.fillDataFromWeb, // заполнить значения из вэбы
            },

            'edittaxoffice field': {
//                blur: this.formCheck, // Изменились данные в форме, проверить
                change: this.formInterativeCheck, // непосредственная проверка данных налоговой
            },


            'edittaxoffice button[action=show_all_panel]': {
                click: this.formFillHand, // Заполнить поля вручную

            },

            'edittaxoffice button[action=compare]': {
                click: this.formCompare, // Сравнить поля с текущим и предыдущим состояниями

            },

            'edittaxoffice [name=bik]': {
                select: this.fillBank, // заполнить значения банка из комбо
            },


            'edittaxoffice button[action=save]': {
                click: this.formSave, // Сохранить
            },

            'edittaxoffice button[action=close]': {
                click: this.formClose, // Закрыть окно
            },

            'edittaxoffice button[action=delete]': {
                click: this.formDelete, // Удалить налоговую / фонд
            },

        });
    },

    /****************************/


    loadData: function (_args) {
        // загрузка данных и открфтие окна

        var me = this,
            win = this.getWin(),
            form = win.down('form'),
            cStore = Ext.create('Ext.data.Store', {
                fields: [
                    {name: 'kod', type: 'string'},
                    {name: 'value', type: 'string'},
                    {name: 'data', type: 'auto'},
                ]

            });

        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);

        me.onScroll();

        me._args = _args;
        me.callback = _args.callback != undefined ? _args.callback : null;
        me.compareMode = false;
        win.down('#kod').bindStore(cStore);
        this.mode = _args.mode;
        if (this.mode == 'tax') {
            this.showAll = this.showAsTax;
            this.showAllAfter = this.showAsTaxAll;
            win.down('[name=type]').setValue(0);
        }
        else {
            this.showAll = this.showAsFond;
            this.showAllAfter = function () {
            };
            if (me._args.type == undefined)
                win.down('[name=type]').setValue('3');
            else
                win.down('[name=type]').setValue(me._args.type);

        }

        this.showAll();
        this.formCheck();
        if (_args.id != 0) {
            win.down('button[action=delete]').show();
            this.stopEvents = true;
            form.load({
                url: dir_start_buh_ + 'tax_of_proceed.php',
                params: {action: 'read', id: _args.id},
                success: function (form, action) {
                    me.currState = action.result.data;
                    me.newState = null;
                    me.stopEvents = false;
                    me.showAllAfter();
                    me.formCheck();
                    win.down('[name=main]').setReadOnly(me.currState.main==1);
                    if (me.mode == 'tax' && me.currState.kod!='') {
                        _ajax(dir_start_buh_ + "dadata.php?kod=" + me.currState.kod, {}, function (ret) {
                            var _ret = Ext.decode(ret, true) == null ? {} : Ext.decode(ret, true);
                            if (_ret.suggestions != undefined) {
                                var arr = _ret.suggestions;
                                me.newState = {};
                                for (i = 0; i < arr.length; i++) {
                                    var rec = arr[i];
                                    if (rec.data.code == me.currState.kod) {
                                        me.newState = rec.data;
                                    }
                                }
                            }
                            me.compareData();
                        });
                    }
                    me.getWin().show();
                    me.onScroll();
                }
            });
        }
        else
        {
            this.getWin().show();
            win.down('[name=main]').setReadOnly(false);
            me.onScroll();
        }

    },

    /****************************/

    compareData: function () {
        var me = this,
            win = this.getWin(),
            _ks = win.down('[name=ks]');
        if (me.newState == null)
            return;
        if (me.currState.rs == null)
            me.currState.rs = '';
        var _rs = me.currState.rs.replace(/\s+/g, '');

        if (
            currYear > 2020 && (
            me.currState.name != me.newState.name ||
            me.currState.addr != me.newState.address ||
            me.currState.inn != me.newState.inn ||
            me.currState.kpp != me.newState.kpp ||
            me.currState.recipient != me.newState.payment_name ||
            me.currState.bik != me.newState.bank_bic ||
            _rs.replace(/ /g, '') != me.newState.bank_account ||
            (_ks && me.currState.ks.replace(/ /g, '') != me.newState.bank_correspondent_account)
        ))
            if (me._args.startwin == undefined)
                win.down('[name=cnt-check]').show();
            else
                this.formCompare();

    },

    /****************************/

    setBlue: function (nm) {
        var me = this,
            win = this.getWin();

        win.down('[name=' + nm + ']').inputEl.addCls('back-fone-blue');
        Ext.defer(function () {
            win.down('[name=' + nm + ']').inputEl.removeCls('back-fone-blue');
        }, 400);

    },

    /****************************/

    formSave: function () {
        // Сохранить
        var me = this,
            win = this.getWin();
        form = win.down('form');
        var notValidField = win.query('textfield{isValid()===false}');

        if (notValidField.length == 0)
            win.down('button[action=save]').disable();

        form.submit({
            params: {
                action: 'save',
                main_ : form.down('[name=main]').getValue() ? 1 : 0
            },
            submitEmptyText: false,
            url: dir_start_buh_ + 'tax_of_proceed.php',
            success: function (form, action) {
                me.modified = true;
                var ret = action.result;
                if (me.callback != undefined && me.callback != null)
                    me.callback(action.result);
                else {
                    Ext.getCmp('mainWin6').itemId = ret.id;
                    var _rec_to_remove = Ext.getCmp('spravGrid6').store.getById(ret.id);

                    if (_rec_to_remove == null) {
                        Ext.getCmp('spravGrid6').store.insert(0, ret);
                        Ext.getCmp('spravGrid6').getSelectionModel().select(0);
                    }
                    else {
                        _rec_to_remove.data = ret;
                        Ext.getCmp('spravGrid6').getView().refresh();
                    }
                }



                win.close();
            }
        });

    },

    /****************************/

    formClose: function () {
        // Закрыть окно
        this.getWin().close();
    },

    /****************************/

    showAsTax: function () {
        // Филдсет для налоговой
        var win = this.getWin();
        if (this._args.id == 0)
            win.down('form').setTitle("Новая налоговая");
        else
            win.down('form').setTitle("Изменить налоговую");

        win.down('[name=cnt-title]').setTitle('Введите код ИФНС для поиска налоговой');
        Ext.apply(this.getWin().down('#nameTax'), {name: 'name'});
        Ext.apply(win.down('[name=kod]'), {maxLength: 4, emptyText: '4 цифры'});
        win.down('[name=cnt-warning]').update('Не найдена налоговая - попробуйте ввести код заново или введите реквизиты вручную');

    },

    /****************************/

    showAsTaxAll: function () {
        // Филдсет для налоговой
        var win = this.getWin(),
            cnt_ks = win.down('[name=cnt-ks]');
        win.down('[name=hr]').show();
        win.down('[name=cnt-name]').show();
        win.down('[name=cnt-adr]').show();
        win.down('[name=cnt-main]').show();
        win.down('[name=cnt-inn]').show();
        win.down('[name=cnt-kpp]').show();
        win.down('[name=cnt-recipient]').show();
        win.down('[name=cnt-bank]').show();
        win.down('[name=cnt-rs]').show();
        if(cnt_ks) {
            cnt_ks.show();
        }
    },

    /****************************/

    showAsFond: function () {
        // Филдсет для фонда
        var win = this.getWin(),
            cnt_ks = win.down('[name=cnt-ks]');
        Ext.apply(win.down('[name=kod]'), {maxLength: 10, emptyText: '10 цифр'});
        if (this._args.id == 0)
            win.down('form').setTitle("Новый фонд");
        else
            win.down('form').setTitle("Изменить фонд");
        win.down('[name=cnt-title]').setTitle('ИНН');
        Ext.apply(this.getWin().down('#nameFond'), {name: 'name'});
        Ext.apply(this.getWin().down('#inn'), {name: 'inn_old'});
        Ext.apply(this.getWin().down('#kod'), {name: 'inn'});
        win.down('[name=cnt-warning]').update('Не найден фонд - попробуйте ввести ИНН заново или введите реквизиты вручную');
        win.down('[name=cnt-name-f]').show();
        win.down('[name=cnt-adr]').show();
        win.down('[name=cnt-kpp]').show();
        win.down('[name=cnt-recipient]').show();
        win.down('[name=cnt-bank]').show();
        win.down('[name=cnt-rs]').show();
        if(cnt_ks) {
            cnt_ks.show();
        }
    },

    /****************************/

    pickOrg: function (t, nv) {
        // Подбор значений по коду
        var me = this,
            win = this.getWin(),
            cStore = win.down('#kod').getStore(),
            url = '',
            params = {};

        if (this.mode == 'tax') {
            url = dir_start_buh_ + "dadata.php?kod=" + nv;
        }
        else {
            url = dir_start_buh_ + 'getinn_.php';
            params = {'inn': nv};
        }

        win.down('#kod').collapse();
        cStore.removeAll();

        this.formCheck();
        if (this.taskAsk != null)
            this.taskAsk.cancel();
        if (this.stopEvents || nv === null || nv.length < (this.mode == 'tax' ? 4 : 10))
            return;

        me.taskAsk = new Ext.util.DelayedTask(function () {
            _ajax(url, params, function (ret) {
                var _ret = Ext.decode(ret, true) == null ? {} : Ext.decode(ret, true),
                    i = 0;
                cStore.removeAll();
                win.down('#kod').collapse();
                if (me.mode == 'tax') {
                    Ext.Array.each(_ret.suggestions, function (r) {
                        if (r.data.code == nv) {
                            cStore.insert(i, {kod: r.data.code, value: r.value, data: r.data});
                            i++;
                        }
                    });
                }
                else{
                    cStore.insert(0, {kod: _ret.data.inn, value: _ret.data.briefname, data: _ret.data});

                }

                if (_ret.suggestions && _ret.suggestions.length == 0) {
                    me.openHandButton();
                } else {
                    me.hideHandButton()
                    win.down('#kod').expand();
                }
            });
        });


        cStore.insert(0, {kod: 0, value: (this.mode == 'tax' ? 'Поиск налоговой ...' : 'Поиск фонда ...'), data: ''});
        win.down('#kod').expand();
        me.taskAsk.delay(400);
    },

    /****************************/

    openHandButton: function () {
        var me = this,
            win = this.getWin();

        win.down('[name=cnt-warning]').show();
        if (!win.down('[name=cnt-rs]').isVisible())
            win.down('[name=cnt-open-btn]').show();

    },

    /****************************/

    hideHandButton: function () {
        var me = this,
            win = this.getWin();

        win.down('[name=cnt-warning]').hide();
        win.down('[name=cnt-open-btn]').hide();

    },

    /****************************/

    fillDataFromWeb: function (t, rec) {
        // заполнить значения из вэбы
        var me = this,
            win = me.getWin(),
            _ks = win.down('[name=ks]'),
            data = rec[0].data.data;
        me.hideHandButton();

        if (this.mode == 'tax') {
            win.down('[name=name]').setValue(data.name);
            win.down('[name=addr]').setValue(data.address);
            win.down('[name=inn]').setValue(data.inn);
            win.down('[name=kpp]').setValue(data.kpp);
            win.down('[name=recipient]').setValue(data.payment_name);
            win.down('[name=bik]').setValue(data.bank_bic);
            win.down('[name=bank]').setValue(data.bank_name);
            win.down('[name=rs]').setValue(data.bank_account);
            win.down('[name=main]').setValue(data.main);

            if(_ks && data.bank_correspondent_account) {
                _ks.setValue(data.bank_correspondent_account);
            }
        }
        else {
            win.down('[name=name]').setValue(data.briefname);
            win.down('[name=addr]').setValue(data.regaddr);
            win.down('[name=kpp]').setValue(data.kpp);
            win.down('[name=recipient]').setValue(data.fullname);
            win.down('[name=bik]').setValue('');
            win.down('[name=bank]').setValue('');
            win.down('[name=rs]').setValue('');
            if(_ks) {
                _ks.setValue('');
            }
            var typ_fond = '1',
                nm = data.briefname.toUpperCase();
            if (nm.match(/ПФР/) || (nm.match(/ПЕНСИОН/) && nm.match(/ФОНД/) && (nm.match(/РФ/) || nm.match(/РОСС/)) )) {
                typ_fond = '1';
            }
            if (nm.match(/ФСС/) || (nm.match(/ФОНД/) && nm.match(/СОЦИАЛЬН/) && nm.match(/СТРАХОВАН/) && (nm.match(/РФ/) || nm.match(/РОСС/)) )) {
                typ_fond = '3';
            }
            if (nm.match(/ФОМС/) || (nm.match(/ФОНД/) && nm.match(/ОБЯЗАТЕЛЬН/) && nm.match(/МЕДИЦИНСК/) && nm.match(/СТРАХОВАН/)  )) {
                typ_fond = '2';
            }
            win.down('[name=type]').setValue(typ_fond);
        }
        this.showAllAfter();
        this.setBlue('name');
        this.setBlue('addr');
        this.setBlue('inn');
        this.setBlue('kpp');
        this.setBlue('recipient');
        this.setBlue('bik');
        this.setBlue('bank');
        this.setBlue('rs');
        me.formCheck();

    },

    /****************************/

    formFillHand: function () {
        // Заполнить поля вручную
        var win = this.getWin();
        win.down('button[action=show_all_panel]').hide();
        this.showAllAfter();
        this.formCheck();
    },

    /****************************/

    fillBank: function (cb, recs) {
        // заполнить значения банка из комбо
        var win = this.getWin();
        win.down('[name=bank]').setValue(recs[0].data.NAME);

    },

    /****************************/

    formDelete: function () {
        // Удалить налоговую / фонд

        var me = this,
            win = this.getWin();
        id = win.down('[name=id]').getValue();

        _fn_del = function () {
            _fn = function (ans) {
                a = Ext.JSON.decode(ans);
                if (a.errorText == '') {
                    me.modified = true;
                    if (me.callback != undefined)
                        me.callback(a);

                    win.close();
                }
                else
                    _alert_win('Удаление невозможно.', a.errorText);
            };
            _ajax(dir_start_buh_ + 'sp_del.php', {'sprav': 12, 'id': id}, _fn);
        };

        _confirm('Подтвердите удаление', 'Вы хотите удалить эту запись?', _fn_del);


    },

    /****************************/

    winClose: function () {
        // обработка закрытия окна
        if (this.modified) {
            Ext.getCmp('spravGrid6').store.load();
        }
    },

    /****************************/

    formCheck: function () {
        // Изменились данные в форме, проверить
        var win = this.getWin(),
            toolbar = win.down('toolbar'),
            arFld = [],
            layout = [];
        if (this.mode == 'tax')
            layout = [
                {
                    name: 'kod', text: 'Код ИФНС', fn: function (_inp) {
                    return !(_inp != null && _inp != "" && _inp.length == 4);
                }
                },
                {name: 'name', text: 'Наименование'},
            ];
        else
            layout = [
                {
                    name: 'inn', text: 'ИНН', fn: function (_inp) {
                    return !(_inp != null && _inp != "" && _inp.length == 10);
                }
                },
                {name: 'name', text: 'Наименование'},
            ];

        toolbar.fillErrorBar(layout, win.down('[name=cnt-kpp]').isVisible());
    },

    /**************************************/

    formCompare: function () {
        // Сравнить поля с текущим и предыдущим состояниями
        var me = this,
            win = me.getWin(),
            _ks = win.down('[name=ks]'),
            win = me.getWin();
        if (me.newState == null)
            return;
        me.compareMode = true;
        win.down('[name=cnt-check]').hide();
        win.down('[name=name]').setValue(me.newState.name);
        win.down('[name=addr]').setValue(me.newState.address);
        win.down('[name=inn]').setValue(me.newState.inn);
        win.down('[name=kpp]').setValue(me.newState.kpp);
        win.down('[name=recipient]').setValue(me.newState.payment_name);
        win.down('[name=bik]').setValue(me.newState.bank_bic);
        win.down('[name=bank]').setValue(me.newState.bank_name);
        win.down('[name=rs]').setValue(me.newState.bank_account);

        win.down('[name=_name]').update('Было : ' + me.currState.name);
        win.down('[name=_addr]').update('Было : ' + me.currState.addr);
        win.down('[name=_inn]').update('Было : ' + me.currState.inn);
        win.down('[name=_kpp]').update('Было : ' + me.currState.kpp);
        win.down('[name=_recipient]').update('Было : ' + me.currState.recipient);
        win.down('[name=_bik]').update('Было : ' + (me.currState.bik || "") + ' ' + (me.currState.bank  || ""));
        win.down('[name=_rs]').update('Было : ' + me.currState.rs);

        if(_ks) {
            _ks.setValue(me.newState.bank_correspondent_account);
            win.down('[name=_ks]').update('Было : ' + me.currState.ks);
        }

        me.checkForEqual();

    },

    /**************************************/

    checkForEqual: function () {
        var me = this,
            win = this.getWin(),
            _rs = win.down('[name=rs]').getValue(),
            _ks = win.down('[name=ks]'),
            rs1_ = me.currState.rs   ;

        me.markFieldBlue('name', win.down('[name=name]').getValue() != me.currState.name);
        me.markFieldBlue('addr', win.down('[name=addr]').getValue() != me.currState.addr);
        me.markFieldBlue('inn', win.down('[name=inn]').getValue() != me.currState.inn);
        me.markFieldBlue('kpp', win.down('[name=kpp]').getValue() != me.currState.kpp);
        me.markFieldBlue('recipient', win.down('[name=recipient]').getValue() != me.currState.recipient);
        me.markFieldBlue('bik', win.down('[name=bik]').getValue() != me.currState.bik);
        me.markFieldBlue('rs', _rs.replace(/ /g, '') != rs1_.replace(/ /g, ''));
        if(_ks) {
            me.markFieldBlue('ks', _ks.getValue().replace(/ /g, '') != (me.currState.ks || "").replace(/ /g, ''));
        }
    },


    /**************************************/

    markFieldBlue: function (name, condition) {
        var me = this,
            win = this.getWin();
        if (condition) {
            win.down('[name=' + name + ']').inputEl.addCls('back-fone-blue');
            win.down('[name=_' + name + ']').setVisible(true);
        }
        else {
            win.down('[name=' + name + ']').inputEl.removeCls('back-fone-blue');
            win.down('[name=_' + name + ']').setVisible(false);
        }


    },

    /**************************************/

    showDifferentFields: function () {
        var win = this.getWin();

        var notValidField = win.query('textfield{isValid()===false}');
    },

    /***************************************/
    formInterativeCheck: function (field, nValue) {
        // непосредственная проверка данных налоговой
        if (this.compareMode)
            this.checkForEqual();
        this.formCheck();
    },

    onScroll: function () {
        // Окно скроллится

        if (this.getWin() == undefined)
            return;

        if (!this.getWin().rendered)
            return;
        var win = this.getWin(),
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

});
