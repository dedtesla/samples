/**
 * Форма фильтра Книга доходов и расходов.
 *
 * GBS-6829, GBS-8558, GBS-9690
 * @since 08/20
 */
Ext.define('Buh.view.kudir.filter.FilterForm', {
    extend: 'gbs.window.Form',
    requires: ['Buh.classes.container.Vertical', 'Buh.classes.container.PeriodAndYear',
        'Buh.classes.container.DateInterval', 'Buh.classes.sprav.Tool'],
    alias: 'widget.kudirfilterform',
    itemId: 'panelFilterKudir',
    isClean: true,
    listeners: {
        render: function () {
            let me = this, tab = me.up('window').tabId;

            me.add(
                [
                    {
                        xtype: 'label',
                        html: 'Период',
                    },
                    {
                        xtype: 'gbs_combo',
                        name: 'kf_period',
                        editable: false,
                        valueField: 'id',
                        displayField: 'name',
                        queryMode: 'local',
                        width: 190,
                        cls: 'container-align',
                        value: '',
                        store: Ext.create('Ext.data.Store', {
                            fields: [
                                {type: 'int', name: 'id'},
                                {type: 'string', name: 'name'},
                            ],
                            data: [
                                {id: 1, name: 'За I квартал'},
                                {id: 2, name: 'За II квартал'},
                                {id: 3, name: 'За III квартал'},
                                {id: 4, name: 'За IV квартал'},
                                {id: 6, name: 'За полугодие'},
                                {id: 9, name: 'За 9 месяцев'},
                                {id: 12, name: 'За год'}
                            ]
                        }),
                        tpl: Ext.create('Ext.XTemplate',
                            '<tpl for=".">',
                            '<tpl if="xindex == 5">',
                            '<hr class="txt-grey"><li class="x-boundlist-item">{name}</li>',
                            '<tpl else>',
                            '<li class="x-boundlist-item">{name}</li>',
                            '</tpl>',
                            '</tpl>'
                        ),
                        displayTpl: Ext.create('Ext.XTemplate',
                            '<tpl for=".">',
                            '{name}',
                            '</tpl>'
                        )
                    },
                    {
                        xtype: 'label',
                        html: 'Дата документа'
                    },
                    {
                        xtype: 'contdateinterval'
                    },
                    {
                        xtype: 'container',
                        cls: 'container-align'
                    },
                    {
                        xtype: 'label',
                        html: 'Сумма',
                    },
                    {
                        xtype: 'container',
                        cls: 'container-align',
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                xtype: 'gbs_combo',
                                name: 'kf_op_type',
                                displayField: 'name',
                                valueField: 'id',
                                editable: false,
                                forceSelection: true,
                                width: 190,
                                hidden: tab != 1,
                                store: Ext.create('Ext.data.Store', {
                                    fields: [
                                        {type: 'int', name: 'id'},
                                        {type: 'string', name: 'name'},
                                        {type: 'int', name: 'tax_mode'}
                                    ],
                                    data: [
                                        {id: 0, name: 'Доходы и расходы', tax_mode: 0},
                                        {id: 1, name: 'Доходы', tax_mode: 1},
                                        {id: 2, name: 'Расходы', tax_mode: 0}
                                    ]
                                }),
                                listeners: {
                                    select: function () {
                                        let me = this, _store = me.up('form').down('[name=kf_doc_name]').store
                                        win = me.up('window');

                                        me.up('form').isClean = false;
                                        me.up('form').down('[name=kf_id_sod]').typ_dir = me.getValue();
                                        me.up('form').down('[name=kf_id_sod]').store.proxy.extraParams.filt = me.getValue();
                                        me.up('form').down('[name=kf_id_sod]').store.proxy.extraParams.excl = '6,14';

                                        _store.clearFilter();
                                        if (me.getValue() == 2) {
                                            _store.filterBy(function (record, id) {
                                                return Ext.Array.indexOf([0, 2], record.get('typ_oper')) !== -1 &&
                                                    Ext.Array.indexOf([-1, win._taxMode], record.get('tax_mode')) !== -1 &&
                                                    Ext.Array.contains(record.get('tab'), win.tabId);
                                            }, me);
                                        } else if (me.getValue() == 1) {
                                            _store.filterBy(function (record, id) {
                                                return Ext.Array.indexOf([0, 1], record.get('typ_oper')) !== -1 &&
                                                    Ext.Array.indexOf([-1, win._taxMode], record.get('tax_mode')) !== -1 &&
                                                    Ext.Array.contains(record.get('tab'), win.tabId);
                                            }, me);
                                        } else {
                                            _store.filterBy(function (record, id) {
                                                return Ext.Array.indexOf([-1, win._taxMode], record.get('tax_mode')) !== -1 &&
                                                    Ext.Array.contains(record.get('tab'), win.tabId);
                                            }, me);
                                        }
                                    }
                                }
                            },
                            {
                                xtype: 'container',
                                cls: 'block-input-unite',
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
                                        xtype: 'textfield',
                                        cls: 'unite-start unite-field_1',
                                        name: 'kf_sum1',
                                        emptyText: 'от',
                                        width: 95,
                                        value: ''
                                    },
                                    {
                                        xtype: 'textfield',
                                        cls: 'unite-end unite-field_2',
                                        name: 'kf_sum2',
                                        emptyText: 'до',
                                        width: 95,
                                        value: ''
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        xtype: 'label',
                        html: 'Документ-основание'
                    },
                    {
                        xtype: 'container',
                        cls: 'container-align-middle',
                        items: [
                            {
                                xtype: 'gbs_combo',
                                name: 'kf_doc_name',
                                displayField: 'name',
                                valueField: 'short_name',
                                editable: false,
                                forceSelection: true,
                                width: 520,
                                tpl: Ext.create('Ext.XTemplate',
                                    '<tpl for=".">',
                                    '<tpl if="xindex == 8">',
                                    '<hr class="txt-grey"><li class="x-boundlist-item">{name}</li>',
                                    '<tpl else>',
                                    '<li class="x-boundlist-item">{name}</li>',
                                    '</tpl>',
                                    '</tpl>'
                                ),
                                displayTpl: Ext.create('Ext.XTemplate',
                                    '<tpl for=".">',
                                    '{name}',
                                    '</tpl>'
                                ),
                                listConfig: {
                                    minWidth: 520,
                                    maxWidth: 520,
                                },
                                queryMode: 'local',
                                store: Ext.create('Ext.data.Store', {
                                    fields: [
                                        {type: 'string', name: 'name'},
                                        {type: 'string', name: 'short_name'},
                                        {type: 'int', name: 'typ_oper'},
                                        {type: 'int', name: 'tax_mode'},
                                        {type: 'string', name: 'tab'},
                                    ],
                                    data: [
                                        {name: 'Платежное поручение', short_name: 'ПП', typ_oper: 0, tax_mode: -1, tab: [1,4,5]},
                                        {name: 'Приходный кассовый ордер', short_name: 'ПКО', typ_oper: 1, tax_mode: -1, tab: [1]},
                                        {name: 'Расходный кассовый ордер', short_name: 'РКО', typ_oper: 2, tax_mode: -1, tab: [1,4,5]},
                                        {name: 'УПД', short_name: 'УПД', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Товарная накладная Торг-12', short_name: 'Торг-12', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Акт', short_name: 'Акт', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Справка-расчет', short_name: 'Справка-расчет', typ_oper: 0, tax_mode: -1, tab: [1,4]},
                                        {name: 'Платежное требование', short_name: 'ПТ', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Банковский ордер', short_name: 'БО', typ_oper: 0, tax_mode: -1, tab: [1]},
                                        {name: 'Мемориальный ордер', short_name: 'МО', typ_oper: 0, tax_mode: -1, tab: [1]},
                                        {name: 'Инкассовое поручение', short_name: 'ИП', typ_oper: 1, tax_mode: -1, tab: [1,4,5]},
                                        {name: 'Счет-фактура', short_name: 'Счф', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Счет', short_name: 'Сч.', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Товарный чек', short_name: 'Тов.чек', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Квитанция', short_name: 'Квит.', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Товарно-транспортная накладная', short_name: 'ТТН', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Транспортная накладная', short_name: 'Тр. накл.', typ_oper: 0, tax_mode: 0, tab: [1]},
                                        {name: 'Авансовый отчет', short_name: 'АО', typ_oper: 2, tax_mode: 0, tab: [1]},
                                        {name: 'Взаимозачет', short_name: 'Взаимозачет', typ_oper: 0, tax_mode: -1, tab: [1]},
                                        {name: 'Без документа', short_name: 'Без док.', typ_oper: 0, tax_mode: -1, tab: [1,4,5]}
                                    ]
                                })
                            }
                        ]
                    },
                    {
                        xtype: 'container',
                        layout: 'hbox',
                        cls: 'container-align-small',
                        items: [
                            {
                                xtype: 'textfield',
                                emptyText: '№',
                                name: 'kf_n_doc',
                                value: '',
                                width: 140
                            }
                        ]
                    },
                    {
                        xtype: 'label',
                        hidden: tab != 1,
                        html: 'Содержание операции (вид дохода и расхода)'
                    },
                    {
                        xtype: 'container',
                        cls: 'container-align',
                        name: 'cnt-dir',
                        hidden: tab != 1,
                        items: [
                            {
                                xtype: 'sprav_tool',
                                name: 'kf_id_sod',
                                emptyText: 'Выберите вид ДиР',
                                id_sprav: 541,
                                fid: 'id_sod',
                                fnm: 'operation',
                                width: 520,
                                allowBlank: true,
                                emptyText: 'Все'
                            }
                        ]
                    },
                    {
                        xtype: 'label',
                        html: 'Контрагент',
                        hidden: tab != 1,
                    },
                    {
                        xtype: 'container',
                        hidden: tab != 1,
                        items:
                            {
                                xtype: 'sprav_tool',
                                cls: 'container-align-middle',
                                emptyText: 'Введите название для поиска',
                                name: 'kf_id_contra',
                                id_sprav: 6,
                                fid: 'id_contra',
                                fnm: 'name_contra',
                                width: 520,
                                allowBlank: true
                            }
                    },
                    {
                        xtype: 'label',
                        html: 'Тип взноса',
                        hidden: tab != 4,
                    },
                    {
                        xtype: 'cont_vert',
                        cls: 'container-align',
                        name: 'cnt-payment',
                        title: '',
                        hidden: tab != 4,
                        itm: {
                            xtype: 'gbs_combo',
                            name: 'kf_id_op',
                            editable: false,
                            forceSelection: true,
                            width: 520,
                            displayField: 'name',
                            valueField: 'id',
                            value: '0',
                            store: [
                                ['0', ''],
                                ['1', 'ОПС'],
                                ['2', 'ОСС'],
                                ['3', 'ОМС'],
                                ['4', 'ФСС травматизм'],
                                ['5', 'Пособия за счет работодателя'],
                                ['6', 'ФСС (добр.)'],
                            ]
                        }
                    },
                    {
                        xtype: 'label',
                        html: 'За период',
                        hidden: !Ext.Array.contains([4, 5], tab)
                    },
                    {
                        name: 'kf_doc_period',
                        xtype: 'periodandyear',
                        periodUnit: iif(tab == 4, 'month', 'quarter'),
                        hidden: !Ext.Array.contains([4, 5], tab)
                    }
                ]
            );
        },
        afterrender: function () {
            let me = this, win = me.up('window'), tab = win.tabId
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir');

            me.getForm().setValues(win.data);

            me.down('[name=kf_period]').setValue(cbPeriod.getValue());

            if (tab == 1) {
                me.down('[name=kf_id_sod]').typ_dir = iif(Ext.Array.contains([0,1], win.oper_type), 1, 2);
            }

            if (win.data != _dummy) {
                me.down('[name=kf_doc_name]').setValue(win.data.kf_doc_name);

                if (tab == 1) {
                    me.down('[name=kf_id_contra]').down('[name=name_contra]').pickerAlign = 'bl-tl';
                    me.down('[name=kf_id_sod]').store.proxy.extraParams.excl = '6,14';

                    if (me.down('[name=kf_op_type]').getValue() == 2) {
                        me.down('[name=kf_doc_name]').store.filterBy(function(record, id){
                            return Ext.Array.indexOf([0,2], record.get('typ_oper')) !== -1;
                        }, this);
                    } else if (Ext.Array.contains([0,1], me.down('[name=kf_op_type]').getValue())) {
                        me.down('[name=kf_doc_name]').store.filterBy(function(record, id){
                            return Ext.Array.indexOf([0,1], record.get('typ_oper')) !== -1;
                        }, this);
                    } else {
                        me.down('[name=kf_doc_name]').store.clearFilter();
                    }

                    if (win.data.kf_id_sod != _dummy && win.data.operation != _dummy) {
                        me.down('[name=kf_id_sod]').setValue(win.data.kf_id_sod, win.data.operation);
                    }
                }

                if (tab == 4) {
                    if (win.data.kf_id_op != _dummy) {
                        me.down('[name=kf_id_op]').setValue(win.data.kf_id_op);
                    }
                }

                if (Ext.Array.contains([4,5], tab) && me.down('[name=at_period_unit]').getValue() == _dummy) {
                    me.down('[name=at_year]').hide();
                }
            } else {
                if (Ext.Array.contains([4,5], tab)) {
                    me.down('[name=at_year]').hide();
                }
            }
        }
    }
});
