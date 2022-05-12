Ext.define('Buh.view.kudir.grid.GridSection2', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirsection2grid',
    itemId: 'grid2',
    store: Ext.create('Buh.store.kudir.KudirSection2Store'),
    minHeight: 300,
    cls: 'grid-multi-line dop_margin-top twoline_header first-line-header_twoline',
    columns: [
        {
            text: '№',
            style: {'text-align': 'center'},
            columns: [
                {
                    text: '1',
                    tdCls: 'txt-grey',
                    style: {'text-align': 'center'},
                    dataIndex: 'order_num',
                    sortable: false,
                    width: 50,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        return "<div>" + value + "</div>";
                    },
                }
            ]
        },
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'ОС, НМА',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '2',
                    dataIndex: 'name',
                    style: {'text-align': 'left'},
                    sortable: false,
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let div = "";

                        if (record.data.iskl == 0) {
                            div = "<div style='white-space:normal !important;'>"
                            div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Открыть карточку">';
                            div += record.data.name + '</a>';
                        } else {
                            metaData.tdCls = 'txt-grey';
                            div = "<div style='white-space:normal !important;'>"
                            div += record.data.name;
                        }
                        div += "</div>";

                        div += iif(record.data.iskl == 1, "<div class='table_doc-status'>Исключено</div>", "") +
                            iif(record.data.auto == 0, "<div class='table_doc-status'>Добавлено</div>", "") +
                            iif(record.data.is_dirty == 1, "<div class='table_doc-status'>Исправлено</div>", "");

                        return div;
                    }
                }
            ]
        },
        {
            text: 'Первоначальная<br>стоимость',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '6',
                    dataIndex: 'base_cost',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let format = "0,000.00";
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        },
        {
            text: 'Учитываемые расходы<br>за каждый квартал',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '12',
                    dataIndex: 'quarter_fees',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let format = "0,000.00";
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        },
        {
            text: 'Учитываемые расходы<br>за налоговый период',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '13',
                    dataIndex: 'tax_fees',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let format = "0,000.00";
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        },
        {
            text: 'Включено в расходы<br>за предыдущие периоды',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '14',
                    dataIndex: 'previous_fees',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let format = "0,000.00";
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        },
        {
            text: 'Расходы, подлежащие списанию<br>в будущие периоды',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '15',
                    dataIndex: 'future_fees',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    width: 140,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let format = "0,000.00";
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        },
        {
            text: '',
            columns: [
                {
                    xtype: 'actioncolumn',
                    width: 50,
                    sortable: false,
                    items: [
                        {
                            handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                                this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
                            }
                        }
                    ]
                }
            ]
        }
    ],
    listeners: {
        afterRender: function (grid, opts) {
            let me = this,
                pw = parseInt(grid.up('#mainPanelKudir').getWidth()),
                cols = grid.down('headercontainer').getVisibleGridColumns(),
                grw = 0, colw = 0;

            Ext.each(cols, function (el) {
                if (!Ext.Array.contains(['base_cost', 'quarter_fees', 'tax_fees', 'previous_fees', 'future_fees'], el.dataIndex)) {
                    grw += parseInt(el.width);
                }
            });

            colw = parseInt((pw - grw) / 5);
            grid.down('[dataIndex=base_cost]').setWidth(colw);
            grid.down('[dataIndex=quarter_fees]').setWidth(colw);
            grid.down('[dataIndex=tax_fees]').setWidth(colw);
            grid.down('[dataIndex=previous_fees]').setWidth(colw);
            grid.down('[dataIndex=future_fees]').setWidth(colw);

            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=txt]').setWidth(grw - 50);
            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=base_cost]').setWidth(colw);
            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=quarter_fees]').setWidth(colw);
            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=tax_fees]').setWidth(colw);
            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=previous_fees]').setWidth(colw);
            me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').down('[dataIndex=future_fees]').setWidth(colw);

            me.store.on('load', function () {
                me.calcTotals();
            });
        },
        cellclick: function (g, r, c, e) {
            let me = this;

            if (Ext.Array.contains([2], c)) {
                me.fireEvent('goEditor', e);
            }
        }
    },
    calcTotals: function () {
        let me = this, s1 = 0, s2 = 0, s3 = 0, s4 = 0, s5 = 0,
            rowIndex = 0, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            format = "0,000.00";

        me.store.each(function (rec) {
            if (rec.data.iskl == 0) {
                rowIndex++;
                rec.set('order_num', rowIndex);
                if (!isNaN(parseFloat(rec.data.base_cost))) s1 += parseFloat(rec.data.base_cost);
                if (!isNaN(parseFloat(rec.data.quarter_fees))) s2 += parseFloat(rec.data.quarter_fees);
                if (!isNaN(parseFloat(rec.data.tax_fees))) s3 += parseFloat(rec.data.tax_fees);
                if (!isNaN(parseFloat(rec.data.previous_fees))) s4 += parseFloat(rec.data.previous_fees);
                if (!isNaN(parseFloat(rec.data.future_fees))) s5 += parseFloat(rec.data.future_fees);
            } else {
                rec.set('order_num', '&mdash;');
            }
        });
        me.store.commitChanges();

        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('txt', 'Всего за ' + cbPeriod.getRawValue().replace(/^За\s/gi, '') + ':');
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('base_cost', iif(s1 > 0, Ext.util.Format.number(s1, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('quarter_fees', iif(s2 > 0, Ext.util.Format.number(s2, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('tax_fees', iif(s3 > 0, Ext.util.Format.number(s3, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('previous_fees', iif(s4 > 0, Ext.util.Format.number(s4, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).set('future_fees', iif(s5 > 0, Ext.util.Format.number(s5, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection2]').store.getAt(0).commit();
    }
});
