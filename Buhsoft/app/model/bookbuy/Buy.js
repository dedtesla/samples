Ext.define('Buh.model.bookbuy.Buy', {
    extend: 'Ext.data.Model',
    fields: [
        'id',// int(10) unsigned auto_increment,
        {
            name: 'origin',
            type: 'int'
        },// tinyint(1) unsigned comment '������������� (0 - ������ ����, ������ �� ���� �������������)',
        'typ_doc',// char(3) comment '��� ���������',
        'dat_doc',// date comment '���� ���������',
        'dat_pay',// varchar(15),
        'dat_reg',
        'n_pay',// varchar(15),
        'number',// varchar(15) comment '����� ���������',
        'summa',// decimal (15,2) unsigned default 0,
        'sumnds',// decimal (15,2) unsigned default 0,
        'inn',// varchar(15) comment '��� ����������',
        'kpp',// varchar(15) comment '��� ����������',
        'df',// varchar(10) comment '��������������� ���� ���������',
        'sposob',// varchar(15),
        'kod',// varchar(15) comment '��� ���������',
        'sum20',// decimal (15,2) unsigned default 0,
        'sum18',// decimal (15,2) unsigned default 0,
        'sum10',// decimal (15,2) unsigned default 0,
        'sum0',// decimal (15,2) unsigned default 0,
        'sumb',// decimal (15,2) unsigned default 0,
        'sumnds20',// decimal (15,2) unsigned default 0,
        'sumnds18',// decimal (15,2) unsigned default 0,
        'sumnds10',// decimal (15,2) unsigned default 0,
        'sumnds0',// decimal (15,2) unsigned default 0,
        'sumndsb',// decimal (15,2) unsigned default 0,
        'stav',// varchar(15) comment '������ ���',
        'df1',// varchar(10) comment '��������������� ���� ���������',
        'org_id',// int(10) unsigned comment 'id ��������',
        'mediator_id',// int(10) unsigned comment 'id  ����������',
        'mediator_name',// varchar(250)
        'mediator_inn_kpp',// varchar(30)
        'sumz',// decimal (15,2) unsigned,
        'sumndsz',// decimal (15,2) unsigned,
        'nm_p',// id comment '�������� ��������',
        'inn_p',// varchar(15) comment '��� ��������',
        'kpp_p',// varchar(15) comment '��� ��������',
        'org_inn_kpp',
        'gtd',// varchar(250) comment '���',
        'osnov_zak',// varchar(250) comment '��������� ��������',
        {
            name: 'all_pay',
            convert: function(value) {
                if ((value*1)==0){
                    let v = [];
                    return v.map(item => '');
                }
                let v = value ? Ext.decode(value) : [];
                return v.map(item => `�${item.n} �� ${Ext.Date.format(Ext.Date.parse(item.dat, 'Y-m-d'), 'd.m.Y')}`)
            }
        },// varchar(250) comment '���� � ����� ���������� �������',
        'df_ship',// varchar(10) comment '��������������� ���� ��������',
        'id_sb',// int(10) unsigned comment 'id ������',
        'year',// int(4) unsigned comment '���',
        'curr_id',// char(3) comment '��� ������',
        'summav',// decimal(15,2) unsigned comment '����� � ������',
        {
            name: 'dates_accounting',
            convert: function(value) {
                let v = value ? Ext.decode(value) : [];
                return v.map(date => Ext.Date.format(Ext.Date.parse(date, 'Y-m-d'), 'd.m.Y'))
            }
        },// varchar(250) comment '���� �������� �� ���� ����� ;',
        'tnved',// varchar(250)
        {
            name: 'have_rnpt',
            type: 'boolean',
            defaultValue: false
        },
        'corr_number',
        'corr_date',

    ]
});
