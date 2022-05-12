Ext.define('Buh.controller.ImportSostav', {
    extend: 'Ext.app.Controller',

    stores: [
        'Buh.store.global.ScStore',
    ],

    refs: [

        {
            ref: 'grdMaket',
            selector: 'impmaketwindow grd_imp'
        },

        {
            ref: 'winMaket',
            selector: 'impmaketwindow'
        },

        {
            ref: 'cbSc',
            selector: 'impmaketwindow [name=cb_sc_ssc]'
        },

        {
            ref: 'cbAn',
            selector: 'impmaketwindow [name=idanalit]'
        },

    ],

    init: function () {
        this.control({

            'impmaketwindow': {
                show: this.loadGrid,         // Загрузка грида с макетами при открытии окна
                beforeclose: this.askCloseWin,  // обработка закрытия окна
            },

            'impmaketwindow grid': {
                select: this.fillMaket,           // Заполнить деталями макета нижнюю панель
                selectionchange: this.showMaket,  // показать / спрятать нижнюю панель
                itemcontextmenu: this.showMenu,  // показать меню грида
            },

            'impmaketwindow form': {
                fieldvaliditychange: this.checkForm,  // Проверить изменение полей
            },

            'impmaketwindow [name=maketName]': {
                change: this.checkForm,        // Проверить изменение полей
            },

            'impmaketwindow button[text=Добавить шаблон импорта]': {
                click: this.addMaket,        // Добавление макета для импорта
            },


            'impmaketwindow button[action=save]': {
                click: this.saveMaket,      // сохранение макета для импорта
            },

            'impmaketwindow filefield': {
                change: this.selectFile,
            },

            'impmaketwindow [name=import_sostav]': {
                click: this.importFile,     // Начать импортировать файл
            },


            'impmaketwindow [name=cb_sc_ssc]': {
                focus: this.openList,     // открывать список при фокусе
            },

            'impmaketwindow [name=idanalit]': {
                select: this.selScImport,   // Заполнить счетами комбо счетов в зависимости от типа номенклатуры
            },

            'impmaketwindow [action=help]': {
                click: this.help,   // Вызов подсказки по кнопке
            },

            'winconfirmred[name=wcloseimport] button[action=ok]': {
                click: this.confCloseWin,         // подтверждение закрытия окна
            },

            'winconfirmred[name=wcloseimport] button[action=cancel]': {
                click: this.refuseCloseWin,         // отказ от закрытия окна
            },

        });
    },


    loadGrid: function (button) {
        // Загрузка грида с макетами при открытии окна
        var me = this,
            grd = me.getGrdMaket();
        grd.store.proxy.extraParams = {tab: 652};
        grd.store.load(function (recs) {
            if (recs.length > 0)
                grd.getSelectionModel().select(0);
        });
        me.getWinMaket().down('form').down('header').removeAll();
        if (me.getWinMaket().owner.id_tab == 100) {
            me.getWinMaket().down('form').down('header').add({
                    xtype: 'box',
                    cls: 'window_header',
                    name: 'panel_title',
                    html: 'Импорт покупки из экселя'
                },
                {xtype: "button", text: "?", action: 'help', cls: 'btn_ico-vopros'});
            me.getWinMaket().down('[name=idanalit]').store.loadData([
                ['5', 'Товары'],
                ['31', 'Услуги'],
                ['32', 'РБП'],
                ['3', 'Материалы'],
            ]);
        }
        else {
            me.getWinMaket().down('form').down('header').add({
                    xtype: 'box',
                    cls: 'window_header',
                    name: 'panel_title',
                    html: 'Импорт продажи из экселя'
                },
                {xtype: "button", text: "?", action: 'help', cls: 'btn_ico-vopros'});
            me.getWinMaket().down('[name=idanalit]').store.loadData([
                ['5', 'Товары'],
                ['4', 'Продукция'],
                ['41', 'Услуги'],
                ['3', 'Материалы'],
            ]);
        }
        me.getCbSc().setValue('41.1');
        var st = me.getStore('Buh.store.global.ScStore').getScFiltered(me.getWinMaket().owner.id_tab == 100 ? 1 : 2, 5);
        me.getCbSc().bindStore(st);
    },

    openList: function (fld) {
        // открывать список при фокусе
        fld.expand();
    },

    checkForm: function () {
        // Проверить изменение полей
        var me = this,
            win = me.getWinMaket();
        win.modified = true;
    },


    askCloseWin: function () {
        // обработка закрытия окна
        var me = this,
            win = me.getWinMaket(),
            fld = win.down('[name=file-path]');
        if (fld.getValue() != "" || win.modified === true) {

            var w = Ext.create('Buh.view.service.WinConfirmRed', {
                name: "wcloseimport",
                title: "Закрыть окно?",
                text: "Введенная информация не сохранится",
                yes: "Закрыть без сохранения",
                no: "Отмена"
            });
            w.show();
            return false;
        }


    },

    confCloseWin: function (button) {
        // подтверждение закрытия окна
        var me = this,
            win = me.getWinMaket(),
            fld = win.down('[name=file-path]');
        fld.reset();
        win.modified = false;
        button.up('window').close();
        this.getWinMaket().close();

    },

    refuseCloseWin: function (button) {
        // отказ от закрытия окна
        button.up('window').close();
    },

    fillMaket: function (t, rec) {
        // Заполнить деталями макета нижнюю панель
        var me = this,
            win = me.getWinMaket();
        win.down('form').getForm().load({
            url: dir_start_buh_ + 'form.php',
            params: {
                'action': 'read',
                'sprav': 652,
                'id': rec.data.id
            },
            success: function (form, action) {
                win.down('[name=maketName]').setValue(action.result.data.maketName);
                var st = me.getStore('Buh.store.global.ScStore').getScFiltered(me.getWinMaket().owner.id_tab == 100 ? 1 : 2, me.getCbAn().getValue());
                me.getCbSc().bindStore(st);
                win.modified = false;
            }
        });


    },

    showMaket: function (t, rec) {
        // показать / спрятать нижнюю панель
        if (rec == undefined || rec.length == 0) {
            this.getWinMaket().down('impmaketempty').show();
            this.getWinMaket().down('impmaketdetail').hide();
        }
        else {
            this.getWinMaket().down('impmaketempty').hide();
            this.getWinMaket().down('impmaketdetail').show();
        }

    },

    addMaket: function () {
        // Добавление макета для импорта
        var me = this,
            grd = me.getWinMaket().down('grid');

        grd.store.insert(0, {'sprav': 652, 'maketName': 'Новый шаблон', 'kod': 1, 'cb_sc_ssc': '41.1', 'idanalit': 5});
        grd.store.sync();
    },

    saveMaket: function () {
        // сохранение макета для импорта
        var me = this,
            win = me.getWinMaket(),
            grd = win.down('grid'),
            rec = grd.getSelectionModel().getSelection()[0],
            ind = grd.store.indexOf(rec);
        win.down('form').getForm().submit({
            url: dir_start_buh_ + 'form.php',
            params: {'action': 'save', 'maketName': win.down('[name=maketName]').getValue()},
            success: function (form, action) {
                win.modified = false;
                rec.set('maketName', win.down('[name=maketName]').getValue());
            }
        });


    },

    selectFile: function (button) {
        this.getWinMaket().down('button[name=import_sostav]').enable();
    },

    importFile: function (button) {
        // Начать импортировать файл
        var win = this.getWinMaket(),
            grd = win.down('grid'),
            grdSd = win.owner.down('grid'),
            form = win.down('form').getForm(),
            naim_ = form.findField('naim_').getValue(),
            edizm_name_ = form.findField('edizm_name_').getValue(),
            lineB = form.findField('lineB').getValue() * 1,
            lineE = form.findField('lineE').getValue() * 1,
            kol_ = form.findField('kol_').getValue(),
            sumaNDS_ = form.findField('sumaNDS_').getValue(),
            _id_tab = win.owner.id_tab,
            dt = new Date(),
            _dat = Ext.Date.format(dt, 'Y-m-d');


        if (naim_ == false || edizm_name_ == false || kol_ == false || sumaNDS_ == false || lineB == 0 || lineE == 0) {
            _alert_win('Не введена обязательная информация', 'Укажите номера ячеек для полей:<br>&#8212; Начальная строка<br>&#8212; Конечная строка' +
                '<br>&#8212; Наименование<br>&#8212; Ед. изм.<br>&#8212; Количество<br>&#8212; Сумма с НДС');
            return;
        }

        if (grd.getSelectionModel().hasSelection()) {
            if (form.isValid()) {
                form.submit({
                    url: dir_start_buh_ + 'file-upload.php/sdelka',
                    params: {
                        tab: _id_tab,
                        dat_ship: _dat,
                        sklad: d_sklad_id
                    },

                    waitMsg: 'Обрабатывается файл...',
                    success: function (form, action) {
                        win.modified = false;
                        win.close();
                        var ans = action.result;
                        var _rec = ans.data;
                        grdSd.store.insert(0, Ext.create('mdl.gridSBDoc', _rec));
                        grdSd.getSelectionModel().select(0);
                        grdSd.getView().focusRow(0);
                        var rec = grdSd.store.getAt(0);
                        openSbEdit({_id_tab: _id_tab, _recGrid: rec, _constrain: win.owner.renderTo});


                    },
                    failure: function (fp, o) {
                        ext = "";
                        if (o.result.nofile == 1) ext = "Не выбран файл для импорта.";
//                        _alert_win('Ошибка !', 'Импорт завершился неудачей. ' + ext);
                    }
                });
            }
            /*
                        else
                            _alert_win('Ошибка !', 'Выберите макет для импорта.');
            */
        }

    },

    selScImport: function (combo) {
        // Заполнить счетами комбо счетов в зависимости от типа номенклатуры

        var me = combo,
            val = me.getValue(),
            val1 = me.getValue(),
            sc = [],
            s = me.getValue();
        sc['3'] = '10.1';
        sc['31'] = '20.1';
        sc['32'] = '97.1';
        sc['4'] = '43.1';
        sc['41'] = '90.1';
        sc['5'] = '41.1';

        if (val == '3') {
            val1 = 30;
            s = 3;
        }
        if (val == '31') {
            val1 = 31;
            s = 31;
        }
        if (val == '32') {
            val1 = 32;
            s = 32;
        }
        var st = this.getStore('Buh.store.global.ScStore').getScFiltered(this.getWinMaket().owner.id_tab == 100 ? 1 : 2, val);
        this.getCbSc().bindStore(st);
        this.getCbSc().setValue(sc[val]);
    },

    help: function () {
        // Вызов подсказки по кнопке
        window.open("https://prgmanual.ru/node/295967");

    },


    showMenu: function (v, rec, it, ind, e, eo) {
        // показать меню грида
        var grid = v.up('grid');
        e.stopEvent();
        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.menu.showAt(e.getXY());

    },

});
