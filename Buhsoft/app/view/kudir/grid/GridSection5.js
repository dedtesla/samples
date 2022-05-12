Ext.define('Buh.view.kudir.grid.GridSection5', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirsection5grid',
    itemId: 'grid5',
    plugins: Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function(e, editor){
                if (editor.record.data.iskl == 1) return false;
            }
        }
    }),
    store: Ext.create('Buh.store.kudir.KudirSection5Store'),
    minHeight: 300,
    cls: 'grid-multi-line dop_margin-top twoline_header',
    columns: [
        {
            text: '№',
            dataIndex: 'order_num',
            tdCls: 'txt-grey',
            style: {'text-align': 'center'},
            width: 50,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                return "<div style='text-align: center'>" + value + "</div>";
            }
        },
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'tab_id',
            dataIndex: 'tab_id',
            value: 6,
            hidden: true
        },
        {
            text: 'summa_orig',
            dataIndex: 'summa_orig',
            hidden: true
        },
        {
            text: 'details',
            dataIndex: 'details',
            hidden: true
        },
        {
            text: 'Документ',
            style: {'text-align': 'left'},
            dataIndex: 'n_doc',
            sortable: false,
            width: 115,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                let div = "";

                if (record.data.iskl == 0) {
                    div = "<div style='white-space:normal !important;'>"

                    if (record.data.auto == 2 && record.data.short_name != null && record.data.summa == record.data.summa_orig) {
                        div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Перейти к документу">' + record.data.short_name + ' №' + record.data.n_doc + '</a>';
                    } else {
                        div += '<a name="jumptoedit" class="link-darkgray" data-qtip="Изменить">' + record.data.short_name + ' №' + record.data.n_doc + '</a>';
                    }
                } else {
                    metaData.tdCls = 'txt-grey';
                    div = "<div style='white-space:normal !important;'>"
                    div += record.data.short_name + ' №' + record.data.n_doc;
                }
                div += "</div>";

                div += iif(record.data.iskl == 1, "<div class='table_doc-status'>Исключено</div>", "") +
                    iif(record.data.auto == 0, "<div class='table_doc-status'>Добавлено</div>", "") +
                    iif(record.data.is_dirty == 1, "<div class='table_doc-status'>Исправлено</div>", "");

                return div;
            }
        },
        {
            text: 'Дата док-та',
            sortable: false,
            dataIndex: 'doc_date',
            tdCls: 'txt-grey',
            style: {'text-align': 'left'},
            width: 95,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                let div = "";

                if (record.data.iskl == 0) {
                    if (record.data.auto == 2 && record.data.short_name != null && record.data.summa == record.data.summa_orig) {
                        div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Перейти к документу">' + value + '</a>';
                    } else {
                        div += '<a name="jumptoedit" class="link-darkgray" data-qtip="Изменить">' + value + '</a>';
                    }
                } else {
                    div += value;
                }
                div += "</div>";

                return div;
            }
        },
        {
            text: 'За период',
            sortable: false,
            dataIndex: 'at_period',
            tdCls: 'txt-grey',
            style: {'text-align': 'left'},
            width: 95,
            renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                if (value != null && value.length) {
                    let _val = value.split('.'), _out = '';
                    _kv2.forEach(function (v, i) {
                        if (v[0] == _val[0]) {
                            _out = v[1] + iif(_val[1] == currYear, '', ' ' + _val[1]);
                            return false;
                        }
                    });
                    if (record.data.iskl == 1) {
                        metaData.tdCls = 'txt-grey';
                    }
                    return "<div>" + _out + "</div>";
                }
            }
        },
        {
            text: 'Сумма',
            sortable: false,
            dataIndex: 'summa',
            tdCls: 'txt-blue',
            style: {'text-align': 'right'},
            align: 'right',
            width: 200,
            hideTrigger: true,
            editor: numEditor,
            renderer: function (value, meta, record) {
                let format = "0,000.00"
                if (record.data.iskl == 0) {
                    meta.tdCls = "txt-blue";
                } else {
                    meta.tdCls = "txt-grey";
                }
                return Ext.util.Format.number(value, format);
            }
        },
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
    ],
    listeners: {
        afterRender: function (grid, opts) {
            let me = this,
                cols = grid.down('headercontainer').getVisibleGridColumns(),
                grw = 0;

            Ext.each(cols, function (el) {
                if (el.dataIndex != 'summa') {
                    grw += parseInt(el.width);
                }
            });

            me.up('[name=bottomTabs]').down('[name=grdTotalSection5]').down('[dataIndex=txt]').setWidth(grw + 10);

            me.store.on('load', function () {
                me.calcTotals();
            });
        },
        edit: function (editor, e) {
            if (e.originalValue == e.value) return;

            let me = this;

            if (e.field == 'summa') {
                let sum = e.record.data['summa'] * 1;
                _ajax(dir_start_buh_ + 'kudir_process.php',
                    {
                        action: 'modifySum',
                        id: e.record.data.id,
                        summa: sum,
                        is_dirty: 1,
                        tab_id: 5
                    });

                e.record.set('summa', sum.toFixed(2));
                e.record.set('is_dirty', 1);
                me.store.commitChanges();
                me.calcTotals();
            }
        },
        cellclick: function (g, r, c, e) {
            let me = this;

            if (Ext.Array.contains([5,6], c)) {
                if (e.data.auto == 2) me.fireEvent('gotoDoc', e);
                else me.fireEvent('goEditor', e);
            }
        }
    },
    calcTotals: function () {
        let me = this, s = 0, qs = 0, rowIndex = 0, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            format = "0,000.00";

        me.store.each(function (rec) {
            if (rec.data.iskl == 0) {
                rowIndex++;
                rec.set('order_num', rowIndex);
                s += parseFloat(rec.data.summa);
                qs += parseFloat(rec.data.summa);
            } else {
                rec.set('order_num', '&mdash;');
                rec.set('summa', qs);
                qs = 0;
            }
        });
        me.store.commitChanges();

        me.up('[name=bottomTabs]').down('[name=grdTotalSection5]').store.getAt(0).set('txt', 'Всего за ' + cbPeriod.getRawValue().replace(/^За\s/gi, '') + ':');
        me.up('[name=bottomTabs]').down('[name=grdTotalSection5]').store.getAt(0).set('summa', iif(s > 0, Ext.util.Format.number(s, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection5]').store.getAt(0).commit();
    }
});
