Ext.define('Buh.view.import.DetailPanel', {
    extend: 'Ext.form.Panel',

    requires: [
        'Buh.view.import.ImpField',
        'Buh.classes.combo.ComboSsc'
    ],
    xtype: 'impmaketdetail',
    alias: 'widget.impmaketdetail',
    itemId: 'winImpDet',
    width: 1100,
    layout: 'column',
    title: 'Настройка соответствия полей и номеров ячеек в XLS',

    items: [
        {
            columnWidth: 0.25,
            cls: 'block_fon-gray block_pad16x24 block_content-compact',
            defaults: {
                xtype: 'textfield',
                hidden: true,
                flex: 1,
//                width: 171,
                value: 0
            },
            items: [
                {
                    name: 'orgmy',
                }, {
                    name: 'sklad',
                }, {
                    name: 'kod',
                }, {
                    name: 'id'
                }, {
                    name: 'sprav'
                },

                {
                    fieldLabel: 'Начальная строка',
                    labelWidth: 140,
                    hidden: false,
                    name: 'lineB',
                    emptyText: '№'
                }, {
                    fieldLabel: 'Конечная строка',
                    labelWidth: 140,
                    hidden: false,
                    name: 'lineE',
                    emptyText: '№'
                },
                {
                    xtype: 'container',
                    hidden: false,
                    cls: 'hr-line'
                },

                {
                    xtype: 'combo',
                    hidden: false,
                    listConfig: {cls: 'style2018', minWidth: 500, maxHeight: 150},
                    hideTrigger: true,
                    name: 'idanalit',
//                width: 165,
                    cls: 'style2018',
                    fieldCls: 'gbs-combo',
                    fieldLabel: 'Тип',
                    labelWidth: 80,
                    width: 190,
                    editable: false,
                    forceSelection: true,
                    value: '5',
                    store: [
                        ['5', 'Товары'],
                        ['4', 'Продукция'],
                        ['41', 'Услуги предоставленные'],
                        ['31', 'Услуги полученные'],
                        ['32', 'РБП'],
                        ['3', 'Материалы'],
                    ],
                },
                {
                    xtype: 'combo_ssc',
                    fieldLabel: 'Счет',
                    labelWidth: 80,
                    width: 190,
                    hidden: false,
                    name: 'cb_sc_ssc',
                    value: ''

                }
            ]

        },
        {
            columnWidth: 0.25,
            cls: 'block_pad8x20 block_content-compact',
            defaults: {
                xtype: 'impfield',
            },
            items: [
                {
                    name_: 'naim',
                    title_: 'Наименование'
                },

                {
                    name_: 'edizm_name',
                    title_: 'Ед.измерения'
                },

                {
                    name_: 'kol',
                    title_: 'Количество'
                },

                {
                    name_: 'sumaNDS',
                    title_: 'Сумма с НДС',
                },

                {
                    name_: 'stavkaNDS',
                    title_: 'Ставка НДС',
                }


            ]
        },
        {
            columnWidth: 0.25,
            cls: 'block_pad8x20 block_content-compact',
            defaults: {
                xtype: 'impfield',
            },
            items: [
                {
                    name_: 'coun_nam',
                    title_: 'Страна',
                },

                {
                    name_: 'gtd',
                    title_: 'ГТД',
                },

                {
                    name_: 'kodd',
                    title_: 'Код'
                },

                {
                    name_: 'note',
                    title_: 'Примечание',
                },

                {
                    name_: 'gr',
                    title_: 'Группа',
                }


            ]
        },
        {
            columnWidth: 0.25,
            cls: 'block_pad8x20 block_content-compact',
            defaults: {
                xtype: 'impfield',
            },
            items: [
                {
                    name_: 'kol_znak',
                    title_: 'Десятичных',
                },

                {
                    name_: 'artikul',
                    title_: 'Артикул',
                }
            ]
        }
    ]

});
