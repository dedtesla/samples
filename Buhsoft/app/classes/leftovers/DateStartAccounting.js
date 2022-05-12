Ext.define('Buh.classes.leftovers.DateStartAccounting', {

    constructor: function (cfg) {
        this.initConfig(cfg);
        this.callParent(arguments);
        var me = this;
        var config = this.config;

        this.on({
            'beforeshow': function () {
                let win = this,
                    runner = new Ext.util.TaskRunner();
                _ajax(
                    dir_start_buh_ + "ostat/getDatLeftovers/",
                    {
                        yearDatabase: currYear
                    },
                    function (_ret) {
                        let ans = Ext.decode(_ret);
                        win.down('gbs_combo_year').setValue(ans.dat.substr(0, 4));
                    }
                );
            }
        });

    },

    cls: 'style2018 sprav_window pad-small',
    extend: 'winEditDoc',
    layout: 'fit',
    modal: true,
    width: 650,
    task: null,
    callBack: null,
    items: {
        xtype: 'panel',
        title: 'Год начала учета',
        items: [
            {
                xtype: 'box',
                html: 'Год'
            },
            {
                xtype: 'gbs_combo_year'
            }
        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [
                {
                    text: 'Сохранить',
                    'xtype': 'greenbuttonsimple',
                    handler: function () {
                        this.up('window').save();
                    }
                }, {
                    text: 'Отмена',
                    handler: function () {
                        this.up('window').close();
                    }
                }]
        }],
    },

    save: function () {
        let win = this,
            _year = win.down('gbs_combo_year').getValue();
        _ajax(
            dir_start_buh_ + "ostat/setDatLeftovers/",
            {
                yearDatabase: currYear,
                year: _year
            },
            function (_ret) {
                let ans = Ext.decode(_ret);
                if (win.callBack != null) {
                    win.callBack();
                }
                win.close();
            }
        );
    },


});
