Ext.define('Buh.view.kudir.editor.Form', {
    extend: 'Ext.form.FormPanel',
    requires: ['Buh.classes.container.ThreeSelect', 'Buh.classes.container.Vertical', 'Buh.classes.sprav.Tool',
               'Buh.classes.container.PeriodAndYear'],
    xtype: 'kudirrecordform',
    name: 'kudirEditorPanel',
    bodyCls: 'panel-pad',
    layout: 'form',
    trackResetOnLoad: true,
    items: [
        {
            xtype: 'hidden',
            name: 'id',
            value: 0
        },
        {
            xtype: 'hidden',
            name: 'id_op_orig',
            value: 0
        },
        {
            xtype: 'hidden',
            name: 'id_doc',
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'copy_id',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'summa_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'short_name_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'date_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'n_doc_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'at_period_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'id_sod_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'id_contra_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'tab_id',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'details',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'iskl',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'at_period',
            hidden: true,
        },
        {
            xtype: 'textfield',
            name: 'auto',
            hidden: true,
        },
        {
            xtype: 'textfield',
            name: 'is_dirty',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'source',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'source_id',
            hidden: true,
            value: 0
        },
        {
            xtype: 'three_select',
            cls: 'block-btn-unite container-align',
            nm: 'id_oper',
            b1: 'Доход',
            b2: 'Расход',
            listeners: {
                change: function () {
                    let me = this,
                        _title = 'Содержание операции (вид ' + iif(me.getValue() == 1, 'дохода', 'расхода') + ')',
                        _store = me.up('form').down('[name=short_name]').store,
                        win = me.up('window');

                    _store.clearFilter();
                    me.up('form').down('[name=short_name]').setValue('');

                    if (me.getValue() == 2) {
                        _store.filterBy(function(record, id){
                            return (Ext.Array.indexOf([0,2], record.get('typ_oper')) !== -1 &&
                                    Ext.Array.indexOf([-1, win._taxMode], record.get('tax_mode')) !== -1 &&
                                    Ext.Array.contains(record.get('tab'), win.tabId));
                        }, me);
                    } else if (me.getValue() == 1) {
                        _store.filterBy(function(record, id){
                            return (Ext.Array.indexOf([0,1], record.get('typ_oper')) !== -1 &&
                                Ext.Array.indexOf([-1, win._taxMode], record.get('tax_mode')) !== -1 &&
                                Ext.Array.contains(record.get('tab'), win.tabId));
                        }, me);
                    }

                    me.up('form').down('[name=id_sod]').typ_dir = me.getValue();
                    me.up('form').down('[name=id_sod]').store.proxy.extraParams.filt = me.getValue();
                    me.up('form').down('[name=id_sod]').store.proxy.extraParams.excl = '6,14';
                    me.up('[name=kudirEditorPanel]').down('[name=cnt-dir]').setTitle(_title);
                }
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align hr-line',
            name: 'cnt-gotoDoc',
            hidden: true,
            itm: {
                xtype: 'button',
                cls: 'btn-sel-blue',
                text: 'Перейти к документу для редактирования',
                icon: _icons.forward,
                border: 0,
                action: 'gotoDoc'
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align hr-line',
            name: 'cnt-rollback',
            hidden: true,
            itm: {
                xtype: 'button',
                cls: 'btn-sel-blue',
                text: 'Отменить внесенные изменения',
                icon: _icons.forward,
                border: 0,
                handler: function () {
                    let me = this, form = me.up('form');

                    form.down('[name=is_dirty]').setValue(0);
                    form.down('[name=summa]').setValue(form.down('[name=summa_orig]').getValue());
                    form.down('[name=short_name]').setValue(form.down('[name=short_name_orig]').getValue());
                    form.down('[name=n_doc]').setValue(form.down('[name=n_doc_orig]').getValue());
                    form.down('[name=doc_date]').setValue(form.down('[name=date_orig]').getValue());

                    if (parseInt(form.down('[name=auto]').getValue() != 2)) {
                        form.down('[name=id_sod]').setValue(form.down('[name=id_sod_orig]').getValue());
                        form.down('[name=id_contra]').setValue(form.down('[name=id_contra_orig]').getValue());
                    }
                    me.up('container').hide();
                }
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-summa',
            title: 'Сумма',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'container',
                        cls: 'input-summa',
                        layout: 'hbox',
                        items: [
                            {
                                xtype: 'numberfield',
                                allowBlank: false,
                                name: 'summa',
                                selectOnFocus: true,
                                width: 140,
                                listeners: {
                                    blur: function () {
                                        let me = this, form = me.up('form');
                                        if (me.getValue() != form.down('[name=summa_orig]').getValue()) {
                                            form.down('[name=is_dirty]').setValue(1);
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align-middle',
            name: 'cnt-n-doc',
            title: 'Документ-основание',
            itm: {
                xtype: 'gbs_combo',
                name: 'short_name',
                editable: false,
                width: 520,
                valueField: 'short_name',
                displayField: 'name',
                // forceSelection: true,
                tpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                    '<tpl if="xindex == 8">',
                    '<hr class="txt-grey"><li class="x-boundlist-item">{name}</li>',
                    '<tpl else>',
                    '<li class="x-boundlist-item">{name}</li>',
                    '</tpl>',
                    '</tpl>'
                ),
                displayTpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                    '{name}',
                    '</tpl>'
                ),
                store: Ext.create('Ext.data.Store', {
                    fields: [
                        {type: 'string', name: 'name'},
                        {type: 'string', name: 'short_name'},
                        {type: 'int', name: 'typ_oper'},
                        {type: 'int', name: 'tax_mode'},
                        {type: 'string', name: 'tab'},
                    ],
                    data: [
                        {name: 'Платежное поручение', short_name: 'ПП', typ_oper: 0, tax_mode: -1, tab: [1,4,5]},
                        {name: 'Приходный кассовый ордер', short_name: 'ПКО', typ_oper: 1, tax_mode: -1, tab: [1]},
                        {name: 'Расходный кассовый ордер', short_name: 'РКО', typ_oper: 2, tax_mode: -1, tab: [1,4,5]},
                        {name: 'УПД', short_name: 'УПД', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Товарная накладная Торг-12', short_name: 'Торг-12', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Акт', short_name: 'Акт', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Справка-расчет', short_name: 'Справка-расчет', typ_oper: 0, tax_mode: -1, tab: [1,4]},
                        {name: 'Платежное требование', short_name: 'ПТ', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Банковский ордер', short_name: 'БО', typ_oper: 0, tax_mode: -1, tab: [1]},
                        {name: 'Мемориальный ордер', short_name: 'МО', typ_oper: 0, tax_mode: -1, tab: [1]},
                        {name: 'Инкассовое поручение', short_name: 'ИП', typ_oper: 2, tax_mode: -1, tab: [1,4,5]},
                        {name: 'Счет-фактура', short_name: 'Счф', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Счет', short_name: 'Сч.', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Товарный чек', short_name: 'Тов.чек', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Квитанция', short_name: 'Квит.', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Товарно-транспортная накладная', short_name: 'ТТН', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Транспортная накладная', short_name: 'Тр. накл.', typ_oper: 0, tax_mode: 0, tab: [1]},
                        {name: 'Без документа', short_name: 'Без док.', typ_oper: 0, tax_mode: -1, tab: [1,4,5]}
                    ]
                }),
                queryMode: 'local',
                listeners: {
                    change: function () {
                        let me = this, form = me.up('form');
                        if (me.getValue() != form.down('[name=short_name_orig]').getValue()) {
                            form.down('[name=is_dirty]').setValue(1);
                        }
                    }
                }
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-n-doc',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        cls: 'input-number',
                        allowBlank: false,
                        name: 'n_doc',
                        width: 140,
                        listeners: {
                            blur: function () {
                                let me = this, form = me.up('form');
                                if (me.getValue() != form.down('[name=n_doc_orig]').getValue()) {
                                    form.down('[name=is_dirty]').setValue(1);
                                }
                            }
                        }
                    },
                    {
                        xtype: 'gbs_date',
                        name: 'doc_date',
                        allowBlank: false,
                        width: 140,
                        listeners: {
                            blur: function () {
                                let me = this, form = me.up('form');
                                if (me.getValue() != form.down('[name=date_orig]').getValue()) {
                                    form.down('[name=is_dirty]').setValue(1);
                                }
                            }
                        }
                    }
                ],
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-dir',
            title: 'Содержание операции',
            itm: {
                xtype: 'sprav_tool',
                name: 'id_sod',
                emptyText: 'Выберите',
                id_sprav: 541,
                fid: 'id_sod',
                fnm: 'operation',
                width: 520,
                allowBlank: true,
                listeners: {
                    change: function () {
                        let me = this, form = me.up('form');
                        if (me.getValue() != form.down('[name=id_sod_orig]').getValue()) {
                            form.down('[name=is_dirty]').setValue(1);
                        }
                    }
                }
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-contragent',
            title: 'Контрагент',
            itm: {
                xtype: 'sprav_tool',
                name: 'id_contra',
                emptyText: 'Выберите',
                id_sprav: 6,
                fid: 'id_contra',
                fnm: 'name_contra',
                width: 520,
                allowBlank: true,
                listeners: {
                    change: function () {
                        let me = this, form = me.up('form');
                        if (me.getValue() != form.down('[name=id_contra_orig]').getValue()) {
                            form.down('[name=is_dirty]').setValue(1);
                        }
                    }
                }
            }
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-payment',
            title: 'Вид взноса',
            itm: {
                xtype: 'gbs_combo',
                name: 'id_op',
                editable: false,
                forceSelection: true,
                width: 520,
                value: '1',
                store: [
                    ['1', 'ОПС'],
                    ['2', 'ОСС'],
                    ['3', 'ОМС'],
                    ['4', 'ФСС травматизм'],
                    ['5', 'Пособия за счет работодателя'],
                    ['6', 'ФСС (добр.)'],
                ],
                listeners: {
                    change: function () {
                        let me = this, form = me.up('form');
                        if (me.getValue() != form.down('[name=id_op_orig]').getValue()) {
                            form.down('[name=is_dirty]').setValue(1);
                        }
                    }
                }
            }
        },
        {
            name: 'docPeriod',
            xtype: 'periodandyear',
            periodUnit: ''
        }
    ],
    listeners: {
        render: function () {
            let me = this, win = me.up('window'), rec = me.getValues(), periodVal = [];

            if (parseInt(rec.id) > 0) {
                me.down('[nm=id_oper]').hide();

                if (rec.is_dirty == 1) {
                    me.down('[name=cnt-rollback]').show();
                    me.down('[name=cnt-gotoDoc]').hide();
                } else {
                    me.down('[name=cnt-rollback]').hide();
                    if (rec.auto == 1) {
                        me.down('[name=cnt-gotoDoc]').show();
                    } else {
                        me.down('[name=cnt-gotoDoc]').hide();
                    }
                }

                if (rec.at_period != null && rec.at_period.length) {
                    periodVal = rec.at_period.split('.');
                }
            } else {
                win.down('[name=editorTBar]').down('[name=checkIskl]').hide();
            }

            if (win.tabId == 1) {
                me.down('[name=cnt-payment]').hide();
                me.down('[name=docPeriod]').hide();

                me.down('[name=id_sod]').typ_dir = rec.id_op;

                if (rec.auto == 2) {
                    me.down('[name=id_sod]').setOff();
                    me.down('[name=id_contra]').setOff();
                } else {
                    me.down('[name=id_sod]').store.proxy.extraParams.filt = win.oper_type;
                    me.down('[name=id_sod]').store.proxy.extraParams.excl = '6,14';
                }
            } else if (win.tabId == 4) {
                me.down('[name=docPeriod]').periodUnit = 'month';
                if (periodVal.length) {
                    me.down('[name=at_period_unit]').setValue(periodVal[0]);
                    me.down('[name=at_year]').setValue(periodVal[1]);
                }
                me.down('[nm=id_oper]').hide();
                me.down('[name=cnt-dir]').hide();
                me.down('[name=cnt-contragent]').hide();
            } else if (win.tabId == 5) {
                me.down('[name=docPeriod]').periodUnit = 'quarter';
                if (periodVal.length) {
                    me.down('[name=at_period_unit]').setValue(periodVal[0]);
                    me.down('[name=at_year]').setValue(periodVal[1]);
                }
                me.down('[nm=id_oper]').hide();
                me.down('[name=cnt-dir]').hide();
                me.down('[name=cnt-contragent]').hide();
                me.down('[name=cnt-payment]').hide();
            }
        },
        validitychange: function (th, valid, eOpts) {
            let win = this.up('window'),
                toolbar = win.down('toolbar');

            if (valid) {
                toolbar.down('button[name=editor_save_btn]').enable();
                toolbar.down('button[name=editor_save_btn]').removeCls("disabled-btn");
                toolbar.down('button[name=editor_save_btn]').addCls("green-btn");
            } else {
                toolbar.down('button[name=editor_save_btn]').disable();
                toolbar.down('button[name=editor_save_btn]').addCls("disabled-btn");
                toolbar.down('button[name=editor_save_btn]').removeCls("green-btn");
            }
        },
        fieldvaliditychange: function () {
            let me = this,
                win = me.up('window'),
                toolbar = win.down('toolbar'),
                errorCount = 0;

            if (parseFloat(me.down('[name=summa]').getValue()) != 0) {
                toolbar.down('[name=error_sum]').hide();
            } else {
                toolbar.down('[name=error_sum]').show();
                errorCount++;
            }

            if (me.down('[name=n_doc]').getValue().length > 0) {
                toolbar.down('[name=error_num_doc]').hide();
            } else {
                toolbar.down('[name=error_num_doc]').show();
                errorCount++;
            }

            if (me.down('[name=doc_date]').getValue() != null) {
                toolbar.down('[name=error_doc_data]').hide();
            } else {
                toolbar.down('[name=error_doc_data]').show();
                errorCount++;
            }

            if (errorCount > 0) toolbar.down('[name=errordata]').show();
            else toolbar.down('[name=errordata]').hide();
        }
    }

});
