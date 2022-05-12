Ext.define('Buh.view.kudir.editor.TBar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'kudireditrecordbar',
    layout: 'vbox',
    name: 'editorTBar',
    dock: 'bottom',
    items: [
        {
            xtype: 'container',
            name: 'errordata',
            cls: 'bottom-block_alert-info',
            layout: 'hbox',
            defaultType: 'button',
            defaults: {
                componentCls: 'x-toolbar-item'
            },
            items: [
                {
                    xtype: 'label',
                    cls: 'btn-sel-blue color-orange',
                    text: 'Не введено:'
                },
                {
                    text: 'Сумма',
                    name: 'error_sum',
                    cls: 'btn-sel-blue color-orange',
                    handler: function (el) {
                        let me = this;
                        me.up('window').down('form').down('[name=summa]').focus();
                    }
                },
                {
                    text: 'Номер документа',
                    name: 'error_num_doc',
                    cls: 'btn-sel-blue color-orange',
                    handler: function (el) {
                        let me = this;
                        me.up('window').down('form').down('[name=n_doc]').focus();
                    }
                },
                {
                    text: 'Дата документа',
                    name: 'error_doc_data',
                    cls: 'btn-sel-blue color-orange',
                    handler: function (el) {
                        let me = this;
                        me.up('window').down('form').down('[name=doc_date]').focus();
                    }
                }
            ],
            addFieldCls: function (cls) {
                var me = this,
                    items = me.items.items,
                    i;
                for (i = 0; i < items.length; i++) {
                    items[i].addCls(cls);
                }
            },
            removeFieldCls: function (cls) {
                var me = this,
                    items = me.items.items,
                    i;
                for (i = 0; i < items.length; i++) {
                    items[i].removeCls(cls);
                }
            }
        },
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaultType: 'button',
                    defaults: {
                        componentCls: 'x-toolbar-item'
                    },
                    items: [
                        {
                            text: 'Сохранить',
                            action: 'saveeditor',
                            name: 'editor_save_btn',
                            cls: 'green-btn',
                        },
                        {
                            text: 'Отмена',
                            name: 'editor_cancel_btn',
                            action: 'cancelwindow',
                        },
                        {
                            xtype: 'tbfill'
                        },
                        {
                            itemId: 'iskl',
                            xtype: 'green-cbox',
                            name: 'checkIskl',
                            boxLabelAlign: 'after',
                            checked: false,
                            boxLabel: 'Исключенная запись',
                            width: 200,
                            handler: function () {
                                let me = this;
                                me.up('window').down('form').down('[name=iskl]').setValue(iif(me.checked == true, 1, 0));
                            }
                        },
                        {
                            text: 'Удалить',
                            xtype: 'button',
                            name: 'deleteRecord',
                            icon: '/img/ico-delete24.png',
                            handler: function () {
                                let me = this,
                                    tab = me.up('window').tabId,
                                    grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']');

                                grid.fireEvent('delete', me.up('window').down('form').getForm().getValues());
                                me.up('window').close();
                            }
                        }
                    ]
                }
            ]
        }
    ],
    listeners: {
        afterrender: function () {
            let me = this, win = me.up('window');
            if (win.down('form').down('[name=auto]').getValue() == 2) {
                me.down('[name=checkIskl]').show();
                me.down('[name=deleteRecord]').hide();
            } else {
                me.down('[name=checkIskl]').hide();
                if (win.action == 'edit') {
                    me.down('[name=deleteRecord]').show();
                } else {
                    me.down('[name=deleteRecord]').hide();
                }
            }
        }
    }
});
