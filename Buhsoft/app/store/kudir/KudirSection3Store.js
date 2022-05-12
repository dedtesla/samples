Ext.define('Buh.store.kudir.KudirSection3Store', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.kudir.KudirSection3Model',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    data: [
        {'id': 1, 'indicator': 'Сумма убытков, полученных по итогам предыдущих налоговых периодов, которые не были перенесены на начало истекшего налогового периода, всего: (сумма по кодам строк 020-110)', 'row': '010', 'summa': 0, 'outerid': 0},
        {'id': 2, 'indicator': '', 'row': '020', 'summa': 0, 'outerid': 0},
        {'id': 3, 'indicator': '', 'row': '030', 'summa': 0, 'outerid': 0},
        {'id': 4, 'indicator': '', 'row': '040', 'summa': 0, 'outerid': 0},
        {'id': 5, 'indicator': '', 'row': '050', 'summa': 0, 'outerid': 0},
        {'id': 6, 'indicator': '', 'row': '060', 'summa': 0, 'outerid': 0},
        {'id': 7, 'indicator': '', 'row': '070', 'summa': 0, 'outerid': 0},
        {'id': 8, 'indicator': '', 'row': '080', 'summa': 0, 'outerid': 0},
        {'id': 9, 'indicator': '', 'row': '090', 'summa': 0, 'outerid': 0},
        {'id': 10, 'indicator': '', 'row': '100', 'summa': 0, 'outerid': 0},
        {'id': 11, 'indicator': '', 'row': '110', 'summa': 0, 'outerid': 0},
        {'id': 12, 'indicator': 'Налоговая база за истекший налоговый период, которая может быть уменьшена на убытки предыдущих налоговых периодов (код стр.040 справочной части раздела I Книги доходов и расходов)', 'row': '120', 'summa': 0, 'outerid': 0},
        {'id': 13, 'indicator': 'Сумма убытков, на которую налогоплательщик фактически уменьшил налоговую базу за истекший налоговый период (в пределах суммы убытков, указанных по стр.010)', 'row': '130', 'summa': 0, 'outerid': 0},
        {'id': 14, 'indicator': 'Сумма убытка за истекший налоговый период (код стр.041 справочной части раздела I Книги учета доходов и расходов)', 'row': '140', 'summa': 0, 'outerid': 0},
        {'id': 15, 'indicator': 'Сумма убытков на начало следующего налогового периода, которые налогоплательщик вправе перенести на будущие налоговые периоды (код стр.010 - код стр.130 + код стр.140)', 'row': '150', 'summa': 0, 'outerid': 0},
        {'id': 16, 'indicator': '', 'row': '160', 'summa': 0, 'outerid': 0},
        {'id': 17, 'indicator': '', 'row': '170', 'summa': 0, 'outerid': 0},
        {'id': 18, 'indicator': '', 'row': '180', 'summa': 0, 'outerid': 0},
        {'id': 19, 'indicator': '', 'row': '190', 'summa': 0, 'outerid': 0},
        {'id': 20, 'indicator': '', 'row': '200', 'summa': 0, 'outerid': 0},
        {'id': 21, 'indicator': '', 'row': '210', 'summa': 0, 'outerid': 0},
        {'id': 22, 'indicator': '', 'row': '220', 'summa': 0, 'outerid': 0},
        {'id': 23, 'indicator': '', 'row': '230', 'summa': 0, 'outerid': 0},
        {'id': 24, 'indicator': '', 'row': '240', 'summa': 0, 'outerid': 0},
        {'id': 25, 'indicator': '', 'row': '250', 'summa': 0, 'outerid': 0}
    ]
});
