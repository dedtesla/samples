Ext.define('Buh.classes.closesc.Window', {
    requires: [
        'Buh.classes.closesc.Tree20',
        'Buh.classes.closesc.Tree90',
        'Buh.classes.closesc.CloseSetting',
        'Buh.classes.closesc.TopContainer',
        'Buh.classes.closesc.TopContainerRed',
        'Buh.classes.closesc.TopContainerAutoClose',
        'Buh.classes.closesc.TopContainerRedError',
    ],


    extend: 'Gbs.window',
    cls: 'style2018 sprav_window period-window',
    header: false,
    closeAction: 'destroy',
    width: 800,
    modal: true,
    //height: 612,
    y: 60,

    initComponent: function() {
        this.items = {
            xtype: 'form',
            name: 'main_panel',
            header: {
                xtype: 'header',
                items: [
                    {
                        xtype: 'box',
                        cls: 'window_header',
                        name: 'panel_title',
                        width: '100%',
                        html: 'Закрытие периода'
                    }]
            },


            items: [
                {
                    xtype: 'closesetting',
                    width: '740',
                    //flex: 1
                },

                {
                    xtype: 'redpaneltop',
                    hidden: true,
                    width: '740',
                    // flex: 1
                },

                {
                    xtype: 'redpaneltoperror',
                    hidden: true,
                    width: '740',
                    // flex: 1
                },

                {
                    xtype: 'greenpaneltop',
                    hidden: true,
                    width: '740',
                    // flex: 1
                },

                {
                    xtype: 'closepaneltop',
                    hidden: true,
                    width: 740
                    // flex: 1
                },

                {
                    xtype: 'box',
                    name: "empty20_title",
                    cls: "sub-title-doc",
                    html: "Списание расходов",
                },
                {
                    xtype: 'tree20',
                    width: '740',
                    store: Ext.create('Buh.classes.closesc.Tree20Store'),
                    //flex: 10
                },
                {
                    xtype: 'box',
                    hidden: true,
                    name: "empty20",
                    width: '740',
                    html: "За выбранный период нет ни одного счета с остатком",
                },
                {
                    xtype: 'box',
                    name: "empty90_title",
                    cls: "sub-title-doc",
                    html: "Финансовый результат",
                },
                {
                    xtype: 'tree90',
                    width: '740',
                    store: Ext.create('Buh.classes.closesc.Tree90Store'),
                },
                {
                    xtype: 'box',
                    hidden: true,
                    name: "empty90",
                    width: '740',
                    html: "За выбранный период нет ни одного счета с остатком",
                },
            ]
        }
        this.callParent(arguments)
    },

    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        items: [{
            text: 'Закрыть счета',
            name: 'btnCloseSc',
            'xtype': 'greenbuttonsimple',
            handler: function () {
                this.up('window').fireEvent('closeSc');
            }
        }, {
            text: 'Отмена',
            handler: function () {
                this.up('window').close();
            }
        }]
    }],

    showWin: function (_args) {
        this.listenersOn();
        let win = this,
            year = win.down('#cmbYear').getValue(),
            comboStore = win.down('[name=periods]').store;
        _ajax(dir_start_buh_ + 'closeaccounts/readsetting/',
            {
                'yearDatabase': currYear,
                'year': year
            },
            function (_inp) {
                let val = Ext.decode(_inp, false);
                comboStore.proxy.extraParams.period = val.period;
                comboStore.proxy.extraParams.year = year;
                comboStore.load({
                    callback: function (recs) {
                        let id = 0;
                        Ext.Array.each(recs, function (rec) {
                            id = rec.data.id;
                            if (rec.data.closed != 1 && rec.data.closed != 2)
                                return false;
                        });
                        win.show();
                        win.hide();
                        win.down('[name=periods]').setValue(id);
                        win.fireEvent("setPeriodClosing", val.period);
                        win.fireEvent("fillTrees");
                    }
                });
            }
        );

        //this.show();

    },

    compileFooter: function (answer) {

        let textFooter = (answer.notused.length == 1 ? "Счет " : "Счета "),
            textSuffix = (answer.notused.length == 1 ? " не использовался" : " не использовались");
        for (let i = 0; i < answer.notused.length; i++) {
            textFooter += " " + answer.notused[i];
            if (i < (answer.notused.length - 1)) {
                textFooter += (i == (answer.notused.length - 2)) ? " и" : ",";
            }
        }
        textFooter += textSuffix;
        return textFooter;

    },

    listenersOn: function () {
        let window = this;
        window.on({
                fillTrees: function () {
                    let win = this,
                        year = win.down('#cmbYear').getValue(),
                        period = win.down('[name=periods]').getValue(),
                        inputGreen = {},
                        store20 = win.down('tree20').store,
                        store90 = win.down('tree90').store;
                    win.down('redpaneltoperror').hide();
                    inputGreen.reset = true;
                    win.fireEvent('setGreenPanelStatus', inputGreen);
                    win.down('[name=btnCloseSc]').enable();
                    win.fireEvent('setRedPanelStatus', 0);
                    let winMask = new Ext.LoadMask(win, {msg: "Загрузка данных..."});
                    winMask.show();


                    _ajax(dir_start_buh_ + 'closeaccounts/readperiodstatus/',
                        {
                            yearDatabase: currYear,
                            year: year,
                            period: period
                        },
                        function (_inp) {
                            let val = Ext.decode(_inp, false),
                                btnText = "";
                            inputGreen.reset = false;
                            inputGreen.haveClosed = val.haveclosed;
                            inputGreen.ost20 = val.ost20;
                            inputGreen.ost90 = val.ost90;

                            btnText = period == 17 ? "Реформация баланса" : ((period != 12 && period != 16) ? "Закрыть счета" : "Закрыть счета и перейти к реформации");
                            win.down('[name=btnCloseSc]').setText(btnText);
                            win.fireEvent('setGreenPanelStatus', inputGreen);


                            if (!(val.ost20 == 0 && val.ost90 == 0)) {
                                win.down('[name=empty90_title]').setVisible(true);
                                if (period != 17) {
                                    win.down('[name=empty20_title]').setVisible(true);
                                    store20.proxy.extraParams = {
                                        yearDatabase: currYear,
                                        year: year,
                                        scMask: '20,23,25,26,29,44',
                                        period: period
                                    };
                                    store20.load({
                                        callback: function (rows, store) {
                                            let answer = Ext.decode(store.response.responseText),
                                                node = win.down('tree20').getRootNode(),
                                                nodes = node.childNodes,
                                                statusRed = -1;
                                            if (answer.error)
                                                statusRed = 1;
                                            win.down('tree20').setVisible(answer.error || answer.ost != 0);
                                            win.down('[name=empty20]').setVisible(!(statusRed != -1 || answer.ost != 0));

                                            node.expand();
                                            if (answer.notused.length > 0) {
                                                win.down('tree20').down('[name=unused-20]').show();
                                                win.down('tree20').down('[name=unused-20]').down('[name=footer]').update(win.compileFooter(answer));
                                            }
                                            else
                                                win.down('tree20').down('[name=unused-20]').hide();

                                            win.fireEvent('setRedPanelStatus', statusRed);
                                            Ext.Array.each(
                                                nodes, function (node) {
                                                    if (!node.data.error)
                                                        win.down('tree20').getSelectionModel().select(node, true);
                                                });
                                            Ext.defer(function () {
                                                winMask.hide();
                                                if (win.isHidden())
                                                    win.show();
                                                win.doLayout();
                                                cons('layout 1');
                                            }, 100);

                                        }

                                    });

                                }
                                else {
                                    win.down('[name=empty20_title]').setVisible(false);
                                    win.down('tree20').hide();
                                    win.fireEvent('setRedPanelStatus', 0);
                                    Ext.defer(function () {
                                        if (win.isHidden())
                                            win.show();
                                        win.doLayout();
                                        cons('layout 2');
                                        winMask.hide();
                                    }, 100);
                                }
                            }
                            else {
                                win.down('[name=empty20_title]').setVisible(false);
                                win.down('tree20').hide();
                                win.fireEvent('setRedPanelStatus', 0);
                                Ext.defer(function () {
                                    if (win.isHidden())
                                        win.show();
                                    win.doLayout();
                                    cons('layout 3');
                                    winMask.hide();
                                }, 100);
                            }
                            if (!(val.ost20 == 0 && val.ost90 == 0)) {
                                store90.proxy.extraParams = {
                                    yearDatabase: currYear,
                                    scMask: period != 17 ? '90,91' : '90,91,99',
                                    year: year,
                                    period: period
                                };
                                store90.load({
                                    callback: function (rows, store) {
                                        win.down('tree90').getSelectionModel().setLocked(false);
                                        let answer = Ext.decode(store.response.responseText),
                                            node = win.down('tree90').getRootNode(),
                                            nodes = node.childNodes,
                                            statusRed = -1;
                                        if (answer.error)
                                            statusRed = 1;
                                        if (answer.error901)
                                            statusRed = 2;

                                        win.down('tree90').setVisible(!val.haveclosed || val.ost20 != 0 || val.ost90 != 0);
                                        node.expand();
                                        if (answer.notused.length > 0) {
                                            win.down('tree90').down('[name=unused-90]').show();
                                            win.down('tree90').down('[name=unused-90]').down('[name=footer]').update(win.compileFooter(answer));
                                        }
                                        else
                                            win.down('tree90').down('[name=unused-90]').hide();
                                        win.fireEvent('setRedPanelStatus', statusRed);
                                        Ext.Array.each(nodes, function (node) {
                                            if (!node.data.error)
                                                win.down('tree90').getSelectionModel().select(node, true);
                                        });
                                        win.down('tree90').getSelectionModel().setLocked(period == 17);
                                        Ext.defer(function () {
                                            if (win.isHidden())
                                                win.show();
                                            win.doLayout();
                                            cons('layout 4');
                                            winMask.hide();
                                        }, 100);
                                    }
                                });
                            }
                        }
                    );

                    win.doLayout();
                },

                closeSc: function () {
                    let win = this,
                        p = win.down('[name=periods]').getValue(),
                        year = win.down('#cmbYear').getValue(),
                        i = 0,
                        url = dir_start_buh_ + 'closeaccounts/closingrecords/',
                        arScClosed = '',
                        arScClosed1 = [],
                        arScClosed2 = [],
                        toCloseSc = win.down('[name=btnCloseSc]').toCloseSc,
                        comboStore = win.down('[name=periods]').store,
                        periodType = win.down('[name=period]').getValue(),
                        sm20 = win.down('tree20').getSelectionModel().selected,
                        sm90 = win.down('tree90').getSelectionModel().selected;

                    if (toCloseSc) {
                        win.down('[name=periods]').setValue(periodType == 0 ? '12' : '16');
                        win.fireEvent("fillTrees");

                        return;
                    }

                    Ext.Array.each(sm20.items, function (rec) {
                        arScClosed += rec.data.sc + ",";
                        arScClosed1.push(rec.data.sc);

                    });
                    Ext.Array.each(sm90.items, function (rec) {
                        arScClosed += rec.data.sc + ",";
                        arScClosed2.push(rec.data.sc);
                    });
                    if (p == 17)
                        url = dir_start_buh_ + 'closeaccounts/reformbalans/';

                    _ajax(url,
                        {
                            'yearDatabase': currYear,
                            'year': year,
                            'period': p,
                            'sc': arScClosed
                        },
                        function (_inp) {
                            let val = Ext.decode(_inp, false),
                                recPer = win.down('[name=periods]').store.getById(p),
                                pdName = recPer.data.period_name;
                            comboStore.load({
                                callback: function () {
                                    win.fireEvent("fillTrees");
                                }
                            });

                            if (val.errorCode != undefined) {
                                let arrExplain = val.errorMessage.split(","),
                                    header = "",
                                    txt = "",
                                    recPeriod = win.down('[name=periods]').store.getById(arrExplain[0]),
                                    periodName = recPeriod.data.period_name;

                                switch (val.errorCode) {
                                    case 1101:
                                        header = "Период нельзя закрыть.";
                                        txt = "В незакрытом прошлом периоде (" + periodName.toLowerCase() + ") есть счета с " +
                                            "неправильными остатками. Внесите исправления в<br>" +
                                            "учет и повторите операцию";
                                        break;
                                    case 1102:
                                        header = "Период нельзя закрыть.";
                                        txt = "В незакрытом прошлом периоде (" + periodName.toLowerCase() + ") есть счета с " +
                                            "неправильными остатками. Внесите исправления в<br>" +
                                            "учет и повторите операцию";
                                        break;

                                }
                                win.down('redpaneltoperror').down('[name=text-pad]').update(txt);
                                win.down('redpaneltoperror').show();
                            }
                            else {
                                if (p == 12 || p == 16)
                                    win.down('[name=periods]').setValue('17');

                                //win.fireEvent("fillTrees");
                                let winAnswer = Ext.create('Buh.classes.closesc.windowCloseReport');
                                winAnswer.owner = win;
                                if (p == 17)
                                    pdName = "Реформация баланса сделана";
                                else {
                                    if (arScClosed2 != [])
                                        pdName = pdName + " закрыт";
                                    else
                                        pdName = "Счета закрыты";
                                }

                                winAnswer.showWin([pdName, recPer, arScClosed1, arScClosed2]);
                            }
                        }
                    );


                },

                openWindowSetting: function (btn) {
                    let win = this,
                        year = win.down('#cmbYear').getValue(),
                        winSetting = Ext.create('Buh.classes.closesc.windowSetting');
                    winSetting.year = year;
                    winSetting.showWin({
                        "button": btn, "callback": function (period) {
                            win.down('[name=periods]').store.proxy.extraParams.period = period;
                            win.down('[name=periods]').store.proxy.extraParams.year = year;
                            win.down('[name=periods]').store.load({
                                callback: function (recs) {
                                    win.down('[name=periods]').setValue(recs[0].data.id);
                                    win.fireEvent("setPeriodClosing", period);
                                    win.fireEvent("fillTrees");
                                }
                            });

                        }
                    });
                },

                setYearClosing: function () {
                    /*
                                        let win = this;
                                        //this.showWin();
                                        //win.down('[name=periods]').setValue(id);
                                        //win.fireEvent("setPeriodClosing", val.period);
                                        win.fireEvent("setPeriodClosing", 1);
                                        win.fireEvent("fillTrees");
                                        */

                    let win = this,
                        year = win.down('#cmbYear').getValue(),
                        comboStore = win.down('[name=periods]').store;
                    _ajax(dir_start_buh_ + 'closeaccounts/readsetting/',
                        {
                            'yearDatabase': currYear,
                            'year': year
                        },
                        function (_inp) {
                            let val = Ext.decode(_inp, false);
                            comboStore.proxy.extraParams.period = val.period;
                            comboStore.proxy.extraParams.year = year;
                            comboStore.load({
                                callback: function (recs) {
                                    let id = 0;
                                    Ext.Array.each(recs, function (rec) {
                                        id = rec.data.id;
                                        if (rec.data.closed != 1 && rec.data.closed != 2)
                                            return false;
                                    });
                                    win.down('[name=periods]').setValue(id);
                                    win.fireEvent("setPeriodClosing", val.period);
                                    win.fireEvent("fillTrees");
                                }
                            });
                        }
                    );


                },

                closingrecordsdelete: function (btn) {
                    let win = this,
                        rc = null,
                        typePeriod = win.down('[name=period]').getValue(),
                        year = win.down('#cmbYear').getValue(),
                        p = win.down('[name=periods]').getValue(),
                        comboStore = win.down('[name=periods]').store,
                        recPeriod = win.down('[name=periods]').store.getById(p),
                        closedCount = 0,
                        periodName = recPeriod.data.period_name;

                    comboStore.each(function (t) {
                        if ((t.data.id * 1) > p && t.data.closed == 1)
                            closedCount++;
                    });


                    _confirm("Удалить проводки по закрытию?", "Удалятся проводки по закрытию за " + periodName +
                        (closedCount > 0 ? ", а так же все последующие периоды" : ""),
                        function () {
                            _ajax(dir_start_buh_ + 'closeaccounts/closingrecordsdelete/',
                                {
                                    'yearDatabase': currYear,
                                    'year': year,
                                    'period': p
                                },
                                function (_inp) {
                                    let val = Ext.decode(_inp, false);
                                    comboStore.load();
                                    win.hide();
                                    win.fireEvent("fillTrees");

                                }
                            );
                        });


                },

                setPeriodClosing: function (period) {
                    let win = this;
                    win.down('[name=period]').setValue(period);
                    win.down('[name=openSettingWindow]').setText(period == 0 ? "Ежемесячное закрытие" : "Ежеквартальное закрытие");
                },

                beforeshow: function () {
                },

                setRedPanelStatus: function (val) {

                    let win = this,
                        tit = '',
                        body = '',
                        redPanel = win.down('redpaneltop');
                    if (val == 0) {
                        redPanel.state = 0;
                        redPanel.hide();
                    }
                    else {

                        if (redPanel.state < val) {
                            redPanel.state = val;

                        }
                        else
                            return;
                        switch (redPanel.state) {
                            case 1:
                                tit = 'Не будут закрыты счета с неправильными остатками';
                                body = 'Возможно, есть ошибка в остатках, проводках или суммах списания.<br>' +
                                    'Внесите исправления в учет и повторите операцию';
                                break;
                            case 2:
                                tit = 'Невозможно закрыть период';
                                body = 'На счетах учета финансовых результатов есть ошибка в остатках, проводках ' +
                                    'или суммах списания.<br>Внесите исправления в учет и повторите операцию.';
                                win.down('[name=btnCloseSc]').disable();
                                break;
                        }
                        redPanel.down('[name=title-pad]').update(tit);
                        redPanel.down('[name=text-pad]').update(body);
                        redPanel.show();
                    }
                },

                setGreenPanelStatus: function (val) {
                    let win = this,
                        tit = '',
                        body = '',
                        buttons = false,
                        notClosed = "",
                        notClosedCount = 0,
                        panelCls = "block_info-txt",
                        comboStore = win.down('[name=periods]').store,
                        period = win.down('[name=periods]').getValue(),
                        closePanel = win.down('closepaneltop'),
                        greenPanel = win.down('greenpaneltop');
                    win.down('[name=btnCloseSc]').toCloseSc = false;
                    greenPanel.hide();
                    closePanel.hide();
                    if (val.reset == true) {
                        greenPanel.ost20 = 0;
                        greenPanel.ost90 = 0;
                        greenPanel.haveClosed = false;
                        return;
                    }

                    comboStore.each(function (t) {
                        if ((t.data.id * 1) == period)
                            return false;

                        if (t.data.closed == 0) {
                            notClosedCount++;
                            if (notClosedCount > 1)
                                notClosed += ",";
                            notClosed += t.data.name;
                        }
                    });
                    if (notClosedCount > 0) {
                        if (period != 17) {
                            closePanel.down('[name=autoclose]').getEl().down('label.x-form-cb-label').update("Закрыть все периоды (" + notClosed + ")");
                            closePanel.down('[name=text-pad]').update('Сначала закройте прошлые периоды или отметьте галочкой закрытие всех периодов вместе.');
                            closePanel.down('[name=autoclose]').setValue(0);
                            win.down('[name=btnCloseSc]').setDisabled(true);
                            closePanel.down('[name=autoclose]').show();
                        }
                        else {
                            closePanel.down('[name=text-pad]').update('Для реформации в конце года необходимо закрыть все периоды.');
                            win.down('[name=btnCloseSc]').setText('Закрыть счета');
                            win.down('[name=btnCloseSc]').toCloseSc = true;
                            closePanel.down('[name=autoclose]').hide();
                        }
                        closePanel.show();
                    }

                    if (val.ost20 != undefined)
                        greenPanel.ost20 = val.ost20;
                    if (val.ost90 != undefined)
                        greenPanel.ost90 = val.ost90;
                    if (val.haveClosed != undefined)
                        greenPanel.haveClosed = val.haveClosed;

                    if (greenPanel.ost20 == 0 && greenPanel.ost90 == 0 && !greenPanel.haveClosed) {
                        // не требует закрытия
                        win.down('tree20').setVisible(false);
                        win.down('[name=empty20]').setVisible(false);
                        win.down('tree90').setVisible(false);
                        win.down('[name=empty90]').setVisible(false);
                        win.down('[name=empty20_title]').setVisible(false);
                        win.down('[name=empty90_title]').setVisible(false);


                        tit = 'Закрытие периода не требуется';
                        body = 'За выбранный период нет ни одного счета с остатком';
                        panelCls = "block_info-txt block_info-green";
                        if (period != 12 && period != 16)
                            win.down('[name=btnCloseSc]').setDisabled(true);
                        win.fireEvent("showGreenPanel", tit, body, buttons, panelCls);
                        return;
                    }

                    if (greenPanel.ost20 == 0 && greenPanel.ost90 == 0 && greenPanel.haveClosed) {
                        // не требует закрытия
                        win.down('tree20').setVisible(false);
                        win.down('[name=empty20]').setVisible(false);
                        win.down('tree90').setVisible(false);
                        win.down('[name=empty90]').setVisible(false);
                        win.down('[name=empty20_title]').setVisible(false);
                        win.down('[name=empty90_title]').setVisible(false);

                        tit = 'Период закрыт';
                        body = '';
                        panelCls = "block_info-txt block_info-green";
                        buttons = true;
                        if (period != 12 && period != 16)
                            win.down('[name=btnCloseSc]').setDisabled(true);
                        win.fireEvent("showGreenPanel", tit, body, buttons, panelCls);
                        return;
                    }

                    if (greenPanel.haveClosed) {
                        // не требует закрытия
                        tit = 'За этот период уже есть проводки по закрытию';
                        body = '';
                        panelCls = "block_info-txt";
                        buttons = true;
                        win.fireEvent("showGreenPanel", tit, body, buttons, panelCls);
                        return;
                    }

                    if (greenPanel.ost20 != 0 && greenPanel.ost90 == 0 && greenPanel.haveClosed) {
                        // не требует закрытия
                        tit = 'Период закрыт, но появились остатки на счетах в закрытом периоде';
                        body = 'Для закрытия этих счетов необходимо удалить проводки и закново закрыть период';
                        panelCls = "block_info-txt";
                        buttons = true;
                        win.fireEvent("showGreenPanel", tit, body, buttons, panelCls);
                        return;
                    }


                },

                showGreenPanel: function (tit, body, btns, cls) {
                    let win = this,
                        greenPanel = win.down('greenpaneltop');

                    greenPanel.down('[name=title-pad]').update(tit);
                    greenPanel.down('[name=text-pad]').update(body);
                    greenPanel.removeCls('block_info-green');
                    greenPanel.removeCls('block_info-txt');
                    greenPanel.addCls(cls);
                    greenPanel.down('[name=btn-pad]').setVisible(btns);
                    greenPanel.show();


                },

                switchAutoCloseSc: function () {
                    let win = this,
                        t = win.down('[name=autoclose]').getValue(),
                        redPanel = win.down('redpaneltop');
                    if (redPanel.state != 0)
                        win.down('[name=btnCloseSc]').setDisabled(true);
                    else
                        win.down('[name=btnCloseSc]').setDisabled(!t);
                },

                checkTreeSelection: function () {
                    let win = this,
                        s20 = win.down('tree20').getSelectionModel().selected,
                        s90 = win.down('tree90').getSelectionModel().selected,
                        redPanel = win.down('redpaneltop');
                    if ((s20.length + s90.length) == 0)
                        win.down('[name=btnCloseSc]').setDisabled(true);
                    else if (redPanel.state == 0)
                        win.down('[name=btnCloseSc]').setDisabled(false);

                },


                jumpToJournal: function () {
                    let win = this,
                        rec = win.down('[name=periods]').findRecordByValue(win.down('[name=periods]').getValue());
                    //dat_end_period
                    buhManager.boolOpenSource = true;
                    buhManager.d1 = rec.data.dat_end_period;
                    buhManager.d2 = rec.data.dat_end_period;
                    buhManager.typ_op = -1;
                    buhManager.id_doc = win.down('[name=periods]').getValue();
                    document.getElementById("mn1-1-09").click();
                    Ext.getCmp('joMainSceern').refreshGrid();
                    win.close();
                },


            }
        );

    }

});

