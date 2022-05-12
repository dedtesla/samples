let items = [
    {
        xtype: 'cont_vert',
// cls: 'container-align',
//        name  : 'cnt-summa',
//        title: 'Сумма',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    cls: 'sub-title-doc',
                    width : 450,
                    html: 'Статус, очередность, код, срок, резервное поле '
                },
                {xtype: 'tbfill'},
                {
                    xtype: 'button',
                    cls: 'btn-sel-blue color-grey',
                    border: false,
                    focusable: false,
                    text: 'Скрыть',
                    action: 'close_add_panel',
                    height: 20,
                    align: 'right'
                }
            ],
        }
    },


    {
        xtype: 'cont_vert',
        cls: 'container-align',
        title: 'Статус плательщика',
        itm: [
            {
                xtype: 'buttonask',
                text: 'Укажите в поле статус плательщика:<br>' +
                    '01 — при уплате налогов, сборов и взносов (кроме взносов на травматизм) организациями<br>' +
                    '02 — при уплате НДФЛ с зарплаты работников, а также при уплате НДС с муниципальной аренды и других агентских платежей в бюджет<br>' +
                    '08 — взносы на травматизм<br>' +
                    '09 — налоги и взносы ИП за себя<br>' +
                    '09 — взносы ИП за работников<br>' +
                    '10, 11, 12 — нотариусы, адвокаты, фермеры, уплачивающие налоги и взносы за себя и взносы за работников.'
            },
            {
                xtype: 'docfieldnumber',
                text: '101',
                title: 'Статус плательщика'
            },
            {
                'xtype': 'gbs_combo',
                'editable': false,
                'forceSelection': true,
                'value': '',
                'name': 'f0',
                'width': 520,
                'listConfig': {minWidth: 400},
                'store': [['', '—'],
                        ['01', '01 - Налогоплательщик - юр. лицо'],
                        ['02', '02 - Налоговый агент'],
//['03', '03 - '],
//['04', '04'],
//['05', '05'],
                        ['06', '06 - Участник ВЭД - юр.лицо'],
//['07', '07'],
                        ['08', '08 - Взносы на травматизм'],
                        ['09', '09 - Индивидуальный предприниматель'],
                        ['10', '10 - Частный нотариус'],
                        ['11', '11 - Адвокат, учредивший адвокатский кабинет'],
                        ['12', '12 - Глава крестьянского (фермерского) хозяйства'],
                        ['13', '13 - Физическое лицо'],
//['14', '14'],
//['15', '15'],
//['16', '16'],
                        ['17', '17 - Участник ВЭД - ИП'],
//['18', '18'],
//['19', '19'],
//['20', '20']
                    ],
                'flex': 1
            }
        ]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        title: 'Очередность платежа',
        itm: [
            {
                xtype: 'buttonask',
                text: 'Поле "Очерёдность" определяет, в каком порядке банк будет проводить платежи, если денежных средств на счете организации недостаточно.<br>' +
                    'Например, значение «3» указывается в платежных документах, выставленных ИФНС и отделениями внебюджетных фондов при принудительном взыскании задолженности;<br>' +
                    'значение «5» указывается в платежных документах, которые организации составляют самостоятельно. Поэтому недоимки будут списаны со счёта в первую очередь.'
            },
            {
                xtype: 'docfieldnumber',
                text: '21',
                title: 'Очередность платежа'
            },
            {
                'xtype': 'gbs_combo',
                'editable': false,
                'forceSelection': true,
                'value': '5',
                'name': 'f12',
                'width': 520,
                'listConfig': {minWidth: 500},
                valueField: 'id',
                displayField: 'name',
                'store': [['5', '5 - Иные перечисления в календарном порядке'],
                            ['4', '4 - Выплаты по исполнительным документам для удовлетворение других денежных требований'],
                            ['3', '3 - Выплата зарплаты и других доходов работникам; принудительные взыскания ИФНС, ФСС и ПФР согласно требованиям (недоимки) '],
                            ['2', '2 - Выплаты по исполнительным документам на оплату выходных пособий и зарплаты'],
                            ['1', '1 - Оплата алиментов, выплаты по исполнительным документам по возмещению вреда жизни и здоровью'],
                            ['', '—']],
                'flex': 1


            }
        ]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        title: 'Код',
        itm: [
            {
                xtype: 'buttonask',
                text: 'Код УИН (20-25 символов). Требование о необходимости заполнения реквизита "Код" ' +
                    'устанавливается только по  формам Положения Банка России N 383-П. Заполняется программно значением 0.'
            },
            {
                xtype: 'docfieldnumber',
                text: '22',
                title: 'Кодовое назначение платежа'
            },
            {
                'xtype': 'textfield',
                'name': 'f10',
                'width': 140,
                'value': 0
            }
        ]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        title: 'Срок платежа',
        itm: [
            {
                xtype: 'buttonask',
                text: 'Срок платежа заполняется только в тех случаях, когда это прямо предусмотрено указаниями Банка России (прил.№ 1 к положению Банка России от 19.06.2012 № 383-П)<br>' +
                    'По умолчанию поле остается пустым, без значений.'
            },
            {
                xtype: 'docfieldnumber',
                text: '19',
                title: 'Срок платежа'
            },
            {
                'xtype': 'textfield',
                'name': 'f11',
                'width': 140
            }
        ]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        title: 'Резервное поле',
        itm: [
            {
                xtype: 'buttonask',
                text: 'Резервное поле. Значение  не указывается, если иное не установлено Банком России.'
            },
            {
                xtype: 'docfieldnumber',
                text: '23',
                title: 'Резервное поле'
            },
            {
                'xtype': 'textfield',
                'name': 'f13',
                'width': 140

            }
        ]
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: (currYear < 2021),
        title: 'Тип документа-основания',
        name: 'cnt-_f6',
        itm: [
            {
                xtype: 'buttonask',
                text: ''
            },
            {
                xtype: 'docfieldnumber',
                text: '108',
                title: 'Тип документа-основания'
            },
            {
                'xtype': 'gbs_combo',
                'editable': false,
                'forceSelection': true,
                'value': '',
                'name': '_f6',
                'width': 520,
                'listConfig': {minWidth: 500},
                'store': [['ТР', 'ТР — Требование ИФНС об уплате налога, сбора, страховых взносов'],
                    ['ПР', 'ПР — Решение о приостановлении взыскания'],
                    ['АП', 'АП — Решение о привлечении к ответственности за налоговое правонарушение или об отказе в привлечении к ответственности'],
                    ['АР', 'АР — Исполнительный документ'],
                    ['', '—']],
                'flex': 1
            }
        ]
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: (currYear < 2021),
        title: 'Номер документа-основания',
        name: 'cnt-f6',
        itm: [
            {
                xtype: 'buttonask',
                text: ''
            },
            {
                xtype: 'docfieldnumber',
                text: '',
                title: 'Номер документа-основания'
            },
            {
                'xtype': 'textfield',
                'name': 'f6',
                'emptyText': '0',
                'width': 140
            }
        ]
    }, {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: (currYear < 2021),
        title: 'Дата документа-основания',
        itm: [
            {
                xtype: 'buttonask',
                text: ''
            },
            {
                xtype: 'docfieldnumber',
                text: '109',
                title: 'Дата документа-основания'
            },
            {
                xtype: 'container',
                layout: 'hbox',
                items: [{
                    xtype: 'gbs_combo',
                    name: '_f7',
                    editable: false,
                    displayField: 'name',
                    valueField: '_f7',
                    store: [['0', '0'], ['1', 'Дата']],
                    value: '0',
                    width: 140
                },
                    {
                        'xtype': 'gbs_date',
                        'hidden': true,
                        'name': 'f7',
                        'minValue': null,
                        'width': 140
                    }]
            }
        ]
    }
];

Ext.define('Buh.view.bank.BlueForm', {
    requires: ['Buh.classes.help.ButtonAsk', 'Buh.classes.common.DocFieldNumber'],
    extend: 'Ext.form.FormPanel',
    xtype: 'addbankform',
    name: 'add_panel',
    cls: 'blue_block',
//    bodyCls: 'panel-pad',
    layout: 'form',
    items: items
});
