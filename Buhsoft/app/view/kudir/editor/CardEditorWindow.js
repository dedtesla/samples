Ext.define('Buh.view.kudir.editor.CardEditorWindow', {
    constructor: function () {
        let args = arguments[0],
            _action = args._action || 'edit',
            _data = args._data || {},
            _tabId = args._tabId || false,
            _typeCard = args._typeCard || 0;

        if (!_tabId) return false;
        else this.tabId = _tabId;

        this.action = _action;
        this.data = _data;
        this._typeCard = _typeCard;

        this.callParent(arguments);

        this.renderTo = args.renderTo;
    },
    extend: 'Gbs.window',
    customclosable: false,
    requires: ['Buh.view.kudir.grid.GridCardSection2', 'Buh.view.kudir.editor.FormCard'],
    alias: 'widget.editcardkudirpopup',
    id: 'kudirCardEditor',
    resizable: false,
    header: false,
    x: 248,
    y: 0,
    cls: 'style2018 window_personal-card account_window kudir_window',
    modal: false,
    layout: 'form',
    title: '',
    editProcessing: false,
    items: [
        {
            xtype: 'container',
            name: 'docPanel',
            cls: 'block_card-header',
            items:
                [
                    {
                        'xtype': 'container',
                        'cls': 'bill-header',
                        'layout': 'hbox',
                        items: [
                            {
                                xtype: 'box',
                                cls: 'b-head',
                                id: 'winCardEditorTitle',
                                name: 'winTitle',
                                html: '<span></span>'
                            }
                        ]
                    },
                    {
                        'xtype': 'container',
                        'cls': 'block_small-btn',
                        'layout': 'hbox',
                        'items': [
                            {
                                xtype: 'container',
                                name: 'cardStateAdded',
                                html: '<span class="small-grey-info">Добавлено</span>'
                            },
                            {
                                xtype: 'container',
                                name: 'cardStateExcluded',
                                html: '<span class="small-grey-info">Исключено</span>'
                            },
                            {
                                xtype: 'button',
                                cls: 'grey-btn',
                                text: 'Исключить',
                                name: 'cardBtnExclude',
                                handler: function () {
                                    let win = Ext.getCmp('kudirCardEditor'),
                                        tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
                                        grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']'),
                                        _title = Ext.getCmp('winCardEditorTitle');

                                    if (win.data.id > 0) {
                                        let fn = function () {
                                            _fn = function () {
                                                win.down('[name=kudirCardEditorForm]').down('[name=iskl]').setValue(1);

                                                win.down('[name=cardBtnExclude]').hide();
                                                win.down('[name=cardBtnInclude]').show();
                                                win.down('[name=cardStateExcluded]').show();
                                                selectedRecord = grid.getSelectionModel().getSelection();
                                                grid.store.reload();
                                                grid.getSelectionModel().select(selectedRecord[0]);

                                                let dt = new Date(new Date());
                                                if (_title != _dummy) _title.el.dom.innerHTML = win.title + '<span>Сохранено в Книге в ' + Ext.Date.format(dt, "H:i") + '</span>';
                                            };
                                            _ajax(dir_start_buh_ + 'kudir_process.php', {
                                                action: 'exclude',
                                                id: win.data.id
                                            }, _fn);
                                        };

                                        fn();
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                cls: 'grey-btn',
                                text: 'Вернуть',
                                name: 'cardBtnInclude',
                                handler: function () {
                                    let win = Ext.getCmp('kudirCardEditor'),
                                        tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
                                        grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']'),
                                        _title = Ext.getCmp('winCardEditorTitle');

                                    if (win.data.id > 0) {
                                        let fn = function () {
                                            _fn = function () {
                                                win.down('[name=kudirCardEditorForm]').down('[name=iskl]').setValue(0);

                                                win.down('[name=cardBtnExclude]').show();
                                                win.down('[name=cardBtnInclude]').hide();
                                                win.down('[name=cardStateExcluded]').hide();
                                                selectedRecord = grid.getSelectionModel().getSelection();
                                                grid.store.reload();
                                                grid.getSelectionModel().select(selectedRecord[0]);

                                                let dt = new Date(new Date());
                                                if (_title != _dummy) _title.el.dom.innerHTML = win.title + '<span>Сохранено в Книге в ' + Ext.Date.format(dt, "H:i") + '</span>';
                                            };
                                            _ajax(dir_start_buh_ + 'kudir_process.php', {
                                                action: 'include',
                                                id: win.data.id
                                            }, _fn);
                                        };

                                        fn();
                                    }
                                }
                            },
                            {
                                xtype: 'button',
                                cls: 'grey-btn',
                                text: 'Удалить',
                                name: 'cardBtnDelete',
                                handler: function () {
                                    let win = Ext.getCmp('kudirCardEditor'),
                                        tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
                                        grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']');

                                    if (win.data.id > 0) {
                                        let msg= 'Удалится запись ' + win.title + '.';

                                        let _confirm = Ext.create('Buh.view.kudir.service.Confirm', {
                                            title: 'Удалить запись в Книге?',
                                            msg: msg,
                                            btn1: 'Удалить',
                                            fn1: function () {
                                                _fn = function () {
                                                    win.close();
                                                    grid.store.reload();
                                                };
                                                _ajax(dir_start_buh_ + 'kudir_process.php', {action: 'delete', id: win.data.id, tab: tab}, _fn);
                                            },
                                        });

                                        _confirm.show();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        xtype: 'box',
                        cls: 'close_tool',
                        listeners: {
                            render: function () {
                                let me = this, win = me.up('window');
                                me.mon(me.el, "click", function () {
                                    win.close();
                                }, me);
                            }
                        }
                    }
                ]
        },
        {
            xtype: 'container',
            layout: 'vbox',
            items: [
                {
                    xtype: 'kudircardsection2'
                }
            ]
        },
        {
            xtype: 'kudirrecordcardform'
        }
    ],
    listeners: {
        afterrender: function () {
            let me = this, _title = Ext.getCmp('winCardEditorTitle');

            if (me.action == "add") {
                me.setTitle(iif(me._typeCard == 0, 'Новое ОС', 'Новое НМА'));
                _title.el.dom.innerHTML = me.title;

                me.down('[name=cardStateAdded]').show();
                me.down('[name=cardStateExcluded]').hide();
                me.down('[name=cardBtnExclude]').hide();
                me.down('[name=cardBtnInclude]').hide();
                me.down('[name=cardBtnDelete]').hide();
            } else {
                me.setTitle(me.data.name);
                _title.el.dom.innerHTML = me.title;

                if (me.data.auto == 0) {
                    me.down('[name=cardStateAdded]').show();
                    me.down('[name=cardBtnDelete]').show();
                } else {
                    me.down('[name=cardStateAdded]').hide();
                    me.down('[name=cardBtnDelete]').hide();
                }

                if (me.data.iskl == 0) {
                    me.down('[name=cardBtnExclude]').show();
                    me.down('[name=cardBtnInclude]').hide();
                    me.down('[name=cardStateExcluded]').hide();
                } else {
                    me.down('[name=cardBtnExclude]').hide();
                    me.down('[name=cardBtnInclude]').show();
                    me.down('[name=cardStateExcluded]').show();
                }
            }

            me.editProcessing = false;
            me.fillForm();
        }
    },
    fireResize: function (w, h) {
        let me = this,
            gs = me.down('[name=grdCardSection]'),
            size = Ext.getBody().getViewSize(),
            needheight = size.height - this.y - 101,
            needwidth = size.width - this.x;

        me.setWidth(needwidth);
        me.setHeight(needheight);
        if (gs != null) {
            gs.setHeight(needheight - 160);
            gs.setWidth(needwidth);
        }
        me.doLayout();
    },
    fillForm: function () {
        let me = this, form = me.down('form'), grid = me.down('[name=grdCardSection]'), rec;

        if (me.action == "edit") {
            _ajax(dir_start_buh_ + 'kudir_process.php', {
                    action: 'getCardData',
                    id: me.data.id
                }, function (resp) {
                    let response = Ext.decode(resp);
                    form.getForm().setValues(response.data);
                    rec = form.getForm().getValues();

                    grid.down('componentcolumn').down('[name=card_1]').setValue(rec.kat);
                    grid.down('componentcolumn').down('[name=card_2]').setValue(rec.name);
                    grid.down('componentcolumn').down('[name=card_3]').setValue(rec.datepayed);
                    grid.down('componentcolumn').down('[name=card_4]').setValue(iif(rec.datgr != '00.00.0000', rec.datgr, ''));
                    grid.down('componentcolumn').down('[name=card_5]').setValue(rec.datvv);
                    grid.down('componentcolumn').down('[name=card_6]').setValue(rec.base_cost);
                    grid.down('componentcolumn').down('[name=card_7]').setValue(rec.yrexp);
                    grid.down('componentcolumn').down('[name=card_8]').setValue(rec.ost);
                    grid.down('componentcolumn').down('[name=card_9]').setValue(rec.qtexp);
                    grid.down('componentcolumn').down('[name=card_10]').setValue(100);
                    let _pc = iif(rec.qtexp > 0, 100 / rec.qtexp);
                    grid.down('componentcolumn').down('[name=card_11]').setValue(_pc.toFixed(2));
                    grid.down('componentcolumn').down('[name=card_12]').setValue(rec.quarter_fees);
                    grid.down('componentcolumn').down('[name=card_13]').setValue(rec.tax_fees);
                    grid.down('componentcolumn').down('[name=card_14]').setValue(rec.previous_fees);
                    grid.down('componentcolumn').down('[name=card_15]').setValue(rec.future_fees);
                    grid.down('componentcolumn').down('[name=card_16]').setValue(iif(rec.datvyb != '00.00.0000', rec.datvyb, ''));

                    me.editProcessing = true;
                });
        } else {
            form.down('[name=rectype]').setValue(me._typeCard);
            form.down('[name=kat]').setValue('5');
            form.down('[name=name]').setValue(me.title);
            me.editProcessing = true;
            me.saveCard();
        }
    },
    saveCard: function () {
        let me = this, _form = me.down('form'), _title = Ext.getCmp('winCardEditorTitle'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']'),
            cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

        if (me.editProcessing == true) {
            if (me.data.id == 0 || me.data.id == _dummy || me.action == 'add') {
                _form.down('[name=is_dirty]').setValue(0);
            } else {
                _form.down('[name=is_dirty]').setValue(1);
            }

            _form.submit({
                submitEmptyText: true,
                url: dir_start_buh_ + 'kudir_process.php',
                params: {
                    action: 'saveCard',
                    mode: me.action,
                    year: cbYear.getValue()
                },
                success: function (form, action) {
                    if (me.data.id == 0 || me.data.id == _dummy) {
                        me.data.id = action.result.data.id;
                        _form.down('[name=id]').setValue(me.data.id);
                    }
                    dt = new Date(new Date());
                    if (_title != _dummy) _title.el.dom.innerHTML = me.title + '<span>Сохранено в Книге в ' + Ext.Date.format(dt, "H:i") + '</span>';
                    grid.store.reload();
                }
            });
        }
    }
});
