Ext.define('Buh.view.kudir.grid.GridSection3', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirsection3grid',
    itemId: 'grid3',
    cls: 'grid-multi-line dop_margin-top twoline_header',
    store: Ext.create('Buh.store.kudir.KudirSection3Store'),
    income: 0,
    outcome: 0,
    plugins: Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function(e, editor){
                if (Ext.Array.contains([1, 12, 14, 15], editor.record.data.id)) return false;
            }
        }
    }),
    columns: [
        {
            text: 'id',
            dataIndex: 'id',
            hidden: true
        },
        {
            text: 'Показатель',
            style: {'text-align': 'left'},
            columns: [
                {
                    text: '1',
                    dataIndex: 'indicator',
                    width: 400,
                    renderer: function (value, metaData, record, rowIndex, colIndex, view) {
                        let askText, button = '';

                        if (record.data.id == 1) {
                            askText = 'Программа рассчитывает автоматически как сумму строк 020 - 110.. Также это значение должно быть равно стр.150 раздела 3 КУДиР за прошлый год';
                        } else if (record.data.id == 12) {
                            askText = 'Программа заполняет автоматически по данным стр.040 Справки к разделу 1';
                        } else if (record.data.id == 14) {
                            askText = 'Программа заполняет автоматически по данным стр.041 Справки к разделу 1';
                        } else if (record.data.id == 15) {
                            askText = 'Программа рассчитывает автоматически как (..стр.010 - код стр.130 + код стр.140). Этому значению должна быть равна сумма строк 160-250';
                        }

                        if (Ext.Array.contains([1, 12, 14, 15], record.data.id)) {
                            button = Ext.String.format('<a class="ico-faq-small tooltip-container" data-qtip="{0}"></a>', askText);
                        }

                        return "<div style='white-space:normal !important;'>" + iif(value == null, '', value + button) + "</div>";
                    }
                }
            ]
        },
        {
            text: 'Строка',
            style: {'text-align': 'center'},
            columns: [
                {
                    text: '2',
                    dataIndex: 'row',
                    tdCls: 'txt-grey',
                    width: 50,
                    style: { 'text-align': 'center' }
                }
            ]
        },
        {
            text: 'Сумма',
            style: {'text-align': 'right'},
            columns: [
                {
                    text: '3',
                    dataIndex: 'summa',
                    width: 150,
                    style: { 'text-align': 'right' },
                    align: 'right',
                    editor: numEditor,
                    renderer: function (value, metaData, record) {
                        let format = "0,000.00"
                        if (Ext.Array.contains([1, 12, 14, 15], record.data.id)) {
                            metaData.tdCls = 'txt-grey';
                        }
                        return Ext.util.Format.number(value, format);
                    }
                }
            ]
        }
    ],
    listeners: {
        afterRender: function (grid, opts) {
            let me = this, cbPeriod = Ext.getCmp('mainPanelKudir').down('toolbar').down('combo_interval_kudir'),
                cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

            me.store.on('load', function (records, operation, success) {
                _ajax(
                    dir_start_buh_ + 'kudir_process.php',
                    {
                        action: 'readSection3',
                        d_beg: cbPeriod.periodStartDate,
                        d_end: cbPeriod.periodEndDate,
                        year: cbYear.getValue()
                    },
                    function (resp) {
                        let response = Ext.decode(resp);

                        if (response.data) {
                            let income = iif(response.data.income > 0, response.data.income, 0),
                                outcome = iif(response.data.outcome > 0, response.data.outcome, 0),
                                ref030 = response.data.ref030,
                                str010 = str120 = str130 = str140 = 0,
                                rec, sum, incr1 = 2, incr2 = 16, offset = 0;

                            me.income = income;
                            me.outcome = outcome;

                            if (response.data.manual != false) {
                                response.data.manual.forEach(function (r) {
                                    if (Ext.Array.contains(['2','3','4','5','6','7','8','9','10','11'], r.store_id)) {
                                        rec = me.store.getById(parseInt(r.store_id));
                                        rec.set('outerid', r.id);
                                        rec.set('summa', r.summa);
                                        str010 += parseFloat(r.summa);
                                    } else if (Ext.Array.contains(['13','16','17','18','19','20','21','22','23','24','25'], r.store_id)) {
                                        rec = me.store.getById(parseInt(r.store_id));
                                        rec.set('outerid', r.id);
                                        rec.set('summa', r.summa);

                                        if (r.store_id == '13') {
                                            str130 = parseFloat(r.summa);
                                        }
                                    }
                                });

                                rec = me.store.getById(1);
                                rec.set('summa', str010);
                            }

                            rec = me.store.getById(12);
                            sum = parseFloat(income) - parseFloat(outcome) - parseFloat(ref030);
                            str120 = iif(sum >= 0, sum.toFixed(2), 0);
                            rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

                            rec = me.store.getById(14);
                            sum = parseFloat(outcome) + parseFloat(ref030) - parseFloat(income);
                            str140 = iif(sum >= 0, sum.toFixed(2), 0);
                            rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

                            rec = me.store.getById(15);
                            sum = parseFloat(str010) - parseFloat(str130) + parseFloat(str140);
                            rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

                            for (i = 1; i < 11; i++) {
                                rec = me.store.getById(incr1);
                                rec.set('indicator', parseInt(cbYear.getValue()) - i);
                                rec = me.store.getById(incr2);
                                rec.set('indicator', parseInt(cbYear.getValue()) - offset);
                                incr1++;
                                incr2++;
                                offset++;
                            }

                            me.store.commitChanges();
                        }
                    });
            });
        },
        edit: function (editor, e) {
            if (e.originalValue == e.value) return;

            if (e.field == 'summa') {
                let me = this, sum = e.record.data[e.field] * 1,
                    cbYear = Ext.getCmp('mainPanelKudir').down('toolbar').down('gbs_combo_year');

                _ajax(dir_start_buh_ + 'kudir_process.php',
                    {
                        action: 'modifySumManual',
                        tabid: 3,
                        storeid: e.record.data.id,
                        id: e.record.data.outerid,
                        summa: sum,
                        year: cbYear.getValue()
                    });

                e.record.set('summa', sum.toFixed(2));
                me.store.commitChanges();
                me.calculate();
            }
        }
    },
    calculate: function () {
        let me = this, str010 = str120 = str130 = str140 = 0, rec;

        rec = me.store.getById(2);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(3);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(4);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(5);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(6);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(7);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(8);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(9);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(10);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(11);
        str010 += parseFloat(rec.get('summa'));

        rec = me.store.getById(1);
        rec.set('summa', str010);

        rec = me.store.getById(13);
        str130 = rec.get('summa');

        rec = me.store.getById(12);
        sum = parseFloat(me.income) - parseFloat(me.outcome) - parseFloat(str130);
        str120 = iif(sum >= 0, sum.toFixed(2), 0);
        rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

        rec = me.store.getById(14);
        sum = parseFloat(me.outcome) + parseFloat(str130) - parseFloat(me.income);
        str140 = iif(sum >= 0, sum.toFixed(2), 0);
        rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

        rec = me.store.getById(15);
        sum = parseFloat(str010) - parseFloat(str130) + parseFloat(str140);
        rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

        me.store.commitChanges();
    }
});
