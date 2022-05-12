/**
 * Компонент - кнопка печати документа сделки.
 * Встраивается в тулбар с элементами управления формой -
 * сохранение, отмена редактирования/добавления и тп.
 *
 * Встроено меню:
 * 1. Прямая печать,
 * 2. Выгрузка в pdf,
 * 3. Выгрузка в xls.
 *
 * @param int docId ID документа
 * @param int docType Вид документа (id в наборе данных)
 *
 * #GBS-8394
 * 08.2020
 */
Ext.define('Buh.classes.common.ButtonPrintMenu', {
    extend: 'Ext.Button',
    xtype: 'buttonprintmenu',
    alias: 'widget.buttonprintmenu',
    text: 'Распечатать',
    name: 'printDoc',
    itemId: 'printDocBtn',
    saveUrl: null,
    dealId: null,
    docId: null,
    docType: null,
    _win: null,
    _sb: null,
    form: null,
    crmVars: [],
    url: '',
    cls: 'x-toolbar-item x-noicon x-btn-noicon x-btn-default-small-noicon',
    menu: {
        itemId: 'printDocMenu',
        items: [
            {
                name: 'printDirect',
                text: 'Сохранить и распечатать',
                handler: function () {
                    let me = this.ownerCt.ownerButton;

                    if (Ext.getCmp('doc_dat') != undefined) {
                        let dt_2021_07_01 = new Date('2021-07-01 00:00:00'),
                            dt_doc = new Date(Ext.getCmp('doc_dat').getValue()),
                            countRNPT = 0, _docDocType = this.up('#printDocBtn').docType,
                            _sbType = this.up('#printDocBtn')._sb;

                        if(this.up('window').down('[name=countRNPT]') != undefined)
                            countRNPT = this.up('window').down('[name=countRNPT]').getValue();

                        if (dt_2021_07_01.getTime() <= dt_doc.getTime()) {
                            if (countRNPT > 0) {
                                // GBS-11828. Статистика.
                                if (Ext.Array.contains([4,18,19,26,27], _docDocType)) {
                                    if (_sbType == 100) {
                                        crmEvent('buh', 'ed26bce8-33ad-4489-b9e8-155ea356690e', false, false);
                                    } else {
                                        crmEvent('buh', '9f1de681-cbda-4267-90e9-f51e999b256b', false, false);
                                    }
                                }

                                this.up('buttonprintmenu').docType += 200;
                            }
                            else
                                this.up('buttonprintmenu').docType += 100;
                        }
                    }

                    me.saveAndPrint(0);
                    me.up('window').close();
                }
            },
            {
                name: 'dlPdfFile',
                text: 'Сохранить и скачать PDF',
                handler: function () {
                    let me = this.ownerCt.ownerButton;

                    if (Ext.getCmp('doc_dat') != undefined) {
                        let dt_2021_07_01 = new Date('2021-07-01 00:00:00'),
                            dt_doc = new Date(Ext.getCmp('doc_dat').getValue()),
                            countRNPT = 0, _docDocType = this.up('#printDocBtn').docType,
                            _sbType = this.up('#printDocBtn')._sb;

                        if(this.up('window').down('[name=countRNPT]') != undefined)
                            countRNPT = this.up('window').down('[name=countRNPT]').getValue();

                        if (dt_2021_07_01.getTime() <= dt_doc.getTime()) {
                            if (countRNPT > 0) {
                                // GBS-11828. Статистика.
                                if (Ext.Array.contains([4,18,19,26,27], _docDocType)) {
                                    if (_sbType == 100) {
                                        crmEvent('buh', 'ed26bce8-33ad-4489-b9e8-155ea356690e', false, false);
                                    } else {
                                        crmEvent('buh', '9f1de681-cbda-4267-90e9-f51e999b256b', false, false);
                                    }
                                }

                                this.up('buttonprintmenu').docType += 200;
                            }
                            else
                                this.up('buttonprintmenu').docType += 100;
                        }
                    }
                    me.saveAndPrint(1);
                    me.up('window').close();
                }
            },
            {
                name: 'dlXlsFile',
                text: 'Сохранить и скачать XLS',
                handler: function () {
                    let me = this.ownerCt.ownerButton;

                    if (Ext.getCmp('doc_dat') != undefined) {
                        let dt_2021_07_01 = new Date('2021-07-01 00:00:00'),
                            dt_doc = new Date(Ext.getCmp('doc_dat').getValue()),
                            countRNPT = 0, _docDocType = this.up('#printDocBtn').docType,
                            _sbType = this.up('#printDocBtn')._sb;

                        if(this.up('window').down('[name=countRNPT]') != undefined)
                            countRNPT = this.up('window').down('[name=countRNPT]').getValue();

                        if (dt_2021_07_01.getTime() <= dt_doc.getTime()) {
                            if (countRNPT > 0) {
                                // GBS-11828. Статистика.
                                if (Ext.Array.contains([4,18,19,26,27], _docDocType)) {
                                    if (_sbType == 100) {
                                        crmEvent('buh', 'ed26bce8-33ad-4489-b9e8-155ea356690e', false, false);
                                    } else {
                                        crmEvent('buh', '9f1de681-cbda-4267-90e9-f51e999b256b', false, false);
                                    }
                                }

                                this.up('buttonprintmenu').docType += 200;
                            }
                            else
                                this.up('buttonprintmenu').docType += 100;
                        }
                    }

                    me.saveAndPrint(2);
                    me.up('window').close();
                }
            }
        ]
    },
    initComponent: function() {
        let me = this;
        me.record = Ext.create('Buh.model.global.DealDocPrint');
        me.store = Ext.create('Buh.store.global.DealDocPrintStore');
        me.store.load();
        me.callParent(arguments);
    },
    printDirect: function() {
        let me = this;

        if (Ext.get('iFramePrintDirect') != _dummy) {
            Ext.get('iFramePrintDirect').remove();
        }

        me.buildUrl(['type_doc_convert=pdf', 'directprint=true']);

        if (me.url == _dummy) {
            _alert_win('Ошибка', 'Печать документа недоступна.');
            return false;
        }

        gbsPrintDirect(me.url);
    },
    printPdf: function() {
        let me = this;

        me.buildUrl(['type_doc_convert=pdf']);

        if (me.url == _dummy) {
            _alert_win('Ошибка', 'Печать документа недоступна.');
            return false;
        }

        window.location.href = me.url;
    },
    printXls: function() {
        let me = this;

        me.buildUrl();

        if (me.url == _dummy) {
            _alert_win('Ошибка', 'Печать документа недоступна.');
            return false;
        }

        window.location.href = me.url;
    },
    buildUrl: function(extArgs) {
        let me = this,
            doc = me.store.getById(me.docType);

        extArgs = extArgs || [];

        if (doc == _dummy || me.docId == _dummy) {
            _alert_win('Ошибка', 'Печать документа недоступна.');
            return false;
        }

        me.url = dir_start_buh_ + doc.data.url + '?id=' + me.docId + '&pict=1' + iif(extArgs.length, '&' + extArgs.join('&'), '');
    },
    setUrl: function(url) {
        let me = this;
        me.saveUrl = url;
    },
    setForm: function(form) {
        let me = this;
        me.form = form;
    },
    saveAndPrint: function(prnt) {
        let me = this;
        let win = me.up('window');

        let notValidField = win.query('numberfield{isValid()===false}');
        if (notValidField.length == 0) {
            notValidField = win.query('textfield{isValid()===false}');
        }

        if (notValidField.length > 0) {
            notValidField[0].focus();
            return 0;
        } else {
            win.down('button[name=saveDoc]').disable();
            win.down('button[name=printDoc]').disable();
        }

        let prntMethod = prnt || 0;
        let form = me.form;
        form.submit({
            submitEmptyText: false,
            url: me.saveUrl,
            success: function (form, action) {
                me.docId = action.result.data.id;
                if (prntMethod === 0) {
                    me.printDirect();
                } else if (prntMethod === 1) {
                    me.printPdf();
                } else if (prntMethod === 2) {
                    me.printXls();
                }
                me._win.refreshDoc();
            }
        });

        if (me.crmVars.length) {
            pushCRMVariables(me.crmVars.doc, eval(me.crmVars.start), eval(me.crmVars.fin), me.dealId);
        }
    }
});
