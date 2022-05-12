Ext.define('Buh.classes.dir.gridGoods', {
    extend: 'Ext.grid.Panel',
    xtype: 'gridGoods',
    store: {
        fields: ['id', {
            name: 'date',
            type: 'date'
        }, 'summa',
            'n_doc',
            'doc_date',
            'id_op',
            'id_doc',
            'operation',
            'name_contra',
            'deal_text',
            'tovar_text',
            'name',
            'prihod',
            'rashod',
            'source',
            'kol',
            'kol_znak',
            'source_id'
        ],
        proxy: {
            type: 'ajax',
            reader: {
                type: 'json',
                root: 'data',
            },
            api: {
                read: dir_start_buh_ + 'bookincomexpence/epxlainDocSale/'
            },
        }
    },
    columns: [
        {
            text: '№',
            tdCls: 'txt-grey',
            dataIndex: 'order_num',
            sortable: false,
            width: 50,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                value = record.index + 1;
                return "<div style='text-align: center'>" + value + "</div>";
            }
        },
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'Содержание операции',
            dataIndex: 'name',
            sortable: true,
            width: 375,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                let div = "<div style='white-space:normal !important;'>";
                if (record.data.name!=null) {
                    div += iif(record.data.name.length, record.data.name, "");
                    div += iif(record.data.deal_text.length, "<br>" + record.data.deal_text, "");
                }
                div += "</div>";
                return div;
            },
        },
        {
            text: 'Товар',
            dataIndex: 'name_contra',
            sortable: true,
            width: 175,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                return "<div style='white-space:normal !important;'>" + record.data.tovar_text + "</div>";
            }
        },
        {
            text: 'Количество',
            dataIndex: 'kol',
            width: 90,
            sortable: true,
            align: 'right',

            renderer: function (value, meta, record) {
                if (value != 0) {
                    return (value * 1).toFixed(record.data.kol_znak);
                } else
                    return "-";
            }
        },
        {
            text: 'Списано',
            dataIndex: 'summa',
            sortable: true,
            align: 'right'
        },


        {
            text: '',
            dataIndex: 'summa',
            sortable: false,
            width: 125,
            align: 'center',
            renderer: function (value, meta, record) {
                return "<span class='a-btn'>Детализация</span>";
            }
        },


        {
            text: '',
            xtype: 'actioncolumn',
            tdCls: 'vert-menu_btn',
            width: 35,
            sortable: false,
            items: [
                {
                    handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                        this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
                    }
                }
            ]
        }
    ],

    menu: Ext.create('Ext.menu.Menu', {
        rec: null,
        grid: null,
        cls: 'style2018 menu-gray',
        items: [{
            /*
                        text: 'Открыть детализацию',
                        name: 'menuCardOpen',
                        icon: _icons.calc,
                        handler: function (_inp) {
                            let me = this,
                                menu = this.up('menu'),
                                grid = menu.grid,
                                win = grid.up('window');
                            win.down('tabpanel').setActiveTab(1);

                        }
                    }, {
                    */
            text: 'Перейти к документу',
            name: 'menuCardOpen',
            icon: _icons.doc_white,
            handler: function (_inp) {
                let me = this,
                    menu = this.up('menu'),
                    recMenu = menu.rec,
                    rec = {'data': {source: 0}};
                rec.data.source = recMenu.data.id_op;
                rec.data.source_id = recMenu.data.id_doc;
                if (rec.data.source > 0) {
                    joManager.openSource(rec);
                }
            }
        }]
    }),

    listeners: {
        itemcontextmenu: function (v, rec, it, ind, e, eo) {
            e.stopEvent();
            this.menu.grid = this;
            this.menu.rec = rec;
            this.menu.showAt(e.getXY());
        },
        cellclick: function (view, cell, colindex, record, row, rowindex, e, eopt) {
            let panel2 = this.up('window').down('tovarDetail');
            panel2.source = record.data.source;
            panel2.source_id = record.data.source_id;
            panel2.date = Ext.Date.format(record.data.date, 'Y-m-d');
            if (colindex == 2 && e.target.nodeName == 'A') {
                this.menu.rec = record;
                this.menu.down('[name=menuCardOpen]').handler();
            }
            if (colindex == 6 && e.target.nodeName == 'SPAN') {
                let tabPanel = this.up('window').down('tabpanel');
                tabPanel.setActiveTab(1);
            }
        },
        celldblclick: function (view, cell, colindex, record, row, rowindex, e, eopt) {
            let tabPanel = this.up('window').down('tabpanel');
            tabPanel.setActiveTab(1);
        },
    }
});



