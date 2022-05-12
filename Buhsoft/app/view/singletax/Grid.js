Ext.define('Buh.view.singletax.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.singletaxgrid',
    viewConfig: {
        markDirty: false
    },
    store: Ext.create('Buh.store.singletax.SingleTaxStore'),
    flex: 1,
    columns: [
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            xtype: 'numbercolumn',
            format: '0',
            text: '<b>Период</b>',
            dataIndex: 'kvartal',
            width: 200,
            flex: 1,
            renderer: function (org, column, record) {
                kv1 = '';
                if (record.get('kvartal') == 1) {
                    kv1 = 'I квартал';
                }
                if (record.get('kvartal') == 2) {
                    kv1 = 'Полугодие';
                }
                if (record.get('kvartal') == 3) {
                    kv1 = '9 месяцев';
                }
                if (record.get('kvartal') == 4) {
                    kv1 = 'Год';
                }
                if (!Ext.Array.contains(['1','2','3','4'], record.get('kvartal'))) {
                    kv1 = 'Минимальный налог за ' + record.get('year') + ' год';
                }
                return kv1;
            }
        },
        {
            text: '<b>Исчислено</b>',
            xtype: 'numbercolumn',
            format: '0',
            dataIndex: 'p1_nalog_to_pay',
            width: 200,
            align: 'right',
            renderer: function (value, meta, record) {
                let format = "0,000.00"
                return Ext.util.Format.number(value, format);
            }
        },
        {
            text: '<b>Оплачено</b>',
            xtype: 'numbercolumn',
            format: '0',
            dataIndex: 'sum_pay',
            width: 200,
            align: 'right',
            renderer: function (value, meta, record) {
                let format = "0,000.00"
                return Ext.util.Format.number(value, format);
            }
        },
        {
            text: '<b>Долг</b>',
            xtype: 'numbercolumn',
            format: '0',
            dataIndex: 'dolg',
            width: 200,
            align: 'right',
            renderer: function (value, meta, record) {
                let format = "0,000.00"
                return Ext.util.Format.number(value, format);
            }
        }
    ],
    listeners: {
        afterrender: function() {
            let me = this, grdPay = me.up('panel').down('panel[name=panelEnPay]').down('grid');

            me.getSelectionModel().on('select', function (g, r, i, e) {
                grdPay.store.proxy.extraParams = {
                    year: r.data.year,
                    kvartal: r.data.kvartal
                };
                grdPay.store.reload();
            });

            me.refresh();
        }
    },
    refresh: function () {
        let me = this, win = Ext.getCmp('main_winSDPay'), n_period = oDefaults.enPeriod - 1,
            cbYear = win.down('tabpanel').tabBar.down('gbs_combo_year');

        me.store.proxy.extraParams = {
            kvartal: win.down('[name=kvartal]').getValue(),
            year: cbYear.getValue(),
            taxobject: win.taxMode
        };
        me.store.load(function (r, o, s) {
            me.getSelectionModel().select(n_period);
        });
    }
});
