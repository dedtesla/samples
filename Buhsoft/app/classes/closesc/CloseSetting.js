Ext.define('Buh.classes.closesc.CloseSetting', {
    extend: 'Ext.container.Container',
    xtype: 'closesetting',
    cls: 'container-align',
    layout: {
        type: 'hbox'
    },
    items: [{
        xtype: 'hidden',
        name: 'period',
        value: 0
    }, {
        xtype: 'gbs_combo_year',
        itemId: 'cmbYear',
        value: currYearMax,
        listeners: {
            'select': function (t, nv, ov, e) {
                this.up('window').fireEvent("setYearClosing");
            }
        }

    }, {
        xtype: 'gbs_combo',
        name: 'periods',
        editable: false,
        displayField: 'name',
        valueField: 'id',
        width: 300,
        queryMode: 'remote',
        store: {
            xtype: 'store',
            fields: ['id', 'name', 'period', 'closed', 'period_name', 'dat_end_period'],
            autoload: false,
            proxy: {
                type: 'ajax',
                autoload: false,
                url: dir_start_buh_ + 'closeaccounts/listPeriods/',
                extraParams: {'yearDatabase': currYear, 'period': 0},
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },


        },
        listeners:
            {
                select: function () {
                    this.up('window').fireEvent("fillTrees");
                }
            }


    }, {
        xtype: 'tbfill'
    }, {
        xtype: 'button',
        cls: 'btn-setting',
        name: 'openSettingWindow',
        text: 'Ежемесячное закрытие',
        handler: function (btn) {
            this.up('window').fireEvent("openWindowSetting", btn);
        }
    }
    ]
})
;
