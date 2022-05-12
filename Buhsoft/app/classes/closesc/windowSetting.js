Ext.define('Buh.classes.closesc.windowSetting', {
    extend: 'Gbs.window',
    cls: 'style2018 window_nopad',
    header: false,
    resizable: false,
    width: 400,
    items: {
        xtype: 'gbs_panel',
        items: [
            {
                xtype: 'radiogroup',
                vertical: true,
                columns: 1,
                items: [
                    {boxLabel: 'Ежемесячное закрытие', name: 'period', inputValue: '0', checked: true},
                    {boxLabel: 'Ежеквартальное закрытие', name: 'period', inputValue: '1'}
                ],
            }],

        dockedItems: [{
            xtype: 'toolbar',
            cls: 'no_line',
            dock: 'bottom',
            ui: 'footer',
            items: [{
                text: 'Сохранить',
                'xtype': 'greenbuttonsimple',
                handler: function () {
                    this.up('window').fireEvent('save');
                }
            }, {
                text: 'Отмена',
                handler: function () {
                    this.up('window').close();
                }
            }]
        }],
    },

    showWin: function (_args) {
        this.btn = _args;
        this.listenersOn();
        if (_args != undefined) {
            this.callback = _args.callback;
            this.showBy(_args.button, 'br-tr?'/*, [0, 7]*/);
        }
        else
            this.show();


    },


    listenersOn: function () {
        let window = this,
            year = window.year;
        window.on({
                "save": function (arg) {
                    let win = this,
                        form = win.down('gbs_panel'),
                        vals = form.getValues();
                    _ajax(dir_start_buh_ + 'closeaccounts/savesetting/',
                        {
                            'yearDatabase': currYear,
                            'year': year,
                            'period': vals.period
                        },
                        function () {
                            if (win.callback != undefined)
                                win.callback(vals.period);
                        }
                    );

                    this.close();
                },
                "beforeshow": function () {
                    let form = this.down('gbs_panel');
                    _ajax(dir_start_buh_ + 'closeaccounts/readsetting/',
                        {
                            'yearDatabase': currYear,
                            'year': year
                        },
                        function (_inp) {
                            let val = Ext.decode(_inp, false);
                            form.down('[name=period]').setValue(val.period);
                        }
                    );
                }
            }
        );


    }

});


