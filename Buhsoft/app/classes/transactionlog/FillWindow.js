Ext.define('Buh.classes.transactionlog.FillWindow', {

    constructor: function (cfg) {
        this.initConfig(cfg);
        this.callParent(arguments);
        var me = this;
        var config = this.config;

        this.on({
            'beforeclose': function () {
                this.task.stop();
                this.callback();
            },
            'beforeshow': function () {
                let win = this,
                    runner = new Ext.util.TaskRunner();

                _ajax(
                    dir_start_buh_ + "transactionlog/checkForCalc/",
                    {
                        yearDatabase: currYear
                    },
                    function (_ret) {
                        let ans = Ext.decode(_ret);
                        if (ans.calctime > 10 || ans.broken) {
                            win.down('[name=info]').show();
                            win.down('#msg').update(
                                'Необходим перерасчет операций с ' + Date.monthNamesRP[ans.month] +
                                '. Это займет длительное время (до ' +
                                Math.ceil(ans.calctime / 60) +
                                ' минут), во время которого вы не сможете продолжать работу'
                            );
                        } else {
                            win.down('[name=info]').hide();
                        }

                        win.down('[name=d1]').setValue(ans.d);
                        let d1 = ans.d,
                            d2 = ans.d2;
                        let dFinish = d1 > d2 ? d1 : d2;
                        win.down('[name=d2]').setValue(dFinish);
                        win.down('[name=d2]').setMinValue(dFinish);
                    }
                );

                let task = runner.newTask({
                    run: function () {
                        let task = this,
                            win = task.win,
                            periodToRun = null,
                            periods = this.periods,
                            firstRun = this.firstRun,
                            lastRun = false,
                            toRun = -1;
                        this.firstRun = false;
                        if (this.periodsRunning > -1) {
                            console.log('task work');
                            return;
                        }
                        Ext.Array.each(periods, function (val, index) {
                            if (val.start == 0) {
                                toRun = index;
                                periodToRun = val;
                                if (index == (periods.length - 1))
                                {
                                    lastRun = true;
                                }
                                return false;
                            }

                        });

                        if (toRun > -1) {
                            this.periodsRunning = toRun;
                            periods[toRun].start = 1;
                            win.down('#msg1').update('Выполняется перерасчет за ' +
                                Date.monthNames[periodToRun.month - 1].toLowerCase() + ' ' + periodToRun.year + ' года');

                            _ajax(dir_start_buh_ + "transactionlog/fillAll/",
                                {
                                    yearDatabase: currYear,
                                    static: 1,
                                    firstRun: firstRun ? 1 : 0,
                                    lastRun: lastRun ? 1 : 0,
                                    d_beg: periodToRun.d1,
                                    d_end: periodToRun.d2
                                },
                                function (_ans) {
                                    let ans = Ext.JSON.decode(_ans);
                                    periods[task.periodsRunning].finish = 1;
                                    task.periodsRunning = -1;

                                }
                            );


                            return;
                        }
                        win.close();
                        let winInfo = Ext.create('Buh.classes.window.Green', {
                            //aCls : color == 'red' ? 'there_error' : null,
                            id: 'winJoFillFinish',
                            setText: 'Заполнение журнала завершено',
                            itemId: 'edoInfoWindow'
                        });
                        winInfo.show();
                    },
                    interval: 1000
                });
                win.task = task;


            }
        });
    },

    cls: 'style2018 sprav_window pad-small',
    extend: 'winEditDoc',
    layout: 'fit',
    customclosable: false,
    modal: true,
    customclosable: false,
    width: 650,
    task: null,
    items: {
        xtype: 'panel',
        title: 'Перерасчет журнала операций',
        items: [{
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'gbs_date_simple',
                    fieldLabel: 'С',
                    labelWidth : 20,
                    labelSeparator : '',
                    labelStyle : 'line-height: 32px;',
                    name: 'd1',
                    itemId: 'datBegin',
                    format: 'd.m.Y',
                }, {
                    xtype: 'gbs_date_simple',
                    fieldLabel: 'по',
                    labelWidth : 20,
                    labelStyle : 'line-height: 32px;',
                    labelSeparator : '',
                    name: 'd2',
                    itemId: 'datEnd',
                    format: 'd.m.Y',
                },
            ]
        }, {
            xtype: 'container',
            cls: 'block_info-txt_close',
            name: 'info',
            hidden: true,
            layout: 'hbox',
            items: [{
                xtype: 'box',
                width: 600,
                itemId: 'msg',
                height: 45,
                html: 'Необходим перерасчет операций с января. Это займет длительное время (до 10 минут), во время которого вы не сможете продолжать работу'
            }]
        }, {
            xtype: 'container',
            name: 'mesProceed',
            hidden: true,
            layout: 'vbox',
            items: [{
                xtype: 'box',
                width: 600,
                html: 'Ожидайте окончания и не закрывайте это окно'
            }, {
                xtype: 'box',
                width: 600,
                cls: 'txt-gray',
                itemId: 'msg1',
                html: ''
            }]
        },
        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [
                {
                    text: 'Применить',
                    'xtype': 'greenbuttonsimple',
                    itemId: 'btnStart',
                    handler: function () {
                        this.up('toolbar').hide();
                        this.up('window').dontClose = true;
                        this.up('window').makeTask();
                    }
                }, {
                    text: 'Отмена',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
        }],
    },


    makeTask: function () {

        let win = this,
            datFinishFill = Ext.Date.format(win.down('#datEnd').getValue(), 'Y-m-d'),
            datField = win.down('#datBegin'),
            btnStart = win.down('#btnStart'),
            d = datField.getValue(),
            d1 = null,
            d2 = null,
            _d2 = null,
            m = '',
            arr = [],
            m_ = 0,
            day = Ext.Date.format(d, 'd'),
            month = Ext.Date.format(d, 'm'),
            fillBreak = false;
        year = Ext.Date.format(d, 'Y');
        win.down('[name=mesProceed]').show();
        win.down('[name=info]').hide();

        datField.disable();
        btnStart.disable();
        for (let y = year; y <= currYearMax; y++) {
            for (m = (y == year ? month : 1); m <= 12; m++) {
                let dStart = 1;
                m_ = (m < 10) ? "0" + m : m;
                if (arr.length == 0) {
                    d1 = Ext.Date.format(d, 'Y-m-d');
                    dStart = day;
                } else {
                    d1 = y + '-' + m_ + '-01';
                }
                if (dStart > 20) {
                    d2 = Ext.Date.getLastDateOfMonth(new Date(y + '-' + m + '-10'));
                    d2 = Ext.Date.format(d2, 'Y-m-d')
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                } else if (dStart > 10) {
                    d2 = Ext.Date.format(new Date(y + '-' + m + '-20'), 'Y-m-d');
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                    d1 = Ext.Date.format(new Date(y + '-' + m + '-21'), 'Y-m-d');
                    d2 = Ext.Date.getLastDateOfMonth(new Date(y + '-' + m + '-10'));
                    d2 = Ext.Date.format(d2, 'Y-m-d')
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                } else {
                    d2 = Ext.Date.format(new Date(y + '-' + m + '-10'), 'Y-m-d');
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                    d1 = Ext.Date.format(new Date(y + '-' + m + '-11'), 'Y-m-d');
                    d2 = Ext.Date.format(new Date(y + '-' + m + '-20'), 'Y-m-d');
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                    d1 = Ext.Date.format(new Date(y + '-' + m + '-21'), 'Y-m-d');
                    d2 = Ext.Date.getLastDateOfMonth(new Date(y + '-' + m + '-10'));
                    d2 = Ext.Date.format(d2, 'Y-m-d')
                    Ext.Array.include(arr, {'d1': d1, 'd2': d2, 'start': 0, 'finish': 0, 'month': m, 'year': y});
                }
                if (datFinishFill < d2) {
                    fillBreak = true;
                    break;
                }
            }
            if (fillBreak) {
                break;
            }
        }
        cons('jo fill');
        cons(arr);
        win.task.periods = arr;
        win.task.firstRun = true;
        win.task.lastRun = false;
        win.task.periodsToRun = -1;
        win.task.periodsRunning = -1;
        win.task.win = win;
        win.task.start();

    }


});
