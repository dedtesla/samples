Ext.define('Buh.store.kudir.KudirCardSection2Store', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.kudir.KudirCardSection2Model',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    data: [
        {id: 1, parameter: 'Тип ОС', indicator: '', value: ''},
        {id: 2, parameter: 'Наименование', indicator: 2, value: ''},
        {id: 3, parameter: 'Дата оплаты', indicator: 3, value: ''},
        {id: 4, parameter: 'Дата подачи документов на государственную регистрацию', indicator: 4, value: ''},
        {id: 5, parameter: 'Дата ввода в эксплуатацию', indicator: 5, value: ''},
        {id: 6, parameter: 'Первоначальная стоимость', indicator: 6, value: ''},
        {id: 7, parameter: 'Срок полезного использования, лет', indicator: 7, value: ''},
        {id: 8, parameter: 'Остаточная стоимость', indicator: 8, value: ''},
        {id: 9, parameter: 'Количество кварталов эксплуатации', indicator: 9, value: ''},
        {id: 10, parameter: 'Доля стоимости, принимаемая в расходы за налоговый период, %', indicator: 10, value: ''},
        {id: 11, parameter: 'Доля стоимости, принимаемая в расходы за каждый квартал налогового периода, %', indicator: 11, value: ''},
        {id: 12, parameter: 'Учитываемые расходы за каждый квартал', indicator: 12, value: ''},
        {id: 13, parameter: 'Учитываемые расходы за налоговый период', indicator: 13, value: ''},
        {id: 14, parameter: 'Включено в расходы в предыдущие периоды', indicator: 14, value: ''},
        {id: 15, parameter: 'Расходы, подлежащие списанию в будущих периодах', indicator: 15, value: ''},
        {id: 16, parameter: 'Дата выбытия (реализации)', indicator: 16, value: ''}
    ]
});
