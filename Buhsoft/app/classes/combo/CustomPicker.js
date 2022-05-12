Ext.define('Buh.classes.combo.CustomPicker', {
    extend: 'Gbs.window',
    constructor: function () {
        var _args = arguments[0];

        this.callParent(arguments);

        var me = this,
            flds = ['id', 'name'];
        model = me.down('#grid').store.model;

        if (_args.fields != undefined) {
            flds = _args.fields;
        }
        this.down('#grid').reconfigure(Ext.create('Ext.data.Store', {
            proxy: {
                type: 'ajax',
                url: dir_start_buh_ + 'getcbsprav.php/0',
                extraParams: {'query': ''},
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            fields: flds,
            autoLoad: false
        }));


        Ext.apply(this, arguments);
    },
    initComponent: function () {
        this.callParent(arguments);

        Ext.apply(this, {
            listeners: {
                filter: function () {
                    var me = this,
                        store = me.down('#grid').store,
                        fltFunc = me.filterFunc;
                    store.proxy.url = dir_start_buh_ + 'getcbsprav.php/' + this.id_sprav;
                    store.load({
                        callback: function () {
                            if (fltFunc != undefined)
                                fltFunc(me);
                        }
                    });


                },
                show: function () {
                    this.fireEvent('filter');
                }
            }
        });
    },

    customclosable: false,
    cls: 'null-window up_layer new-dropdown_menu',
    width: 500,
    header: false,
    closeAction: 'hide',
    _constrain: '',
    callback: '',
    record: '',
    id_sprav: 0,
    rec: null,
    layout: 'fit',

//    fields: ['id', 'name'],

    items: [
        {
            'xtype': 'grid',
            itemId: 'grid',
            emptyText: "Введите новое наименование",
//         height : 300 ,
            minHeight: 80,
            maxHeight: 300,
            'hideHeaders': true,
            viewConfig: {
                loadMask: false
            },
            'store': null,
            headers: false,
            columns: [
                {text: 'Id', dataIndex: 'id', hidden: true},
                {text: 'Text', dataIndex: 'name', flex: 1},
            ],
            bbar: [{
                'text': 'Справочник',
                'cls': 'btn-sel-blue',
                'name': 'btnSprav',
                'handler': function () {
                    // Открыть справочник
                    this.up('window').spravBtn(this.up('window'));
                    this.up('window').hide();
                }
            }, {'xtype': 'box', html: '&#183;'}, {
                'text': 'Добавить',
                'cls': 'btn-sel-blue',
                'name': 'btnAdd',
                'handler': function () {
                    // Открыть добавление
                    this.up('window').spravAddBtn(this.up('window'));
                    this.up('window').hide();


                }
            }],
            listeners: {
                itemclick: function (v, rec, i, ind, e, eO) {
                    var w = this.up('window');
                    if (w.callback != '') {
                        w.callback(rec);
                        w.hide();
                    }
                    else
                        w.hide();

                },
            }
        }
    ],
    getSelectionModel: function () {
        return this.down('grid').getSelectionModel();

    }

});
