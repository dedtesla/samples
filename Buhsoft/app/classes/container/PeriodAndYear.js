Ext.define('Buh.classes.container.PeriodAndYear',
    {
        constructor: function () {
            let args = arguments[0];
            this.callParent(arguments);
        },
        extend: 'Ext.container.Container',
        xtype: 'periodandyear',
        alias: 'widget.periodandyear',
        cls: 'container-align',
        periodUnit: '',
        yearsArray: [],
        layout: {
            'type': 'hbox',
            'align': 'stretch'
        },
        items: [
            {
                name: 'at_period_unit',
                editable: false,
                xtype: 'gbs_combo',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                value: null,
                store: null,
                width: 140,
                listeners: {
                    select: function () {
                        let me = this;
                        if (me.up('container').down('[name=at_year]').hidden == true) {
                            me.up('container').down('[name=at_year]').show();
                        }
                    }
                }
            },
            {
                name: 'at_year',
                editable: false,
                xtype: 'gbs_combo',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'id',
                value: currYear,
                store: null,
                width: 70
            }
        ],
        listeners: {
            afterrender: function () {
                let me = this, comboYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year').getValue();

                me.down('[name=at_year]').bindStore(me.getYears());
                me.down('[name=at_year]').store.load();
                me.down('[name=at_year]').setValue(comboYear);

                if (me.periodUnit == 'month') {
                    me.down('[name=at_period_unit]').bindStore(me.getMonthPeriodUnit());
                    me.down('[name=at_period_unit]').store.load();
                } else if (me.periodUnit == 'quarter') {
                    me.down('[name=at_period_unit]').bindStore(me.getQuarterPeriodUnit());
                    me.down('[name=at_period_unit]').store.load();
                }
            }
        },
        getYears : function () {
            let me = this, comboYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year').getValue();

            for (let i = 0; i < 6; i++) {
                me.yearsArray.push({id: comboYear, name: comboYear});
                comboYear--;
            }

            return Ext.create('Ext.data.Store', {
                fields: [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                ],
                data: me.yearsArray
            });
        },
        getMonthPeriodUnit: function () {
            return Ext.create('Ext.data.Store', {
                fields: [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                ],
                data: [
                    {id: '1', name: 'Январь'},
                    {id: '2', name: 'Февраль'},
                    {id: '3', name: 'Март'},
                    {id: '4', name: 'Апрель'},
                    {id: '5', name: 'Май'},
                    {id: '6', name: 'Июнь'},
                    {id: '7', name: 'Июль'},
                    {id: '8', name: 'Август'},
                    {id: '9', name: 'Сентябрь'},
                    {id: '10', name: 'Октябрь'},
                    {id: '11', name: 'Ноябрь'},
                    {id: '12', name: 'Декабрь'},
                ]
            });
        },
        getQuarterPeriodUnit: function () {
            return Ext.create('Ext.data.Store', {
                fields: [
                    {type: 'string', name: 'id'},
                    {type: 'string', name: 'name'},
                ],
                data: [
                    {id: '01', name: 'I квартал'},
                    {id: '02', name: 'II квартал'},
                    {id: '03', name: 'III квартал'},
                    {id: '04', name: 'IV квартал'}
                ]
            });
        }
    }
);