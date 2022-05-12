/**
 * ��������� - ������, �������������� ������ � �������������� ���������.
 * ������ ��� ��������� app/classes/combo/ComboDateIntervalKudir.js � ������
 * ����� ����� 2020/21, �� ����� �������������� � ����� ������ ������.
 *
 * @method  getPeriod �������� �����, ������������ ��� ��������� ����� � ����������� ���������
 *          actualDate � value.
 * @method  getQuarter ���������� ������� value � ������������ � ���������,
 *          � ��������� ��� �������� ��������� ������� actualDate.
 * @method  getHalfYear �� �������� � getQuarter, ��� ���������.
 * @method  getNineMonth �� �������� � getQuarter, ��� 9 �������.
 * @method  getYear �� �������� � getQuarter, ��� ����.
 * @method  getBuhPeriods ������� � ���������� ��������� ����� (@see app/classes/combo/ComboDateIntervalKudir.js).
 * @method  setDatesRange ���������� ������� actualDate � ������� ��������� dateRanges.
 *
 * @param string alternateClassName ������� ������������ ������.
 * @param string actualDate ������� ������� ����, ����� �� ��������������� �����������.
 * @param string dateFormat ����� ������� ����.
 * @param int value ������������� �������:
 * 0 = �� ���������
 * 1 = I �������
 * 2 = II �������
 * 3 = III �������
 * 4 = IV �������
 * 6 = ���������
 * 9 = 9 �������
 * 12 = ���
 * @param mixed|object dateRanges ��������� ���, ������������ ������� ��������.
 * ���������:
 * id = 1-4, 6, 9, 12 (@see value)
 * dateStart = ��������� ���� �������
 * dateEnd = �������� ���� �������
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
                    {id: 1, name: '�� I �������'},
                    {id: 2, name: '�� II �������'},
                    {id: 3, name: '�� III �������'},
                    {id: 4, name: '�� IV �������'},
                    {id: 6, name: '�� ���������'},
                    {id: 9, name: '�� 9 �������'},
                    {id: 12, name: '�� ���'}
                ]
            });
        }
    },
);
