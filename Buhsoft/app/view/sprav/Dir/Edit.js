Ext.define('Buh.view.sprav.Dir.Edit', {
    requires: ['Buh.classes.container.Vertical', 'Buh.classes.combo.ComboAnalit'],
    extend: 'winEditDoc',
    alias: 'widget.editdir',
    itemId: 'winEditDir',
    width: 600,

    items: {
        xtype: 'form',
        title: 'Добавление дохода',
        layout: {
            type: 'table',
            columns: 2
        },
        items: [
            {
                xtype: 'hidden',
                name: 'id'
            },
            {
                xtype: 'hidden',
                name: 'id_gr'
            },
            {
                xtype: 'three_select',
                cls: 'block-btn-unite container-align',
                nm: 'd_r_',
                b1: 'Патент',
                b2: 'Доход',
                b3: 'Расход',
                colspan: 2
            },
            {
                xtype: 'cont_vert',
                cls: 'container-align',
                title: 'Вид',
                itm: {
                    xtype: 'gbs_combo',
                    name: 'id_gr_',
                    listConfig: {cls: 'style2018', minWidth: 440},
                    forceSelection: false,
                    width: 500,
                    displayField: 'name',
                    valueField: 'id_gr',
                    editable: false,
                    queryMode: 'local',
                    store: null
                },
                colspan: 2
            },
            {
                xtype: 'cont_vert',
//                cls : 'container-align',
                title: 'Наименование',
                itm: {
                    xtype: 'textfield',
                    name: 'name',
                    width: 350,
                    msgTarget: 'none',
                    allowBlank: false
                },
            },

            {
                xtype: 'cont_vert',
                name: 'cnt_analit',
                title: 'Аналитика',
                itm: {
                    xtype: 'combo_analit',
                    width: 140,
                    name: 'id_analit2'
                }
            },

        ],
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            items: [{
                text: 'Сохранить',
                formBind: true,
                xtype: 'greenbuttonsimple',
                action: 'save'
            }, {
                text: 'Отмена',
                action: 'close',
                handler: function () {
                    this.up('window').close();
                }
            }]
        }]

    },

    setPatent: function (_val) {
        var win = this;
        if (_val == 1) {
            win.down('[name=cnt_analit]').hide();
            win.down('[name=name]').setWidth(500);
        }
        else {
            win.down('[name=cnt_analit]').show();
            win.down('[name=name]').setWidth(350);
        }
    }
});
