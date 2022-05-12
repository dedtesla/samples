Ext.define('Buh.view.kudir.grid.GridSection4', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirsection4grid',
    itemId: 'grid4',
    store: Ext.create('Buh.store.kudir.KudirSection4Store'),
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
                        return "<div style='text-align: center'>" + value + "</div>";
                    }
                }
            ]
        },
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'id_op',
            dataIndex: 'id_op',
            hidden: true
        },
        {
            text: 'tab_id',
            dataIndex: 'tab_id',
            value: 4,
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
            columns: [
                {
                    text: '2',
                    dataIndex: 'n_doc',
                    style: {'text-align': 'left'},
                    sortable: false,
                    width: 135,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let div = "";

                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                div = "<div style='white-space:normal !important;'>"

                                if (record.data.auto == 2 && record.data.short_name != null && record.data.is_dirty == 0) {
                                    if (record.data.short_name != 'Справка-расчет') {
                                        div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Перейти к документу">' + record.data.short_name + ' №' + record.data.n_doc + '</a>';
                                    } else {
                                        div += record.data.short_name;
                                    }
                                } else {
                                    if (record.data.short_name != 'Справка-расчет') {
                                        div += '<a name="jumptoedit" class="link-darkgray" data-qtip="Изменить">' + record.data.short_name + ' №' + record.data.n_doc + '</a>';
                                    } else {
                                        div += record.data.short_name;
                                    }
                                }
                            } else {
                                metaData.tdCls = 'txt-grey';
                                div = "<div style='white-space:normal !important;'>"
                                if (record.data.short_name != 'Справка-расчет') {
                                    div += record.data.short_name + ' №' + record.data.n_doc;
                                } else {
                                    div += record.data.short_name;
                                }
                            }
                            div += "</div>";

                            div += iif(record.data.iskl == 1, "<div class='table_doc-status'>Исключено</div>", "") +
                                iif(record.data.auto == 0, "<div class='table_doc-status'>Добавлено</div>", "") +
                                iif(record.data.is_dirty == 1, "<div class='table_doc-status'>Исправлено</div>", "");
                        } else {
                            div = "<div style='font-weight: bold'>" + record.data.n_doc + "</div>";
                        }

                        return div;
                    }
                }
            ]
        },
        {
            text: 'Дата док-та',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '',
                    dataIndex: 'doc_date',
                    style: {'text-align': 'left'},
                    sortable: false,
                    tdCls: 'txt-grey',
                    width: 95,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let div = "";

                        if (record.data.iskl == 0) {
                            if (record.data.auto == 2 && record.data.short_name != null && record.data.is_dirty == 0) {
                                if (record.data.n_doc != 'Справка-расчет') {
                                    div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Перейти к документу">' + value + '</a>';
                                } else {
                                    div += value;
                                }
                            } else {
                                if (record.data.n_doc != 'Справка-расчет') {
                                    div += '<a name="jumptoedit" class="link-darkgray" data-qtip="Изменить">' + value + '</a>';
                                } else {
                                    div += value;
                                }
                            }
                        } else {
                            div += value;
                        }
                        div += "</div>";

                        return div;
                    }
                }
            ]
        },
        {
            text: 'За период',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '3',
                    dataIndex: 'at_period',
                    style: {'text-align': 'left'},
                    sortable: false,
                    tdCls: 'txt-grey',
                    width: 80,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        if (value != null && value.length) {
                            let _val = value.split('.'), _out = '';

                            if (_val.length > 1) {
                                _month.forEach(function (v, i) {
                                    if (v[0] == _val[0]) {
                                        _out = v[1] + iif(_val[1] == currYear, '', ' ' + _val[1]);
                                        return false;
                                    }
                                });
                            } else {
                                _out = value;
                            }

                            if (record.data.iskl == 1) {
                                metaData.tdCls = 'txt-grey';
                            }
                            return "<div>" + _out + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'ОПС',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '4',
                    dataIndex: 'ops',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'ОСС',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '5',
                    dataIndex: 'oss',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'ОМС',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '6',
                    dataIndex: 'oms',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'ФСС<br>травматизм',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '7',
                    dataIndex: 'fss_trauma',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'Пособия за счет<br>работодателя',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '8',
                    dataIndex: 'benefit',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
                    }
                }
            ]
        },
        {
            text: 'ФСС (добр)',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '9',
                    dataIndex: 'fss_voluntary',
                    sortable: false,
                    tdCls: 'txt-blue',
                    style: {'text-align': 'right'},
                    align: 'right',
                    renderer: function (value, meta, record) {
                        let format = "0,000.00"
                        if (record.data.id != '') {
                            if (record.data.iskl == 0) {
                                meta.tdCls = "txt-blue";
                            } else {
                                meta.tdCls = "txt-grey";
                            }
                            return Ext.util.Format.number(value, format);
                        } else {
                            return div = "<div style='font-weight: bold'>" + Ext.util.Format.number(value, format) + "</div>";
                        }
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
                                if (rec.data.id != '') {
                                    this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
                                } else return false;
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
                cols = grid.down('headercontainer').getVisibleGridColumns(),
                grw = 0;

            Ext.each(cols, function (el) {
                if (el.dataIndex == 'order_num' ||
                    el.dataIndex == 'n_doc' ||
                    el.dataIndex == 'doc_date' ||
                    el.dataIndex == 'at_period') {
                    grw += parseInt(el.width);
                } else {
                    if (el.xtype != 'actioncolumn') {
                        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').down('[dataIndex=' + el.dataIndex + ']').setWidth(el.width);
                    }
                }
            });

            me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').down('[dataIndex=txt]').setWidth(grw);

            me.store.on('load', function () {
                me.calcTotals();
            });
        },
        cellclick: function (g, r, c, e) {
            let me = this;

            if (Ext.Array.contains([6, 7], c)) {
                if (e.data.auto == 0) me.fireEvent('goEditor', e);
            }
        }
    },
    calcTotals: function () {
        let me = this, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'), rowIndex = 0,
            ops = 0, oss = 0, oms = 0, fss_trauma = 0, benefit = 0, fss_voluntary = 0,
            qops = 0, qoss = 0, qoms = 0, qfss_trauma = 0, qbenefit = 0, qfss_voluntary = 0,
            qtops = 0, qtoss = 0, qtoms = 0, qtfss_trauma = 0, qtbenefit = 0, qtfss_voluntary = 0,
            format = "0,000.00";

        me.store.each(function (rec) {
            if (rec.data.id != '') {
                if (rec.data.iskl == 0) {
                    rowIndex++;
                    rec.set('order_num', rowIndex);
                    if (!isNaN(parseFloat(rec.data.ops))) {
                        ops += parseFloat(rec.data.ops);
                        qops += parseFloat(rec.data.ops);
                    }
                    if (!isNaN(parseFloat(rec.data.oss))) {
                        oss += parseFloat(rec.data.oss);
                        qoss += parseFloat(rec.data.oss);
                    }
                    if (!isNaN(parseFloat(rec.data.oms))) {
                        oms += parseFloat(rec.data.oms);
                        qoms += parseFloat(rec.data.oms);
                    }
                    if (!isNaN(parseFloat(rec.data.fss_trauma))) {
                        fss_trauma += parseFloat(rec.data.fss_trauma);
                        qfss_trauma += parseFloat(rec.data.fss_trauma);
                    }
                    if (!isNaN(parseFloat(rec.data.benefit))) {
                        benefit += parseFloat(rec.data.benefit);
                        qbenefit += parseFloat(rec.data.benefit);
                    }
                    if (!isNaN(parseFloat(rec.data.fss_voluntary))) {
                        fss_voluntary += parseFloat(rec.data.fss_voluntary);
                        qfss_voluntary += parseFloat(rec.data.fss_voluntary);
                    }
                }
            } else {
                qtops += qops;
                qtoss += qoss;
                qtoms += qoms;
                qtfss_trauma += qfss_trauma;
                qtbenefit += qbenefit;
                qtfss_voluntary += qfss_voluntary;

                rec.set('order_num', '&mdash;');
                if (Ext.Array.contains([6, 9], rec.data.quarter)) {
                    rec.set('ops', qtops);
                    rec.set('oss', qtoss);
                    rec.set('oms', qtoms);
                    rec.set('fss_trauma', qtfss_trauma);
                    rec.set('benefit', qtbenefit);
                    rec.set('fss_voluntary', qtfss_voluntary);
                } else {
                    rec.set('ops', qops);
                    rec.set('oss', qoss);
                    rec.set('oms', qoms);
                    rec.set('fss_trauma', qfss_trauma);
                    rec.set('benefit', qbenefit);
                    rec.set('fss_voluntary', qfss_voluntary);
                }
                qops = qoss = qoms = qfss_trauma = qbenefit = qfss_voluntary = 0;
            }
        });

        me.store.commitChanges();

        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('txt', 'Всего за ' + cbPeriod.getRawValue().replace(/^За\s/gi, '') + ':');
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('ops', iif(ops > 0, Ext.util.Format.number(ops, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('oss', iif(oss > 0, Ext.util.Format.number(oss, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('oms', iif(oms > 0, Ext.util.Format.number(oms, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('fss_trauma', iif(fss_trauma > 0, Ext.util.Format.number(fss_trauma, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('benefit', iif(benefit > 0, Ext.util.Format.number(benefit, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).set('fss_voluntary', iif(fss_voluntary > 0, Ext.util.Format.number(fss_voluntary, format), '&mdash;'));
        me.up('[name=bottomTabs]').down('[name=grdTotalSection4]').store.getAt(0).commit();
    }

});
