Ext.define('Buh.classes.combo.RowPicker', {
    extend: 'Gbs.window',
    constructor: function () {
        var _args = arguments[0];

        this.callParent(arguments);
        var fld = [
            {text: 'Id', dataIndex: 'id', hidden: true},
            {text: 'Text', dataIndex: 'nms', flex: 1},
        ];
        if (_args.fld != null)
            fld = _args.fld;

        this.down('#grid').reconfigure(_args.store, fld);


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

                    store.load({
                        callback: function (t, recs) {
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
        if (this.btnSpravShow == false) {
            this.down('[name=btnSprav]').hide();
            this.down('[name=btnSpravPoint]').hide();
        }

        if (this.btnAuxSpravText != undefined && this.btnAuxSpravText.length) {
            this.down('[name=btnAuxSprav]').text = this.btnAuxSpravText;
        }

        if (this.btnAuxSpravShow == true) {
            this.down('[name=btnAuxSprav]').show();
            this.down('[name=btnAuxSpravPoint]').show();
        }

        if (this.btnAddShow == false) {
            this.down('[name=btnAdd]').hide();
            this.down('[name=btnAuxSpravPoint]').hide();
        }

        if (this.btnAddShow == false && this.btnSpravShow == false && this.btnAuxSpravShow != true) this.down('toolbar').hide();
        if (this.btnAddText != undefined) this.down('[name=btnAdd]').setText(this.btnAddText);
    },

    customclosable: false,
    cls: 'null-window up_layer new-dropdown_menu',
    width: 300,
    height: 200,
    header: false,
    closeAction: 'hide',
    _constrain: '',
    callback: '',
    record: '',
    id_sprav: 0,
    rec: null,
    layout: 'fit',
    focusOnToFront: false,
    items: [
        {
            xtype: 'grid',
            itemId: 'grid',
            emptyText: "Введите новое наименование",
//         height : 300 ,
            minHeight: 80,
            maxHeight: 300,
            hideHeaders: true,
            viewConfig: {
                loadMask: false
            },
            store: null,
            headers: false,
            columns: [
                {text: 'Id', dataIndex: 'id', hidden: true},
                {text: 'Text', dataIndex: 'nms', flex: 1},
            ],
            bbar: [{
                    text: 'Справочник',
                    cls: 'btn-sel-blue',
                    name: 'btnSprav',
                    handler: function () {
                    // Открыть справочник
                        let me = this;
                        me.up('window').hide();
                        me.up('window').spravBtn(me.up('window'));
                }
                },
                {
                    xtype: 'box',
                    name: 'btnSpravPoint',
                html: '&#183;'
                },
                {
                    text: 'Справочник',
                    cls: 'btn-sel-blue',
                    name: 'btnAuxSprav',
                    hidden: true,
                    handler: function () {
                        // Открыть дополнительный справочник
                        let me = this;
                        me.up('window').hide();
                        me.up('window').spravBtn(me.up('window'), true);
                    }
                },
                {
                    xtype: 'box',
                    name: 'btnAuxSpravPoint',
                    hidden: true,
                    html: '&#183;'
                },
                {
                'text': 'Добавить',
                'cls': 'btn-sel-blue',
                'name': 'btnAdd',
                'handler': function () {
                    // Открыть добавление
                        let me = this;
                        me.up('window').hide();
                        me.up('window').spravAddBtn(me.up('window'));
                }
            }],
            listeners: {
                itemclick: function (v, rec, i, ind, e, eO) {
                    let me = this, w = me.up('window');
                    w.owner.down('#text_').collapse()
                    if (w.callback != '') {
                        w.callback(rec);
                    }
                },
            }
        }
    ],
    getSelectionModel: function () {
        let me = this;
        return me.down('grid').getSelectionModel();
    }

});
