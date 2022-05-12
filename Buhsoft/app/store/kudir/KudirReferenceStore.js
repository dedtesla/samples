Ext.define('Buh.store.kudir.KudirReferenceStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.kudir.KudirReferenceModel',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    data: [
        { 'id': 1, 'indicator': 'Сумма полученных доходов за налоговый период', 'row': '010', 'summa': 0, 'outerid': 0},
        { 'id': 2, 'indicator': 'Сумма произведенных расходов за налоговый период', 'row': '020', 'summa': 0, 'outerid': 0},
        { 'id': 3, 'indicator': 'Сумма разницы между суммой уплаченного минимального налога и суммой исчисленного в общем порядке налога за предыдущий налоговый период', 'row': '030', 'summa': 0, 'outerid': 0},
        { 'id': 4, 'indicator': 'Итого доходов', 'row': '040', 'summa': 0, 'outerid': 0},
        { 'id': 5, 'indicator': 'Итого убытков', 'row': '041', 'summa': 0, 'outerid': 0},
    ]
});
