let store;
if(currYear > 2020) {
    store = [['МС', 'Месяц'], ['КВ', 'Квартал'], ['ПЛ', 'Полугодие'], ['ГД', 'Год'], ['ДТ', 'Дата'], ['', '0']];
} else {
    store = [['МС', 'Месяц'], ['КВ', 'Квартал'], ['ПЛ', 'Полугодие'], ['ГД', 'Год'], ['', '0']];
}

Ext.define('Buh.view.bank.TaxPeriod', {
    extend: 'Ext.container.Container',
    xtype: 'taxperiod',
    items: [
        {
            xtype: 'container',
            layout: 'hbox',
            defaults: {
                xtype: 'gbs_combo',
                editable: false,
                displayField: 'name',
                valueField: 'id',
                value: '01',
                width: 120,
                hidden: true,
            },
            items: [
                {
                    name: 'f5',
                    store: store,
                    value: 'ГД',
                    hidden: false,
                    width: 140,
                }, {
                    name: 'f14_1',
                    listConfig: {cls: 'style2018', minWidth: 200},
                    store: _month2,
                }, {
                    name: 'f14_2',
                    listConfig: {cls: 'style2018', minWidth: 200},
                    store: _kv2,
                }, {
                    name: 'f14_3',
                    listConfig: {cls: 'style2018', minWidth: 200},
                    store: _hy2,
                }, {
                    name: 'f14_4',
                    store: _y2,
                    listConfig: {cls: 'style2018', minWidth: 200},
                    hidden: false,
                    value: currYear,
                }, {
                    name: 'f14_5',
                    xtype: 'gbs_date',
                }, {
                    xtype: 'textfield',
                    name: 'f14',
                }]
        },
        {
            xtype: 'box',
            name: 'nalog_text',
            cls: 'txt-grey',
            width: 520,
            html: ''
        }
    ]
});