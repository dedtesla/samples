/**
 * Форма окна мастера Акта сверки с контрагентом (Buh.view.reconciliationreport.Panel).
 *
 * @since 04.21
 */
Ext.define('Buh.view.reconciliationreport.Form', {
    extend: 'Ext.form.Panel',
    requires: ['Buh.classes.container.Vertical', 'Buh.classes.container.DateInterval',
        'Buh.classes.help.ButtonAsk', 'Buh.classes.sprav.RRContragentTool'],
    alias: 'widget.rrForm',
    name: 'rrPanel',
    title: 'Акт сверки',
    layout: 'form',
    id: 'rrStartWin',
    items: [
        {
            'xtype': 'container',
            'cls': 'container-align',
            'itemId': 'rrCalendar',
            items: [
                {
                    'xtype': 'label',
                    'html': 'Период'
                }
/*
                {
                    xtype: 'contdateinterval',
                    listeners: {
                        afterrender: function () {
                            let me = this, _date = new Date,
                                _y = _date.getFullYear(), _m = _date.getMonth(),
                                dt1 = new Date(_y, 0, 1), dt2 = new Date();
                            me.down('#kf_date_beg').setValue(dt1);
                            me.down('#kf_date_end').setValue(dt2);
                        }
                    }
                }
*/
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit1',
            title: 'Контрагент или группа контрагентов',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Начните вводить наименование для поиска или выберите значение.<br><br>' +
                        'Для выбора нескольких контрагентов добавьте их в одну группу в справочнике Контрагенты. ' +
                        'Программа составит акт за группу как если бы это был один контрагент. Это удобно, к примеру, ' +
                        'когда разными контрагентами заведены обособленные подразделения одного юр.лица.'
                },
                {
                    xtype: 'rrcontra_groups',
                    name: 'id_contra',
                    fid: 'id_contra',
                    fnm: 'name_contra',
                    emptyText: 'Выбрать или ввести',
                    btnSpravShow: false,
                    btnAuxSpravShow: false,
                    _auxNameText: ' (группа)',
                    store:  Ext.create('Buh.store.reconciliationreport.RRContragentGroupStore')
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-contra_main',
            title: 'Главный контрагент в группе',
            hidden: true,
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Этот контрагент будет в шапке печатной формы акта сверки, его директор будет подписантом, а также в его адрес отправляется файл акта по ЭДО или почте.'
                },
                {
                    xtype: 'gbs_combo',
                    name: 'id_contra_main',
                    editable: false,
                    displayField: 'name',
                    valueField: 'id',
                    forceSelection: true,
                    width: 640,
                    store: Ext.create('Buh.store.reconciliationreport.RRContragentStore')
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit2',
            title: 'Договор',
            itm: [
                {
                    xtype: 'buttonask',
                    text: 'Выбрать можно несколько договоров.<br>Тогда в акте по ним будут отдельные блоки с расчетами и итогами.'
                },
                {
                    xtype: 'gbs_combo',
                    emptyText: 'Сначала выберите контрагента',
                    queryMode: 'local',
                    triggerAction: 'all',
                    multiSelect: true,
                    delimiter: ', ',
                    name: 'rrAgreement',
                    store: Ext.create('Buh.store.reconciliationreport.RRAgreementStore'),
                    displayField: 'name',
                    valueField: 'id',
                    width: 640,
                    editable: false,
                    disabled: true,
                    defaultListConfig: {
                        cls: 'style2018 boundlist-multi',
                    },
                    listeners: {
                        change: function (el) {
                            let me = this, picker = me.picker, rec;

                            if (picker != undefined && picker.isVisible()) {
                                rec = picker.getSelectionModel().getLastSelected();
                                if (Ext.Array.contains([0,-1], rec.data.id)) {
                                    me.setValue(rec.data.id);
                                    me.collapse();
                                } else if (me.getValue().length > 1) {
                                    if (Ext.Array.contains(me.getValue(), 0) ||
                                        Ext.Array.contains(me.getValue(), -1)) {
                                        me.setValue(rec.data.id);
                                        if (Ext.Array.contains([0,-1], rec.data.id)) me.collapse();
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-employee',
            title: 'Ответственный за акт в ' + our_org_name,
            itm: [
                {
                    xtype: 'sprav_tool',
                    name: 'otvc',
                    emptyText: 'Выбрать или добавить',
                    id_sprav: 7,
                    alias: 'otv',
                    prefix: 'os_',
                    value_of_combo: 'nms',
                    blank: 'blank',
                    button1_br: true,
                    button2: false,
                }
            ]
        },
        {
            xtype: 'cont_vert',
            name: 'cnt-me-only',
            layout: 'hbox',
            itm: [
                {
                    xtype: 'checkbox',
                    name: 'fillMeOnly',
                    boxLabelAlign: 'after',
                    checked: false,
                    boxLabel: 'Не заполнять расчеты за контрагента',
                },
                {
                    xtype: 'buttonask',
                    text: 'По умолчанию программа заполняет акт и за контрагента.<br>' +
                        'Проставьте галочку, если  заполнять акт за контрагента не нужно.'
                }
            ]
        },
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
                            text: 'Скачать PDF',
                            action: 'downloadPdf',
                            name: 'downloadPdfBtn',
                            cls: 'green-btn',
                            disabled: true
                        },
                        {
                            text: 'Скачать XLS',
                            action: 'downloadXls',
                            name: 'downloadXlsBtn',
                            cls: 'grey-btn',
                            disabled: true
                        },
                        {
                            text: 'Отправить',
                            name: 'sendBtn',
                            disabled: true,
                            menuAlign: 'bl-tl',
                            menu: [
                                {
                                    text: '<b>Сохранить и отправить</b>',
                                    canActivate: false,
                                    hideOnClick: false,
                                    handler: function (e) {
                                        return false;
                                    }
                                },
                                {
                                    text: '<span style="margin-left: 19px">PDF через ЭДО</span>',
                                    icon: dir_start_buh_ + 'img/invite-gray-icon.svg',
                                    handler: function () {
                                        let me = this;
                                        me.up('form').fireEvent('goEDO');
                                    }
                                },
                                {
                                    text: 'PDF или XLS по эл.почте',
                                    handler: function () {
                                        let me = this;
                                        me.up('form').fireEvent('goEmail');
                                    }
                                }
                            ]
                        },
                        {
                            text: 'Отмена',
                            xtype: 'button',
                            action: 'cancelWindow',
                        },
                    ]
                }
            ]
        }
    ],
    listeners: {
        afterrender: function () {
            let me = this,/* index = container.items.indexOf(component),*/
                _cmp = Ext.getCmp('rrStartWin').down('[itemId=rrCalendar]'),
                cntDt = askPeriodGbs("periodRR"), dt = new Date,
                dt1 = new Date(dt.getFullYear(), 0, 1),
                dt2 = new Date(dt.getFullYear(), 11, 31);

            _cmp.insert(1, cntDt);

            Ext.getCmp('periodRR_dat_doc1').setValue(dt1);
            Ext.getCmp('periodRR_dat_doc2').setValue(dt2);

            me.checkScroll();
        }
    },
    setToolbarToBottom: function () {
        if (!this.up('window').isVisible()) return;
        let me = this,
            body = Ext.getBody(),
            bodyHeight = body.getViewSize().height,
            scrollPosition = body.getScroll(),
            toolbar = me.down('toolbar'),
            parent = me.ownerCt,
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
    },
    setReady: function () {
        let me = this, tb = me.down('toolbar');
        tb.down('button[name=downloadPdfBtn]').setDisabled(false);
        tb.down('button[name=downloadXlsBtn]').setDisabled(false);
        tb.down('button[name=sendBtn]').setDisabled(false);
    },

});
