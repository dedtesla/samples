/**
 * Окно заполнения КУДиР.
 *
 * Функционал.
 * 1. Выбор периода заполнения.
 * Синхронизирован с быстрым фильтром (Период) основной экранной формы КУДиР.
 * После заполнения обновляет грид основной экранной формы в соответствии с
 * выбранным периодом.
 *
 * 2. Резервирование КУДиР.
 * 2.1. Автоматическое создание копии КУДиР перед заполнением.
 * 2.2. Восстановление КУДиР из указанной пользователем копии.
 *
 * 3. Блок управления автозаполнением.
 * Пользователь самостоятельно принимает решение:
 * а) Удалить/сохранить записи, добавленные вручную.
 * б) Удалить/сохранить записи, добавленные автоматически, но исправленные вручную.
 * в) Удалить/сохранить записи, добавленные автоматически, но исключенные.
 * Пользователь может также указать, какие записи обрабатывать - везде или только
 * в определенных разделах КУДиР.
 *
 * 4. Кнопка старта заполнения.
 * 5. Кнопка отмены заполнения.
 */
Ext.define('Buh.view.kudir.service.ConditionalConfirm', {
    extend: 'winEditDoc',
    cls: 'style2018 init_window toolbar-highlight',
    requires: ['Buh.classes.container.KudirFillPreset'],
    modal: true,
    width: 600,
    btn1: 'Заполнить',
    btn2: 'Отмена',
    msg: '',
    d_beg: '',
    d_end: '',
    year: null,
    tax_mode: null,
    _data: {},
    _grid: null,
    fn1: '',
    initComponent: function () {
        let me = this,
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            year = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

        cbPeriod.year = year.getValue();

        Ext.define('msg.Form', {
            extend: 'gbs.window.Form',

            initComponent: function () {
                Ext.apply(this, {
                    title: 'Заполнение Книги доходов и расходов',
                    items: [
                        {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [
                                {
                                    xtype: 'label',
                                    html: 'За период',
                                }, {
                                    xtype: 'tbfill',

                                }, {
                                    xtype: 'button',
                                    text: 'Восстановить сохраненную версию',
                                    id: 'btn_restore_dir_version',
                                    cls: 'btn-time_link',
                                    handler: function () {
                                        if (Ext.getCmp('windowRestoreDiRSelector')) {
                                            Ext.getCmp('windowRestoreDiRSelector').close();
                                        }
                                        let comp = this,
                                            winOwner = this.up('window'),
                                            win = Ext.create('Buh.classes.dir.backupWin'),
                                            per = this.up('form').down('[name=periodCondition]');
                                        win.fillWindow(0);
                                        win.afterAction = function () {
                                            let mainPanel = Ext.getCmp('mainPanelKudir');
                                            mainPanel.down('#tpKudir').fireEvent('tabchange', mainPanel.down('#tpKudir'), mainPanel.down('#tpKudir').getActiveTab());
                                            win.close();
                                            winOwner.close();
                                        };
                                        win.showBy(comp, 'bl-tl?', [0, 7]);
                                    }
                                }]
                        }, {
                            xtype: 'gbs_combo',
                            name: 'periodCondition',
                            editable: false,
                            valueField: 'id',
                            displayField: 'name',
                            queryMode: 'local',
                            width: 190,
                            cls: 'container-align',
                            value: cbPeriod.getValue(),
                            store: Ext.create('Ext.data.Store', {
                                fields: [
                                    {type: 'int', name: 'id'},
                                    {type: 'string', name: 'name'},
                                ],
                                data: [
                                    {id: 1, name: 'За I квартал'},
                                    {id: 2, name: 'За II квартал'},
                                    {id: 3, name: 'За III квартал'},
                                    {id: 4, name: 'За IV квартал'},
                                    {id: 6, name: 'За полугодие'},
                                    {id: 9, name: 'За 9 месяцев'},
                                    {id: 12, name: 'За год'}
                                ]
                            }),
                            tpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                '<tpl if="xindex == 5">',
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
                            listeners: {
                                change: function () {
                                    let me = this, tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
                                        cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
                                        _win = me.up('window'), _presetCmp = _win.down('kudirfillpreset');

                                    if (tab != 2) {
                                        cbPeriod.setValue(me.getValue());
                                        cbPeriod.reconfig(tab, me.getValue());
                                    } else if (tab == 2 && me.getValue() <= 4) {
                                        cbPeriod.setValue(me.getValue());
                                        cbPeriod.reconfig(tab, me.getValue());
                                    }

                                    let fn = function (response) {
                                        let r = Ext.JSON.decode(response);
                                        _presetCmp.presetCache = r.data;
                                        _presetCmp.validateParentCheckBox(true);
                                    }

                                    _ajax(dir_start_buh_ + 'kudir_process.php', {
                                        action: 'getFillPreset',
                                        d_beg: cbPeriod.periodStartDate,
                                        d_end: cbPeriod.periodEndDate,
                                        tax_mode: _win.tax_mode
                                    }, fn);
                                }
                            }
                        },
                        {
                            xtype: 'container',
                            cls: 'container-align',
                            items: [{
                                xtype: 'kudirfillpreset'
                            }]
                        }
                    ],
                    dockedItems: [{
                        xtype: 'toolbar',
                        dock: 'bottom',
                        ui: 'footer',
                        items: [
                            {
                                text: me.btn1,
                                xtype: 'greenbuttonsimple',
                                scope: this,
                                handler: this.onBtn1
                            },
                            {
                                text: me.btn2,
                                scope: this,
                                handler: this.onCancel
                            }
                        ]
                    }]
                });

                this.callParent();
            },
            onBtn1: function () {
                let me = this, _win = me.up('window');

                if (Ext.getCmp('windowRestoreDiRSelector'))
                    Ext.getCmp('windowRestoreDiRSelector').close();

                if (_win.fn1 != false) {
                    _win.fn1(_win);
                    _win.close();
                } else {
                    let _presetCmp = _win.down('kudirfillpreset'), _preset,
                        cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

                    _presetCmp.bookFillPreset();
                    _preset = _presetCmp.presetCache;

                    let d = new Date();
                    let startAdd = d.getTime();

                    let sign = '<span class="fix-icon_left-text loading-anime fix">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 23C9.94687 23 7.93474 22.4254 6.19124 21.3412C4.44774 20.2571 3.04245 18.7065 2.13439 16.8652C1.22632 15.0238 0.851719 12.9651 1.05296 10.9218C1.2542 8.87861 2.02325 6.93248 3.27311 5.30363C4.52296 3.67479 6.20373 2.42824 8.12527 1.70504C10.0467 0.98183 12.1323 0.810823 14.146 1.21136C16.1597 1.61191 18.021 2.56801 19.5195 3.9715C21.018 5.37499 22.0938 7.16985 22.6252 9.15297" stroke="#BAC0D1" stroke-width="2" stroke-linecap="round"/></svg>' +
                        '</span>';
                    let show_win = win_warn_const('Заполнение книги', sign + '<span>Ожидайте, процесс может занять длительное время.</span>', []);
                    show_win.show();

                    let runner = new Ext.util.TaskRunner();

                    show_win.on(
                        {
                            'beforeclose': function () {
                                this.task.stop();
                            }
                        }
                    );

                    let _fn = function () {
                        _ajax(
                            dir_start_buh_ + '__kndrfill21_background.php', //'kndr_fill_21.php',
                            {
                                year: currYear,
                                actualYear: cbYear.getValue(),
                                action: 'fillKudir',
                                d_beg: _win.d_beg,
                                d_end: _win.d_end,
                                sum1: 0,
                                sum2: 0,
                                tax_mode: _win.tax_mode,
                                excl1: _preset.excl1,
                                excl2: _preset.excl2,
                                excl4: _preset.excl4,
                                excl5: _preset.excl5,
                                dirt1: _preset.dirt1,
                                dirt2: _preset.dirt2,
                                dirt4: _preset.dirt4,
                                dirt5: _preset.dirt5,
                                manl1: _preset.manl1,
                                manl2: _preset.manl2,
                                manl4: _preset.manl4,
                                manl5: _preset.manl5
                            },
                            function (response) {
                                let result = response,
                                    ans = Ext.decode(result);

                                let runner = new Ext.util.TaskRunner();
                                let task = runner.newTask({
                                    run: function () {
                                        let me = this;
                                        _ajax(dir_start_buh_ + '__kndrfill21_background.php',
                                            {'year': currYear, 'id_task': ans.process, actualYear: cbYear.getValue()},
                                            function (_ans) {
                                                let ans = Ext.JSON.decode(_ans);
                                                if (ans.progress == 100 || ans.progress == -1) {
                                                    me.stop();
                                                    show_win.close();
                                                    kdirFilled = true;

                                                    _win.periodChange();
                                                    _alert_win('Заполнение Книги ДиР', 'Книга доходов и расходов заполнена.');
                                                }
                                            }
                                        );
                                    },
                                    interval: 10000
                                });
                                show_win.task = task;
                                show_win.task.start();
                            });
                    }

                    Ext.Ajax.request({
                        url: dir_start_buh_ + 'backup_kndr.php',
                        params: {
                            act: 'create'
                        },
                        success: function (response) {
                            _fn();
                        }
                    });
                    _win.close();
                }
            },
            onCancel: function () {
                if (Ext.getCmp('windowRestoreDiRSelector'))
                    Ext.getCmp('windowRestoreDiRSelector').close();
                this.up('window').close();
            }
        });

        Ext.apply(me, {
            items: Ext.create('msg.Form')
        });

        me.callParent();
    },
    listeners: {
        afterrender: function () {
            let me = this, preset = me._data,
                _btnFillKudir = Ext.getCmp('mainPanelKudir').down('toolbar').down('[itemId=btnFillKudir]');

            _btnFillKudir.setDisabled(false);

            if (preset && parseInt(preset.excl_all) > 0) {
                me.down('[name=cnt-exclusions]').show();

                if (parseInt(preset.excl_section1) > 0) {
                    me.down('[name=exclusions-section1]').show();
                }

                if (me.tax_mode == 0) {
                    if (parseInt(preset.excl_section2) > 0) {
                        me.down('[name=exclusions-section2]').show();
                    }
                } else {
                    if (parseInt(preset.excl_section4) > 0) {
                        me.down('[name=exclusions-section4]').show();
                    }
                    if (parseInt(preset.excl_section5) > 0) {
                        me.down('[name=exclusions-section5]').show();
                    }
                }
            } else {
                me.down('[name=cnt-exclusions]').hide();
            }

            if (parseInt(preset.dirty_all) > 0) {
                me.down('[name=cnt-dirties]').show();

                if (parseInt(preset.dirty_section1) > 0) {
                    me.down('[name=dirties-section1]').show();
                }

                if (me.tax_mode == 0) {
                    if (parseInt(preset.dirty_section2) > 0) {
                        me.down('[name=dirties-section2]').show();
                    }
                } else {
                    if (parseInt(preset.dirty_section4) > 0) {
                        me.down('[name=dirties-section4]').show();
                    }
                    if (parseInt(preset.dirty_section5) > 0) {
                        me.down('[name=dirties-section5]').show();
                    }
                }
            } else {
                me.down('[name=cnt-dirties]').hide();
            }

            if (parseInt(preset.manual_all) > 0) {
                me.down('[name=cnt-manuals]').show();
                if (parseInt(preset.manual_section1) > 0) {
                    me.down('[name=manuals-section1]').show();
                }

                if (me.tax_mode == 0) {
                    if (parseInt(preset.manual_section2) > 0) {
                        me.down('[name=manuals-section2]').show();
                    }
                } else {
                    if (parseInt(preset.manual_section4) > 0) {
                        me.down('[name=manuals-section4]').show();
                    }
                    if (parseInt(preset.manual_section5) > 0) {
                        me.down('[name=manuals-section5]').show();
                    }
                }
            } else {
                me.down('[name=cnt-manuals]').hide();
            }

            /*
                            //                triggerStateEvent('tipForDiRRestoreOk', function () {

                                let tipRestore = Ext.create('Gbs.ToolTip', {
                                    renderTo: me.getEl(),
                                    //target: 'btn_restore_dir_version',
                                    maxWidth: 450,
                                    anchor: 'top',
                                    tooltipHtml: 'Теперь вы можете восстановить состояние<br>книги до заполнения'
                                });

                                setTimeout(function () {
                                    let pos =me.getPosition();
                                    tipRestore.showAt([pos[0]-1400, pos[1]+60]);
                                }, 100);


            //                }, this);
            */
        }
    },
    periodChange: function () {
        let me = this,
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = me._grid;

        cbPeriod.year = cbYear.getValue();

        Ext.util.Cookies.set('kdrf' + tab, null, new Date(1970, 1, 1));
        Ext.util.Cookies.clear();

        Ext.getCmp('mainPanelKudir').reconfig(tab);
        cbPeriod.reconfig(tab, cbPeriod.getValue());
        grid.store.removeAll();

        if (tab == 10) {
            grid.store.proxy.extraParams = {
                action: 'readReference',
                d_beg: cbPeriod.periodStartDate,
                d_end: cbPeriod.periodEndDate,
                year: cbPeriod.year
            }
        } else {
            grid.store.proxy.extraParams = {
                action: 'readSection' + tab,
                d_beg: cbPeriod.periodStartDate,
                d_end: cbPeriod.periodEndDate,
                period: cbPeriod.getValue(),
                year: cbPeriod.year
            };
        }

        grid.store.load();
    }

});
