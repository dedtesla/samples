Ext.define('Buh.classes.common.Values',
    {
        alternateClassName: ['CommonVals'],

        getTextAnalit: function (_i) {
            var ar_analits = [];
            ar_analits[0] = '*';
            ar_analits[5] = 'Товары';
            ar_analits[3] = 'Материалы';
            ar_analits[30] = 'Материалы';
            ar_analits[31] = 'Услуги';
            ar_analits[32] = 'РБП';
            ar_analits[4] = 'Продукция';
            ar_analits[41] = 'Услуги';
            ar_analits[1] = 'ОС';
            ar_analits[2] = 'НМА';

            return ar_analits[_i * 1];
        },

        getScAnalit: function (_oper, _analit) {
            var ret = [];
            ret[0] = '*';
            if (_oper == 1) {
                ret[5] = '41.1';
                ret[3] = '10.1';
                ret[31] = '20.1';
                ret[32] = '97.1';
                ret[1] = '08.1';
                ret[2] = '08.5';
            }
            else {
                ret[5] = '41.1';
                ret[3] = '10.1';
                ret[4] = '43.1';
                ret[41] = '90.1';
                ret[1] = '01.1';
                ret[2] = '04.1';
            }

            return ret[_analit * 1];
        },

        statics: {
            getDRAnalit: function (mode) {
                if (mode == 1) {
                    return Ext.create('Ext.data.Store', {
                        fields: [
                            {type: 'string', name: 'id'},
                            {type: 'string', name: 'name'},
                        ],
                        data: [
                            {id: '-1', name: 'Вся аналитика'},
                            {id: '1', name: 'ОС'},
                            {id: '2', name: 'НМА'},
                            {id: '3', name: 'Материалы'},
                            {id: '4', name: 'Продукция'},
                            {id: '5', name: 'Товары'},
                            {id: '6', name: 'Организации'},
//                            {id: '7', name: 'Сотрудники'},
                            {id: '71', name: 'Зарплата'},
                            {id: '0', name: 'Без аналитики'},
                            {id: '41', name: 'Услуги оказанные'},
                            {id: '31', name: 'Услуги полученные'},
                            {id: '32', name: 'РБП'},

                        ]
                    });

                }


                if (mode == 2) {
                    return [['0', 'Нет аналитики'],
                        ['1', 'ОС'],
                        ['2', 'НМА'],
                        ['3', 'Материальные доходы/расходы'],
                        ['4', 'Продукция'],
                        ['5', 'Товары'],
                        ['6', 'Организация'],
                        ['7', 'Кадровый состав'],
                        ['8', 'Банки'],
                        ['9', 'Виды деятельности'],
                        ['10', 'Виды налогов'],
                        ['11', 'Внереализационные/операционные доходы/расходы'],
                        ['12', 'Подразделения'],
                        ['13', 'Начисления'],
                        ['14', 'ККМ']
                    ];

                }

                if (mode == 3) {
                    return Ext.create('Ext.data.Store', {
                        fields: [
                            {type: 'string', name: 'id'},
                            {type: 'string', name: 'name'},
                        ],
                        data: [
                            {id: '5', name: 'Товары'},
                            {id: '41', name: 'Услуги оказанные'},
                            {id: '3', name: 'Материалы'},
                            {id: '31', name: 'Услуги полученные'},
                            {id: '4', name: 'Продукция'},
                            {id: '1', name: 'ОС'},
                            {id: '2', name: 'НМА'},
                            {id: '71', name: 'Зарплата'},
                            {id: '6', name: 'Огранизации'},
                            {id: '0', name: 'Без аналитики'},
                            {id: '32', name: 'РБП'},

                        ]
                    });
                }

            }
        }
    });
