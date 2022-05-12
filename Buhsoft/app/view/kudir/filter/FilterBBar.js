/**
 * Панель инструментов фильтра Книга доходов и расходов.
 * C 2021г. реализована бесшовность базы данных.
 *
 * GBS-6829|8558|9690|14108
 * @since 08/20
 */
Ext.define('Buh.view.kudir.filter.FilterBBar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.kudirfilterbbar',
    initComponent: function () {
        let me = this;

        Ext.apply(this, {
            items:
                [
                    {
                        xtype: 'greenbuttonsimple',
                        text: 'Применить',
                        handler: me.applyFilter
                    },
                    {
                        xtype: 'button',
                        icon: dir_start_buh_ + 'img/reset-icon.svg',
                        text: 'Сбросить',
                        handler: me.resetFilter
                    },
                ]
        });
        this.callParent();
    },
    resetFilter: function () {
        let me = this, win = me.up('window'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']'),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            _btn = Ext.getCmp('mainPanelKudir').down('[name=filterButton]');

        Ext.util.Cookies.set('kdrf' + tab, null, new Date(1970, 1, 1));
        Ext.util.Cookies.clear('kdrf' + tab);

        _btn.filterData = {};
        _btn.filterCount = 0;
        _btn.setText("Фильтр");
        _btn.setIcon('/img/filter-icon.svg');
        _btn.removeCls('ico_number');

        win.down('#panelFilterKudir').getForm().reset();

        cbPeriod.reconfig(tab, cbPeriod.defaultPeriod);

        grid.store.proxy.extraParams = {
            action: 'readSection' + tab,
            d_beg: cbPeriod.periodStartDate,
            d_end: cbPeriod.periodEndDate,
            period: cbPeriod.getValue()
        };

        Ext.getCmp('mainPanelKudir').down('kudirtbar').doComponentLayout();
        grid.store.load(function() {
            if (tab === 1) grid.calcTotals();
        });
        win.close();
    },
    applyFilter: function () {
        let me = this,
            win = me.up('window'), _period = 0,
            form = win.down('#panelFilterKudir'),
            tab = Ext.getCmp('mainPanelKudir').down('tabpanel').activeTab.itemId,
            grid = Ext.getCmp('mainPanelKudir').down('tabpanel').down('[itemId=grid' + tab + ']'),
            cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
            _btn = Ext.getCmp('mainPanelKudir').down('[name=filterButton]'),
            filterCache = form.getForm().getValues();

        _btn.filterCount = 0;

        grid.store.proxy.extraParams = {};
        grid.store.proxy.extraParams.action = 'readSection' + tab;

        if (parseFloat(form.down('[name=kf_sum1]').getValue()) > 0) {
            filterCache.sum1 = form.down('[name=kf_sum1]').getValue();
            grid.store.proxy.extraParams.sum1 = filterCache.sum1;
            _btn.filterCount++;
        }

        if (parseFloat(form.down('[name=kf_sum2]').getValue()) > 0) {
            filterCache.sum2 = form.down('[name=kf_sum2]').getValue();
            grid.store.proxy.extraParams.sum2 = filterCache.sum2;
            _btn.filterCount++;
        }

        if (form.down('[name=kf_doc_name]').getValue() != _dummy && form.down('[name=kf_doc_name]').getValue().length) {
            filterCache.kf_doc_name = form.down('[name=kf_doc_name]').getValue();
            grid.store.proxy.extraParams.short_name = filterCache.kf_doc_name;
            _btn.filterCount++;
        }

        if (form.down('[name=kf_n_doc]').getValue() != _dummy && form.down('[name=kf_n_doc]').getValue().trim().length) {
            filterCache.kf_n_doc = form.down('[name=kf_n_doc]').getValue().trim();
            grid.store.proxy.extraParams.n_doc = filterCache.kf_n_doc;
            _btn.filterCount++;
        }

        if (form.down('[name=kf_date_beg]').getValue() != _dummy) {
            filterCache.kf_date_beg = Ext.Date.format(form.down('[name=kf_date_beg]').getValue(), 'd.m.Y');
            filterCache.d_beg = Ext.Date.format(form.down('[name=kf_date_beg]').getValue(), 'Y-m-d');
            grid.store.proxy.extraParams.d_beg = filterCache.d_beg;
            _btn.filterCount++;
        }

        if (form.down('[name=kf_date_end]').getValue() != _dummy) {
            if (form.down('[name=kf_date_beg]').getValue() == _dummy) {
                let d = new Date(currYear, 1, 1);
                form.down('[name=kf_date_beg]').setValue(d);
                filterCache.kf_date_beg = Ext.Date.format(d, 'd.m.Y');
                filterCache.d_beg = Ext.Date.format(d, 'Y-m-d');
                grid.store.proxy.extraParams.d_beg = filterCache.d_beg;
            }

            filterCache.kf_date_end = Ext.Date.format(form.down('[name=kf_date_end]').getValue(), 'd.m.Y');
            filterCache.d_end = Ext.Date.format(form.down('[name=kf_date_end]').getValue(), 'Y-m-d');
            grid.store.proxy.extraParams.d_end = filterCache.d_end;

            _period = cbPeriod.periodHelper.getPeriod(form.down('[name=kf_date_end]').getValue());
            cbPeriod.reconfig(tab, _period);

            _btn.filterCount++;
        }

        if (tab == 1) {
            if (form.down('[name=kf_op_type]').getValue() > 0) {
                filterCache.kf_op_type = form.down('[name=kf_op_type]').getValue();
                grid.store.proxy.extraParams.op_type = filterCache.kf_op_type;
                _btn.filterCount++;
            }

            if (form.down('[name=kf_id_sod]').getValue() > 0) {
                filterCache.kf_id_sod = form.down('[name=kf_id_sod]').getValue();
                grid.store.proxy.extraParams.id_sod = filterCache.kf_id_sod;
                _btn.filterCount++;
            }

            if (parseInt(form.down('[name=kf_id_contra]').getValue()) > 0) {
                filterCache.kf_id_contra = form.down('[name=kf_id_contra]').getValue();
                grid.store.proxy.extraParams.id_contra = filterCache.kf_id_contra;
                _btn.filterCount++;
            }
        }

        if (tab == 4) {
            if (form.down('[name=kf_id_op]').getValue() != _dummy) {
                filterCache.kf_id_op = form.down('[name=kf_id_op]').getValue();
                grid.store.proxy.extraParams.id_op = filterCache.kf_id_op;
                _btn.filterCount++;
            }
        }

        if (Ext.Array.contains([4, 5], tab)) {
            if (form.down('[name=at_period_unit]').getValue() != _dummy) {
                if (form.down('[name=at_year]').getValue() != _dummy) {
                    filterCache.at_period_unit = form.down('[name=at_period_unit]').getValue();
                    grid.store.proxy.extraParams.at_period_unit = filterCache.at_period_unit;

                    filterCache.at_year = form.down('[name=at_year]').getValue();
                    grid.store.proxy.extraParams.at_year = filterCache.at_year;
                    _btn.filterCount++;
                }
            }
        }

        if ((grid.store.proxy.extraParams.d_beg == _dummy || grid.store.proxy.extraParams.d_end == _dummy)) {
            if (form.down('[name=kf_period]').getValue() > 0 &&
                form.down('[name=kf_period]').getValue() != cbPeriod.getValue()) {

                cbPeriod.setValue(form.down('[name=kf_period]').getValue());
                cbPeriod.reconfig(tab, form.down('[name=kf_period]').getValue());
                _btn.filterCount++;
            }

            filterCache.d_beg = Ext.Date.format(cbPeriod.periodStartDate, 'Y-m-d');
            filterCache.d_end = Ext.Date.format(cbPeriod.periodEndDate, 'Y-m-d');
            grid.store.proxy.extraParams.d_beg = cbPeriod.periodStartDate;
            grid.store.proxy.extraParams.d_end = cbPeriod.periodEndDate;
        }

        grid.store.proxy.extraParams.period = cbPeriod.getValue();

        if (_btn.filterCount > 0) {
            filterCache.count = _btn.filterCount;
            _btn.setText("<i>" + _btn.filterCount + "</i>Фильтр");
            _btn.setIcon("");
            _btn.addCls('ico_number');
        } else {
            filterCache.count = 0;
            _btn.setText("Фильтр");
            _btn.setIcon('/img/filter-icon.svg');
            _btn.removeCls('ico_number');
        }

        _btn.filterData = filterCache;
        Ext.util.Cookies.set('kdrf' + tab, Ext.encode(_btn.filterData), new Date(new Date().getTime() + 1000 * 60 * 60));

        if (_btn.filterCount > 0 || form.isClean == false) {
            grid.store.removeAll();
            grid.store.load(function() {
                if (tab === 1) grid.calcTotals();
            });
        }

        Ext.getCmp('mainPanelKudir').down('kudirtbar').doComponentLayout();
        win.close();
    }

});
