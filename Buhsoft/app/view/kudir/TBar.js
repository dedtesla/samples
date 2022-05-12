/**
 * Верхняя панель инструментов Книги доходов и расходов.
 *
 * GBS-6829|8558|14108
 * @since 08/20
 */
Ext.define('Buh.view.kudir.TBar', {
    extend: 'Ext.toolbar.Toolbar',
    requires: ['Buh.classes.combo.ComboDateIntervalKudir'],
    alias: 'widget.kudirtbar',
    xtype: 'toolbar',
    dock: 'top',
    cls: 'container-align-small',
    items: [
        {
            xtype: 'button',
            cls: 'grey-btn',
            text: 'Заполнить',
            action: 'fillbook',
            itemId: 'btnFillKudir'
        },
        {
            xtype: 'gbs_combo_year',
            itemId: 'cmbYear'
        },
        {
            xtype: 'combo_interval_kudir',
            action: 'setbookinterval'
        },
        {
            text: 'Фильтр',
            xtype: 'button',
            name: 'filterButton',
            icon: '/img/filter-icon.svg',
            filterData: {},
            filterCount: 0,
            action: 'openfilterform',
            minWidth: 98
        },
        {
            xtype: 'button',
            text: 'Печать',
            icon: _icons.print,
            action: 'printbook'
        },
        {
            text: 'Проверить',
            xtype: 'button',
            icon: '/img/dgrey-galka.svg',
            action: 'checkbook',
            hidden: true
        },
        {
            text: 'Добавить запись',
            xtype: 'button',
            name: 'editorButton',
            icon: '/img/gplus-icon.svg',
            action: 'openaddbookrecord',
            menu: [
                {
                    text: 'Новое ОС',
                    action: 'addFixedAssets',
                    width: 160,
                    handler: function () {
                        let _owner = Ext.getCmp('mainPanelKudir'),
                            tab = _owner.down('tabpanel').activeTab.itemId,
                            _constrain = _owner._owner,
                            win = Ext.create('Buh.view.kudir.editor.CardEditorWindow', {'_action': 'add', '_tabId': tab, '_typeCard': 0, 'renderTo': _constrain});

                        win.on({
                            activate: function (el) {
                                el.fireResize();
                            }
                        });

                        crmEvent('buh', '8D119466-A5B5-436B-A474-BA994EA71939', false, false);

                        Ext.EventManager.onWindowResize(win.fireResize, win);
                        win.show();
                    }
                },
                {
                    text: 'Новое НМА',
                    action: 'addIntangibleAssets',
                    width: 160,
                    handler: function () {
                        let _owner = Ext.getCmp('mainPanelKudir'),
                            tab = _owner.down('tabpanel').activeTab.itemId,
                            _constrain = _owner._owner,
                            win = Ext.create('Buh.view.kudir.editor.CardEditorWindow', {'_action': 'add', '_tabId': tab, '_typeCard': 1, 'renderTo': _constrain});

                        win.on({
                            activate: function (el) {
                                el.fireResize();
                            }
                        });

                        crmEvent('buh', '8D119466-A5B5-436B-A474-BA994EA71939', false, false);

                        Ext.EventManager.onWindowResize(win.fireResize, win);
                        win.show();
                    }
                }
            ],
            listeners: {
                click: function () {
                    let me = this,
                        win = Ext.getCmp('mainPanelKudir');

                    if (win.down('tabpanel').activeTab.itemId != 2) {
                        me.hideMenu();
                    }
                }
            }
        },
        {
            xtype: "button",
            name: 'help_button',
            cls: 'btn_ico-vopros',
            style: 'margin-top: 5px',
            action: 'askhelp',
            listeners: {
                click: function () {
                    window.open("https://b.docs247.ru/#/document/16/73558");
                }
            }
        },
        {
            xtype: 'tbfill'
        },
        {
            text: 'Рассчитать УСН',
            xtype: "button",
            name: 'calcEn',
            class: 'float-right',
            icon: '/img/gray-calc-icon.svg',
            listeners: {
                click: function () {
                    let win = Ext.getCmp('mainPanelKudir');

                    _ajax(
                        dir_start_buh_ + 'kudir_process.php',
                        {
                            action: 'saveState',
                            namefield: 'yeartocalcen',
                            data: win.yearToHold
                        }, function (resp) {
                            crmEvent('buh', 'A0913101-C7F2-47FA-90EA-DD11E5A4BB97', false, false);
                            openEN();
                        }
                    );
                }
            }
        },
        {
            text: 'Детализация',
            xtype: "button",
            class: 'float-right',
            menu: [
                {
//                    text: 'Отчет по списанию товаров',
                    text: 'Отчет будет доступен в ближайшее время.<br>Пока рекомендуем пользоваться расшифровкой по <br>каждой строке операций <br>Расходы на приобретение товаров.',

                    /*
                                        handler: function () {
                                            let _printReportConfirm = Ext.create('Buh.view.kudir.service.PrintReportConfirm');
                                            _printReportConfirm.show();
                                        }
                                        */
                }
            ]
        },
    ],
    listeners: {
        afterrender: function () {
            let me = this, _owner = Ext.getCmp('mainPanelKudir'),
                _year = _owner.down('toolbar').down('gbs_combo_year'),
                cbPeriod = _owner.down('toolbar').down('combo_interval_kudir'), yearSaved;

            yearSaved = _owner.yearToHold;
            yearSaved = iif(parseInt(yearSaved) > 0, yearSaved, currYearMax);
            _year.setValue(yearSaved);
            if (_owner.periodToHold > 0) {
                cbPeriod.setValue(_owner.periodToHold);
            }

            if (me.down('[name=help_button]') != null && me.down('[name=help_button]') != undefined) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.down('[name=help_button]').getId(),
                    html: 'Инструкция в справочной системе Бухсофт',
                    showDelay: 300
                });
            }

/*
            if (me.down('[name=calcEn]') != null && me.down('[name=calcEn]') != undefined) {
                me.down('[name=calcEn]').on('click', function () {
                    crmEvent('buh', 'A0913101-C7F2-47FA-90EA-DD11E5A4BB97', false, false);
                    openEN(parseInt(yearSaved));
                });
            }
*/
        }
    }
});
