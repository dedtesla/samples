/**
 * Компонент - хелпер, обеспечивающий работу с бухгалтерскими периодами.
 * Создан для поддержки app/classes/combo/ComboDateIntervalKudir.js в рамках
 * эпика КуДиР 2020/21, но может использоваться в любом другом случае.
 *
 * @method  getPeriod Основной метод, используемый для настройки комбо и выставления атрибутов
 *          actualDate и value.
 * @method  getQuarter Выставляет атрибут value в соответствии с кварталом,
 *          в интервале дат которого находится атрибут actualDate.
 * @method  getHalfYear По аналогии с getQuarter, для полугодия.
 * @method  getNineMonth По аналогии с getQuarter, для 9 месяцев.
 * @method  getYear По аналогии с getQuarter, для года.
 * @method  getBuhPeriods Создает и возвращает хранилище комбо (@see app/classes/combo/ComboDateIntervalKudir.js).
 * @method  setDatesRange Выставляет атрибут actualDate и создает хранилище dateRanges.
 *
 * @param string alternateClassName Краткое наименование класса.
 * @param string actualDate Текущая рабочая дата, может не соответствовать календарной.
 * @param string dateFormat Маска формата даты.
 * @param int value Идентификатор периода:
 * 0 = по умолчанию
 * 1 = I квартал
 * 2 = II квартал
 * 3 = III квартал
 * 4 = IV квартал
 * 6 = полугодие
 * 9 = 9 месяцев
 * 12 = год
 * @param mixed|object dateRanges Хранилище дат, определяющих границы периодов.
 * Структура:
 * id = 1-4, 6, 9, 12 (@see value)
 * dateStart = начальная дата периода
 * dateEnd = конечная дата периода
 *
 * GBS-8588|14108
 * 08.2020
 */
Ext.define('Buh.classes.common.BuhPeriod',
    {
        alternateClassName: ['CommonBuhPeriod'],
        actualDate: null,
        tempDate: null,
        dateFormat: 'Y-m-d',
        value: 0,
        dateRanges: null,
        yearToHold: null,

        setDatesRange: function() {
            let me = this, holdYear = Ext.util.Cookies.get('yeartohold');

            _d = new Date();
            me.actualDate = iif(me.actualDate == null, new Date(iif(parseInt(holdYear) > 0, holdYear, currYear), _d.getMonth(), _d.getDay()), me.actualDate);

            me.dateRanges =  Ext.create('Ext.data.Store', {
                fields: [
                    {type: 'int', name: 'id'},
                    {type: 'string', name: 'startMonth'},
                    {type: 'string', name: 'startDay'},
                    {type: 'string', name: 'endMonth'},
                    {type: 'string', name: 'endDay'},
                ],
                data: [
                    {id: 1, startMonth: 0, startDay: 1, endMonth: 2, endDay: 31},
                    {id: 2, startMonth: 3, startDay: 1, endMonth: 5, endDay: 30},
                    {id: 3, startMonth: 6, startDay: 1, endMonth: 8, endDay: 30},
                    {id: 4, startMonth: 9, startDay: 1, endMonth: 11, endDay: 31},
                    {id: 6, startMonth: 0, startDay: 1, endMonth: 5, endDay: 30},
                    {id: 9, startMonth: 0, startDay: 1, endMonth: 8, endDay: 30},
                    {id: 12, startMonth: 0, startDay: 1, endMonth: 11, endDay: 31}
                ]
            });
        },

        checkDateRange: function(id) {
            let me = this, _year, _date,
                rec = me.dateRanges.findRecord('id', id);

            if (rec) {
                _year = iif(me.actualDate.getFullYear() < 2021, 2021, me.actualDate.getFullYear());

                return iif(Ext.Date.between(me.actualDate,
                    new Date(_year, rec.get('startMonth'), rec.get('startDay')),
                    new Date(_year, rec.get('endMonth'), rec.get('endDay'))),
                    rec.get('id'), 0);
            }

            return 0;
        },

        getQuarter: function () {
            let me = this;

            for (i = 1; i < 5; i++) {
                me.value = me.checkDateRange(i);
                if (me.value > 0) return false;
            }
        },

        getHalfYear: function () {
            let me = this;
            me.value = me.checkDateRange(6);
        },

        getNineMonth: function () {
            let me = this;
            me.value = me.checkDateRange(9);
        },

        getYear: function () {
            let me = this;
            me.value = me.checkDateRange(12);
        },

        getPeriod: function (_d) {
            let me = this;

            me.setDatesRange();
            me.value = 0;

            if (_d != _dummy && _d != null) {
                me.actualDate = _d;
                me.getQuarter();
                if (me.value > 0) return me.value;
            }

/*
            me.getQuarter();
            if (me.value > 0) return me.value;
*/

            me.getHalfYear();
            if (me.value > 0) return me.value;

            me.getNineMonth();
            if (me.value > 0) return me.value;

            me.getYear();
            if (me.value > 0) return me.value;
        },

        getBuhPeriods: function () {
            return Ext.create('Ext.data.Store', {
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
            });
        }
    },
);
