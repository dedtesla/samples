/**
 * Форма окна отправки по электронной почте (Buh.classes.window.EmailWindow).
 *
 * @since 04.21
 */
Ext.define('Buh.classes.window.email.Form', {
    extend: 'Ext.form.Panel',
    requires: ['Buh.classes.container.Vertical'],
    itemId: 'emailForm',
    xtype: 'gbsemailform',
    title: 'Отправить по электронной почте',
    bodyCls: 'panel-pad',
    layout: 'form',
    helper: null,
    fileName: null,
    items: [
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Эл.почта получателя',
            itm: [
                {
                    xtype: 'textfield',
                    vtype: 'email',
                    allowBlank: false,
                    name: 'recipientEmail',
                    width: 640,
                    value: '',
                    msgTarget: 'none',
                    enableKeyEvents: true,
                    listeners: {
                        blur: function (inp, recs, e) {
                            let me = this;
                            me.up('form').setReady();
                        },
                        keyup: function (t, e, eOpts) {
                            let me = this;
                            me.up('form').setReady();
                        }
                    }
                }
            ]
        },
        {
            xtype: 'container',
            cls: 'cnt-fio container-align',
            layout: 'hbox',
            items: [
                {
                    xtype: 'textfield',
                    cls: 'fld_fio_1',
                    name: 'lastName',
                    width: 213,
                    emptyText: 'Фамилия'
                },
                {
                    xtype: 'textfield',
                    cls: 'fld_fio_2',
                    name: 'firstName',
                    width: 213,
                    emptyText: 'Имя'
                },
                {
                    xtype: 'textfield',
                    cls: 'fld_fio_3',
                    name: 'middleName',
                    width: 213,
                    emptyText: 'Отчество'
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Тема',
            itm: [
                {
                    xtype: 'textfield',
                    allowBlank: false,
                    name: 'subject',
                    width: 640,
                    value: '',
                    msgTarget: 'none',
                    enableKeyEvents: true,
                    listeners: {
                        blur: function (inp, recs, e) {
                            let me = this;
                            me.up('form').setReady();
                        },
                        keyup: function (t, e, eOpts) {
                            let me = this;
                            me.up('form').setReady();
                        }
                    }
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Эл.почта отправителя',
            itm: [
                {
                    xtype: 'textfield',
                    vtype: 'email',
                    allowBlank: false,
                    name: 'senderEmail',
                    width: 640,
                    value: '',
                    msgTarget: 'none',
                    enableKeyEvents: true,
                    listeners: {
                        blur: function (inp, recs, e) {
                            let me = this;
                            me.up('form').setReady();
                        },
                        keyup: function (t, e, eOpts) {
                            let me = this;
                            me.up('form').setReady();
                        }
                    }
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Текст письма',
            layout: 'fit',
            flex: 1,
            itm: [
                {
                    xtype: 'textarea',
                    allowBlank: false,
                    name: 'message',
                    width: 640,
                    grow: true,
                    value: '',
                    msgTarget: 'none',
                    enableKeyEvents: true,
                    listeners: {
                        blur: function (inp, recs, e) {
                            let me = this;
                            me.up('form').setReady();
                        },
                        keyup: function (t, e, eOpts) {
                            let me = this;
                            me.up('form').setReady();
                        }
                    }
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-file-attachment',
            title: 'Файл',
            itm: [
                {
                    xtype: 'radiogroup',
                    defaultType: 'radio',
                    vertical: true,
                    columns: 1,
                    items: [
                        {
                            boxLabel: 'PDF',
                            name: 'file_ext',
                            inputValue: 'pdf'
                        },
                        {
                            boxLabel: 'XLS',
                            name: 'file_ext',
                            inputValue: 'xls'
                        },
                        {
                            boxLabel: 'DOC',
                            name: 'file_ext',
                            inputValue: 'doc'
                        }
                    ]
                }
            ]
        }
    ],
    dockedItems: [
        {
            xtype: 'toolbar',
            itemId: 'bottomToolbar',
            layout: 'fit',
            dock: 'bottom',
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
                            text: 'Отправить',
                            name: 'email-send-btn',
                            cls: 'green-btn',
                            disabled: true,
                            handler: function () {
                                let me = this, form = me.up('form');
                                form.sendMe();
                            }
                        },
                        {
                            text: 'Отмена',
                            name: 'email-cancel-btn',
                            handler: function () {
                                let me = this;
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
            let me = this, win = me.up('window'), radioGrp = me.down('radiogroup'),
                radioValue = 0;

            me.getForm().setValues(win.config.data);

            me.down('[name=cnt-file-attachment]').setTitle('Файл ' + win.config.data.fileName);
            me.fileName = win.config.data.fileName;

            Ext.each(radioGrp.items.items, function(item, index) {
                if (index === 0 && win.config.data.fileTypes.pdf === false) {
                    item.checked = false;
                    item.hide();
                } else if (index === 0 && win.config.data.fileTypes.pdf === true) {
                    radioValue = 1;
                    item.setValue(true  );
                }

                if (index === 1 && win.config.data.fileTypes.xls === false) {
                    item.checked = false;
                    item.hide();
                } else if (index === 1 && win.config.data.fileTypes.xls === true) {
                    radioValue = iif(radioValue === 0, 2, radioValue);
                    item.setValue(iif(radioValue === 2, true, false));
                }

                if (index === 2 && win.config.data.fileTypes.doc === false) {
                    item.checked = false;
                    item.hide();
                } else if (index === 2 && win.config.data.fileTypes.doc === true) {
                    radioValue = iif(radioValue === 0, 3, radioValue);
                    item.setValue(iif(radioValue === 3, true, false));
                }
            });

            me.setReady();
            me.checkScroll();
        }
    },
    setReady: function () {
        let me = this, tb = me.down('toolbar'),
            notValidField = me.query('textfield{isValid()===false}');

        if (notValidField.length > 0) {
            tb.down('button[name=email-send-btn]').disable();
            return notValidField[0];
        } else {
            tb.down('button[name=email-send-btn]').enable();
            return true;
        }
    },
    sendMe: function () {
        let me = this, btn = me.down('toolbar').down('[name=email-send-btn]'),
            win = me.up('window'), url = win.config.data.action,
            form = win.down('form'), readyGo = me.setReady(),
            radioGrpVal = form.down('radiogroup').getValue();

        if (readyGo === true) {
            btn.setDisabled(true);

            url += "&filetype=" + radioGrpVal.file_ext;
            url += '&rcemail=' + form.down('[name=recipientEmail]').getValue();
            url += '&snemail=' + form.down('[name=senderEmail]').getValue();
            url += '&subject=' + Ext.encode(form.down('[name=subject]').getValue());
            url += '&message=' + Ext.encode(form.down('[name=message]').getValue());
            _ajax(url, {'fifo': fifo, 'hideRNPT': hideRNPT, 'fileName':me.fileName}, function (resp) {
                response = Ext.decode(resp);
                win.close();
                if (response.success == true) {
                    _alert_win('Письмо успешно отправлено.');
                } else {
                    _alert_win('Не удалось отправить письмо. Повторите, пожалуйста.');
                }
            });
        } else readyGo.focus();
    },
    setToolbarToBottom: function () {
        if (!this.up('window').isVisible()) return;
        let me = this,
            body = Ext.getBody(),
            bodyHeight = body.getViewSize().height,
            scrollPosition = body.getScroll(),
            toolbar = me.down('toolbar'),
            parent = toolbar.ownerCt,
            pos = parent.getPosition(),
            height = parent.getHeight(),
            tbheight = toolbar.getHeight() - 1,
            maxtop = height - tbheight,
            top = bodyHeight - pos[1] + scrollPosition.top - tbheight,
            y = Math.min(top, maxtop);
        toolbar.setPosition({x: null, y: y});
    },
    onScroll: function () {
        let me = this;
        me.setToolbarToBottom();
    },
    checkScroll: function () {
        gb247.on('onScroll', function () {
            this.onScroll();
        }, this);
    }
});
