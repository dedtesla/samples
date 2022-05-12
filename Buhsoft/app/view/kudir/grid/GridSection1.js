Ext.define('Buh.view.kudir.grid.GridSection1', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirsection1grid',
    itemId: 'grid1',
    plugins: Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function (e, editor) {
                let deny = iif((editor.field === 'prihod' || editor.field === 'rashod') && isNaN(parseFloat(editor.value)), true, false);
                if (editor.record.data.iskl == 1 || editor.record.data.id_op == 4 || deny) return false;
            }
        }
    }),
    store: Ext.create('Buh.store.kudir.KudirSection1Store'),
    verticalScroller: {
        leadingBufferZone: 300,
        trailingBufferZone: 300,
        variableRowHeight: true
    },
    selModel: {
      pruneRemoved: false
    },
    minHeight: 300,
    cls: 'grid-multi-line dop_margin-top twoline_header',
    columns: [
        {
            text: '',
            cls: 'drop-icon-col',
            columns: [
                {
                    text: '',
                    dataIndex: 'icon',
                    tdCls: 'drop-icon-col',
                    align: 'left',
                    width: 30,
                    renderer: function (grid, column, record) {
                        if (record.data.id_op == 4) {
                            //column.tdCls = 'drop-icon';
                            let text = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                                '<path d="M3 6C3 5.44772 3.44772 5 4 5H16C16.5523 5 17 5.44772 17 6C17 6.55228 16.5523 7 16 7H4C3.44772 7 3 6.55228 3 6Z" fill="#7D859B"/>\n' +
                                '<path d="M3 10C3 9.44772 3.44772 9 4 9H16C16.5523 9 17 9.44772 17 10C17 10.5523 16.5523 11 16 11H4C3.44772 11 3 10.5523 3 10Z" fill="#7D859B"/>\n' +
                                '<path d="M3 14C3 13.4477 3.44772 13 4 13H16C16.5523 13 17 13.4477 17 14C17 14.5523 16.5523 15 16 15H4C3.44772 15 3 14.5523 3 14Z" fill="#7D859B"/>\n' +
                                '</svg>\n';
                            return text;
                        }
                    }
                },
            ]
        },
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
            text: 'Документ',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '2',
                    dataIndex: 'n_doc',
                    style: {'text-align': 'left'},
                    sortable: false,
                    width: 115,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let div = "";

                        if (record.data.iskl == 0) {
                            div = "<div style='white-space:normal !important;'>"

                            if (record.data.auto == 2 && record.data.short_name != null &&
                                record.data.is_dirty == 0 && record.data.id_op != 4) {
                                if (record.data.n_doc != 'Справка-расчет') {
                                    div += '<a name="jumptodoc" class="link-darkgray" data-qtip="Перейти к документу">';

                                    if (record.data.id_op == 4) {
                                        div += record.data.n_doc + '</a>';
                                    } else {
                                        div += record.data.short_name + ' ';
                                        if (record.data.n_doc != null && record.data.n_doc.length) {
                                            div += '№' + record.data.n_doc + '</a>';
                                        } else {
                                            if (record.data.short_name == undefined) {
                                                div += 'Без документа</a>';
                                            } else if (!record.data.short_name.length) {
                                                div += 'Без документа</a>';
                                            } else if (record.data.n_doc == "") {
                                                div += '</a>';
                                            } else {
                                                div += 'Без документа</a>';
                                            }
                                        }
                                    }
                                } else {
                                    div = "<div>" + record.data.n_doc;
                                }
                            } else {
                                if (record.data.n_doc != 'Справка-расчет') {
                                    if (record.data.id_op == 4) {
                                        div += iif(record.data.n_doc != null && record.data.n_doc.length, record.data.n_doc, 'Без документа');
                                    } else {
                                        div += '<a name="jumptoedit" class="link-darkgray" data-qtip="Изменить">';
                                        div += iif(record.data.short_name != null, record.data.short_name + ' ', '');

                                        if (record.data.n_doc != null && record.data.n_doc.length) {
                                            div += '№' + record.data.n_doc + '</a>';
                                        } else {
                                            if (record.data.short_name == undefined) {
                                                div += 'Без документа</a>';
                                            } else if (!record.data.short_name.length) {
                                                div += 'Без документа</a>';
                                            } else if (record.data.n_doc == "") {
                                                div += '</a>';
                                            } else {
                                                div += 'Без документа</a>';
                                            }
                                        }
                                    }
                                } else {
                                    div = "<div>" + record.data.n_doc;
                                }
                            }
                        } else {
                            metaData.tdCls = 'txt-grey';
                            div = "<div style='white-space:normal !important;'>"

                            if (record.data.id_op == 4) {
                                div += record.data.n_doc;
                            } else {
                                div += iif(record.data.short_name != null, record.data.short_name + ' ', '');
                                div += iif(record.data.n_doc != null, '№' + record.data.n_doc, 'Без документа');
                            }
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
            text: 'Дата док-та',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '',
                    dataIndex: 'doc_date',
                    sortable: false,
                    tdCls: 'txt-grey',
                    width: 95,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let div = "<div>";

                        if (record.data.iskl == 0 && record.data.id_op != 4) {
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
            text: 'Содержание операции',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '3',
                    dataIndex: 'operation',
                    sortable: false,
                    width: 275,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        let div = '';
                        if (record.data.id_op == 4) {
                            div += '<div style="white-space:normal !important;">';
                            div += '<a name="jumptoexplain" class="link-darkgray">';
                            div += iif(value == null, '', value);
                            div += iif(record.data.deal_text.length, '<br>' + record.data.deal_text, '');
                            div += iif(record.data.tovar_text.length, '<br>' + record.data.tovar_text, '');
                            div += '</a>';
                        } else {
                            div = '<div style="white-space:normal !important;">' + iif(value == null, '', value);
                        }
                        div += '</div>';
                        return div;
                    },
                }
            ]
        },
        {
            text: 'Контрагент',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '',
                    dataIndex: 'name_contra',
                    sortable: false,
                    style: {'text-align': 'center'},
                    width: 225,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        if (record.data.iskl == 1) metaData.tdCls = 'txt-grey';
                        return "<div style='white-space:normal !important;'>" + iif(value == null, '', value) + "</div>";
                    }
                }
            ]
        },
        {
            text: 'Доходы',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '4',
                    dataIndex: 'prihod',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
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
                }
            ]
        },
        {
            text: 'Расходы',
            style: {'text-align': 'right'},
            hidden: true,
            columns: [
                {
                    text: '5',
                    dataIndex: 'rashod',
                    sortable: false,
                    style: {'text-align': 'right'},
                    align: 'right',
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
                }
            ]
        },
        {
            text: '',
            columns: [
                {
                    xtype: 'actioncolumn',
                    text: '',
                    tdCls: 'vert-menu_btn',
                    width: 65,
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
        edit: function (editor, e) {
            if (e.originalValue == e.value || isNaN(parseFloat(e.originalValue))) return;

            let me = this,
                _selected = iif(me.getSelectionModel().hasSelection() == true, me.getSelectionModel().getSelection()[0], {}),
                _options = me.store.lastOptions;

            if (e.field == 'prihod' || e.field == 'rashod') {
                let sum = e.record.data[e.field] * 1;

                Ext.apply(_options, {
                    index: _selected.index,
                    callback: function (records, options) {
                        me.getSelectionModel().select(options.index);
                    }
                });

                _ajax(dir_start_buh_ + 'kudir_process.php',
                    {
                        action: 'modifySum',
                        id: e.record.data.id,
                        summa: sum,
                        is_dirty: 1,
                        tab_id: 1,
                        source: e.record.data.source,
                        source_id: e.record.data.source_id
                    },
                    function (resp) {
                        me.store.reload(_options);
                        me.calcTotals();
                    });
            }
        },
        'cellclick': function (g, r, c, e) {
            let me = this;
            if (e.data.id_op == 4 && c == 0) {
                let winExplain = Ext.create('Buh.classes.dir.tovarGroupDetail', {
                    source: e.data.source,
                    source_id: e.data.source_id,
                    date: e.data.date,
                    renderTo: Ext.getCmp('mainPanelKudir')._owner
                });
                winExplain.show();
            } else if (e.data.id > 0 && Ext.Array.contains([3, 4], c)) {
                /*
                if (e.data.auto == 2 && e.data.is_dirty == 0 && e.data.iskl == 0) me.fireEvent('gotoDoc', e);
                else me.fireEvent('goEditor', e);
                */
                if (e.data.auto == 2 && e.data.is_dirty == 0 && e.data.iskl == 0) return false;
                else me.fireEvent('goEditor', e);

            }
        },
        /*
                'celldblclick': function (t, td, cellIndex, record, tr, rowIndex, e, eOpt) {
        //            if (record.data.id_oper == 4) {
                        let winExplain = Ext.create('Buh.classes.dir.tovarGroupDetail', {
                            source: record.data.source,
                            source_id: record.data.source_id,
                            date: record.data.date,
                            renderTo: Ext.getCmp('mainPanelKudir')._owner
                        });
                        winExplain.show();
        //            }
        }
        */
    },
    calcTotals: function () {
        let me = this, income = 0, outcome = 0, storno = 0,
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            format = "0,000.00", _defaults = me.store.proxy.extraParams, _params;

        _params = _defaults.constructor();
        for (let attr in _defaults) {
            if (attr === 'action') _params[attr] = 'getTotalsSumSection1';
            else _params[attr] = _defaults[attr];
        }

        _ajax(
            dir_start_buh_ + 'kudir_process.php',
            _params,
            function (response) {
                let ans = Ext.decode(response);
                if (ans.data) {
                    income = iif(parseFloat(ans.data.income) > 0, parseFloat(ans.data.income), 0);
                    storno = iif(parseFloat(ans.data.storno) != 0 && ans.data.storno != null, parseFloat(ans.data.storno), 0);
                    outcome = iif(parseFloat(ans.data.outcome) > 0, parseFloat(ans.data.outcome), 0);

                    income -= storno;

                    me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').store.getAt(0).set('txt', 'Всего за ' + cbPeriod.getRawValue().replace(/^За\s/gi, '') + ':');
                    me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').store.getAt(0).set('prihod', iif(income > 0, Ext.util.Format.number(income, format), '&mdash;'));
                    me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').store.getAt(0).set('rashod', iif(outcome > 0, Ext.util.Format.number(outcome, format), '&mdash;'));
                    me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').store.getAt(0).commit();
                }
            }
        );
    },
    calcTpl: function() {
        let me = this, panel = Ext.getCmp('mainPanelKudir'),
            pw = parseInt(panel.getWidth()), taxMode = me.up('tabpanel').taxMode,
            cols, grw = 0, colw = 0;

        if (taxMode == 0) {
            me.down('[dataIndex=rashod]').show();
        }

        cols = me.down('headercontainer').getVisibleGridColumns()

        Ext.each(cols, function (el) {
            if (el.dataIndex != 'prihod' && el.dataIndex != 'rashod') {
                grw += parseInt(el.width);
            }
        });

        colw = iif(taxMode == 0, parseInt((pw - grw) / 2), parseInt(pw - grw));

        me.down('[dataIndex=prihod]').setWidth(colw);
        if (taxMode == 0) {
            me.down('[dataIndex=rashod]').setWidth(colw);
        }

        me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').down('[dataIndex=txt]').setWidth(grw - 65);
        me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').down('[dataIndex=prihod]').setWidth(colw);
        if (taxMode == 0) {
            me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').down('[dataIndex=rashod]').setWidth(colw);
        } else {
            me.up('[name=bottomTabs]').down('[name=grdTotalSection1]').down('[dataIndex=rashod]').hide();
        }
    }

});
