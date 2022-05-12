Ext.define('Buh.view.kudir.grid.GridCardSection2', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.kudircardsection2',
    requires: ['Buh.classes.grid.Skirtle.Component'],
    viewConfig: {
        deferEmptyText: false,
        markDirty: false,
        preserveScrollOnRefresh: true
    },
    store: Ext.create('Buh.store.kudir.KudirCardSection2Store'),
    name: 'grdCardSection',
    cls: 'grid-body-pad',
    flex: 1,
    layout: 'fit',
    columns: [
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'ПАРАМЕТР',
            sortable: false,
            style: {'text-align': 'left'},
            columns: [
                {
                    width: 350,
                    dataIndex: 'parameter',
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let askText, button = '', _askTexts = [
                            'Категория ОС.',
                            'Как записано в техпаспорте, инвентарной карточке или другом документе.',
                            'Это дата платежного документа, когда была полная оплата.',
                            'Это дата подачи документов на регистрацию прав собственности на объект недвижимости.',
                            'Это дата ввода ОС в эксплуатацию|это дата принятия к учету НМА.',
                            'Заполняется только по объектам, которые приобрели или создали на УСН.',
                            'Заполняется только по объектам, которые приобрели или создали до перехода на УСН. Это срок в соответствии с амортизационными группами в ОКОФ. А если нужного объекта там нет &ndash; по техдокументам на объект.',
                            'Заполняется только по объектам, которые приобрели или сами создали до перехода на УСН. Рассчитывается как цена приобретения минус сумма начисленной амортизации.',
                            'Это количество кварталов эксплуатации в целом в ' + currYear + ' году.',
                            'По умолчанию программа ставит 100%. Для объектов, приобретенных на УСН доля всегда равна 100%. Если объект приобретен до перехода на УСН, введите нужное значение.',
                            'Рассчитывается как гр.10 разделить на гр.9 и округляется до двух знаков после запятой.',
                            'Это квартальная сумму расходов.<br>Для объектов, приобретенных на УСН, рассчитывается по формуле (гр.6 х гр.11) \ 100<br><br>Для объектов, приобретенных до перехода на УСН, считается так :  (гр.8 х гр.11) \ 100<br><br>Итог по этой графе идет в расходы Раздел 1 в последнее число квартала.',
                            'Рассчитывается как (гр.9 х гр.12).',
                            'Заполняется только по объектам, приобретенным или созданным до УСН.<br><br>Это все суммы по данному объекту из гр.13 раздела 2 КУДиР за прошлые годы.',
                            'Заполняется только по объектам, приобретенным или созданным до УСН.<br><br>Сумма остатка расходов, рассчитывается так: (гр.8 - гр.13 - гр.14).',
                            'Это дата выбытия или реализации объекта.'
                        ];

                        askText = _askTexts[record.data.id - 1];
                        button = Ext.String.format('<a class="ico-faq-small tooltip-container" data-qtip="{0}"></a>', askText);

                        return "<div style='white-space:normal !important;'>" + value + button + "</div>";
                    }
                },
            ]
        },
        {
            text: 'ГРАФА',
            sortable: false,
            style: {'text-align': 'left'},
            columns: [
                {
                    tdCls: 'txt-grey',
                    style: {'text-align': 'center'},
                    width: 50,
                    dataIndex: 'indicator'
                }
            ]
        },
        {
            text: 'ЗНАЧЕНИЕ',
            sortable: false,
            style: {'text-align': 'left'},
            columns: [
                {
                    xtype: 'componentcolumn',
                    width: 350,
                    dataIndex: 'value',
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        if (record.data.id == 1) {
                            return {
                                xtype: 'gbs_combo',
                                queryMode: 'local',
                                displayField: 'name',
                                valueField: 'id',
                                editable: false,
                                name: 'card_' + record.data.id,
                                store: {
                                    xtype: 'array',
                                    fields: ["id", "name"],
                                    data: [
                                        {id: '2', name: 'Оборудование'},
                                        {id: '1', name: 'Здание'},
                                        {id: '3', name: 'Транспортное средство'},
                                        {id: '4', name: 'Земельный участок'},
                                        {id: '5', name: 'Прочее ОС'}
                                    ]
                                },
                                value: iif(value == _dummy || value == '', '5', value),
                                listeners: {
                                    change: function () {
                                        let me = this, win = me.up('window'), form = win.down('form');

                                        form.down('[name=kat]').setValue(me.getValue());
                                        win.saveCard();
                                    }
                                }
                            };
                        } else if (record.data.id == 2) {
                            let me = this, win = me.up('window');
                            return {
                                xtype: 'textfield',
                                name: 'card_' + record.data.id,
                                value: iif(win.action == 'add', win.title, value),
                                listeners: {
                                    inputEl: {
                                        keydown: function (ev) {
                                            ev.stopPropagation();
                                        }
                                    },
                                    blur: function () {
                                        let me = this, win = me.up('window'), form = win.down('form'),
                                            _title = Ext.getCmp('winCardEditorTitle')

                                        me.setValue(trim(me.getValue()));
                                        if (me.getValue().length) {
                                            form.down('[name=name]').setValue(me.getValue());
                                            win.setTitle(me.getValue());
                                            _title.el.dom.innerHTML = win.title;
                                            win.saveCard();
                                        }
                                    }
                                }
                            };
                        } else if (record.data.id == 3) {
                            return {
                                xtype: 'cont_vert',
                                itm: {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'gbs_date',
                                            name: 'card_' + record.data.id,
                                            width: 140,
                                            value: value,
                                            listeners: {
                                                change: function () {
                                                    let me = this, win = me.up('window'), form = win.down('form'),
                                                        grid = me.up('container').up('[name=grdCardSection]'),
                                                        dt = new Date(me.getValue());
                                                    form.down('[name=datepayed]').setValue(Ext.Date.format(dt, 'Y-m-d'));
                                                    grid.calculate();
                                                }
                                            }
                                        }
                                    ],
                                }
                            };
                        } else if (record.data.id == 4) {
                            return {
                                xtype: 'cont_vert',
                                itm: {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'gbs_date',
                                            name: 'card_' + record.data.id,
                                            value: value,
                                            width: 140,
                                            listeners: {
                                                change: function () {
                                                    let me = this, win = me.up('window'), form = win.down('form'),
                                                        dt = new Date(me.getValue());

                                                    form.down('[name=datgr]').setValue(Ext.Date.format(dt, 'Y-m-d'));
                                                    win.saveCard();
                                                }
                                            }
                                        }
                                    ]
                                }
                            };
                        } else if (record.data.id == 5) {
                            return {
                                xtype: 'cont_vert',
                                itm: {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'gbs_date',
                                            name: 'card_' + record.data.id,
                                            value: value,
                                            width: 140,
                                            listeners: {
                                                change: function () {
                                                    let me = this, win = me.up('window'), form = win.down('form'),
                                                        grid = me.up('container').up('[name=grdCardSection]'),
                                                        dt = new Date(me.getValue());

                                                    form.down('[name=datvv]').setValue(Ext.Date.format(dt, 'Y-m-d'));
                                                    grid.calculate();
                                                }
                                            }
                                        }
                                    ]
                                }
                            };
                        } else if (record.data.id == 6) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value,
                                        selectOnFocus: true,
                                        width: 140,
                                        listeners: {
                                            blur: function () {
                                                let me = this, win = me.up('window'), form = win.down('form'),
                                                    grid = me.up('container').up('[name=grdCardSection]');

                                                if (me.getValue() >= 0) {
                                                    form.down('[name=base_cost]').setValue(me.getValue());
                                                    grid.calculate();
                                                }
                                            }
                                        }
                                    }
                                ]
                            };
                        } else if (record.data.id == 7) {
                            return {
                                xtype: 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'card_' + record.data.id,
                                        value: value,
                                        width: 140
                                    }
                                ]
                            };
                        } else if (record.data.id == 8) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value
                                    }
                                ]
                            };
                        } else if (record.data.id == 9) {
                            return {
                                xtype: 'textfield',
                                name: 'card_' + record.data.id,
                                value: value,
                                listeners: {
                                    inputEl: {
                                        keydown: function (ev) {
                                            ev.stopPropagation();
                                        }
                                    },
                                    blur: function () {
                                        let me = this, win = me.up('window'), form = win.down('form');

                                        if (me.getValue() >= 0) {
                                            form.down('[name=qtexp]').setValue(me.getValue());
                                            win.saveCard();
                                        }
                                    }
                                }
                            };
                        } else if (record.data.id == 10) {
                            return {
                                xtype: 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'card_' + record.data.id,
                                        value: '100'
                                    }
                                ]
                            };
                        } else if (record.data.id == 11) {
                            return {
                                xtype: 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'textfield',
                                        name: 'card_' + record.data.id,
                                        disabled: true,
                                        value: ''
                                    }
                                ]
                            };
                        } else if (record.data.id == 12) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value,
                                        disabled: true
                                    }
                                ]
                            };
                        } else if (record.data.id == 13) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value,
                                        disabled: true
                                    }
                                ]
                            };
                        } else if (record.data.id == 14) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value
                                    }
                                ]
                            };
                        } else if (record.data.id == 15) {
                            return {
                                xtype: 'container',
                                cls: 'input-summa',
                                layout: 'hbox',
                                items: [
                                    {
                                        xtype: 'numberfield',
                                        name: 'card_' + record.data.id,
                                        value: value,
                                        disabled: true
                                    }
                                ]
                            };
                        } else if (record.data.id == 16) {
                            return {
                                xtype: 'cont_vert',
                                itm: {
                                    xtype: 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            xtype: 'gbs_date',
                                            name: 'card_' + record.data.id,
                                            value: value,
                                            width: 140,
                                            listeners: {
                                                change: function () {
                                                    let me = this, win = me.up('window'), form = win.down('form'),
                                                        dt = new Date(me.getValue());
                                                    form.down('[name=datvyb]').setValue(Ext.Date.format(dt, 'Y-m-d'));
                                                    win.saveCard();
                                                }
                                            }
                                        }
                                    ],
                                }
                            };
                        }
                    },
                }
            ]
        },
    ],
    calculate: function () {
        let me = this, win = me.up('window'), form = win.down('form'),
            cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year'),
            cell16 = new Date(parseInt(cbYear.getValue()), 11, 31),
            cell3, cell5, cell6, cell9, cell11, cell12, cell13;

        cell3 = new Date(form.down('[name=datepayed]').getValue());
        cell5 = new Date(form.down('[name=datvv]').getValue());
        cell6 = form.down('[name=base_cost]').getValue();

        if (form.down('[name=datvyb]').getValue() != '' &&
            form.down('[name=datvyb]').getValue() != null &&
            form.down('[name=datvyb]').getValue() != '00.00.0000') {
            cell16 = new Date(form.down('[name=datvyb]').getValue());
        }

        if (cell5 > cell3) {
            cell9 = (Math.ceil((cell16.getMonth() + 1) / 3)) - (Math.ceil((cell5.getMonth() + 1) / 3)) + 1;
        } else {
            cell9 = (Math.ceil((cell16.getMonth() + 1) / 3)) - (Math.ceil((cell3.getMonth() + 1) / 3)) + 1;
        }
        cell9 = iif(!isNaN(cell9), cell9, 4);

        form.down('[name=qtexp]').setValue(cell9);
        me.down('componentcolumn').down('[name=card_9]').setValue(cell9);

        cell11 = me.down('componentcolumn').down('[name=card_10]').getValue() / cell9;
        me.down('componentcolumn').down('[name=card_11]').setValue(cell11.toFixed(2));

        cell12 = (cell6 * cell11) / 100;
        form.down('[name=quarter_fees]').setValue(cell12.toFixed(2));
        me.down('componentcolumn').down('[name=card_12]').setValue(cell12.toFixed(2));

        cell13 = cell9 * cell12;
        form.down('[name=tax_fees]').setValue(cell13.toFixed(2));
        me.down('componentcolumn').down('[name=card_13]').setValue(cell13.toFixed(2));

        win.saveCard();
    }
});
