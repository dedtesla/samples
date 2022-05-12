/**
 * Панель подвала Книги доходов и расходов для вывода итоговых сумм гридов.
 * Только в разделах 1,2,4,5.
 * В разделах Справка и 3 не выводится.
 *
 * GBS-6829, GBS-8558
 * 08.2020
 */
Ext.define('Buh.view.kudir.FTBar', {
            extend: 'Ext.toolbar.Toolbar',
            alias: 'widget.kudirftbar',
            xtype: 'kudirftbar',
            ui: 'footer',
            dock: 'bottom',
            fixed: true,
            cls: 'container-align-small',
            items: [
                    {
                            xtype: 'displayfield',
                            flex: 1,
                            fieldCls: 'txt-darkgrey-bold',
                            value: 'Всего:',
                    },
                    {
                            xtype: 'displayfield',
                            name: 'section1_prihod_total',
                            width: 120,
                            renderer: function () {
                                    if (this.getValue() * 1 == 0) {
                                            return "<div class='txt-darkgrey-bold' style='text-align:right'>&mdash;</div>";
                                    } else {
                                            return "<div class='txt-darkgrey-bold' style='text-align:right'>" + toLocaleDigits(this.getValue() * 1) + "</div>";
                                    }
                            }
                    },
                    {
                            xtype: 'displayfield',
                            name: 'section1_rashod_total',
                            width: 120,
                            renderer: function () {
                                    if (this.getValue() * 1 == 0) {
                                            return "<div class='txt-darkgrey-bold' style='text-align:right'>&mdash;</div>";
                                    } else {
                                            return "<div class='txt-darkgrey-bold' style='text-align:right'>" + toLocaleDigits(this.getValue() * 1) + "</div>";
                                    }
                            }
                    }
            ]
    }
);
