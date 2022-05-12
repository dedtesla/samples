Ext.define('Buh.view.kudir.grid.GridReference', {
    extend: 'Buh.view.kudir.grid.GridSection',
    alias: 'widget.kudirreferencegrid',
    itemId: 'grid10',
    store: Ext.create('Buh.store.kudir.KudirReferenceStore'),
    cls: 'grid-multi-line dop_margin-top twoline_header',
    plugins: Ext.create('Ext.grid.plugin.CellEditing', {
        clicksToEdit: 1,
        listeners: {
            beforeedit: function(e, editor){
                if (editor.record.data.id != 3) return false;
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
                            askText = 'Программа заполняет автоматически по данным Раздела 1, графа Доходы';
                        } else if (record.data.id == 2) {
                            askText = 'Программа заполняет автоматически по данным Раздела 1, графа Расходы';
                        } else if (record.data.id == 3) {
                            askText = 'Введите значение вручную. Это разница между стр.270 и стр.280 декларации по УСН за прошлый год';
                        } else if (record.data.id == 4) {
                            askText = 'Программа рассчитывает автоматически как разницу строк 010, 020 и 030 Справки';
                        } else if (record.data.id == 5) {
                            askText = 'Программа рассчитывает автоматически как разницу между суммой строк 020 и 030 и строкой 010 Справки';
                        }

                        button = Ext.String.format('<a class="ico-faq-small tooltip-container" data-qtip="{0}"></a>', askText);

                        return "<div style='white-space:normal !important;'>" + iif(value == null, '', value + ' ' + button) + "</div>";
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
            style: {'text-align': 'center'},
            columns: [
                {
                    text: '3',
                    dataIndex: 'summa',
                    width: 150,
                    style: {'text-align': 'center'},
                    align: 'right',
                    editor: numEditor,
                    renderer: function (value, metaData, record) {
                        let format = "0,000.00"
                        if (record.data.row != '030') {
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
                        action: 'readReference',
                        d_beg: cbPeriod.periodStartDate,
                        d_end: cbPeriod.periodEndDate,
                        year: cbYear.getValue()
                    },
                    function (resp) {
                        let response = Ext.decode(resp);

                        if (response.data) {
                            let income = iif(response.data.income > 0, response.data.income, '0.00'),
                                storno = iif(response.data.storno != 0, response.data.storno*1, '0.00'),
                                outcome = iif(response.data.outcome > 0, response.data.outcome, '0.00');
                                str030 = 0;

                            if (response.data.manual != false) {
                                let rec = me.store.getById(3);
                                rec.set('outerid', response.data.manual.id);
                                rec.set('summa', response.data.manual.summa);
                                str030 = rec.get('summa');
                            }

                            rec = me.store.getById(1);
                            rec.set('summa', parseFloat(income) - parseFloat(storno));

                            rec = me.store.getById(2);
                            rec.set('summa', outcome);

                            rec = me.store.getById(4);
                            let sum = parseFloat(income) - parseFloat(storno) - parseFloat(outcome) - parseFloat(str030);
                            rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

                            rec = me.store.getById(5);
                            sum = parseFloat(outcome) + parseFloat(str030) - parseFloat(income) + parseFloat(storno);
                            rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

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
                        tabid: 10,
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
        let me = this, str030 = 0, income = 0, outcome = 0;

        let rec = me.store.getById(3);
        str030 = rec.get('summa');

        rec = me.store.getById(1);
        income = rec.get('summa');

        rec = me.store.getById(2);
        outcome = rec.get('summa');

        rec = me.store.getById(4);
        let sum = income - outcome - str030;
        rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

        rec = me.store.getById(5);
        sum = outcome + str030 - income;
        rec.set('summa', iif(sum >= 0, sum.toFixed(2), '0.00'));

        me.store.commitChanges();
    }
});
