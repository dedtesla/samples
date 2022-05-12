/**
 * Компонент мастера Акта сверки с контрагентом.
 * Связка со справочниками контрагентов и групп.
 * В одном списке выводятся и контрагенты, и группы контрагентов.
 * Группы отличаются текстом в скобках (группа) после названия.
 *
 * @since 03.21
 */
Ext.define('Buh.classes.sprav.RRContragentTool', {
    extend: 'Buh.classes.sprav.Tool',
    xtype: 'rrcontra_groups',
    id_sprav: 6,
    id_sprav_aux: 680,
    emptyText: 'Выбрать или добавить',
    width: 640,
    allowBlank: false,
    showAdd: false,
    store:  null,
    btnSpravShow: true,
    btnAuxSpravShow: true,
    btnAuxSpravText: '',
    _auxNameText: '',
    items: [
        {
            xtype: 'component',
            itemId: 'title_',
            width: 150,
            html: ''
        },
        {
            xtype: 'button',
            icon: _icons.plus_grey,
            text: 'Добавить',
            itemId: 'btnAdd',
            textAlign: 'left',
            hidden: true,
            width: 106,
            handler: function () {
                let me = this;
                me.up('container').btnAdd();
            }
        },
        {
            xtype: 'textfield',
            hidden: true,
            itemId: 'id',
            name: 'id',
            value: 0,
            setNewValue: function (_val) {
                let me = this, container = me.up('container');
                me.setValue(_val);
                let _text = container.down('#text_').getValue();
                container.fireEvent('select', container.rec);
                me.fireEvent('blur');
                if (container.callBack != null) {
                    let rec = container.rec;
                    container.callBack(rec, rec ? (container.store.getById(rec.data.id) || rec) : null);
                }
            }
        },
        {
            xtype: 'combo',
            cls: ' field-combo-button',
            labelSeparator: '',
            msgTarget: 'none',
            name: 'text_',
            itemId: 'text_',
            enableKeyEvents: true,
            flex: 1,
            listeners: {
                change: function () {
                    let me = this;
                    if (me.up('window') != _dummy) {
                        me.up('window').modified = true;
                    }
                },
                keyup: function (t, e, eOpts) {
                    let me = this;
                    me.up('rrcontra_groups').fillStore();
                },
                blur: function (inp, recs, e) {
                    let me = this;
                    me.collapse();
                    if (me.allowBlank && !me.getValue()) {
                        me.up('rrcontra_groups').getComponent('id').setNewValue(null);
                        me.up('rrcontra_groups').getComponent('text_').setValue('');
                    }
                },
                click: function (t, e, opt) {
                    let me = this;
                    if (!t.readOnly) {
                        let me = this;
                        me.expand();
                        me.picker.id_sprav = t.up('rrcontra_groups').id_sprav;
                        me.picker.setWidth(520);
                    }
                },
                expand: function () {
                    let me = this, cnt = me.up('rrcontra_groups');
                    cnt.oldVal = me.getValue();
                }
            },
            createPicker: function () {
                let me = this, picker, w = me.up('rrcontra_groups');

                picker = Ext.create('Buh.classes.combo.RowPicker', Ext.apply({
                    id_sprav: w.id_sprav,
                    id_sprav_aux: w.id_sprav_aux,
                    owner: w,
                    grd: me.up('grid'),
                    store: w.store,
                    cls: 'null-window up_layer new-dropdown_menu grid-cell-wrap' + (w.lineWrap ? ' grid-cell-wrap' : ''),
                    btnSpravShow: w.btnSpravShow,
                    btnAuxSpravShow: w.btnAuxSpravShow,
                    btnAuxSpravText: iif(!w.btnAuxSpravText.length, 'Справочник групп', w.btnAuxSpravText),
                    btnAddShow: false,
                    btnAddText: '',
                    spravBtn: function (win, useAuxRef = false) {
                        let me = this, fldVal = w.getComponent('id'), fldText = w.getComponent('text_'), filt = '';

                        if (useAuxRef) {
                            let winTree = createTreeSprav(me.id_sprav, 'Контрагенты', fldVal.id, fldText.id, true, 0, 0);
                            winTree.show();
                        } else {
                            Ext.getCmp('mainWin6').showWin(fldVal.getValue(), true, fldVal.id, fldText.id, '', filt, false);
                        }
                    },
                    spravAddBtn: function (win) {
                        return false;
                    },
                    callback: function (rec) {
                        let me = this;
                        me.owner.rec = rec;
                        me.owner.recOrigin = rec;
                        me.owner.setValue(rec.data.id, rec.data.nms);
                        me.owner.lostFocus();
                    }
                }, w.listConfig));
                return picker;
            }
        }
    ]
});
