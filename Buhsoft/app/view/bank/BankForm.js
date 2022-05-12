Ext.define('Buh.view.bank.BankForm', {
    requires: ['Buh.classes.container.ThreeSelect', 'Buh.classes.container.Vertical', 'Buh.classes.sprav.Tool', 'Buh.view.bank.TBar',
               'Buh.view.bank.BlueForm', 'Buh.view.bank.TaxPeriod', 'Buh.classes.help.ButtonAsk', 'Buh.classes.common.DocFieldNumber','Buh.view.bank.FormRequsites'],
    extend: 'Ext.form.FormPanel',
    xtype: 'bankform',
    name: 'main_panel',
    bodyCls: 'panel-pad',
    layout: 'form',
    items: [
        {
            xtype: 'hidden',
            name: 'id',
            value: 0
        },

        {
            'xtype': 'textfield',
            'name': 'copy_id',
            'value': 0,
            'hidden': true
        }, {
            'xtype': 'textfield',
            'name': 'id_sp_analit',
            'value': 0,
            'hidden': true
        }, {
            'xtype': 'textfield',
            'name': 'id_sp_analit2',
            'value': 0,
            'hidden': true
        }, {
            'xtype': 'textfield',
            'name': 'id_sp_analit3',
            'value': 0,
            'hidden': true
        },


        {
            xtype: 'three_select',
            cls: 'block-btn-unite container-align',
            nm: 'id_oper_',
            b1: 'Приход',
            b2: 'Расход',
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-regplt',
            itm: {
                xtype: 'gbs_combo',
                editable: false,
                store: [['0', '']],
                valueField: 'id',
                tpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                    '<div class="x-boundlist-item">{field2}</div><tpl if = "xindex == 3"><hr /></tpl>',
                    '</tpl>'
                ),
                name: 'reg_plt',
                width: 520,
                forceSelection: true,
            },
        },

        {
            xtype: 'container',
            cls: 'container-align block_info-txt_close',
            hidden: true,
            name: 'cnt-go-zp',
//            layout: 'hbox',
            items: [{
                xtype: 'box',
                width: 500,
                html: 'Оформляйте выплату в модуле зарплаты на форме &nbsp;&nbsp;&nbsp;&nbsp;'
            }, {
                xtype: 'button',
                action: 'move_to_zarpl',
                cls: 'btn-sel-blue',
                textAlign: 'left',
                text: 'выплата заработной платы сотруднику',
            }]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align-middle',
            name: 'cnt-n-doc',
            title: 'Платежный документ',
            itm: {
                'xtype': 'gbs_combo',
                'name': 'jdoc',
                'displayField': 'name',
                'valueField': 'id',
                'editable': false,
                width: 520,
                'store': null,
                'queryMode': 'local',
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-n-doc',
//        title: 'Номер и дата документа',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        cls: 'input-number',
                        name: 'n_doc',
                        width: 140
                    },
                    {
                        xtype: 'gbs_date',
                        name: 'df',
                        width: 140
                    }],
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog',
            title: 'Вид налога или взноса',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'gbs_combo',
                        name: 'nalog_vid',
                        editable: false,
                        displayField: 'name',
                        valueField: 'id',
                        store: [['1', 'Налог'], ['2', 'Взнос']],
                        value: '1',
                        width: 140,
                    }, {
                        xtype: 'gbs_combo',
                        name: 'nalog_id',
                        editable: false,
                        displayField: 'name',
                        valueField: 'id',
                        listConfig: {minWidth: 400},
                        queryMode: 'local',
                        lastQuery: '',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name', 'namer', 'named', 'sc', 'n_vz', {
                                name: 'fromYear',
                                defaultValue: currYear
                            }, {
                                name: 'untilYear',
                                defaultValue: null
                            }],
                            data: [{
                                'id': '1',
                                'name': 'Налог по УСН',
                                'namer': 'налога по УСН',
                                'named': 'Налогу по УСН',
                                'sc': '68.1',
                                'n_vz': '1'
                            },
                                {
                                    'id': '2',
                                    'name': 'Налог на прибыль (ФБ)',
                                    'namer': 'налога на прибыль (ФБ)',
                                    'named': 'Налогу на прибыль (ФБ)',
                                    'sc': '68.1',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '3',
                                    'name': 'ЕНВД',
                                    'namer': 'ЕНВД',
                                    'named': 'ЕНВД',
                                    'sc': '68.21',
                                    'n_vz': '1'
                                },
                                {'id': '4', 'name': 'НДС', 'namer': 'НДС', 'named': 'НДС', 'sc': '68.2', 'n_vz': '1'},
                                {
                                    'id': '5',
                                    'name': 'Минимальный налог',
                                    'namer': 'нинимального налога',
                                    'named': 'Минимальному налогу',
                                    'sc': '68.25',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '6',
                                    'name': 'НДФЛ',
                                    'sc': '68.4',
                                    'n_vz': '1',
                                    'untilYear': 2020
                                },
                                {
                                    'id': '14',
                                    'name': 'НДФЛ 13% (общая)',
                                    'namer': 'НДФЛ 13% (общая)',
                                    'named': 'НДФЛ 13% (общая)',
                                    'sc': '68.4',
                                    'n_vz': '1',
                                    'fromYear': 2021
                                },
                                {
                                    'id': '15',
                                    'name': 'НДФЛ 15% (прогрессивная)',
                                    'namer': 'НДФЛ 15% (прогрессивная)',
                                    'named': 'НДФЛ 15% (прогрессивная)',
                                    'sc': '68.4',
                                    'n_vz': '1',
                                    'fromYear': 2021
                                },
                                {
                                    'id': '7',
                                    'name': 'Транспортный налог',
                                    'namer': 'транспортного налога',
                                    'named': 'Транспортному налогу',
                                    'sc': '68.10',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '8',
                                    'name': 'На имущество',
                                    'namer': 'налога на имущество',
                                    'named': 'Налогу на имущество',
                                    'sc': '68.8',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '9',
                                    'name': 'Земельный налог',
                                    'namer': 'земельного налога',
                                    'named': 'Земельному налогу',
                                    'sc': '68.5',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '10',
                                    'name': 'Водный налог',
                                    'namer': 'водного налога',
                                    'named': 'Водному налогу',
                                    'sc': '68.12',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '11',
                                    'name': 'Налог на прибыль (РБ)',
                                    'namer': 'налога на прибыль (РБ)',
                                    'named': 'Налогу на прибыль (РБ)',
                                    'sc': '68.1',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '12',
                                    'name': 'ЕСХН',
                                    'namer': 'ЕСХН',
                                    'named': 'ЕСХН',
                                    'sc': '68.1',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '13',
                                    'name': 'Госпошлина',
                                    'namer': 'госпошлины',
                                    'named': 'Госпошлину',
                                    'sc': '68.13',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '21',
                                    'name': buh_status == 1 ? 'Взнос на социальное страхование' : 'Взнос на ОСС за работников',
                                    'namer': buh_status == 1 ? 'взноса на социальное страхование' : 'взноса на ОСС за работников',
                                    'named': buh_status == 1 ? 'Взносу на социальное страхование' : 'Взносу на ОСС за работников',
                                    'sc': '69.1',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '22',
                                    'name': 'Взнос в ФСС на травматизм',
                                    'namer': 'взноса в ФСС на травматизм',
                                    'named': 'Взносу в ФСС на травматизм',
                                    'sc': '69.2',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '23',
                                    'name': buh_status == 1 ? 'Взнос на медицинское страхование' : 'Взнос на ОМС за работников',
                                    'namer': buh_status == 1 ? 'взноса на медицинское страхование' : 'взноса на ОМС за работников',
                                    'named': buh_status == 1 ? 'Взносу на медицинское страхование' : 'Взносу на ОМС за работников',
                                    'sc': '69.6',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '24',
                                    'name': buh_status == 1 ? 'Взнос на пенсионное страхование' : 'Взнос на ОПС за работников',
                                    'namer': buh_status == 1 ? 'взноса на пенсионное страхование' : 'взноса на ОПС за работников',
                                    'named': buh_status == 1 ? 'Взносу на пенсионное страхование' : 'Взносу на ОПС за работников',
                                    'sc': '69.4',
                                    'n_vz': '2'
                                },


                                {
                                    'id': '31',
                                    'name': 'ОПС по доптарифу (без спецоценки, список 2)',
                                    'namer': 'ОПС по доптарифу (без спецоценки, список 2)',
                                    'named': 'ОПС по доптарифу (без спецоценки, список 2)',
                                    'sc': '69.50',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '32',
                                    'name': 'ОПС по доптарифу (без спецоценки, список 1)',
                                    'namer': 'ОПС по доптарифу (без спецоценки, список 1)',
                                    'named': 'ОПС по доптарифу (без спецоценки, список 1)',
                                    'sc': '69.14',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '33',
                                    'name': 'ОПС по доптарифу (спецоценка, список 1)',
                                    'namer': 'ОПС по доптарифу (спецоценка, список 1)',
                                    'named': 'ОПС по доптарифу (спецоценка, список 1)',
                                    'sc': '69.51',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '34',
                                    'name': 'ОПС по доптарифу (спецоценка, список 2)',
                                    'namer': 'ОПС по доптарифу (спецоценка, список 2)',
                                    'named': 'ОПС по доптарифу (спецоценка, список 2)',
                                    'sc': '69.13',
                                    'n_vz': '2'
                                },

                                {
                                    'id': '25',
                                    'name': 'ОПС фикс взнос '+ ip_org_type,
                                    'namer': 'ОПС фикс взнос '+ ip_org_type,
                                    'named': 'ОПС фикс взнос '+ ip_org_type,
                                    'sc': '69.8',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '26',
                                    'name': 'ОМС фикс взнос '+ ip_org_type,
                                    'namer': 'ОМС фикс взнос '+ ip_org_type,
                                    'named': 'ОМС фикс взнос '+ ip_org_type,
                                    'sc': '69.11',
                                    'n_vz': '2'
                                },
                                {
                                    'id': '27',
                                    'name': 'Торговый сбор',
                                    'namer': 'торгового сбора',
                                    'named': 'Торговому сбору',
                                    'sc': '68.98',
                                    'n_vz': '1'
                                },
                                {
                                    'id': '28',
                                    'name': 'ОПС 1% взнос '+ ip_org_type,
                                    'namer': 'ОПС 1% взнос '+ ip_org_type,
                                    'named': 'ОПС 1% взнос '+ ip_org_type,
                                    'sc': '69.12',
                                    'n_vz': '2'
                                },

                                {
                                    'id': '35',
                                    'name': 'ФСС добровольный взнос '+ ip_org_type,
                                    'namer': 'ФСС добровольный взнос '+ ip_org_type,
                                    'named': 'ФСС добровольный взнос '+ ip_org_type,
                                    'sc': '69.10',
                                    'n_vz': '2'
                                }
                            ]
                        }),
                        value: '1',
                        width: 370
                    }]
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit1',
            title: 'Плательщик',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit1',
                // 'cls': 'container-align-middle',
                'emptyText': 'Выберите или добавьте',
                'id_sprav': 6,
                'fid': 'id_analit',
                'fnm': 'analit_nam',
                'width': 520,
                listWidth : 460 ,
                listeners: {
                    change: function (th, nv, ov) {
                        var me = this,
                            win = me.up('window'),
                            oper = win.down('three_select').getValue(),
                            rpl = win.down('[name=reg_plt]').getValue(),
                            not_check = false;
                        if (rpl == 8 || rpl == 7 || rpl == 20 || rpl == 4 || rpl == 20)
                            not_check = true;

                        Ext.Ajax.request({
                            url: dir_start_buh_ + 'contra_action_21.php',
                            params: {'id': nv, 'action': 'getcontra' },
                            success: function (response) {
                                const ret_now = Ext.JSON.decode(response.responseText);
                                ret_now.data = ret_now.cnt;
                                if (ret_now.data.inn && !not_check) {
                                    Ext.Ajax.request({
                                        url: dir_start_buh_ + 'getinn_.php',
                                        params: {'inn': ret_now.data.inn},
                                        success: function (response) {
                                            const ret = Ext.JSON.decode(response.responseText);

                                            if (ret.kol > 0) {
                                                var change_finded = false;

                                                if (ret.data.inn && ret.data.ogrn) {
                                                    if (ret_now.data.ogrn != ret.data.ogrn)
                                                        change_finded = true;
                                                    if (ret_now.data.naim != ret.data.briefname)
                                                        change_finded = true;
                                                    if (ret_now.data.naim_p != ret.data.fullname)
                                                        change_finded = true;
                                                    if (ret_now.data.dir.trim() != ret.data.dirfio.trim())
                                                        change_finded = true;
                                                    if (ret_now.data.dolgn != ret.data.dirdolgn)
                                                        change_finded = true;

                                                    if (ret_now.data.inn.length == 10) {
                                                        if (ret_now.data.kpp != ret.data.kpp)
                                                            change_finded = true;
                                                        if (ret_now.data.addr_y != ret.data.regaddr)
                                                            change_finded = true;
                                                        if (ret_now.data.addr_f != ret.data.factaddr)
                                                            change_finded = true;
                                                        if (ret_now.data.okato != ret.data.okato)
                                                            change_finded = true;
                                                        if (ret_now.data.okpo != ret.data.okpo)
                                                            change_finded = true;
                                                    }
                                                }

                                                if (change_finded) {
                                                    me.up('window').down('[name=cnt-warning]').show();
                                                } else {
                                                    me.up('window').down('[name=cnt-warning]').hide();
                                                }
                                            }
                                        }
                                    });
                                }
                                else {
                                    me.up('window').down('[name=cnt-warning]').hide();
                                }
                            }
                        });
                    }
                }

            }
        },

        {
            xtype: 'container',
            cls: 'container-align block_info-txt_close',
            layout: 'hbox',
            name: 'cnt-warning',
            hidden: true,
            items: [
                {
                    xtype: 'container',
                    html: 'Обнаружены новые реквизиты контрагента',
                },
                {
                    xtype: 'button',
                    name: 'btn_update_contra',
                    cls: 'btn-sel-blue',
                    text: 'Проверить и обновить',
                    style: 'margin-left: 10px;',
                    handler: function () {
                        var me = this,
                            id = me.up('window').down('[name=analit1]').getValue();
                        Ext.getCmp('spravContra6').openEditOuter({
                            id: id, 'grp': 0, 'sprav': 6, 'caller': 'check',
                            callback: function (_inp) {
                                if (_inp) {
                                    me.up('window').down('[name=cnt-warning]').hide();
                                    Ext.Ajax.request({
                                        url: dir_start_buh_ + 'contra_action_21.php',
                                        params: {'id': id, 'action': 'getcontra'},
                                        success: function (response) {
                                            const ret_now = Ext.JSON.decode(response.responseText);
                                            if (ret_now.cnt) {
                                                me.up('window').down('[name=analit1]').setValue(ret_now.cnt.id, ret_now.cnt.naim);
                                                var _frm = Ext.getCmp('bankMainSceern');
                                                _frm.down('grid').store.load();
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                },
            ]
        },

        {
            xtype: 'container',
            cls: 'container-align block_info-txt_close',
            hidden: true,
            name: 'cnt-check',
            layout: 'hbox',
            items: [{
                xtype: 'box',
                width: 250,
                html: 'Налоговая изменила реквизиты.&nbsp;&nbsp;&nbsp;&nbsp;'
            }, {
                xtype: 'button',
                action: 'compare',
                cls: 'btn-sel-blue',
                textAlign: 'left',
                text: 'Проверить и обновить',
            }]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit2',
            title: 'Договор',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit2',
                // 'cls': 'container-align-middle',
                'emptyText': 'Выберите или добавьте',
                'filterMask': 'Не выбран контрагент',
                'btnTitle': '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c', //Добавить
                'id_sprav': 15,
                'haveFilter': true,
                'fid': 'id_analit2',
                'fnm': 'analit_nam2',
                'width': 520,
                'allowBlank': true,
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog2',
            title: 'Налоговый период',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Период, в котором был начислен налог, подлежащий уплате. <br>' +
                    'Значение поля 107 налоговой платежки может принимать  вид:<br>' +
                    '«МС.ХХ.ГГГГ», где ХХ — номер месяца (от 01 до 12), а ГГГГ — год, за который производится платеж. Например, «МС.01.2020»;<br>' +
                    '«КВ.ХХ.ГГГГ», где ХХ — номер квартала (от 01 до 04), ГГГГ — год, за который уплачивается налог. Например, «КВ.01.2020»;<br>' +
                    '«ПЛ.ХХ.ГГГГ», где ХХ — номер полугодия (01 или 02), ГГГГ — год, за который перечисляется налог. Например, «ПЛ.01.2020»;<br>' +
                    '«ГД.00.ГГГГ», где ГГГГ — год, за который уплачивается налог.  «ГД.00.2019».'
                },
                {
                    xtype: 'docfieldnumber',
                    text: '107',
                    title: 'Налоговый период'
                },
                {
                    xtype: 'taxperiod',
                }
            ]
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog4',
            hidden: true,
            title: 'Вид возмещения',
            itm:{
                    xtype: 'gbs_combo',
                    name: 'vid_return',
                    editable: false,
                    displayField: 'name',
                    valueField: 'id',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name', 'namer', 'named', 'sc'],
                            data: [{
                                'id': '1',
                                'name': 'расходы по социальному страхованию',
                                'namer': 'Возмещение расходов из ФСС',
                                'named': 'Возмещение расходов из ФСС',
                                'sc': '69.1'
                                },{
                                'id': '2',
                                'name': 'расходы на травматизм',
                                'namer': 'Возмещение расходов на травматизм из ФСС',
                                'named': 'Возмещение расходов на травматизм из ФСС',
                                'sc': '69.2'
                                },{
                                'id': '3',
                                'name': 'расходы по добровольному страхованию ИП за себя',
                                'namer': 'Возмещение из ФСС за страховые случаи ИП',
                                'named': 'Возмещение из ФСС за страховые случаи ИП',
                                'sc': '69.10'
                                }
                            ]}),
                    value: '1',
                    width: 520
                }
        },

        {
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'cont_vert',
                    cls: 'container-align',
                    name: 'cnt-summa',
                    title: 'Сумма',
                    itm: {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'gbs_combo',
                                editable: false,
                                hidden: (currYear > 2020),
                                name: 'avans',
                                store: [['0', 'Оплата'],
                                    ['1', 'Аванс']],
                                width: 140,
                                value: '0',
                            },
                            {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'summav',
                                        selectOnFocus : true,
                                        width: 140,
                                    }
                                ]
                            }
                        ],
                    }
                },
                {
                    xtype: 'cont_vert',
                    hidden: false,
                    cls: 'container-align',
                    name: 'cnt-summa-exclude',
                    title: 'Не учитывать в КУДИР',
                    style: 'margin:0 0 0 10px',
                    width: 147,
                    itm: {
                        xtype: 'container',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'sum_envd',
                                        selectOnFocus: true,
                                        width: 140,
                                    }
                                ]
                            }
                        ],
                    }
                },
                {
                    xtype: 'buttonask',
                    name: 'exclude-hint',
                    hidden: false,
                    text: 'укажите сумму налога (взноса), которую платите за сотрудников на ЕНВД и ПСН',
                    _width: '250px'
                },

            ]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nds',
            title: 'НДС',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'comboNDS',
                        width: 140,
                        name: 'nds_id',
                        value: '5'
                    },
                    {
                        xtype: 'container',
                        cls: 'input-summa',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'numberfield',
                                name: 'summandsv',
                                selectOnFocus : true,
                                width: 140,
                            }
                        ]
                    }
                ],
            }
        },


        {
            xtype: 'cont_vert',
            name: 'cnt-avans',
            layout: 'hbox',
            hidden: true,
            itm: [{
                xtype: 'checkbox',
                name: 'avans_nds',
                boxLabelAlign: 'after',
                checked: true,
                boxLabel: 'Выделить НДС с аванса',
                width: 180
            },
                {
                    xtype: 'buttonask',
                    name: 'tip_avans',
                    text: 'При прикреплении аванса к покупкам будут <br>' +
                    'сформированы проволки на ванс с выделением<br>' +
                    'НДС и автоматически создан счет фактура на аванс'
                }

            ]
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-kassa',
            title: 'Касса '/* + our_org_name*/,
            itm: [{
                'xtype': 'gbs_combo',
                'editable': false,
                width: 520,
                'displayField': 'name',
                'valueField': 'id',
                'name': 'kassa_id',
                'store': 'cbKassaId',
            }, {
                xtype: 'box',
                cls: 'txt-grey',
//                hidden: true,
                name: 'from_rs',
                html: 'name'

            }]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-bank',
            title: 'Расчетный счет ' + our_org_name,
            itm: [{
                xtype: 'sprav_tool',
                'name': 'rs_my_other',
                // 'cls': 'container-align-middle',
                'filterMask': 'Не выбран контрагент',
                'haveFilter': true,
                btnSpravShow: false,
                btnAddShow: false,
                'emptyText': 'Выберите счет',
                'id_sprav': 500,
                'fid': 'rs_my_id',
                'fnm': 'rs_nam',
                'width': 520,
                'allowBlank': true,
            }, {
                xtype: 'box',
                cls: 'txt-grey',
//                hidden: true,
                name: 'from_rs1',
                html: 'name'


            }]
        },


        {
            'xtype': 'container',
            'cls': 'hr-line'
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-open-req',
            itm: {
                xtype: 'button',
                action: 'show_req_panel',
                cls: 'btn-sel-blue',
                textAlign: 'left',
                text: 'Посмотреть платежные реквизиты',
                width: 520
            }
        },


        {
            xtype: 'bankformrequsites',
//            hidden: true
        },


        {
            xtype: 'cont_vert',
            name: 'cnt-analit12',
            cls: 'container-align',
            title: 'Прочие доходы и расходы',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit12',
                'id_sprav': 0,
                'fid': 'id_analit__',
                'fnm': 'analit_nam',
                'width': 520,
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-rs-cnt',
            hidden: true,
            title: 'Расчетный счет ' + our_org_name,
            itm: {
                xtype: 'sprav_tool',
                'name': 'rs_our',
                //'cls': 'container-align-middle',
                'emptyText': 'Выберите счет',
                btnSpravShow: false,
                btnAddShow: false,
                'id_sprav': 500,
                'fid': 'rsmy_id',
                'fnm': 'rs_nam',
                'width': 520,
                'allowBlank': true,
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-rs-contra',
            title: 'Расчетный счет контрагента',
            itm: {
                xtype: 'sprav_tool',
                'name': 'rs_contra',
                'filterMask': 'Не выбран контрагент',
                //'cls': 'container-align-middle',
                'emptyText': 'Выберите счет',
                'btnTitle': '\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c', //Добавить
                'id_sprav': 502,
                btnSpravShow: false,
                'fid': 'rs_id',
                'haveFilter': true,
                'fnm': 'rs_nam',
                'width': 520,
                'allowBlank': true,
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog3',
            title: 'КБК',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Код бюджетной классификации. Установлен для каждого вида налога, взноса, а также для штрафов, пеней.<br>' +
                    'Заполняется автоматически по каждому выбранному налогу в Виде операции.'
                },
                {
                    xtype: 'docfieldnumber',
                    text: '104',
                    title: 'КБК'
                },
                {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'gbs_combo',
                            name: 'nalog_vid_kbk',
                            editable: false,
                            displayField: 'name',
                            valueField: 'id',
                            store: [['1', 'По взносу'], ['1', 'По налогу'], ['2', 'По пени'], ['3', 'По штрафу']],
                            value: '1',
                            width: 140,
                        }, {
                            xtype: 'textfield',
                            name: 'f1',
                            emptyText: 'Максимум 20 символов',
                            width: 210,
                            maxLength: 20
                        }
                    ]
                }
            ]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-rs-people',
            title: 'Расчетный счет получателя',
            itm: {
                xtype: 'sprav_tool',
                'name': 'rs_people',
                'filterMask': 'Не выбран сотрудник',
                'haveFilter': true,
                'id_sprav': 550,
                'btnSpravShow': false,
                'btnAddText': 'Исправить',
                'fid': 'rs_people_id',
                'fnm': 'rs_people_nam',
                'width': 520,
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog-oktmo',
            title: 'ОКТМО',
            itm: [
                {
                    xtype: 'buttonask',
                    name: 'btnOKTMO',
                    text: 'ОКТМО Получателя средств'
                },
                {
                    xtype: 'docfieldnumber',
                    text: '105',
                    title: 'ОКТМО'
                },
                {
                    'xtype': 'textfield',
                    'name': 'f2',
                    'width': 130,
                    'value': ''
                }
            ]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog-kpp',
            title: 'КПП плательщика',
            itm: {
                'xtype': 'textfield',
                'name': 'zp_podr_kpp',
                'width': 130,
                'value': ''
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog5',
            title: 'Основание',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Поле заполняется автоматически значением ТП;<br>' +
                        'ТП - платежи текущего года;<br>' +
                        'ЗД - добровольное погашение задолженности по истекшим налоговым периодам, если налоговая инспекция не выписала требование об уплате налогов;<br>' +
                        'ТР - погашение задолженности по требованию, выписанному налоговой инспекцией;<br>' +
                        'РС - погашение рассроченной задолженности;<br>' +
                        'ОТ - погашение отсроченной задолженности;<br>' +
                        'РТ - погашение реструктурируемой задолженности;<br>' +
                        'ВУ - погашение отсроченной задолженности в связи с введением внешнего управления;<br>' +
                        'ПР - погашение задолженности, приостановленной к взысканию;<br>' +
                        'АП - погашение задолженности по акту налоговой проверки;<br>' +
                        'АР - погашение задолженности по исполнительному документу.'
                },
                {
                    xtype: 'docfieldnumber',
                    text: '106',
                    title: 'Основание'
                },
                {
                    xtype: 'gbs_combo',
                    name: 'f3',
                    editable: false,
                    displayField: 'name',
                    tpl: Ext.create('Ext.XTemplate',
                        '<tpl for=".">',
                            '<tpl if="field1 == \'\'">',
                                '<div class="x-boundlist-item">{field2}</div>',
                            '<tpl else>',
                                '<div class="x-boundlist-item">{field1} &mdash; {field3}</div>',
                            '</tpl>',
                        '</tpl>'
                    ), valueField: 'id',
                    store: [['ТП', 'ТП - Платежи текущего года', 'Платежи текущего года'],
                        ['ЗД', 'ЗД - Добровольное погашение', 'Добровольное погашение',],
                        ['ТР', 'ТР - Погашение задолженности', 'Погашение задолженности'],
                        ['РС', 'PC - Погашение рассроченной задолженности', 'Погашение рассроченной задолженности'],
                        ['ОТ', 'ОТ - Погашение отсроченной задолженности', 'Погашение отсроченной задолженности'],
                        ['РТ', 'РТ - Погашение реструктурируемой задолженности', 'Погашение реструктурируемой задолженности'],
                        ['ВУ', 'ВУ - Погашение отсроченной задолженности', 'Погашение отсроченной задолженности'],
                        ['ПР', 'ПР - Погашение задолженности, приостановленной к взысканию', 'Погашение задолженности, приостановленной к взысканию'],
                        ['АП', 'АП - Погашение задолженности по акту проверки', 'Погашение задолженности по акту проверки'],
                        ['АР', 'АР - Погашение задолженности по исполнительному документу', 'Погашение задолженности по исполнительному документу'],
                        ['', '0'], /* ['0', '0'],*/],
                    value: 'ТП',
                    width: 460,
                }
            ]
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nazn',
            title: 'Назначение платежа',
            itm: [
                {
                    xtype: 'docfieldnumber',
                    text: '24',
                    name : 'f24_info',
                    title: 'Назначение платежа'
                },
                {
                    xtype: 'textarea',
                    name: 'nazn',
                    width: 520,
                    grow: true,
                    rows: 2
                }
            ]
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-nalog-np',
            hidden: true,
            title: 'Назн. пл.',
            itm: [
                {
                    xtype: 'buttonask',
                    text: '<b>Код 1</b> ставьте при переводе зарплаты и других доходов, по которым есть ограничение по сумме удержаний на основании статьи 99 Закона от 02.10.2007 № 229-ФЗ. Например, премии, отпускные, пособия по временной нетрудоспособности.<br>' +
                        '<b>Код 2</b> указывайте при выплате доходов, которые имеют характер периодических выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                        '<b>Код 3</b> используйте при переводе доходов, которые имеют характер периодических выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ. В частности, ставьте код при переводе алиментов на несовершеннолетних детей.<br>' +
                        '<b>Код 4</b> указывайте при выплате доходов, которые имеют характер единовременных выплат, на которые не может быть обращено взыскание в силу статьи 101 Закона от 02.10.2007 № 229-ФЗ.<br>' +
                        '<b>Код 5</b> используйте при переводе доходов, которые имеют характер единовременных выплат, к которым не применяют ограничения по обращению взыскания на основании части 2 статьи 101 Закона от 02.10.2007 № 229-ФЗ.'
                },
                {
                    xtype: 'docfieldnumber',
                    text: '20',
                    title: 'Назначение платежа кодовое'
                },
                {
                    xtype: 'gbs_combo',
                    name: 'zp_kod_nazn_pl',
                    editable: false,
                    displayField: 'name',
                    valueField: 'id',
                    store: [
                        ['1', '1 - перевод доходов, в отношении которых установлены ограничения размеров взыскания'],
                        ['2', '2 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер периодических выплат'],
                        ['3', '3 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер периодических выплат'],
                        ['4', '4 - перевод доходов, на которые не может быть обращено взыскание и которые имеют характер единовременных выплат'],
                        ['5', '5 - перевод доходов, к которым ограничения по обращению взыскания не применяются и которые имеют характер единовременных выплат']
                    ],
                    value: '1',
                    width: 520
                }
            ]
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-zp-turn',
            hidden: true,
            title: 'Очередность платежа',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Приоритет, по которому выполняется платеж.<br>' +
                        '1 — оплата возмещения вреда жизни и здоровью; перечисление алиментов, удержанных из зарплаты;<br>' +
                        '2 — выплаты по исполнительным листам дохода авторам за результаты интеллектуальной деятельности и дохода работникам компаний (зарплата и выходное пособие);<br>' +
                        '3 — налоговые платежи, платежи в ФСС и ПФР согласно требованиям и предписаниям (недоимки); выплата зарплаты и других доходов работникам;<br>' +
                        '4 — другие платежи в соответствии с исполнительными документами;<br>' +
                        '5 — иные перечисления в календарном порядке (банк сначала исполняет документ, который поступил первым).'
                },
                {
                    'xtype': 'gbs_combo',
                    'editable': false,
                    'forceSelection': true,
                    'value': '5',
                    'name': 'f12_',
                    'width': 60,
                    'listConfig': {minWidth: 300},
                    'store': [['5', '5'], ['4', '4'], ['3', '3'], ['2', '2'], ['1', '1'], ['', '—']],
                    'flex': 1


                }
            ]
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-zaem',
            title: 'Срок займа, кредита',
            itm: {
                xtype: 'radiogroup',
                vertical: false,
                name: 'loanterm',
                columns: 1,
                items: [
                    {boxLabel: 'Краткосрочный до 1 года', name: 'id_j_pr', inputValue: '1', checked: true},
                    {boxLabel: 'Долгосрочный свыше 1 года', name: 'id_j_pr', inputValue: '2'}
                ],
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-ssc',
            title: 'Счет',
            itm: {
                xtype: 'sprav_tool',
                //'cls': 'container-align-middle',
                'name': 'sc',
                'emptyText': 'Выберите счет',
                'id_sprav': 2005,
                'fid': 'corr_sc',
                'fnm': 'corr_sc_nam',
                'width': 140,
                'allowBlank': true,
                'listConfig': {
                    'minWidth': 430
                },
                'btnSpravShow': false
                /*
                            'callBack': function (_id, _nm) {
                                var me = this, win = this.up('window');
                            }
                */
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align-middle',
//            cls: 'container-align',
            name: 'cnt-analit11',
            title: 'Аналитика счета',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit11',
                'id_sprav': 0,
                'fid': 'id_analit_',
                'fnm': 'analit_nam',
                'width': 520,
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit21',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit21',
                //'cls': 'container-align-middle',
                'id_sprav': 0,
                'fid': 'id_analit2_',
                'fnm': 'analit_nam2',
                'width': 520,
                'allowBlank': true,
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-dir',
            title: 'Вид расхода для КУДИР',
            itm: {
                xtype: 'sprav_tool',
                //'cls': 'container-align-middle',
                'name': 'dir_combo',
                'emptyText': 'Выберите вид ДиР',
                'id_sprav': 541,
                'fid': 'id_j_dr',
                'fnm': 'name',
                'width': 520,
                'allowBlank': true,
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-add-field',
            itm: {
                xtype: 'button',
                action: 'show_add_panel',
                cls: 'btn-sel-blue',
                textAlign: 'left',
                text: 'Редактировать статус, очередность, код, срок, резервное поле',
                width: 520
            }
        },


        {
            xtype: 'addbankform',
            hidden: true
        },

        {
            xtype: 'container',
            cls: 'container-align',
        },
        {
            xtype: 'container',
            hidden : true,
            cls: 'container-align',
            name: 'text_reg_plt',
        },


    ],


});
