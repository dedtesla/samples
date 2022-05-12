Ext.define('Buh.classes.container.Period',
    {

        constructor: function () {
            var args = arguments[0];

            this.callParent(arguments);
            if (args.nm1 != undefined) {
                Ext.apply(this.down('#dat1_ap'), {name: args.nm1});
            }
            if (args.nm2 != undefined) {
                Ext.apply(this.down('#dat2_ap'), {name: args.nm2});
            }
        },

        extend: 'Ext.container.Container',
        xtype: 'c_period',

        cls: 'cnt-period',

        'layout': {
            'type': 'hbox',
            'align': 'stretch'
        },
        'defaults': {
            labelAlign: 'right',
            labelWidth: 50,
            style: 'margin : 0px'
        },


        items: [
            {
                xtype: 'button',
                icon: '/img/cal-icon.svg',
                text: '2022',
                name: 'btnYear',
                arrowAlign: 'right',
                scope: this,
                menu: [
                    {
                        text: '2022',
                        handler: function () {
                            let fire = this.up('c_period').setYear(2022);
                            if (fire) {
                                this.up('c_period').down('#dat2_ap').fireEvent('select');
                            }
                        }
                    },
                    {
                        text: '2021',
                        handler: function () {
                            let fire = this.up('c_period').setYear(2021);
                            if (fire) {
                                this.up('c_period').down('#dat2_ap').fireEvent('select');
                            }
                        }
                    },
                ],
            },
            {
                'xtype': 'gbs_date_simple',
                'submitFormat': 'Y-m-d',
                'name': 'dat_doc1',
                'itemId': 'dat1_ap',
                'width': 90,
                'value': oDefaults.d1,
                'listeners': {
                    'select': function (t, nv, ov, e) {
                        var _dt2 = this.up('c_period').down('#dat2_ap');
                        if (_dt2.getValue() < this.getValue()) _dt2.setValue(this.getValue());
                        oDefaults.date = this.getValue();
                        this.up('c_period').fireEvent('select');
                    }
                }

            },
            {
                'xtype': 'gbs_date_simple',
                'width': 90,
                'name': 'dat_doc2',
                'submitFormat': 'Y-m-d',
                'itemId': 'dat2_ap',
                'value': oDefaults.d2,
                'listeners': {
                    'select': function (t, nv, ov, e) {
                        var _dt1 = this.up('c_period').down('#dat1_ap');
                        if (_dt1.getValue() > this.getValue()) this.setValue(_dt1.getValue());
                        this.up('c_period').fireEvent('select');
                    }
                }
            },
            {
                'xtype': 'button',
                'name': 'btn_menu',
                'cls': 'btn-set-period',
                'text': '',
                menu: mkMenu([
                    {
                        text: `\u0412 2022 \u0433\u043e\u0434\u0443`,
                        itemId: 'menuTitle',
                        disabled: true
                    },
                    {
                        text: '\u0441\u0435\u0433\u043e\u0434\u043d\u044f',
                        handler: function () {
                            var dt = new Date();
                            this.up('c_period').down('#dat1_ap').setValue(dt);
                            this.up('c_period').down('#dat2_ap').setValue(dt);
                            this.up('c_period').fireEvent('select');
                        }
                    },
                    {
                        text: '\u043c\u0435\u0441\u044f\u0446',
                        menu: mkMenu([
                            {
                                text: '\u044f\u043d\u0432\u0430\u0440\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(0);
                                }
                            },
                            {
                                text: '\u0444\u0435\u0432\u0440\u0430\u043b\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(1);
                                }
                            },
                            {
                                text: '\u043c\u0430\u0440\u0442',
                                handler: function () {
                                    this.up('c_period').setRepMonth(2);
                                }
                            },
                            {
                                text: '\u0430\u043f\u0440\u0435\u043b\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(3);
                                }
                            },
                            {
                                text: '\u043c\u0430\u0439',
                                handler: function () {
                                    this.up('c_period').setRepMonth(4);
                                }
                            },
                            {
                                text: '\u0438\u044e\u043d\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(5);
                                }
                            },
                            {
                                text: '\u0438\u044e\u043b\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(6);
                                }
                            },
                            {
                                text: '\u0430\u0432\u0433\u0443\u0441\u0442',
                                handler: function () {
                                    this.up('c_period').setRepMonth(7);
                                }
                            },
                            {
                                text: '\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(8);
                                }
                            },
                            {
                                text: '\u043e\u043a\u0442\u044f\u0431\u0440\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(9);
                                }
                            },
                            {
                                text: '\u043d\u043e\u044f\u0431\u0440\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(10);
                                }
                            },
                            {
                                text: '\u0434\u0435\u043a\u0430\u0431\u0440\u044c',
                                handler: function () {
                                    this.up('c_period').setRepMonth(11);
                                }
                            }])
                    },
                    {
                        text: '\u043a\u0432\u0430\u0440\u0442\u0430\u043b',
                        menu: mkMenu([
                            {
                                text: '1 \u043a\u0432\u0430\u0440\u0442\u0430\u043b',
                                handler: function () {
                                    var dt = this.up('c_period').down('#dat1_ap').getValue();
                                    var yr = dt.getFullYear();
                                    var dt1 = new Date(yr, 0, 1);
                                    var dt2 = new Date(yr, 2, 31);
                                    this.up('c_period').down('#dat1_ap').setValue(dt1);
                                    this.up('c_period').down('#dat2_ap').setValue(dt2);
                                    this.up('c_period').fireEvent('select');
                                }
                            },
                            {
                                text: '2 \u043a\u0432\u0430\u0440\u0442\u0430\u043b',
                                handler: function () {
                                    var dt = this.up('c_period').down('#dat1_ap').getValue();
                                    var yr = dt.getFullYear();
                                    var dt1 = new Date(yr, 3, 1);
                                    var dt2 = new Date(yr, 5, 30);
                                    this.up('c_period').down('#dat1_ap').setValue(dt1);
                                    this.up('c_period').down('#dat2_ap').setValue(dt2);
                                    this.up('c_period').fireEvent('select');
                                }
                            },
                            {
                                text: '3 \u043a\u0432\u0430\u0440\u0442\u0430\u043b',
                                handler: function () {
                                    var dt = this.up('c_period').down('#dat1_ap').getValue();
                                    var yr = dt.getFullYear();
                                    var dt1 = new Date(yr, 6, 1);
                                    var dt2 = new Date(yr, 8, 30);
                                    this.up('c_period').down('#dat1_ap').setValue(dt1);
                                    this.up('c_period').down('#dat2_ap').setValue(dt2);
                                    this.up('c_period').fireEvent('select');
                                }
                            },
                            {
                                text: '4 \u043a\u0432\u0430\u0440\u0442\u0430\u043b',
                                handler: function () {
                                    var dt = this.up('c_period').down('#dat1_ap').getValue();
                                    var yr = dt.getFullYear();
                                    var dt1 = new Date(yr, 9, 1);
                                    var dt2 = new Date(yr, 11, 31);
                                    this.up('c_period').down('#dat1_ap').setValue(dt1);
                                    this.up('c_period').down('#dat2_ap').setValue(dt2);
                                    this.up('c_period').fireEvent('select');
                                }
                            }
                        ])
                    },
                    {
                        text: '\u0433\u043e\u0434',
                        handler: function () {
                            var dt = this.up('c_period').down('#dat1_ap').getValue();
                            var yr = dt.getFullYear();
                            var dt1 = new Date(yr, 0, 1);
                            var dt2 = new Date(yr, 11, 31);
                            this.up('c_period').down('#dat1_ap').setValue(dt1);
                            this.up('c_period').down('#dat2_ap').setValue(dt2);
                            this.up('c_period').fireEvent('select');
                        }
                    }
                ])
            }


        ],
        setRepMonth: function (mn) {
            var dt = this.down('#dat1_ap').getValue();
            var yr = dt.getFullYear();

            if (mn == 0 | mn == 2 | mn == 4 | mn == 6 | mn == 7 | mn == 9 | mn == 11) {
                var dt1 = new Date(yr, mn, 1);
                var dt2 = new Date(yr, mn, 31);
            }
            if (mn == 3 | mn == 5 | mn == 8 | mn == 10) {
                var dt1 = new Date(yr, mn, 1);
                var dt2 = new Date(yr, mn, 30);
            }
            if (mn == 1) {
                var dt1 = new Date(yr, 1, 1);
                if (yr == 2008 | yr == 2012 | yr == 2016 | yr == 2020 | yr == 2024)
                    var dt2 = new Date(yr, 1, 29);
                else
                    var dt2 = new Date(yr, 1, 28);
            }
            this.down('#dat1_ap').setValue(dt1);
            this.down('#dat2_ap').setValue(dt2);
            this.fireEvent('select');
        },

        getDat1: function () {
            return this.down('#dat1_ap').getValue();

        },

        getDat2: function () {
            return this.down('#dat2_ap').getValue();

        },

        setValues: function (d1, d2) {
            this.down('#dat1_ap').setValue(d1);
            this.down('#dat2_ap').setValue(d2);

        },

        setYear: function (_year) {

            let year = _year,
                fireSelect = false,
                d1 = this.down('#dat1_ap'),
                d2 = this.down('#dat2_ap');
            this.down('button[name=btnYear]').setText(year);
            d1.setMinValue(new Date(year, 0, 1));
            d1.setMaxValue(new Date(year, 11, 31));
            d2.setMinValue(new Date(year, 0, 1));
            d2.setMaxValue(new Date(year, 11, 31));
            this.down('#menuTitle').setText(`\u0412 ${year} \u0433\u043e\u0434\u0443`);
            if (d1.getValue().getFullYear() > year) {
                d1.setValue(new Date(year, 11, 1));
                d2.setValue(new Date(year, 11, 31));
                fireSelect = true;
            }
            if (d1.getValue().getFullYear() < year) {
                d1.setValue(new Date(year, 0, 1));
                d2.setValue(new Date(year, 0, 31));
                fireSelect = true;
            }

            return fireSelect;
        },


    });
