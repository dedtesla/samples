Ext.define('Buh.controller.TaxHist', {
    extend: 'Ext.app.Controller',
    stopEvents: false,
    mode: '',
    callback: null,
    currState: null,
    newState: null,
    taskAsk: null,
    compareMode: false,
    modified: false,
    rekvModel: null,
    pl_rekvModel: null,
    count_hist: 0,
    hand_mode: false,
    kod_rec: null,
    dates: [],
    _title: '',
    _args: null,
    hist: [],
    refs: [
        {
            ref: 'win',
            selector: 'edittaxofficeHist'
        },

    ],

    init: function () {
        this.control({
            'edittaxofficeHist': {
                onScroll: this.onScroll, // Окно скроллится
                loadData: this.loadData, // загрузка данных и открфтие окна
                close: this.winClose, // обработка закрытия окна
            },

            'edittaxofficeHist #kod-hand': {
                change: this.pickOrg, // Подбор значений по коду
                select: this.showMore, // показать еще полей
            },

            'edittaxofficeHist #f-kod': {
                change: this.pickOrg, // Подбор значений по коду
                select: this.fillDataFromWeb, // заполнить значения из вэбы
            },

            'edittaxofficeHist button[action=savefromweb]': {
                //change: this.pickOrg, // Подбор значений по коду
                click: this.fillDataFromWeb, // заполнить значения из вэбы
            },

            'edittaxofficeHist field': {
//                blur: this.formCheck, // Изменились данные в форме, проверить
                //change: this.formInterativeCheck, // непосредственная проверка данных налоговой
            },


            'edittaxofficeHist button[action=show_first_panel]': {
                click: this.showAsTaxFirst, // Заполнить поля вручную (первый шаг)

            },

            'edittaxofficeHist button[action=save_first_panel]': {
                click: this.showAsTaxNew, // Заполнить поля вручную (последний шаг)

            },

            'edittaxofficeHist field[name=name-hand]': {
                blur: this.showSaveBtn, // Заполнить поля вручную (второй шаг)
            },

            'edittaxofficeHist button[action=comparedata]': {
                click: this.compareData, // Сравнить данные

            },

            'edittaxofficeHist button[action=compare]': {
                click: this.formCompare, // Сравнить поля с текущим и предыдущим состояниями

            },

            'edittaxofficeHist [action=checkdates]': {
                change: this.checkDates, // Проверяем исторические даты
            },

            // 'edittaxofficeHist [name=bik_bank]': {
            //     select: this.fillBank, // заполнить значения банка из комбо
            // },


            'edittaxofficeHist button[action=save]': {
                click: this.formSave, // Сохранить
            },
            'edittaxofficeHist [action=savemain]': {
                change: this.formSaveMain, // Сохранить
            },

            'edittaxofficeHist button[action=close]': {
                click: this.formClose, // Закрыть окно
            },

            'edittaxofficeHist button[action=delete]': {
                click: this.formDelete, // Удалить налоговую / фонд
            },

            'edittaxofficeHist button[action=showformifns]': {
                click: this.showFormIFNS, // Форма редактирования ифнс
            },

            'edittaxofficeHist button[action=showform]': {
                click: this.showForm, // Форма редактирования реквизитов
            },

            'edittaxofficeHist button[action=showformpl]': {
                click: this.showFormPlRekv, // Форма редактирования пл. реквизитов
            },

            'edittaxofficeHist button[action=saveupdate]': {
                click: this.saveUpdated, // Сохраняем обновление
            },

            'edittaxofficeHist button[action=cancelupdate]': {
                click: this.formFill, // Отменяем обновление
            },

            'edittaxofficeHist button[action=showhistory]': {
                click: this.showHistory, // Показываем историю
            },

            'edittaxofficeHist button[action=hidehistory]': {
                click: this.hideHistory, // Скрываем историю
            },

            'edittaxofficeHist button[action=addnewhistory]': {
                click: this.newHistory, // Новое историческое значение
            },

        });
    },

    /****************************/

    checkDates: function (t) {
        let me = this, win = me.getWin(),  form = win.down('form'), _dt = Ext.Date.format(t.getValue(), 'Y-m-d 00:00:00')
        if ( me.dates.includes(_dt) ) {
            BuhF.fun.showGreenWin(false, 'На данную дату уже есть историческое значение', 2000);
            form.down('[name=saveupdate]').disable();
        }
        else {
            form.down('[name=saveupdate]').enable();
        }
    },

    /****************************/

    formSaveMain: function () {
        var me = this, win = me.getWin(),  form = win.down('form');
        if (form.down('[name=main]')._status == 'first') {
            form.down('[name=main]')._status = 'second';
            return;
        }
        _fn = function () {
            if (form.down('[name=main]').getValue()) {
                me.showGreenWin('green', 'Налоговая выбрана основной', 2000);
                form.down('[name=main]').setReadOnly(true);
            }
        }
        me.formSave('save', _fn);
    },

    /****************************/

    showMore: function (t,recs) {
        var me = this, win = me.getWin();
        me.kod_rec = recs[0].data.data;

        if (this.mode == 'tax') {
            win.down('[name=cnt-type-f]').hide();
            win.down('[name=name-hand]').setValue(me.kod_rec.name);
        }
        else {
            win.down('[name=name-hand]').setValue(me.kod_rec.briefname);
            win.down('[name=cnt-type-f]').show();

            var typ_fond = '1',
                nm = me.kod_rec.briefname.toUpperCase();
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
        win.down('[name=save_btn]').enable();
        win.down('[name=cnt-name-hand]').show();
    },

    /****************************/

    newHistory: function (t) {
        var me = this, win = me.getWin();
        win.down('[name=show_hist]').hide();
        t.state = 'new';
        t.start_from = Ext.Date.format(new Date(), 'Y-m-d 00:00:00');
        t.new = true;
        let itm = {};
        itm.bank = '';
        itm.bik = '';
        itm.ks = '';
        itm.rs = '';
        itm.rs_id = 0;
        itm.recipient = '';
        itm.start_from = t.start_from;

        t.cnf = me.currState;
        t.cnf = itm;
        me.showFormPlRekv(t);
    },

    /****************************/

    delHistory: function (rs_id, callback = false) {
        var me = this, win = me.getWin();
        var _id = win.down('[name=id]').getValue();
        var _hid = rs_id;

        Ext.Ajax.request({
            url: dir_start_buh_ + 'tax_of_proceed.php',
            params: {action: 'delhist', 'id': _id, 'hid': _hid},
            success: function (response) {
                const ret = Ext.JSON.decode(response.responseText);
            }
        });
        if (callback)
            callback(true);
    },

    /****************************/

    hideHistory: function () {
        var me = this, win = me.getWin();

        win.down('[name=hide_hist]').hide();
        win.down('[name=pl_rekv]').show();
        win.down('[name=show_hist]').show();
        win.down('[name=btn_add]').show();
        win.down('[name=cnt-plrekv]').remove(2);
        me.count_hist = 0;
    },

    /****************************/

    showHistory: function () {
        var me = this,
            win = this.getWin(),
            form = win.down('form');

        if (me.currState.hist.length > 1) {
            me.count_hist = me.currState.hist.length;
            var arr = [];
            me.currState.hist.forEach(function (item) {
                let _more = 'more';

                let _st_fr = item.start_from;
                if (item.start_from == null)
                    _st_fr = '1970-01-01 00:00:00';
                if (item.start_from_f == null)
                    _st_fr = '1970-01-01 00:00:00';
                if (_st_fr == '1970-01-01 00:00:00')
                    _more = 'first';

                var fld = {
                    xtype: 'button',
                    width: 500,
                    cls: 'container-align-small btn-sel-blue color-black',
                    textAlign: 'left',
                    text: '',
                    action: 'showformpl',
                    state: _more,
                    start_from: '',
                    hidden: false,
                    cnf: null
                };

                var itm = {};
                itm.bank = item.name;
                itm.bik = item.bik;
                itm.ks = item.ks;
                itm.rs = item.sc;
                itm.rs_id = item.id;
                itm.recipient = item.recipient;
                itm.start_from = _st_fr;
                itm.start_from_f = item.start_from_f;
                itm.start_to_f = item.start_to_f;
                fld.text = me.makePlRekv(itm, true);
                fld.start_from = item.start_from;
                fld.cnf = itm;
                arr.push(fld);
            });

            var cont = {
                name: 'cnt-all-hist',
                xtype: 'container',
                layout: 'vbox',
                cls: 'container-align-small',
                // action: 'showformpl',
                items: arr
            };

            win.down('[name=show_hist]').hide();
            win.down('[name=hide_hist]').show();
            win.down('[name=pl_rekv]').hide();
            win.down('[name=btn_add]').hide();
            win.down('[name=cnt-plrekv]').insert(2,cont);
        }
    },

    /****************************/

    saveUpdated: function () {
        var me = this, win = me.getWin();

        if (me.count_hist != 0) {
            if (win.down('[name=cnt-all-hist]'))
                win.down('[name=cnt-all-hist]').destroy();
            me.count_hist = 0;
        }

        if (me.newState) {
            me.currState.name = me.newState.name;
            me.currState.addr = me.newState.address;
            me.currState.inn = me.newState.inn;
            me.currState.kpp = me.newState.kpp;
            me.currState.recipient = me.newState.payment_name;
            me.currState.bik = me.newState.bank_bic;
            me.currState.bank = me.newState.bank_name;
            me.currState.rs = me.newState.bank_account;
            me.currState.ks = me.newState.bank_correspondent_account;
        }

        win.down('[name=inn]').setValue(me.currState.inn);
        win.down('[name=kpp]').setValue(me.currState.kpp);
        win.down('[name=addr]').setValue(me.currState.addr);

        win.down('[name=recipient]').setValue(me.currState.recipient);
        win.down('[name=bank]').setValue(me.currState.bank);
        win.down('[name=bik]').setValue(me.currState.bik);
        win.down('[name=ks]').setValue(me.currState.ks);
        win.down('[name=rs]').setValue(me.currState.rs);

        win.down('[name=cnt-warning-2]').hide();

        _fn = function () {
            if (me.mode == 'tax')
                var _msg = 'Обновлены реквизиты налоговой';
            else
                _msg = 'Обновлены реквизиты фонда';
            me.showGreenWin('green', _msg, 2000);
            me.clearData();
            me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
        }
        me.formSave('saveupdate', _fn);
    },


    /****************************/

    showFormIFNS: function (t) {
        var me = this,
            win = this.getWin(),
            form = win.down('form')

        let lbl = 'Введите код ИФНС для поиска налоговой';
        let btn = 'Заполнить реквизиты по ИФНС';
        if (me.mode == 'fond') {
            lbl = 'Введите ИНН для поиска фонда';
            btn = 'Заполнить реквизиты по ИНН';
        }

        var fld = [
            {
                'xtype': 'container',
                cls: 'container-align-small',
                items: [
                    {
                        'xtype': 'label',
                        'html': lbl
                    },
                    {
                        'xtype': 'gbs_combo_clr',
                        'name': 'f-kod',
                        itemId: 'f-kod',
                        'displayField': 'kod',
                        'displayField': 'kod',
                        'valueField': 'kod',
                        'editable': true,
                        width: 130,
                        'store': null,
                        'queryMode': 'remote',
                        typeAheadDelay: 400,
                        minChars: 12,
                        enforceMaxLength: true,
                        'listConfig': {
                            cls: 'style2018',
                            minWidth: 420,
                            maxHeight: 150,
                            loadingText: 'Загрузка данных',
                            maxWidth: 420
                        },
                        tpl: Ext.create('Ext.XTemplate',
                            '<tpl for=".">',
                            '<div class="x-boundlist-item">{value}</div>',
                            '</tpl>'
                        ),
                        listeners: {
                            select: function (th, recs) {
                                if (me.mode == 'tax') {
                                    if (recs[0].data.data.code != me.currState.kod) {
                                        _confirm('Обновить реквизиты?', 'Все реквизиты обновятся для  <span style="font-weight: bold">' + recs[0].data.data.name + '</span>',
                                            function () {
                                                th.up('[name=cnt_field_edit]').down('[name=f-name]').setValue(recs[0].data.data.name);
                                                me.fillDataFromWeb();
                                        }, function () {
                                                th.up('[name=cnt_field_edit]').down('[name=f-name]').setValue(me.currState.name);
                                                th.up('[name=cnt_field_edit]').down('[name=f-kod]').setValue(me.currState.kod);
                                        });
                                    }
                                    return false;
                                }
                                else {
                                    if (recs[0].data.data.inn != me.currState.inn) {
                                        _confirm('Обновить реквизиты?',
                                            'Введен ИНН другого фонда, все реквизиты обновятся для  <span style="font-weight: bold">' + recs[0].data.data.briefname + '</span>',
                                            function () {
                                                th.up('[name=cnt_field_edit]').down('[name=f-name]').setValue(recs[0].data.data.briefname);
                                                var typ_fond = '1',
                                                    nm = recs[0].data.data.briefname.toUpperCase();
                                                if (nm.match(/ПФР/) || (nm.match(/ПЕНСИОН/) && nm.match(/ФОНД/) && (nm.match(/РФ/) || nm.match(/РОСС/)) )) {
                                                    typ_fond = '1';
                                                }
                                                if (nm.match(/ФСС/) || (nm.match(/ФОНД/) && nm.match(/СОЦИАЛЬН/) && nm.match(/СТРАХОВАН/) && (nm.match(/РФ/) || nm.match(/РОСС/)) )) {
                                                    typ_fond = '3';
                                                }
                                                if (nm.match(/ФОМС/) || (nm.match(/ФОНД/) && nm.match(/ОБЯЗАТЕЛЬН/) && nm.match(/МЕДИЦИНСК/) && nm.match(/СТРАХОВАН/)  )) {
                                                    typ_fond = '2';
                                                }
                                                th.up('[name=cnt_field_edit]').down('[name=f-type]').setValue(typ_fond);
                                                me.fillDataFromWeb();
                                            }, function () {
                                                th.up('[name=cnt_field_edit]').down('[name=f-name]').setValue(me.currState.name);
                                                th.up('[name=cnt_field_edit]').down('[name=f-kod]').setValue(me.currState.inn);
                                            });
                                    }
                                    return false;
                                }
                                me.kod_rec = recs[0].data.data;
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        name: 'kod_btn',
                        cls: 'btn-sel-blue',
                        textAlign: 'left',
                        text: btn,
                        width:480,
                        action: 'savefromweb',
                        hidden: true
                    },

                    {
                        xtype: 'cont_vert',
                        cls: 'container-align',
                        name: 'f-cnt-type-f',
                        hidden: true,
                        itm: [
                            {
                                xtype: 'box',
                                html: 'Вид',
                            },
                            {
                                xtype: 'cont_vert',
                                itm: {
                                    xtype: 'gbs_combo',
                                    name: 'f-type',
                                    editable: false,
                                    forceSelection: true,
                                    width: 130,
                                    value: '3',
                                    store: [
                                        ['3', 'ФСС'],
                                        ['1', 'ПФР'],
                                        ['2', 'ФОМС']]
                                }
                            },
                        ]
                    },


                    {
                        'xtype': 'label',
                        'html': 'Наименование'
                    },
                    {
                        'xtype': 'textareafield',
                        name: 'f-name',
                        border: 0,
                        height: 50,
                        width: 480,
                        autoScroll: true,
                        grow: true,
                        value: '',
                    }
                ]
            },

            {
                'xtype': 'container',
                items: [
                    {
                        xtype: 'greenbuttonsimple',
                        text: 'Сохранить',
                        name: 'btn_save_edit',
                        style: 'margin-right:10px;',
                        handler: function () {
                            let win = me.getWin();

                            win.down('[name=kod]').setValue(this.up('[name=cnt_field_edit]').down('[name=f-kod]').getValue());
                            win.down('[name=name]').setValue(this.up('[name=cnt_field_edit]').down('[name=f-name]').getValue());
                            me.currState.kod = this.up('[name=cnt_field_edit]').down('[name=f-kod]').getValue();
                            me.currState.name = this.up('[name=cnt_field_edit]').down('[name=f-name]').getValue();
                            this.up('[name=cnt_field_edit]').destroy();
                            me.formFill();
                            me.formSave();
                            t.show();
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Отмена',
                        name: 'btn_cansel_edit',
                        handler: function () {
                            this.up('[name=cnt_field_edit]').destroy();
                            t.show();
                        }
                    }
                ]
            }

        ];

        var fieldContainer =
            {
                xtype: 'form',
                name: 'cnt_field_edit',
                cls: 'container-align',
                style: 'display: inline-block; background: #f6faff;',
                bodyStyle: 'padding: 10px;',
                width: 500,
                items: fld,
                //mdl: model,
                listeners: {
                    validitychange: function (th, valid, eOpts) {
                        var win = this.up('window');
                        if (valid) {
                            this.down('[name=btn_save_edit]').enable();
                            this.down('[name=btn_save_edit]').removeCls("disabled-btn");
                            this.down('[name=btn_save_edit]').addCls("green-btn");
                        } else {
                            this.down('[name=btn_save_edit]').disable();
                            this.down('[name=btn_save_edit]').removeCls("green-btn");
                            this.down('[name=btn_save_edit]').addCls("disabled-btn");
                        }
                    }
                }
            };

        let _index = t.up('container').items.indexOf(t) + 1;
        t.hide();
        t.up('container').insert(_index, fieldContainer);

        var cStore = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'kod', type: 'string'},
                {name: 'value', type: 'string'},
                {name: 'data', type: 'auto'},
            ]

        });
        win.down('#f-kod').bindStore(cStore);
        if (me.mode == 'tax') {
            win.down('[name=f-kod]').setValue(win.down('[name=kod]').getValue());
            win.down('[name=f-cnt-type-f]').hide();
        }
        else {
            win.down('[name=f-type]').setValue(win.down('[name=type]').getValue());
            win.down('[name=f-kod]').setValue(win.down('[name=inn]').getValue());
            win.down('[name=f-cnt-type-f]').show();
        }
        win.down('[name=f-name]').setValue(win.down('[name=name]').getValue());
        win.down('#f-kod').collapse();
    },

    /****************************/

    showForm: function (t) {
        var me = this,
            win = this.getWin(),
            form = win.down('form')

        let hide_inn = false;
        if (me.mode == 'fond') {
            hide_inn = true;
        }

        var fld = [
            {
                'xtype': 'container',
                items: [
                    {
                        'xtype': 'label',
                        'html': 'ИНН',
                        hidden: hide_inn
                    },
                    {
                        xtype: 'textfield',
                        name: 'inn',
                        maxLength: 10,
                        enforceMaxLength: true,
                        emptyText: '10 цифр',
                        cls: 'container-align-small',
                        value: me.rekvModel.get('inn'),
                        width: 200,
                        hidden: hide_inn
                    },
                    {
                        'xtype': 'label',
                        'html': 'КПП'
                    },
                    {
                        xtype: 'textfield',
                        name: 'kpp',
                        maxLength: 9,
                        enforceMaxLength: true,
                        cls: 'container-align-small',
                        value: me.rekvModel.get('kpp'),
                        emptyText: '9 цифр',
                        width: 200
                    },

                    Ext.create('Buh.classes.container.AddressDaDataStruct', {
                        title: 'Адрес',
                        name: 'cnt_addr',
                        boundName: 'addr',
                        cls: 'container-align-small',
                        //style: 'margin: 0 0 -20px 0;',
                        labelText: 'Адрес',
                        isOurOrg: false,
                        showAskText: false,
                        width: 480,
                        value: me.rekvModel.get('addr'),
                    }),
                ]
            },

            {
                'xtype': 'container',
                items: [
                    {
                        xtype: 'greenbuttonsimple',
                        text: 'Сохранить',
                        name: 'btn_save_edit',
                        style: 'margin-right:10px;',
                        handler: function () {
                            let win = me.getWin();

                            win.down('[name=inn]').setValue(this.up('[name=cnt_field_edit]').down('[name=inn]').getValue());
                            win.down('[name=kpp]').setValue(this.up('[name=cnt_field_edit]').down('[name=kpp]').getValue());
                            win.down('[name=addr]').setValue(this.up('[name=cnt_field_edit]').down('[name=addr]').getValue());
                            me.currState.inn = this.up('[name=cnt_field_edit]').down('[name=inn]').getValue();
                            me.currState.kpp = this.up('[name=cnt_field_edit]').down('[name=kpp]').getValue();
                            me.currState.addr = this.up('[name=cnt_field_edit]').down('[name=addr]').getValue();
                            this.up('[name=cnt_field_edit]').destroy();
                            me.formFill();
                            me.formSave();
                            t.show();
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Отмена',
                        name: 'btn_cansel_edit',
                        handler: function () {
                            t.show();
                            this.up('[name=cnt_field_edit]').destroy();
                        }
                    }
                ]
            }

        ];

        var fieldContainer =
            {
                xtype: 'form',
                name: 'cnt_field_edit',
                cls: 'container-align',
                style: 'display: inline-block; background: #f6faff;',
                bodyStyle: 'padding: 10px;',
                width: 600,
                items: fld,
                //mdl: model,
                listeners: {
                    validitychange: function (th, valid, eOpts) {
                        var win = this.up('window');
                        if (valid) {
                            this.down('[name=btn_save_edit]').enable();
                            this.down('[name=btn_save_edit]').removeCls("disabled-btn");
                            this.down('[name=btn_save_edit]').addCls("green-btn");
                        } else {
                            this.down('[name=btn_save_edit]').disable();
                            this.down('[name=btn_save_edit]').removeCls("green-btn");
                            this.down('[name=btn_save_edit]').addCls("disabled-btn");
                        }
                    }
                }
            };

        let _index = t.up('container').items.indexOf(t) + 1;
        t.hide();
        if (t.name == 'rekv') {
            t.up('container').insert(_index, fieldContainer);
        }
    },

    /****************************/

    showFormPlRekv: function (t) {
        var me = this,
            win = this.getWin(),
            form = win.down('form'),
            disabled = false;

        var start_from = '1970-01-01 00:00:00';
        let dbeg = '1970-01-01 00:00:00';

        if (me.currState.start_from) {
            dbeg = me.currState.start_from;
            start_from = dbeg;
        }

        let recipient = me.pl_rekvModel.get('recipient');
        let bik_bank = '';
        if (me.pl_rekvModel.get('bik') != '')
            bik_bank = me.pl_rekvModel.get('bik') + ' : ' + me.pl_rekvModel.get('bank');
        let bik = me.pl_rekvModel.get('bik');
        let bank = me.pl_rekvModel.get('bank');
        let ks = me.pl_rekvModel.get('ks');
        let rs = me.pl_rekvModel.get('rs');
        let rs_id = win.down('[name=rs_id]');

        if (t.cnf) {
            dbeg = t.cnf.start_from;
            start_from = dbeg;
        }

        if (dbeg == null) {
            dbeg = '1970-01-01 00:00:00';
            start_from = dbeg;
        }

        if (t.state && (t.state == 'first')) {
            recipient = t.cnf.recipient;
            bik_bank = t.cnf.bik + ' : ' + t.cnf.bank;
            bik = t.cnf.bik;
            bank = t.cnf.bank;
            ks = t.cnf.ks;
            rs = t.cnf.rs;
            rs_id = t.cnf.rs_id;
            dbeg = '1970-01-01 00:00:00';
            start_from = dbeg;
        }

        if (t.state && (t.state == 'more' || t.state == 'new')) {
            if (start_from == '1970-01-01 00:00:00') {
                start_from = new Date();
                start_from = Ext.Date.format(start_from, 'Y-m-d 00:00:00');
            }
            let _dt = new Date(start_from);
            if (t.state == 'new') {
                dbeg = t.cnf.start_from;
            }
            else
                dbeg = Ext.Date.format(_dt, 'Y-m-d 00:00:00');

            disabled = true;
            // dbeg = t.start_from;

            recipient = t.cnf.recipient;
            bik_bank = t.cnf.bik + ' : ' + t.cnf.bank;
            bik = t.cnf.bik;
            bank = t.cnf.bank;
            ks = t.cnf.ks;
            rs = t.cnf.rs;
            rs_id = t.cnf.rs_id;
        }

        let show_dt_start = false;
        if (dbeg == '1970-01-01 00:00:00')
            show_dt_start = true;

        var fld = [
            {
                'xtype': 'container',
                'name': 'edit_cnt_top',
                'cls': 'container-align-small edit_cnt_top',
                layout: 'vbox',
                width: 480,
                items: [
                    {
                        'xtype': 'label',
                        'html': '<b style="font-size: 16px;">' + (t.new ? 'Новое значение' : 'Редактирование') + '</b>',
                        width: 480,
                    },
                    {
                        'xtype': 'label',
                        'html': '<img src="'+_icons.info+'" style="margin: 0 5px 6px 0" /><span class="txt-grey">' + (t.new ? 'Новое значение будет ' : 'Исправления будут ') + 'в документах, начиная с указанной даты</span>',
                        width: 480,
                    }
                ]
            },

            {
                'xtype': 'container',
                items: [
                    {
                        xtype: 'hidden',
                        name: 'rs_id',
                        value: rs_id
                    },
                    {
                        'xtype': 'label',
                        'html': 'Получатель платежа'
                    },
                    {
                        'xtype': 'textareafield',
                        name: 'recipient',
                        border: 0,
                        height: 50,
                        width: 480,
                        autoScroll: true,
                        grow: true,
                        cls: 'container-align-small',
                        value: recipient,
                        //disabled: true//disabled
                    },

                    {
                        xtype: 'cont_vert',
                        title: 'БИК',
                        itm: {
                            'xtype': 'gbs_combo_clr',
                            'name': 'bik_bank',
                            'displayField': 'BIK',
                            'valueField': 'BIK',
                            'width': 480,
                            'store': 'storeBanks',
                            'minChars': 1,
                            'queryMode': 'remote',
                            'typeAhead': true,
                            value: t.new ? '' : bik_bank,
                            tpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                '<div class="x-boundlist-item">{BIK} : {NAME}</div>',
                                '</tpl>'
                            ),
                            'listConfig': {
                                cls: 'style2018',
                                minWidth: 400,
                                maxHeight: 150,
                                loadingText: 'Загрузка данных',
                                maxWidth: 520
                            },
                            listeners: {
                                select: function (th, recs) {
                                    let win = me.getWin();
                                    //win.down('[name=bank]').setValue(this.up('[name=cnt_field_edit]').down('[name=bank]').getValue());
                                    this.up('[name=cnt_field_edit]').down('[name=bank]').setValue(recs[0].data.NAME);
                                    this.up('[name=cnt_field_edit]').down('[name=bik]').setValue(recs[0].data.BIK);
                                    this.up('[name=cnt_field_edit]').down('[name=ks]').setValue(recs[0].data.KS);
                                    this.setValue(recs[0].data.BIK + ' : ' + recs[0].data.NAME);
                                }
                            }
                        }
                    },
                    {
                        xtype: 'hidden',
                        name: 'bik',
                        value: bik
                    },
                    {
                        xtype: 'hidden',
                        name: 'bank',
                        value: bank
                    },

                    {
                        'xtype': 'label',
                        'html': 'Корр. счет'
                    },
                    {
                        xtype: 'textfield',
                        name: 'ks',
                        maxLength: 24,
                        enforceMaxLength: true,
                        emptyText: '20 цифр',
                        value: t.new ? '' : ks,
                        cls: 'container-align-small',
                        width: 480,
                        listeners: {
                            change: function (th, nv, ov) {
                                nv = nv.replace(/\s+/g, '');
                                this.setRawValue(nv.match(/.{1,4}/g).join(' '))
                            }
                        }
                    },
                    {
                        xtype: 'textfield',
                        name: '_ks',
                        maxLength: 24,
                        enforceMaxLength: true,
                        value:  t.new ? '' : ks,
                        hidden: true,
                        // listeners: {
                        //     change: function (th, nv, ov) {
                        //         this.up('container').down('[name=ks]').setValue(nv.match(/.{1,4}/g).join(' '))
                        //     }
                        // }
                    },

                    {
                        'xtype': 'label',
                        'html': 'Счет получателя'
                    },
                    {
                        xtype: 'textfield',
                        name: 'rs',
                        maxLength: 24,
                        enforceMaxLength: true,
                        emptyText: '20 цифр',
                        value:  t.new ? '' : rs,
                        cls: 'container-align',
                        width: 480,
                        oldv: null,
                        listeners: {
                            change: function (th, nv, ov) {
                                nv = nv.replace(/\s+/g, '');
                                this.setRawValue(nv.match(/.{1,4}/g).join(' '))
                            }
                        }
                    },
                    {
                        xtype: 'textfield',
                        name: '_rs',
                        maxLength: 24,
                        enforceMaxLength: true,
                        value:  t.new ? '' : rs,
                        hidden: true,
                        // listeners: {
                        //     change: function (th, nv, ov) {
                        //         this.up('container').down('[name=rs]').setValue(nv.match(/.{1,4}/g).join(' '))
                        //     }
                        // }
                    },

                    {
                        'xtype': 'container',
                        'name': 'dt_beg',
                        'cls': 'container-align',
                        hidden: show_dt_start,
                        items: [
                            {
                                'xtype': 'label',
                                'html': 'Дата начала действия'
                            },
                            {
                                'xtype': 'gbs_date_all',
                                'name': 'start_from',
                                minValue: '1970-01-01',
                                value: dbeg ? new Date(dbeg) : new Date(),
                                'width': 140
                            }
                        ]
                    },
                    {
                        'xtype': 'label',
                        'html': '<span class="txt-grey">Начальное значение</span>',
                        name: 'dt_start',
                        hidden: !show_dt_start
                    }
                ]
            },

            {
                'xtype': 'container',
                items: [
                    {
                        xtype: 'greenbuttonsimple',
                        text: 'Сохранить',
                        name: 'btn_save_edit',
                        style: 'margin-right:10px;',
                        handler: function () {
                            let th = this, win = me.getWin();

                            let dt = Ext.Date.format(this.up('[name=cnt_field_edit]').down('[name=start_from]').getValue(), 'Y-m-d H:i:s')

                            if ( (t.state && t.state == 'more') && start_from != dt && me.dates.includes(dt) ) {
                                me.showGreenWin(false, 'На данную дату уже есть историческое значение', 2000);
                                return;
                            } else if ( (t.state && t.state == 'new') && me.dates.includes(dt)) {
                                me.showGreenWin(false, 'На данную дату уже есть историческое значение', 2000);
                                return;
                            }

                            win.down('[name=recipient]').setValue(this.up('[name=cnt_field_edit]').down('[name=recipient]').getValue());
                            win.down('[name=bank]').setValue(this.up('[name=cnt_field_edit]').down('[name=bank]').getValue());
                            win.down('[name=bik]').setValue(this.up('[name=cnt_field_edit]').down('[name=bik]').getValue());
                            win.down('[name=ks]').setValue(this.up('[name=cnt_field_edit]').down('[name=ks]').getValue());
                            win.down('[name=rs]').setValue(this.up('[name=cnt_field_edit]').down('[name=rs]').getValue());
                            win.down('[name=start_from]').setValue(dt);
                            win.down('[name=rs_id]').setValue(this.up('[name=cnt_field_edit]').down('[name=rs_id]').getValue());
                            if (this.up('[name=cnt_field_edit]').down('[name=tr_budget_id]'))
                                win.down('[name=tr_budget_id]').setValue(this.up('[name=cnt_field_edit]').down('[name=tr_budget_id]').getValue());
                            else
                                win.down('[name=tr_budget_id]').setValue(0);

                            this.up('[name=cnt_field_edit]').destroy();

                            win.down('[name=pl_rekv]').addCls('color-black');
                            win.down('[name=btn_add]').show();

                            _fn = function () {
                                me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
                                //t.show();
                            }

                            if (t.new) {
                                me.formSave('addhist', _fn);
                            } else {
                                me.formSave('save', _fn);
                            }
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Отмена',
                        name: 'btn_cansel_edit',
                        handler: function () {
                            this.up('[name=cnt_field_edit]').destroy();
                            if (t.new) {
                                me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
                            } else {
                                me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
                            }
                            t.show();
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Удалить',
                        icon: '/img/ico-delete16.png',
                        style: 'margin-left: 188px;',
                        hidden: show_dt_start,
                        handler: function () {
                            th = this;
                            _confirm('Удаление', 'Удалить историческое значение?', function () {
                                _fn = function (data) {
                                    if (data) {
                                        // me.showGreenWin(true, 'Историческое значение удалено', 2000);
                                        th.up('[name=cnt_field_edit]').destroy();
                                        me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
                                    }
                                }
                                me.delHistory(rs_id, _fn);
                            });
                        }
                    }

                ]
            }

        ];

        if (t.state && t.state == 'more')
            fld.push( { xtype: 'hidden', name: 'tr_budget_id', value: t.cnf.id } );

        var fieldContainer =
            {
                xtype: 'form',
                name: 'cnt_field_edit',
                cls: 'container-align',
                style: 'display: inline-block; background: #f6faff;',
                bodyStyle: 'padding: 10px;',
                width: 500,
                items: fld,
                //mdl: model,
                listeners: {
                    validitychange: function (th, valid, eOpts) {
                        var win = this.up('window');

                        if (valid) {
                            this.down('[name=btn_save_edit]').enable();
                            this.down('[name=btn_save_edit]').removeCls("disabled-btn");
                            this.down('[name=btn_save_edit]').addCls("green-btn");
                        } else {
                            this.down('[name=btn_save_edit]').disable();
                            this.down('[name=btn_save_edit]').removeCls("green-btn");
                            this.down('[name=btn_save_edit]').addCls("disabled-btn");
                        }
                    }
                }
            };

        let _index = t.up('container').items.indexOf(t) + 1;
        t.hide();
        t.up('container').insert(_index, fieldContainer);
    },

    fillModels: function () {
        var me = this;

        if (!me.rekvModel) {
            Ext.define('rekvModel', {extend: 'Ext.data.Model',
                fields: [{
                    name: 'inn',
                    type: 'string'
                },{
                    name: 'kpp',
                    type: 'string'
                },{
                    name: 'addr',
                    type: 'string',
                }]
            });
            me.rekvModel = Ext.create('rekvModel', {
                inn: '',
                kpp: '',
                addr: '',
            });
        }
        if (!me.pl_rekvModel) {
            Ext.define('pl_rekvModel', {extend: 'Ext.data.Model',
                fields: [{
                    name: 'recipient',
                    type: 'string'
                },{
                    name: 'bik',
                    type: 'string'
                },{
                    name: 'bank',
                    type: 'string',
                },{
                    name: 'ks',
                    type: 'string',
                },{
                    name: 'rs',
                    type: 'string'
                }]
            });
            me.pl_rekvModel = Ext.create('pl_rekvModel', {
                recipient: '',
                bik: '',
                bank: '',
                ks: '',
                rs: ''
            });
        }

        if (me.currState) {
            me.rekvModel.set('inn', me.currState.inn);
            me.rekvModel.set('kpp', me.currState.kpp);
            me.rekvModel.set('addr', me.currState.addr);

            me.pl_rekvModel.set('recipient', me.currState.recipient);
            me.pl_rekvModel.set('bik', me.currState.bik);
            me.pl_rekvModel.set('bank', me.currState.bank);
            me.pl_rekvModel.set('ks', me.currState.ks);
            me.pl_rekvModel.set('rs', me.currState.rs);
        } else {
            me.currState = {'start_from': '1970-01-01 00:00:00'};
        }
    },

    /****************************/

    loadData: function (_args, title = false) {
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

        if (title)
            win.down('form').setTitle(me._title);

        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);

        me.onScroll();

        me.dates = [];
        me._args = _args;
        me.callback = _args.callback != undefined ? _args.callback : null;
        me.compareMode = false;
        win.down('#kod-hand').bindStore(cStore);
        me.mode = _args.mode;

        if (this.mode == 'tax') {
            this.showAll = this.showAsTax;
            this.showAllAfter = this.showAsTaxAll;
            win.down('[name=type]').setValue(0);
        }
        else {
            this.showAll = this.showAsFondFirst;
            this.showAllAfter = this.showAsFond;

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
                    if (win.down('[name=cnt-all-hist]'))
                        win.down('[name=cnt-all-hist]').destroy();
                    me.currState = action.result.data;
                    me.newState = null;
                    me.stopEvents = false;
                    me.showAllAfter();
                    me.formFill();
                    me.formCheck();
                    win.down('[name=main]').setReadOnly(me.currState.main==1);
                    if (me.mode == 'tax' && me.currState.kod!='') {
                        _ajax(dir_start_buh_ + "dadata.php?kod=" + me.currState.kod, {}, function (ret) {
                            var _ret = Ext.decode(ret, true) == null ? {} : Ext.decode(ret, true);
                            if (_ret.suggestions != undefined && _ret.suggestions.length != 0 ) {
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
                    win.down('[name=main]')._status = 'second';
                }
            });
        }
        else
        {
            this.getWin().show();
            win.down('[name=main]').setReadOnly(false);

            win.down('[name=t_bar]').hide();
            win.down('[name=cnt-name]').hide();
            win.down('[name=cnt-main]').hide();
            win.down('[name=cnt-rekv]').hide();
            win.down('[name=top-cnt-plrekv]').hide();

            me.onScroll();
        }

    },

    /****************************/

    formFill: function () {
        var me = this,
            win = this.getWin(),
            form = win.down('form');

        win.down('[name=_rekv]').hide();
        win.down('[name=_pl_rekv]').hide();
        win.down('[name=cnt-warning-2]').hide();
        win.down('[name=show_hist]').hide();
        win.down('[name=hide_hist]').hide();

        win.down('[name=pl_rekv]').show();
        if (win.down('[name=cnt-all-hist]'))
            win.down('[name=cnt-all-hist]').destroy();

        if (me.currState.hist.length > 1) {
            me.currState.hist.forEach( function (itm) {
                me.dates.push(itm.start_from);
            })
            win.down('[name=show_hist]').show();
        }

        me.fillModels();


        let nm = '';
        let rekv = '';
        if (me.mode == 'tax') {
            win.down('[name=cnt-main]').show();
            nm = me.currState.kod + ' - ' + me.currState.name;
            if (me.currState.inn != '' || me.currState.kpp != '' || me.currState.addr != '')
                rekv = 'ИНН: ' + me.currState.inn + '<br>КПП: ' + me.currState.kpp + '<br>Адрес: ' + me.currState.addr;
            else
                rekv = 'Добавить';
        }
        else {
            win.down('[name=cnt-main]').hide();
            nm = me.currState.inn + ' - ' + me.currState.name;
            if (me.currState.kpp != '' || me.currState.addr != '')
                rekv = 'КПП: ' + me.currState.kpp + '<br>Адрес: ' + me.currState.addr;
            else
                rekv = 'Добавить';
        }

        if (nm.length > 60) {
            nm = nm.slice(0,60) + '<br>' + nm.slice(60);
        }

        win.down('[name=name_btn]').setText(nm);
        win.down('[name=rekv]').setText(rekv);

        let pl_rekv = this.makePlRekv(me.currState);
        win.down('[name=pl_rekv]').setText(pl_rekv);

        win.down('[name=rekv]').show();
        win.down('[name=pl_rekv]').show();
    },

    makePlRekv: function (dt, more = false) {
        let win = this.getWin(), recip =  dt.recipient;

        if (!dt.recipient)
            dt.recipient = '';

        let pl_rekv = '', recipient = '';
        if (dt.recipient != '' || dt.bank != '' || dt.bik != '' ||  dt.ks != '' ||  dt.rs != '') {
            if (dt.recipient.length > 45) {
                recipient = dt.recipient.slice(0,45) + '<br>' + dt.recipient.slice(45);
            }
            else
                recipient = dt.recipient;
            pl_rekv = 'Получатель платежа: ' + recipient + '<br>Банк: ' + dt.bank + '<br>БИК: ' + dt.bik;
            pl_rekv += '<br>Корр. счет: ' + dt.ks + '<br>Счет получателя: ' + dt.rs + '<br>';

            if (more) {
                var dt_str = '';
                if (dt.start_from == '1970-01-01 00:00:00')
                    dt_str = 'Начальное значение';
                else {
                    dt_str = 'C ' + dt.start_from_f;
                    if (dt.start_to_f != '')
                        dt_str += ' по ' + dt.start_to_f;
                }
                pl_rekv += '<div class="txt-gray" style="margin: 10px 0;">' + dt_str  + '</div>';
            }

            win.down('[name=btn_add]').show();
        }
        else {
            pl_rekv = 'Добавить'
            win.down('[name=pl_rekv]').removeCls('color-black');
            win.down('[name=btn_add]').hide();
        }

        return pl_rekv;
    },

    compareData: function (t) {
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
        )) {
            if (me._args.startwin == undefined) {
                win.down('[name=cnt-check]').show();
            } else {
                this.formCompare();
            }
        }
        else {
            if (t != undefined && t.name == 'tbar-upgate') {
                let _msg = 'Реквизиты не изменены';
                me.showGreenWin('green', _msg, 2000);
            }
        }
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

    formSave: function (action = 'save', callback = false) {
        // Сохранить
        var me = this,
            win = this.getWin();
        form = win.down('form');
        var notValidField = win.query('textfield{isValid()===false}');

        if (notValidField.length == 0)
            win.down('button[action=save]').disable();

        form.submit({
            params: {
                action: action,
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
                        win.down('[name=id]').setValue(ret.id);
                    }
                    else {
                        _rec_to_remove.data = ret;
                        Ext.getCmp('spravGrid6').getView().refresh();
                    }

                    if (action == 'addhist' && me.count_hist != 0) {
                        if (win.down('[name=cnt-all-hist]'))
                            win.down('[name=cnt-all-hist]').destroy();
                        //win.down('[name=cnt-plrekv]').remove(2);
                        me.count_hist = 0;
                    }

                    //me.hideHistory();

                    if (callback)
                        callback();
                }
                //win.close();
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
            win.down('form').setTitle("Добавление налоговой");
        else
            win.down('form').setTitle("___");
    },

    /****************************/

    showAsTaxFirst: function () {
        // Филдсет для налоговой
        var me = this, win = me.getWin();
        //cnt_ks = win.down('[name=cnt-ks]');
        if (this.mode == 'tax')
            win.down('[name=cnt-name-hand]').show();
        else {
            win.down('[name=cnt-type-f]').show();
            win.down('[name=cnt-name-hand]').show();
        }
    },

    /****************************/

    showSaveBtn: function () {
        var win = this.getWin();
        win.down('[name=save_btn]').enable();
    },

    /****************************/

    showAsTaxNew: function () {
        // Филдсет для налоговой
        var me = this, win = me.getWin(),
            cnt_ks = win.down('[name=cnt-ks]');

        win.down('[name=name]').setValue(win.down('[name=name-hand]').getValue());

        if (this.mode == 'tax') {
            win.down('[name=kod]').setValue(win.down('[name=kod-hand]').getValue());
        }
        else {
            win.down('[name=kod]').setValue(win.down('[name=kod-hand]').getValue());
            win.down('[name=inn]').setValue(win.down('[name=kod-hand]').getValue());

            win.down('[name=inn-f_btn]').setText(win.down('[name=kod-hand]').getValue());
            win.down('[name=_inn-f_btn]').setText(win.down('[name=kod-hand]').getValue());
        }

        if (me.kod_rec) {
            me.fillDataFromWeb();
        }
        else {
            _fn = function () {
                if (me.mode == 'tax')
                    var _msg = 'Добавлена новая налоговая';
                else
                    _msg = 'Добавлен новый фонд';
                me.showGreenWin('green', _msg, 2000);
                me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
            }
            me.formSave('save', _fn);
        }
    },
    /****************************/

    showAsTaxAll: function () {
        // Филдсет для налоговой
        var me = this, win = me.getWin(),
            cnt_ks = win.down('[name=cnt-ks]');

        win.down('form').setTitle(win.down('[name=name]').getValue());
        me._title = win.down('[name=name]').getValue();

        win.down('[name=cnt-title-kod]').hide();
        win.down('[name=cnt-warning]').hide();
        win.down('[name=cnt-open-btn]').hide();
        win.down('[name=cnt-name-hand]').hide();

        win.down('[name=cnt-inn-fond]').hide();
        win.down('[name=cnt-type-f]').hide();

        win.down('[name=btn-del]').show();
        win.down('[name=t_bar]').show();
        win.down('[name=cnt-name]').show();
        win.down('[name=cnt-main]').show();
        win.down('[name=name_btn]').show();
        win.down('[name=cnt-rekv]').show();
        win.down('[name=top-cnt-plrekv]').show();

        if (win.down('[name=kod]') == '') {
            win.down('[name=kod]').setValue(win.down('[name=kod-hand]').getValue());
            win.down('[name=name]').setValue(win.down('[name=name-hand]').getValue());
            win.down('[name=name_btn]').setText(win.down('[name=kod-hand]').getValue() + ' - ' + win.down('[name=name-hand]').getValue());
        }

    },

    /****************************/

    showAsFondFirst: function () {
        var me = this, win = me.getWin();

        if (me._args.id == 0) {
            win.down('form').setTitle("Добавление фонда");
            win.down('[name=kod-title]').setText('Введите ИНН фонда для поиска');
            win.down('[name=cnt-warning]').update('Не найден фонд - попробуйте ввести ИНН заново или введите реквизиты вручную');
        }
        win.down('[name=tbar-upgate]').setText('Обновить реквизиты фонда');
        win.down('[name=update-btn-w2]').html = 'Обновить реквизиты фонда';
    },

    /****************************/

    showAsFond: function () {
        // Филдсет для фонда
        var me = this, win = me.getWin();
            //cnt_ks = win.down('[name=cnt-ks]');

        Ext.apply(win.down('[name=kod-hand]'), {maxLength: 10, emptyText: '10 цифр'});

        if (me._args.id == 0) {
            win.down('form').setTitle("Добавление фонда");
            win.down('[name=kod-title]').setText('Введите ИНН фонда для поиска');
            win.down('[name=cnt-warning]').update('Не найден фонд - попробуйте ввести ИНН заново или введите реквизиты вручную');
        }
        else {
            win.down('form').setTitle(win.down('[name=name]').getValue());
            win.down('[name=ifns]').setText('Фонд')

            win.down('[name=inn]').setValue(me.currState.inn);

            win.down('[name=inn-f_btn]').setText(win.down('[name=inn]').getValue());
            win.down('[name=_inn-f_btn]').setText(win.down('[name=inn]').getValue());
            win.down('[name=cnt-inn-fond]').show();

            win.down('[name=cnt-title-kod]').hide();
            win.down('[name=cnt-warning]').hide();
            win.down('[name=cnt-open-btn]').hide();
            win.down('[name=cnt-name-hand]').hide();
            win.down('[name=cnt-type-f]').hide();
            win.down('[name=cnt-main]').hide();

            win.down('[name=btn-del]').show();
            win.down('[name=t_bar]').show();
            win.down('[name=cnt-name]').show();
            win.down('[name=cnt-main]').show();
            win.down('[name=cnt-rekv]').show();
            win.down('[name=top-cnt-plrekv]').show();

            if (win.down('[name=kod]') == '') {
                win.down('[name=kod]').setValue(win.down('[name=kod-hand]').getValue());
                win.down('[name=name]').setValue(win.down('[name=name-hand]').getValue());
                win.down('[name=name_btn]').setText(win.down('[name=kod-hand]').getValue() + ' - ' + win.down('[name=name-hand]').getValue());
            }
        }

        // Ext.apply(this.getWin().down('#nameFond'), {name: 'name'});
        // Ext.apply(this.getWin().down('#inn'), {name: 'inn_old'});
        // Ext.apply(this.getWin().down('#kod-hand'), {name: 'inn'});
    },

    /****************************/

    pickOrg: function (t, nv) {
        // Подбор значений по коду
        var me = this,
            win = this.getWin(),
            cStore = win.down('#'+t.itemId).getStore(),
            url = '',
            params = {};

        if (this.mode == 'tax') {
            url = dir_start_buh_ + "dadata.php?kod=" + nv;
        }
        else {
            url = dir_start_buh_ + 'getinn_.php';
            params = {'inn': nv};
        }

        win.down('#'+t.itemId).collapse();
        cStore.removeAll();

        this.formCheck();
        if (this.taskAsk != null)
            this.taskAsk.cancel();
        if (this.stopEvents || nv === null || nv.length < (this.mode == 'tax' ? 4 : 10))
            return;

        me.taskAsk = new Ext.util.DelayedTask(function () {
            _ajax(url, params, function (ret) {
                var _ret = Ext.decode(ret, true) == null ? {} : Ext.decode(ret, true), i = 0,
                    finded = false;
                cStore.removeAll();
                win.down('#'+t.itemId).collapse();
                if (me.mode == 'tax') {
                    Ext.Array.each(_ret.suggestions, function (r) {
                        if (r.data.code == nv) {
                            cStore.insert(i, {kod: r.data.code, value: r.value, data: r.data});
                            i++;
                        }
                    });
                }
                else{
                    if (_ret.kol > 0)
                        cStore.insert(0, {kod: _ret.data.inn, value: _ret.data.briefname, data: _ret.data});
                }

                if (t.store.data.items.length != 0) {
                    me.hideHandButton()
                    me.kod_rec = t.store.data.items[0].data.data;
                    win.down('#' + t.itemId).expand();
                    finded = true;
                }
                else
                    me.kod_rec = null;

                if ( win.down('[name=id]').getValue() == 0) {
                    if (!finded) {
                        me.openHandButton();
                        win.down('#' + t.itemId).collapse();
                    } else {
                        me.hideHandButton()
                        win.down('#' + t.itemId).expand();
                    }
                }
            });
        });


        cStore.insert(0, {kod: 0, value: (this.mode == 'tax' ? 'Поиск налоговой ...' : 'Поиск фонда ...'), data: ''});
        win.down('#'+t.itemId).expand();
        me.taskAsk.delay(400);
    },

    /****************************/

    openHandButton: function () {
        var me = this,
            win = this.getWin();
        win.down('[name=cnt-warning]').show();
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
            //data = rec[0].data.data,
            data = me.kod_rec;

        if (win.down('[name=cnt_field_edit]')) {
            win.down('[name=cnt_field_edit]').destroy();
        }

        if (!data)
            return;

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
            win.down('[name=kod]').setValue(data.code);

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

            var typ_fond = '1';
            if (data.briefname) {
                var nm = data.briefname.toUpperCase();
                if (nm.match(/ПФР/) || (nm.match(/ПЕНСИОН/) && nm.match(/ФОНД/) && (nm.match(/РФ/) || nm.match(/РОСС/)))) {
                    typ_fond = '1';
                }
                if (nm.match(/ФСС/) || (nm.match(/ФОНД/) && nm.match(/СОЦИАЛЬН/) && nm.match(/СТРАХОВАН/) && (nm.match(/РФ/) || nm.match(/РОСС/)))) {
                    typ_fond = '3';
                }
                if (nm.match(/ФОМС/) || (nm.match(/ФОНД/) && nm.match(/ОБЯЗАТЕЛЬН/) && nm.match(/МЕДИЦИНСК/) && nm.match(/СТРАХОВАН/))) {
                    typ_fond = '2';
                }
            }
            win.down('[name=type]').setValue(typ_fond);
        }

        //me.formCheck();

        _fn = function () {
            me.loadData({'id': win.down('[name=id]').getValue(), 'mode': me.mode}, true);
        }
        me.formSave('save', _fn);
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
        var me = this, win = me.getWin();

        win.down('[name=bik_bank]').setValue(recs[0].data.BIK + ': ' + recs[0].data.NAME);
        win.down('[name=bik]').setValue(recs[0].data.BIK);
        win.down('[name=bank]').setValue(recs[0].data.NAME);
        if (recs[0].data.KS) {
            win.down('[name=ks]').setValue(recs[0].data.KS);
            win.down('[name=_ks]').setValue(recs[0].data.KS);
            me.currState.bik = recs[0].data.KS;
        }
        me.currState.bik = recs[0].data.BIK;
        me.currState.kpp = recs[0].data.NAME;
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

    clearData: function () {
        // очистка данных
        this.currState = null;
        this.newState = null;
        this.rekvModel = null;
        this.pl_rekvModel = null;
        this.count_hist = 0;
        this.hand_mode = false;
        this.dates = [];
    },

    /****************************/

    winClose: function () {
        // обработка закрытия окна
        this.clearData()
        Ext.getCmp('spravGrid6').store.load();
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

        //toolbar.fillErrorBar(layout, win.down('[name=cnt-kpp]').isVisible());
    },

    /**************************************/

    formCompare: function () {
        // Сравнить поля с текущим и предыдущим состояниями
        var me = this,
            win = me.getWin(),
            _ks = win.down('[name=ks]');

        if (me.count_hist != 0) {
            if (win.down('[name=cnt-all-hist]'))
                win.down('[name=cnt-all-hist]').destroy();
            //win.down('[name=cnt-plrekv]').remove(2);
            me.count_hist = 0;
        }
        win.down('[name=cnt-check]').hide();
        win.down('[name=cnt-warning-2]').show();

        if (me.newState == null)
            return;

        me.compareMode = true;
        // win.down('[name=name]').setValue(me.newState.name);

        let rekv_changed = false;
        if (me.currState.inn != me.newState.inn ||
            me.currState.kpp != me.newState.kpp ||
            me.currState.addr != me.newState.address) {
            rekv_changed = true;
        }

        win.down('[name=rekv]').show();
        win.down('[name=pl_rekv]').show();

        let str = '';
        let str1 = '';
        if (rekv_changed) {
            if (me.mode == 'tax') {
                str = '<span class="color-green">ИНН: ' + me.newState.inn + '<br>КПП: ' + me.newState.kpp + '<br>Адрес: ' + me.newState.address + '</span>';
                str1 = 'Было:<br>ИНН: ' + me.currState.inn + '<br>КПП: ' + me.currState.kpp + '<br>Адрес: ' + me.currState.addr;
            } else {
                str = '<span class="color-green">КПП: ' + me.newState.kpp + '<br>Адрес: ' + me.newState.address + '</span>';
                str1 = 'Было:<br>КПП: ' + me.currState.kpp + '<br>Адрес: ' + me.currState.addr;
            }
            win.down('[name=rekv]').setText(str);
            win.down('[name=_rekv]').setText(str1);
            win.down('[name=_rekv]').show();
        }

        let pl_rekv_changed = false;
        if (me.currState.recipient != me.newState.payment_name ||
            me.currState.bank != me.newState.bank_name ||
            me.currState.bik != me.newState.bank_bic) {
            pl_rekv_changed = true;
        }
        var _ks = me.currState.rs.replace(/\s+/g, '');
        var _rs = me.currState.rs.replace(/\s+/g, '');
        if (_rs.replace(/ /g, '') != me.newState.bank_account ||
            (_ks && me.currState.ks.replace(/ /g, '') != me.newState.bank_correspondent_account)) {
            pl_rekv_changed = true;
        }

        let pl_rekv = '<div style="white-space: normal;">Получатель платежа: ' + me.currState.recipient + '<br>Банк: ' + me.currState.bank + '<br>БИК: ' + me.currState.bik;
        pl_rekv += '<br>Корр. счет: ' + me.currState.ks + '<br>Счет получателя: ' + me.currState.rs + '</div';
        win.down('[name=pl_rekv]').setText(pl_rekv);

        if (pl_rekv_changed) {
            let str = '<div class="color-green" style="white-space: normal;">Получатель платежа: ' + me.newState.payment_name + '<br>Банк: ' + me.newState.bank_name + '<br>БИК: ' + me.newState.bank_bic;
            str += '<br>Корр. счет: ' + me.newState.bank_correspondent_account + '<br>Счет получателя: ' + me.newState.bank_account + '</div';
            win.down('[name=pl_rekv]').setText(str)
            str = '<div style="white-space: normal;">Было:<br>Получатель платежа: ' + me.currState.recipient + '<br>Банк: ' + me.currState.bank + '<br>БИК: ' + me.currState.bik;
            str += '<br>Корр. счет: ' + me.currState.ks + '<br>Счет получателя: ' + me.currState.rs + '</div';
            win.down('[name=_pl_rekv]').setText(str)
            win.down('[name=_pl_rekv]').show();
        }

        // me.checkForEqual();
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

    showGreenWin: function (result, msg, delay) {
        let color = 'green';
        if (!result) {
            color = 'red';
        }
        let win = Ext.create('Buh.classes.window.Green',{
            aCls : color == 'red' ? 'there_error' : null,
            setText : msg,
            //itemId: 'dovInfoWindow'
        });

        win.show();

        if (delay)
            setTimeout(function () {
                win.close();
            }, delay);
    }

});
