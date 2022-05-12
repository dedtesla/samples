/**
 * Панель вкладки Книга доходов и расходов.
 * Содержит сквозную, общую для всех вкладок, панель инструментов
 * и панель вкладок разделов Книги.
 *
 * GBS-8588
 * 08.2020
 */
Ext.define('Buh.view.kudir.Panel', {
    extend: 'Ext.form.Panel',
    requires: ['Buh.view.kudir.TBar', 'Buh.view.kudir.grid.GridTotals'],
    alias: 'widget.kudirPanel',
    id: "mainPanelKudir",
    name: 'placeKudir',
    _owner: '',
    yearToHold: null,
    periodToHold: null,
    initComponent: function () {
        Ext.apply(this, {
            border: 0,
            frame: false,
            minWidth: 1140,
            maxWidth: 1300,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            listeners: {
                resize: this.fireResize
            }
        });
        this.callParent();
    },
    dockedItems: [
        {
            xtype: 'kudirtbar',
        }
    ],
    items: [
        {
            xtype: 'tabpanel',
            itemId: 'tpKudir',
            name: 'bottomTabs',
            taxMode: null,
            taxStavka: '',
            taxModes: ['доходы минус расходы', 'доходы'],
            items: [
                {
                    title: 'Раздел 1',
                    itemId: 1,
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        Ext.create('Buh.view.kudir.grid.GridSection1'),
                        {
                            xtype: 'kudirgridtotal',
                            name: 'grdTotalSection1',
                            store: Ext.create('Ext.data.Store', {
                                extend: 'Ext.data.Model',
                                fields: ['txt', 'prihod', 'rashod'],
                                data: [
                                    {"txt": "Всего за год:", "prihod": "", "rashod": ""}
                                ]
                            }),
                            columns: [
                                {
                                    dataIndex: 'txt',
                                    width: 200,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'prihod',
                                    align: 'right',
                                    width: 140,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'rashod',
                                    align: 'right',
                                    width: 140,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {flex: 2}
                            ]
                        }
                    ]
                },
                {
                    title: 'Справка',
                    itemId: 10,
                    cls: 'container-align-middle',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        Ext.create('Buh.view.kudir.grid.GridReference'),
                    ]
                },
                {
                    title: 'Раздел 2',
                    itemId: 2,
                    cls: 'container-align-middle',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        Ext.create('Buh.view.kudir.grid.GridSection2'),
                        {
                            xtype: 'kudirgridtotal',
                            name: 'grdTotalSection2',
                            store: Ext.create('Ext.data.Store', {
                                extend: 'Ext.data.Model',
                                fields: ['txt', 'base_cost', 'quarter_fees', 'tax_fees', 'previous_fees', 'future_fees'],
                                data: [
                                    {
                                        "txt": "Всего за год:",
                                        "base_cost": "",
                                        "quarter_fees": "",
                                        "tax_fees": "",
                                        "previous_fees": "",
                                        "future_fees": ""
                                    }
                                ]
                            }),
                            columns: [
                                {
                                    dataIndex: 'txt',
                                    width: 200,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'base_cost',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'quarter_fees',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'tax_fees',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'previous_fees',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'future_fees',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {flex: 1}
                            ]
                        }
                    ]
                },
                {
                    title: 'Раздел 3',
                    itemId: 3,
                    cls: 'container-align-middle',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: Ext.create('Buh.view.kudir.grid.GridSection3')
                },
                {
                    title: 'Раздел 4',
                    itemId: 4,
                    cls: 'container-align-middle',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        Ext.create('Buh.view.kudir.grid.GridSection4'),
                        {
                            xtype: 'kudirgridtotal',
                            name: 'grdTotalSection4',
                            store: Ext.create('Ext.data.Store', {
                                extend: 'Ext.data.Model',
                                fields: ['txt', 'ops', 'oss', 'oms', 'fss_trauma', 'benefit', 'fss_voluntary'],
                                data: [
                                    {
                                        "txt": "Всего за год:",
                                        "ops": "",
                                        "oss": "",
                                        "oms": "",
                                        "fss_trauma": "",
                                        "benefit": "",
                                        "fss_voluntary": ""
                                    }
                                ]
                            }),
                            columns: [
                                {
                                    dataIndex: 'txt',
                                    width: 200,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'ops',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'oss',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'oms',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'fss_trauma',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'benefit',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'fss_voluntary',
                                    align: 'right',
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {flex: 1}
                            ]
                        }
                    ]
                },
                {
                    title: 'Раздел 5',
                    itemId: 5,
                    cls: 'container-align-middle',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    flex: 1,
                    items: [
                        Ext.create('Buh.view.kudir.grid.GridSection5'),
                        {
                            xtype: 'kudirgridtotal',
                            name: 'grdTotalSection5',
                            store: Ext.create('Ext.data.Store', {
                                extend: 'Ext.data.Model',
                                fields: ['txt', 'summa'],
                                data: [
                                    {"txt": "Всего за год:", "summa": ""}
                                ]
                            }),
                            columns: [
                                {
                                    dataIndex: 'txt',
                                    width: 200,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {
                                    dataIndex: 'summa',
                                    align: 'right',
                                    width: 140,
                                    renderer: function (v, md, rec) {
                                        return "<div style='font-weight: bold'>" + v + "</div>";
                                    }
                                },
                                {flex: 1}
                            ]
                        }
                    ],
                }
            ],
            listeners: {
                afterrender: function (panel) {
                    let me = this,
                        bar = panel.tabBar

                    if (panel.taxMode == 0) {
                        panel.remove(4, true);
                        panel.remove(5, true);
                    } else {
                        panel.remove(10, true);
                        panel.remove(2, true);
                        panel.remove(3, true);

                    }
                    bar.add(
                        [
                            {
                                xtype: 'component',
                                flex: 1
                            },
                            {
                                xtype: 'component',
                                html: '<a class="link-darkgray" data-qtip="Изменить ставку">' + panel.taxStavka + ' (' + panel.taxModes[panel.taxMode] + ')' + '</a>',
                                id: 'lblTaxUsno',
                                name: 'lbl-tax',
                                cls: 'txt-grey',
                                width: 200,
                                style: {
                                    textAlign: 'right'
                                },
                                listeners: {
                                    render: function (cmp) {
                                        cmp.getEl().on('click', function (e) {
                                            document.getElementById('mn5-2-02').click();
                                        });
                                    }
                                },
                            }
                        ]
                    );
                }
            }
        }
    ],
    listeners: {
        afterRender: function () {
            let me = this;
            me.reconfig(me.down('tabpanel').activeTab.itemId);
        },
        resize: function () {
            this.fireResize;
        }
    },
    reconfig: function (tab) {
        let me = this,
            btnFilter = me.down('toolbar').down('[name=filterButton]'),
            btnEditor = me.down('toolbar').down('[name=editorButton]');

        if (Ext.Array.contains([1, 2, 4, 5], tab)) {
            btnEditor.show();
        } else {
            btnEditor.hide();
        }

        if (Ext.Array.contains([1, 4, 5], tab)) {
            btnFilter.show();

            if (Ext.util.Cookies.get('kdrf' + tab) != _dummy) {
                btnFilter.data = Ext.decode(Ext.util.Cookies.get('kdrf' + tab));
                if (btnFilter.data != _dummy && btnFilter.data.count > 0) {
                    btnFilter.setText("<i>" + btnFilter.data.count + "</i>Фильтр");
                    btnFilter.setIcon("");
                    btnFilter.addCls('ico_number');
                } else {
                    btnFilter.setText("Фильтр");
                    btnFilter.setIcon('/img/filter-icon.svg');
                    btnFilter.removeCls('ico_number');
                }
            } else {
                btnFilter.data = {};
                btnFilter.data.count = 0;
                btnFilter.setText("Фильтр");
                btnFilter.setIcon('/img/filter-icon.svg');
                btnFilter.removeCls('ico_number');
            }
        } else {
            btnFilter.hide();
        }
    },
    fireResize: function (m = false) {
        let me = this,
            size = Ext.getBody().getViewSize(),
            needheight = size.height,
            needwidth = size.width,
            tab = me.down('tabpanel').activeTab.itemId,
            gs = me.down('#grid' + tab),
            _popup = Ext.get('messageNewsNumber1'),
            _popSize = iif(_popup != undefined && localStorage.getItem("messageNewsNumber1") !== "invisible", 200, 0);


        me.setWidth(needwidth);
        me.setHeight(needheight-111-_popSize);
        if (gs != null) {
            gs.setHeight(needheight-270-_popSize);
            gs.setWidth(needwidth);
        }

        me.doLayout();
    },
    processPopup: function () {
        let me = this;
        me.fireResize(true);
    }

});
