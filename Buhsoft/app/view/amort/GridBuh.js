Ext.define('Buh.view.amort.GridBuh', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.amortgridbuh',
    emptyText: "<center>Нет данных для отображения</center>",
    store: Ext.create('Buh.store.AmortBuhS'),
    columns: [{
        text: 'Наименование',
        dataIndex: 'name',
        flex: 1
    }, {
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {
        text: 'Первонач.ст.',
        dataIndex: 'first_summa',
        width: 120,
        align: 'right'
    }, {
        text: 'За месяц',
        dataIndex: 'summa',
        width: 120,
        align: 'right'
    }, {
        text: 'С начала года',
        dataIndex: 'byr_summa',
        width: 120,
        align: 'right'
    }, {
        text: 'Остаточ.стоим.',
        dataIndex: 'rest_summa',
        width: 120,
        align: 'right'
    }, {
        text: 'Дебет',
        dataIndex: 'sc_dt',
        align: 'center',
        width: 120
    }, {
        text: 'Кредит',
        dataIndex: 'sc_ct',
        align: 'center',
        width: 120
    }],
    tbar: {
        xtype: 'toolbar',
        name: 'tbarTop',
        dock: 'top',
        items: [
            {
                xtype: 'gbs_combo_year',
                itemId: 'cmbYear',
            },
            {
                xtype: 'gbs_combo',
                itemId: 'amortBuhMonCb',
                name: 'mon',
                editable: false,
                forceSelection: true,
                width: 190,
                value: '1',
                store: [['1', 'Январь'],
                    ['2', 'Февраль'],
                    ['3', 'Март'],
                    ['4', 'Апрель'],
                    ['5', 'Май'],
                    ['6', 'Июнь'],
                    ['7', 'Июль'],
                    ['8', 'Август'],
                    ['9', 'Сентябрь'],
                    ['10', 'Октябрь'],
                    ['11', 'Ноябрь'],
                    ['12', 'Декабрь']]
            }, {
                'xtype': 'field_find',
                'width': 190,
            }, {
                xtype: 'button',
                text: 'Печать',
                action: 'print',
                icon: _icons.print
            }


        ]
    }
});
