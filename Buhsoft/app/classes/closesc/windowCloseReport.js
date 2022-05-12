Ext.define('Buh.classes.closesc.windowCloseReport', {
    extend: 'Gbs.window',
    owner: null,
    cls: 'style2018 init_window',
    header: false,
    width: 500,
    items: {
        xtype: 'gbs_panel',
        title: "123",
        items: [
            {
                xtype: 'box',
                name: 'row1',
                cls: 'info-green_ok',
                html: 'первая строка'
            }, {
                xtype: 'box',
                name: 'row2',
                cls: 'info-green_ok',
                html: 'вторая строка'
            }, {
                xtype: 'button',
                name: 'openJo',
                cls: "btn-sel-blue",
                text: 'Посмотреть проводки в журнале операций'
            }]

    },
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'bottom',
        ui: 'footer',
        items: [{
            text: 'Хорошо',
            'xtype': 'greenbuttonsimple',
            handler: function () {
                this.up('window').close();
            }
        }]
    }],

    showWin: function (_args) {
        let i = 0,
            s = '',
            a = [],
            title = '',
            recCombo = _args[1];



        //dat_end_period: "2020-02-29"
        let fnFilterJo = function(){
            buhManager.boolOpenSource = true;
            buhManager.d1 = recCombo.data.dat_end_period;
            buhManager.d2 = recCombo.data.dat_end_period;
            buhManager.typ_op = -1;
            buhManager.id_doc = recCombo.data.id;
            document.getElementById("mn1-1-09").click();
            Ext.getCmp('joMainSceern').refreshGrid();
        }

        fnFilterJo();

        this.down('[name=openJo]').handler = function () {

            fnFilterJo();
            this.up('window').owner.close();
            this.up('window').close();
        }

        if (_args[2] != undefined) {
            a = _args[2];
            for (i = 0; i < a.length; i++) {
                s += a[i];
                if (i < (a.length - 2))
                    s += ', ';
                else if (i < (a.length - 1))
                    s += ' и ';
            }
            if (s != '') {
                s = "Списаны расходы с " + s + " счета";
                this.down('[name=row1]').update(s);
            }
            else
                this.down('[name=row1]').hide();
        }
        if (_args[3] != undefined) {
            s = "";
            a = _args[3];
            for (i = 0; i < a.length; i++) {
                s += a[i];
                if (i < (a.length - 2))
                    s += ', ';
                else if (i < (a.length - 1))
                    s += ' и ';
            }
            if (s != '') {
                s = "Сформирован финансовый результат по счету " + s;
                this.down('[name=row2]').update(s);
            }
            else
                this.down('[name=row2]').hide();
        }

        this.down('gbs_panel').setTitle(_args[0]);
        this.show();
    },


    listenersOn: function () {
        /*
                let window = this;
                window.on({
                        "save": function (arg) {
                            let win = this,
                                form = win.down('gbs_panel'),
                                vals = form.getValues();
                            _ajax(dir_start_buh_ + 'closeaccounts/savesetting/',
                                {
                                    'yearDatabase': currYear,
                                    'period': vals.period
                                },
                                function () {
                                    if (win.callback != undefined)
                                        win.callback(vals.period);
                                }
                            );

                            this.close();
                        },
                    });
                                */


    }

});

