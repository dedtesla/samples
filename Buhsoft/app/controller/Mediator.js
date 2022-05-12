Ext.define('Buh.controller.Mediator', {
    extend: 'Ext.app.Controller',


    _fill: 0,
    _args: null,
    taskCheckField: null,
    refs: [

        {
            ref: 'win',
            selector: 'editmediator'
        },

        {
            ref: 'grid',
            selector: 'mediatorrepgrid'
        },

    ],

    init: function () {
        this.control({
            'editmediator': {
                fillData: this.fillData, // заполнить окно данными и показать
                onScroll: this.onScroll, // Окно скроллится
            },

            'editmediator grid': {
                itemcontextmenu: this.contextMenu, // Контекстное меню для грида ДиР
                exceptRecord: this.exceptRecord, // Исключить сделку из отчета
                includeRecord: this.includeRecord, // Включить сделку из отчета
                goDeal: this.goDeal, // Перейти к сделке
            },

            'editmediator three_select': {
                switch: this.fillDealsByCondition, // Заполнить сделки
            },

            'editmediator c_period[name=docs_period]': {
                select: this.fillDealsByCondition, // Заполнить сделки
            },

            'editmediator [name=analit1]': {
                select: this.filtContract, //  Фильтровать договор по контрагенту.
            },

            'editmediator [name=analit2]': {
                select: this.fillDealsByCondition, // Заполнить сделки
            },

            'editmediator [name=way_create]': {
                select: this.fillDealsByCondition , // Способ создания расечта вознаграждения ручной или автоматический
            },

            'editmediator [name=way_calc]': {
                select: this.setRewardFields, // Поставить поля в зависимости от настроек
            },

            'editmediator toolbar [action=save_print]': {
                click: this.savePrint, // сохранить данные и распечатать
            },

            'editmediator toolbar [action=save_pdf]': {
                click: this.savePrint, // сохранить данные и распечатать
            },

            'editmediator toolbar [action=save_xls]': {
                click: this.savePrint, // сохранить данные и распечатать
            },

            'editmediator toolbar [action=save]': {
                click: this.save, // сохранить данные и закрыть окно
            },

            'editmediator [action=gotodeal]': {
                click: this.goToDeal, // Перейти к сделке
            },

            'editmediator toolbar [action=close_window]': {
                click: this.close, // закрыть окно
            },

            'editmediator [name=n_doc]': {
                change: this.formCheck, //
            },

            'editmediator [name=nds_id]': {
                select: this.calcReward, // расчитать вознаграждение
            },

            'editmediator [name=percent]': {
                change: this.calcReward, // расчитать вознаграждение
            },

            'editmediator [name=summa]': {
                change: this.calcReward, // расчитать вознаграждение
            },

        });
    },

    fillData: function () {
        // заполнить окно данными и показать

        let _args = arguments[0],
            me = this,
            win = me.getWin(),
            form = win.down('form'),
            store = Ext.create('Buh.store.MediatorItems'),
            grid = me.getGrid();
        dat = new Date();
        me._args = _args;
        win.show();
        win.modified = false;

        grid.reconfigure(store);
        win.down('[name=way_calc]').store.clearFilter(true);

        gb247.on('onScroll', function () {
            me.onScroll();
        }, me);
        me.onScroll();

        if (me._args.id == 0) {
            form.down('[name=type_report]').setValue(1);
            form.down('[name=date_doc]').setValue(dat);
            let _par = {'action': 'new'};
            _ajax(dir_start_buh_ + 'mediator_proc.php', _par,
                function (ret) {
                    let ans = Ext.decode(ret);
                    form.down('[name=n_doc]').setValue(ans.data.num_doc);
                }
            );
            me.setRewardFields();

        }
        else {
            me._fill = 1;
            var _par = {'action': 'read', 'id': me._args.id};
            _ajax(dir_start_buh_ + 'mediator_proc.php', _par,
                function (ret) {
                    var ans = Ext.decode(ret),
                        i = 0;
                    form.down('[name=id]').setValue(me._args.id);
                    form.down('[name=type_report]').setValue(ans.data.type_report);
                    form.down('[name=date_doc]').setValue(ans.data.date_doc);
                    form.down('[name=n_doc]').setValue(ans.data.n_doc);
                    form.down('[name=analit1]').setValueSilent(ans.data.org_id, ans.data.mediator);
                    form.down('[name=analit2]').setFilter("org_id=" + ans.data.org_id);
                    form.down('[name=analit2]').setValue(ans.data.dog_id, ans.data.dog);
                    form.down('c_period[name=docs_period]').setValues(ans.data.dat_b, ans.data.dat_e);
                    form.down('gbs_combo[name=way_create]').setValue(ans.data.way_create);
                    form.down('gbs_combo[name=way_calc]').setValue(ans.data.way_calc);
                    form.down('[name=summa]').setValue(ans.data.summa);
                    form.down('[name=percent]').setValue(ans.data.percent);
                    form.down('[name=nds_id]').setValue(ans.data.nds_id);
                    if (ans.data.way_create == 2) {
                        form.down('[name=cnt-go-to]').show();
                    }
                    Ext.Array.each(ans.footer, function (row) {
                        var p = {
                            id: row.id,
                            dat: row.dat,
                            md: row.md,
                            mdoc: row.mdoc,
                            s_buy: (row.s_buy * 1).toFixed(2),
                            sd_summa: (row.sd_summa * 1).toFixed(2),
                            include_sb: row.include_sb,
                            reward: row.reward,
                            way_calc_reward: row.way_calc_reward
                        };
                        grid.store.insert(i, p);
                        i++;
                    });
                    grid.view.refresh();
                    me.setRewardFields();
                    me._fill = 0;
                });
        }

    },


    onScroll: function () {
        // Окно скроллится

        if (this.getWin() == undefined)
            return;

        if (!this.getWin().rendered)
            return;
        var win = this.getWin(),
            toolbar = win.down('toolbar'),
            body = Ext.getBody(),
            bodyHeight = body.getViewSize().height,
            scrollPosition = body.getScroll(),
            parent = toolbar.ownerCt,
            pos = parent.getPosition(),
            posinwin = toolbar.getPosition(true),
            height = parent.getHeight(),
            tbheight = toolbar.getHeight() - 1,
            maxtop = height - tbheight,
            top = bodyHeight - pos[1] + scrollPosition.top - tbheight,
            y = Math.min(top, maxtop);

        toolbar.setPosition({x: null, y: y});

    },

    save: function (_button) {
        // сохранить данные и закрыть окно
        var _args = arguments[0],
            me = this,
            win = me.getWin(),
            grid = me.getGrid();
        form = win.down('form');

        var _title = win.down('panel').getForm().getValues(),
            recs = grid.store.data.items,
            _bottom = [];

        for (var i = 0; i < recs.length; i++) {
            _bottom.push(for_json2(recs[i].data, 'Y-m-d'));
        }
        Ext.Ajax.request({
            url: dir_start_buh_ + "mediator_proc.php",
            params: {
                'action': 'save',
                'title': Ext.encode(_title),
                'podval': Ext.encode(_bottom)
            },
            success: function (res) {

                win.modified = false;
                rc = Ext.decode(res.responseText, true);
                var mainPanel = Ext.ComponentQuery.query('mediatorPanel')[0];
                mainPanel.down('grid').store.reload();
                win.close();
                if (_button.action == 'save_xls')
                    _ajax(dir_start_buh_ + 'frm_mediator_report.php', {'id': rc.id},
                        function () {
                            window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + rc.id + "&type=91";
                        }
                    );

                if (_button.action == 'save_pdf')
                    window.location.href = dir_start_buh_ + "frm_mediator_report.php?type_doc_convert=pdf&id=" + rc.id;

                if (_button.action == 'save_print') {
                    if (Ext.get('iFramePrintDirect') != _dummy) {
                        Ext.get('iFramePrintDirect').remove();
                    }
                    let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
                        src: dir_start_buh_ + "frm_mediator_report.php?type_doc_convert=pdf&directprint=true&id=" + rc.id
                    });
                    let iFrame = printFrame.el.dom.firstChild.contentWindow;

                    iFrame.focus();
                    iFrame.print();
                }

            }
        });


    },

    fillDeals: function () {
        // Заполнить сделки
        var
            me = this,
            win = me.getWin(),
            typ = win.down('three_select').getValue(),
            oid = win.down('[name=analit1]').getValue(),
            did = win.down('[name=analit2]').getValue(),
            dat1 = win.down('c_period[name=docs_period]').getDat1(),
            dat2 = win.down('c_period[name=docs_period]').getDat2(),
            mode = win.down('[name=way_create]').getValue(),
            calc = win.down('[name=way_calc]').getValue(),
            grid = me.getGrid();

        if (typ == 2) {
            win.down('[name=cnt-analit1]').setTitle("Принципал");
            win.down('form').setTitle("Отчет агента");
        }
        else {

            win.down('[name=cnt-analit1]').setTitle("Комитент");
            win.down('form').setTitle("Отчет комиссионера");
        }


        me.formCheck();

        if (oid == 0 || me._fill != 0) return;


        grid.store.removeAll();
        _par = {
            action: 'fillDeals',
            id: 0,
            typ_deal: typ,
            org: oid,
            dog: did,
            d1: Ext.Date.format(dat1, 'Y-m-d'),
            d2: Ext.Date.format(dat2, 'Y-m-d'),
            mode: mode
        };
        _ajax(dir_start_buh_ + 'mediator_proc.php', _par,
            function (ret) {
                var ans = Ext.decode(ret),
                    sum_reward = 0,
                    sum_reward_nds = 0,
                    i = 0;

                Ext.Array.each(ans.data, function (row) {
                    var p = {
                        id: row.id, dat: row.dat, md: row.md, mdoc: row.mdoc,
                        reward: row.reward,
                        way_calc_reward: row.way_calc_reward,
                        s_buy: (row.s_buy * 1).toFixed(2), sd_summa: (row.sd_summa * 1).toFixed(2), include_sb: 1
                    };
                    grid.store.insert(i, p);
                    i++;
                });

                if (calc != 3 && i==0 && mode==2) {
                  win.down('[name=way_calc]').setValue('3');
                  me.setRewardFields();
                }

                me.calcReward();
                grid.getView().refresh();

            }
        );
    },

    calcReward: function () {
        // Расчитать вознаграждение
        let
            me = this,
            win = me.getWin(),
            sum_buy = 0,
            sum_sale = 0,
            sum_reward = 0,
            w1 = 0,
            w2 = 0,
            w3 = 0,
            sum_reward_nds = 0,
            typ = win.down('three_select').getValue(),
            oid = win.down('[name=analit1]').getValue(),
            mode = win.down('[name=way_create]').getValue(),
            calc = win.down('[name=way_calc]').getValue(),
            grid = me.getGrid(),
            prc = win.down('[name=percent]').getValue() * 0.01,
            nds_id = win.down('[name=nds_id]').getValue();


        if (oid == 0) {
           grid.view.emptyText = (typ == 2) ? 
                                 "<span class=text-big-center>Для загрузки продаж выберите принципала</span>" :
                                 "<span class=text-big-center>Для загрузки продаж выберите комитента</span>";
        }
        else
        {
           grid.view.emptyText = (mode == 1) ?
                    "<span class='text-big-center'>Нет продаж по посреднической деятельности - измените период или выберите ручной способ создания отчета</span>" : 
                    "<span class='text-big-center'>Нет продаж по посреднической деятельности - измените период или введите сумму вознаграждения вручную</span>";
        }
        grid.getView().refresh();


        grid.store.each(function (row) {
            if (row.data.include_sb == 1) {
                sum_reward += row.data.reward.summa * 1;
                sum_reward_nds += row.data.reward.summands * 1;
                sum_buy += row.data.s_buy * 1;
                sum_sale += row.data.sd_summa * 1;
                if (row.data.way_calc_reward == 1)
                    w1++;
                if (row.data.way_calc_reward == 2)
                    w2++;
                if (row.data.way_calc_reward == 3)
                    w3++;
            }
        });

        if (mode == 1) {
            win.down('[name=summa]').setValue(sum_reward.toFixed(2));
            win.down('[name=note]').update(sum_reward_nds.toFixed(2));
            if (w1 != 0 && w2 == 0 && w3 == 0) {
                win.down('[name=way_calc]').setValue('1');
            }
            else if (w1 == 0 && w2 != 0 && w3 == 0) {
                win.down('[name=way_calc]').setValue('2');
            }
            else if (w1 == 0 && w2 == 0 && w3 != 0) {
                win.down('[name=way_calc]').setValue('3');
            }
            else {
                win.down('[name=way_calc]').setValue('0');
            }
            win.down('toolbar').down('[name=notedata]').hide();
        }
        else {
            if (calc == 1) {
                sum_reward = sum_sale - sum_buy;
                sum_reward_nds = sum_reward - (sum_reward / (1 + ndsArrayStav[nds_id]));

                win.down('[name=summa]').setValue(sum_reward.toFixed(2));
                win.down('[name=note]').update(sum_reward_nds.toFixed(2));
            }
            if (calc == 2) {
                sum_reward = sum_sale * prc;
                sum_reward_nds = sum_reward - (sum_reward / (1 + ndsArrayStav[nds_id]));

                win.down('[name=summa]').setValue(sum_reward.toFixed(2));
                win.down('[name=note]').update(sum_reward_nds.toFixed(2));
            }
            if (calc == 3) {
                sum_reward = win.down('[name=summa]').getValue() * 1;
                sum_reward_nds = sum_reward - (sum_reward / (1 + ndsArrayStav[nds_id]));
                win.down('[name=note]').update(sum_reward_nds.toFixed(2));
            }
            win.down('toolbar').down('[name=notedata]').show();
            var dt = win.down('[name=date_doc]').getValue();
            win.down('toolbar').down('[name=notedata]').update("Вместе с отчетом будет создана запись в учете продаж от " + Ext.Date.format(dt, 'd') + " " + Date.monthNamesRP[dt.getMonth()] + " " + Ext.Date.format(dt, 'Y'));
        }


    },

    contextMenu: function (v, rec, it, ind, e, eo) {
        // Контекстное меню для грида ДиР
        e.stopEvent();
        var me = this,
            grid = me.getGrid();
        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.menu.down('[name=e]').setVisible(rec.data.include_sb == 1);
        grid.menu.down('[name=i]').setVisible(rec.data.include_sb != 1);
        grid.menu.showAt(e.getXY());

    },

    filtContract: function (rec) {
        //  Фильтровать договор по контрагенту.
        var me = this,
            win = me.getWin(),
            org_id = win.down('[name=analit1]').getValue();

        win.down('[name=analit2]').setFilter('org_id=' + org_id);
        me.formCheck();
        me.fillDealsByCondition();
    },

    close: function () {
        // закрыть окно
        var me = this,
            win = me.getWin();
        win.close();

    },

    exceptRecord: function (rec) {
        // Исключить сделку из отчета
        var me = this;
        rec.set('include_sb', 0);
        me.calcReward();

    },

    includeRecord: function (rec) {
        // Включить сделку из отчета
        var me = this;
        rec.set('include_sb', 1);
        me.calcReward();

    },

    setRewardFields: function () {
        // Поставить поля в зависимости от настроек
        var me = this,
            win = me.getWin(),
            typ = win.down('three_select').getValue(),
            way_cr = win.down('[name=way_create]').getValue(),
            way_calc = win.down('[name=way_calc]').getValue();

        win.down('[name=summa]').disable();
        if (way_cr == 1) {
            win.down('[name=way_calc]').store.clearFilter(true);
            win.down('[name=nds_id]').hide();
            win.down('[name=way_calc]').disable();
        }
        else {
            win.down('[name=nds_id]').show();

            if (way_calc == '0')
                win.down('[name=way_calc]').setValue('1');

            win.down('[name=way_calc]').enable();
            win.down('[name=way_calc]').store.filterBy( function(rec){
                        let ret = false;
                        if (typ == 1)
                            ret = (rec.get("id") != '0');
                        else
                            ret = (rec.get("id") != '0' && rec.get("id") != '1');
                        return ret;
                    });
            if (way_calc == 3)
                win.down('[name=summa]').enable();

        }
        win.down('[name=c-prc]').setVisible(way_calc == '2');
        win.down('[name=c-nds]').setVisible(buh_nalog_mode == 1);
        if (buh_nalog_mode != 1)
            win.down('[name=nds_id]').setValue('4');

//        me.calcReward();
    },


    formCheck: function () {
        var nameEditedField = "all";
        if (arguments[0] != undefined)
            nameEditedField = arguments[0].name;
        if (nameEditedField.indexOf('id_analit') == 0)
            nameEditedField = 'analit1';

        // Изменились данные в форме, проверить
//        if (this.fieldSetValue==1) return;
        var me = this,
            win = me.getWin(),
            toolbar = win.down('toolbar'),
            typ = win.down('three_select').getValue(),
            grid = me.getGrid(),

            arFld = [],
            layout = [
                {name: 'n_doc', text: 'Номер документа'},
                {name: 'analit1', text: typ == 2 ? 'Принципал' : 'Комитент'},
            ],
            kolErrorPrev = 0,
            kolError = 0;

        if (!win.isVisible()) return;
        arFld[''] = [];
        arFld[1] = [];
        arFld[2] = [];

        if (me.taskCheckField != null)
            me.taskCheckField.cancel();

        me.taskCheckField = new Ext.util.DelayedTask(function () {

            toolbar.down('[name=errordata]').removeAll();
            toolbar.down('[name=errordata]').hide();
            toolbar.down('[action=save]').enable();
            toolbar.down('[action=print]').enable();

            Ext.each(layout, function (fld, index) {
                var val = win.down('[name=' + fld.name + ']').getValue();
                if (Ext.Array.contains(['', 0, null, '0.00', '0'], val)) {
                    kolErrorPrev++;
                }
            });


            Ext.each(layout, function (fld, index) {
                var val = win.down('[name=' + fld.name + ']').getValue();
                if (Ext.Array.contains(['', 0, null, '0.00', '0'], val)) {

                    kolError++;
                    if (kolError == 1) {
                        toolbar.down('[name=errordata]').add({
                            xtype: 'label',
                            cls: 'btn-sel-blue color-orange',
                            text: 'Не введено:'
                        });
                        var b = {
                            xtype: 'tbspacer',
                        };
                        toolbar.down('[name=errordata]').add(b);
                    }
                    var b = {
                        xtype: 'tbspacer',
                    };
                    toolbar.down('[name=errordata]').add(b);

                    var b = {
                        xtype: 'button',
                        action: 'focusfield',
                        componentCls: 'x-toolbar-item',
                        text: fld.text + (kolErrorPrev > kolError ? ',' : ''),
                        fname: fld.name,
                        cls: 'btn-sel-blue color-orange',
                    };
                    toolbar.down('[name=errordata]').add(b);
                    toolbar.down('[action=save]').disable();
                    toolbar.down('[action=print]').disable();
                }
            });

            Ext.defer(function () {
                me.onScroll();
            }, 100);
            if (kolError > 0)
                toolbar.down('[name=errordata]').show();
        });


        me.taskCheckField.delay(50);

    },

    goToDeal: function () {
        // Перейти к сделке
        var win = this.getWin(),
            id = win.down('[name=id]').getValue(),
            rec = {'data': ''};
        win.close();
        rec.data = {'source': 24, 'source_id': id};
        joManager.openSource(rec);


    },

    goDeal: function (_rec) {
        // Перейти к сделке из грида
        var win = this.getWin(),
            id = win.down('[name=id]').getValue(),
            rec = {'data': ''};
        rec.data = {'source': 2, 'source_id': _rec.data.id};
        var _fn = function () {
            joManager.openSource(rec);
        };
//        win.confirmClose();
        /*
              win.close();
        */

    },

    savePrint: function (btn) {
        // сохранить данные и распечатать
        this.save(btn);
    },


    setWayCreate: function() {
      // Способ создания расечта вознаграждения ручной или автоматический
      let me = this;

      me.fillDealsByCondition();

    },

    fillDealsByCondition: function() {
      // Способ создания расечта вознаграждения ручной или автоматический
      let me = this;

      me.fillDeals();
      me.setRewardFields();

    },
});
