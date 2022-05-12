/**
 * ���������� ������ ���������� ��������� ������� ����� ������� � ��������.
 * �������� ������� = 1 �������, ���������, 9 �������, ���.
 * ����������� ����������� ����� ���������� "���������".
 *
 * ������ ���������� ��������� ������� �� Buh.classes.common.BuhPeriod (@see app/classes/common/BuhPeriod.js):
 * - ������,
 * - ���������,
 * - ��������� ���� �������,
 * - �������� ���� �������.
 *
 * ��� ������� 3 ����� ����������� ������ �������� - �������� ���������� ����� ���� ������ 12 (���) �
 * ��������� ���������� ���������� ��� ��������� �������������.
 *
 * ��� ������� 2 ����������� ������ �������� - ������� ���������, ��������� ������ ��������.
 *
 * @method reconfig �������� �����. ����������� ���������� � ���������� ������ ��� �������� ������� �����.
 * ������� ���������:
 * 1. int tab itemId �������� �������.
 * 2. int value ID ������ � ��������� ����� ����������.
 *
 * ��������:
 * 1. �������� � �������� ������� ��� �������� ������� ����� (tab) � bookPeriod.
 * 2. �������� ID ������ � ���������:
 * 2.1. ���� ������� ������ - 3 (tab == 4) - ������ ��� (val = 12).
 * 2.2. � ��������� ������� - val = value - ��������� � ��������� ���������.
 * 2.3. ���� value ������ - val = bookPeriod (���� ���� ����������� ����� ��� �������).
 * 2.4. ����� value = ��������� ������ getPeriod() ������� (@see Buh.classes.common.BuhPeriod).
 * 3. ������ value � ������� ��������� tr_states (namefield = 'kdrs' + tab).
 * 4. ������������ ��������� ��� ��� ���������� �������� (@see setPeriodDates).
 *
 * @method setPeriodDates ������������ ��������� ��� ��� �������� �������� ���������� � �������� ������������
 * ������� (@see Buh.classes.common.BuhPeriod). ������ ��� ������������� �������� ���������� ���� (actualDate),
 * ������� ����������� ��� ����������� ������� �� ��������� ���������� � ��� ������������ ��������� ���.
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
            // ��� ������� 3 ����� - ������ ���.
            val = 12;

            me.store.filterBy(function(rc){
                if (rc.data.id == 12) return true;
                else return false;
            })
        } else if (tab == 2) {
            // ��� ������� 2 - ������ � ��������� 1-4 (��������).
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
