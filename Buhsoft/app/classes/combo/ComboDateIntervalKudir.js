/**
 * Выпадающий список интервалов отчетного периода Книги доходов и расходов.
 * Отчетные периоды = 1 квартал, полугодие, 9 месяцев, год.
 * Разделитель вставляется перед интервалом "полугодие".
 *
 * Данные компонента полностью зависят от Buh.classes.common.BuhPeriod (@see app/classes/common/BuhPeriod.js):
 * - хелпер,
 * - хранилище,
 * - начальная дата периода,
 * - конечная дата периода.
 *
 * Для раздела 3 Книги реализуется особый сценарий - значение компонента может быть только 12 (год) и
 * компонент становится недоступен для изменений пользователем.
 *
 * Для раздела 2 реализуется особый сценарий - периоды убираются, оставлены только кварталы.
 *
 * @method reconfig Основной метод. Выполняется подготовка и сохранение данных для текущего раздела Книги.
 * Входные параметры:
 * 1. int tab itemId текущего раздела.
 * 2. int value ID записи в хранилище этого компонента.
 *
 * Сценарий:
 * 1. Проверка и фиксация кукисов для текущего раздела книги (tab) в bookPeriod.
 * 2. Фиксация ID записи в хранилище:
 * 2.1. Если текущий раздел - 3 (tab == 4) - только год (val = 12).
 * 2.2. В остальных случаях - val = value - приоритет у входящего аргумента.
 * 2.3. Если value пустой - val = bookPeriod (если есть сохраненный кукис для раздела).
 * 2.4. Иначе value = результат метода getPeriod() хелпера (@see Buh.classes.common.BuhPeriod).
 * 3. Запись value в таблицу состояний tr_states (namefield = 'kdrs' + tab).
 * 4. Формирование диапазона дат для выбранного значения (@see setPeriodDates).
 *
 * @method setPeriodDates Формирование диапазона дат для текущего значения компонента с активным привлечением
 * хелпера (@see Buh.classes.common.BuhPeriod). Хелпер при инициализации содержит актуальную дату (actualDate),
 * которая применяется для определения периода по умолчанию компонента и для формирования диапазона дат.
 *
 * GBS-8588|14108
 * 08.2020
 */
Ext.define('Buh.classes.combo.ComboDateIntervalKudir', {
    extend: 'Gbs.ComboBox',
    requires: ['Buh.classes.common.BuhPeriod'],
    xtype: 'combo_interval_kudir',
    hideEmptyLabel: true,
    listConfig: {cls: 'style2018', minWidth: 150},
    displayField: 'name',
    valueField: 'id',
    editable: false,
    queryMode: 'local',
    width: 150,
    periodHelper: null,
    periodStartDate: null,
    periodEndDate: null,
    store: null,
    defaultPeriod: null,
    year: null,
    initComponent: function () {
        let me = this;
        me.periodHelper = new CommonBuhPeriod();
        me.bindStore(me.periodHelper.getBuhPeriods());
        me.store.load();
        // me.reconfig(1);
        // me.defaultPeriod = me.getValue();
        me.callParent(arguments);
    },
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '<tpl if="xindex == 5">',
        '<hr class="txt-grey"><li class="x-boundlist-item">{name}</li>',
        '<tpl else>',
        '<li class="x-boundlist-item">{name}</li>',
        '</tpl>',
        '</tpl>'
    ),
    displayTpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '{name}',
        '</tpl>'
    ),
    reconfig: function (tab, value) {
        let me = this, val;

        if (tab == 3) {
            // Для раздела 3 Книги - всегда год.
            val = 12;

            me.store.filterBy(function(rc){
                if (rc.data.id == 12) return true;
                else return false;
            })
        } else if (tab == 2) {
            // Для раздела 2 - только в диапазоне 1-4 (кварталы).
            val = iif(value < 5, value, me.periodHelper.getPeriod(new Date));

            me.store.filterBy(function(rc){
                if (rc.data.id <= 4) return true;
                else return false;
            })
        } else {
            val = iif(value > 0, value, me.periodHelper.getPeriod());

            me.store.filterBy(function(rc){
                return true;
            })
        }

        rec = me.store.findRecord('id', val);
        if (rec) {
            me.setValue(rec.get('id'));
            me.selectedIndex = rec.index;
        }
        me.setPeriodDates();
    },
    setPeriodDates: function () {
        let me = this, rec, _year;

        rec = me.periodHelper.dateRanges.findRecord('id', me.getValue());
        if (rec) {
            if (me.year==null) {
                _year = iif(me.periodHelper.actualDate.getFullYear() < 2021, 2021, me.periodHelper.actualDate.getFullYear());
                me.year = _year;
            } else {
                _year = me.year;
            }
            me.periodStartDate = new Date(_year, rec.get('startMonth'), rec.get('startDay'));
            me.periodEndDate = new Date(_year, rec.get('endMonth'), rec.get('endDay'));
        }
    }
/*
    getYear: function () {
        let me = this;
        return me.periodHelper.actualDate.getFullYear();
    }
*/
})
