Ext.define('Buh.classes.dir.tovarGroupDetail', {
    requires: ['Buh.classes.dir.gridGoods', 'Buh.classes.dir.tovarDetail'],
    extend: 'Gbs.window',
    cls: 'style2018 new-window-card',
    modal: false,
    resizable: false,
    x: 248,
    y: 0,
    width: 1200,
    customclosable: false,
    constructor: function (cfg) {
        this.initConfig(cfg);
        this.callParent(arguments);
        let win = this;
        this.on({
            beforeshow: function () {
                Ext.require(['src.joManager']);

                let me = this,
                    gridMain = this.down("gridGoods"),
                    store = gridMain.store;
                me.down('[name=ttl1]').update("Расходы на приобретение товаров");
                let ttl = me.down('#tp1');
                ttl.setTitle("Состав расхода");
                if (me.source == 2) {
                    //ttl.setTitle("Продано и списано");
                    gridMain.columns[4].show();
                }
                else {
                    //ttl.setTitle("Оплачено и списано");
                    gridMain.columns[4].hide();
                }

                store.proxy.extraParams =
                    {
                        'yearDatabase': currYear,
                        'source': me.source,
                        'source_id': me.source_id
                    };
                store.load({
                    callback: function (records, operation, success) {
                        gridMain.getSelectionModel().select(0);
                        gridMain.fireEvent("cellclick", gridMain, '', 0, records[0]);
                        let add = store.getProxy().reader.jsonData;
                        win.docName = add.nm;
                        me.down('[name=ttl2]').update(win.docName);
                    }
                });

                Ext.EventManager.onWindowResize(me.fireResize, me);
                me.fireResize();
            },


        });
    },

    header: false,
    title: "Расшифровка списания",
    layout: 'border',
    items: [
        {
            region: 'north',
            xtype: 'panel',
            //layout: 'vbox',
            cls: 'window-header',
            items: [
                {
                    xtype: 'box',
                    cls: 'header-title',
                    name: 'ttl1',
                    //width: 500,
                    text: ""
                },
                {
                    xtype: 'box',
                    //width: 500,
                    cls: 'header-info',
                    name: 'ttl2',
                    text: ""

                },
                {
                    xtype: 'button',
                    cls: 'close_btn',
                    text: "X",
                    handler: function () {
                        this.up('window').close();
                    }
                }
            ]
        }, {
            region: 'center',
            cls: "window-body tab-joint-header",
            xtype: 'tabpanel',
            items: [
                {
                    tabConfig: {
                        title: 'Операции по поставке',
                        cls : 'tab_panel_active'
                    },
                    layout: 'fit',
                    itemId: 'tp1',
                    items: [
                        {
                            xtype: 'gridGoods'
                        }

                    ]

                }, {
                    title: /*'Детализация выбранной операции'*/ '',
                    layout: 'fit',
                    itemId: 'tp2',
                    items: [
                        {
                            xtype: 'tovarDetail'
                        }
                    ]
                }
            ],
            listeners: {
                tabchange: function (t, nc, oc) {
                    let win = t.up('window'),
                        winWidth =win.getWidth(),
                        grid = win.down('gridGoods'),
                        rec = grid.getSelectionModel().getSelection()[0],
                        tovar = rec.data.tovar_text,
                        ttl = win.down('[name=ttl1]');
                    if (nc.itemId == 'tp1') {
                        ttl.update("Расходы на приобретение товаров");
                        win.down('[name=ttl2]').update(win.docName);
                    }
                    else {
//                        win.down('[name=width]').setWidth(winWidth - 900);

                        ttl.update("Детализация выбранной операции: " + tovar);
                        nc.down('tovarDetail').load();
                    }
                }
            }


        }

    ],


    fireResize: function (w, h) {  // window resize
        let me = this,
            tp = this.down('tabpanel'),
            size = Ext.getBody().getViewSize(),
            needheight = size.height - this.y - 101,
            pnl = tp.getTabBar(),
            needwidth = size.width - this.x-2;
        pnl.items.items[1].hide();


        me.down('[name=itog]').setWidth((needwidth - 480)/2);
        me.setWidth(needwidth);
        me.setHeight(needheight);
        me.doLayout();
    },


});



