Ext.define('Buh.classes.container.DateInterval',
    {
        extend: 'Ext.container.Container',
        xtype: 'contdateinterval',
        alias: 'widget.dateinterval',
        cls: 'cnt-period',
        id: '',
        name: 'cntPeriod',
        format: 'd.m.Y',
        callback: null,
        layout: {
            'type': 'hbox',
            'align': 'stretch'
        },
        defaults: {
            labelAlign: 'right',
            labelWidth: 50,
            style: 'margin : 0px'
        },
        items: [
            {
                xtype: 'button',
                icon: '/img/cal-icon.svg'
            },
            {
                xtype: 'gbs_date_simple',
                name: 'kf_date_beg',
                itemId: 'kf_date_beg',
                width: 90,
                value: '',
                listeners: {
                    select: function (t, nv, ov, e) {
                        _dt2 = this.up().down('datefield[name=kf_date_end]');
                        if (_dt2.getValue() < this.getValue()) _dt2.setValue(this.getValue());
                        oDefaults.date = this.getValue();
                    }
                }
            },
            {
                xtype: 'gbs_date_simple',
                width: 90,
                name: 'kf_date_end',
                itemId: 'kf_date_end',
                value: '',
                listeners: {
                    select: function (t, nv, ov, e) {
                        _dt1 = this.up().down('datefield[name=kf_date_beg]');
                        if (_dt1.getValue() > this.getValue()) this.setValue(_dt1.getValue());
                    }
                }
            },

            {
                xtype: 'button',
                name: 'btn_menu',
                cls: 'btn-set-period',
                text: '',
                menu: mkMenu([
                    {
                        text: 'сегодня',
                        handler: function () {
                            let me = this, _owner = me.up('contdateinterval'), dt = new Date();
                            _owner.down('#kf_date_beg').setValue(dt);
                            _owner.down('#kf_date_end').setValue(dt);
                        }
                    },
                    {
                        text: 'месяц',
                        menu: mkMenu([
                            {
                                text: 'январь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 0);
                                }
                            },
                            {
                                text: 'февраль',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 1);
                                }
                            },
                            {
                                text: 'март',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 2);
                                }
                            },
                            {
                                text: 'апрель',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 3);
                                }
                            },
                            {
                                text: 'май',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 4);
                                }
                            },
                            {
                                text: 'июнь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 5);
                                }
                            },
                            {
                                text: 'июль',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 6);
                                }
                            },
                            {
                                text: 'август',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 7);
                                }
                            },
                            {
                                text: 'сентябрь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 8);
                                }
                            },
                            {
                                text: 'октябрь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 9);
                                }
                            },
                            {
                                text: 'ноябрь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 10);
                                }
                            },
                            {
                                text: 'декабрь',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval');
                                    _owner.setRepMonth(me, 11);
                                }
                            }])
                    },
                    {
                        text: 'квартал',
                        menu: mkMenu([
                            {
                                text: '1 квартал',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval'),
                                        dt1 = new Date(yr, 0, 1), dt2 = new Date(yr, 2, 31);
                                    _owner.down('#kf_date_beg').setValue(dt1);
                                    _owner.down('#kf_date_end').setValue(dt2);
                                }
                            },
                            {
                                text: '2 квартал',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval'),
                                        dt1 = new Date(yr, 3, 1), dt2 = new Date(yr, 5, 30);
                                    _owner.down('#kf_date_beg').setValue(dt1);
                                    _owner.down('#kf_date_end').setValue(dt2);
                                }
                            },
                            {
                                text: '3 квартал',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval'),
                                        dt1 = new Date(yr, 6, 1), dt2 = new Date(yr, 8, 30);
                                    _owner.down('#kf_date_beg').setValue(dt1);
                                    _owner.down('#kf_date_end').setValue(dt2);
                                }
                            },
                            {
                                text: '4 квартал',
                                handler: function () {
                                    let me = this, _owner = me.up('contdateinterval'),
                                        dt1 = new Date(yr, 9, 1), dt2 = new Date(yr, 11, 31);
                                    _owner.down('#kf_date_beg').setValue(dt1);
                                    _owner.down('#kf_date_end').setValue(dt2);
                                }
                            }
                        ])
                    },
                    {
                        text: 'год',
                        handler: function () {
                            let me = this, _owner = me.up('contdateinterval'),
                                dt = this.up('contdateinterval').down('#kf_date_beg').getValue(),
                                yr = dt.getFullYear(),
                                dt1 = new Date(yr, 0, 1),
                                dt2 = new Date(yr, 11, 31);
                            this.up('contdateinterval').down('#kf_date_beg').setValue(dt1);
                            this.up('contdateinterval').down('#kf_date_end').setValue(dt2);
                        }
                    }
                ])
            }


        ],
        setRepMonth: function (obj, mn) {
            let dt = obj.up('contdateinterval').down('#kf_date_beg').getValue(),
                yr = dt.getFullYear(), dt1, dt2;

            if (mn == 0 | mn == 2 | mn == 4 | mn == 6 | mn == 7 | mn == 9 | mn == 11) {
                dt1 = new Date(yr, mn, 1);
                dt2 = new Date(yr, mn, 31);
            }
            if (mn == 3 | mn == 5 | mn == 8 | mn == 10) {
                dt1 = new Date(yr, mn, 1);
                dt2 = new Date(yr, mn, 30);
            }
            if (mn == 1) {
                dt1 = new Date(yr, 1, 1);
                if (yr == 2008 | yr == 2012 | yr == 2016 | yr == 2020 | yr == 2024)
                    dt2 = new Date(yr, 1, 29);
                else
                    dt2 = new Date(yr, 1, 28);
            }
            obj.up('contdateinterval').down('#kf_date_beg').setValue(dt1);
            obj.up('contdateinterval').down('#kf_date_end').setValue(dt2);
        }
    });