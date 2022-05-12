Ext.define('Buh.view.singletax.GridPay', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.singletaxpaygrid',
    viewConfig: {
        markDirty: false
    },
    store: Ext.create('Buh.store.singletax.SingleTaxPayStore'),
    flex: 1,
    menu: Ext.create('Ext.menu.Menu', {
        cls: 'style2018 menu-gray',
        rec: null,
        grd: null,
        items: [
            {
                text: 'Изменить',
                icon: _icons.edit,
                handler: function () {
                    this.up('menu').grd.fireEvent('edit', this.up('menu').rec);
                }
            },
            {
                text: 'Скачать платежку',
                icon: _icons.dwnl,
                handler: function () {
                    this.up('menu').grd.fireEvent('downloadpaydoc', this.up('menu').rec);
                }
            },
            {
                text: 'Удалить',
                icon: _icons.del,
                handler: function () {
                    this.up('menu').grd.fireEvent('deletepaydoc', this.up('menu').rec);
                }
            }
        ]
    }),
    columns: [
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'Дата',
            dataIndex: 'df',
            width: 100
        },
        {
            text: 'Номер',
            dataIndex: 'n_doc',
            width: 100
        },
        {
            text: 'Сумма',
            dataIndex: 'summa',
            width: 100,
            align: 'right',
            renderer: function (value, meta, record) {
                let format = "0,000.00"
                return Ext.util.Format.number(value, format);
            }
        },
        {
            text: 'Проводка',
            dataIndex: 'confirm',
            width: 80,
            renderer: function (org, column, record) {
                if (record.get('confirm') == 1) {
                    return '<img src="' + _icons.v_gr + '">';
                } else {
                    return "Нет";
                }
            }
        },
        {
            text: '<b>Банк</b>',
            dataIndex: 'rs_bank',
            flex: 1
        },
        {
            xtype: 'actioncolumn',
            width: 50,
            items: [
                {
                    handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                        this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
                    }
                }
            ]
        }
    ]
});
