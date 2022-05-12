/**
 * Грид справочника ДиР.
 *
 * GBS-7010.
 * Скрывается кнопка actioncolumn для строки с заголовком группы (read_onl = 2).
 *
 */
Ext.define('Buh.view.sprav.Dir.Grid', {
    requires: ['Buh.classes.field.Find',
        'Buh.classes.combo.ComboAnalit',
        'Buh.classes.container.ThreeSelect',
        'Buh.classes.common.Values'
    ],

    extend: 'Ext.grid.Panel',
    xtype: 'grd_sprav_dir',
    cls: ' grid-multi-line',
    height: 200,
    alias: 'widget.spravdirgrid',
    viewConfig: {
        markDirty: false,
    },
    emptyText: "<center>Нет данных для отображения</center>",
    store: null,
    columns: [{
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {
        text: '<b>Наименование</b>',
        dataIndex: 'name',
        sortable: false,
        flex: 1,
        renderer: function (org, column, record) {
            if (record.get('read_onl') == 2) {
                ret = '<b><big>' + record.get('name') + '</big></b>';
            }
            else {
                ret = record.get('name');
            }
            return ret;

        }
    }, {
        text: '<b>Аналитика</b>',
        dataIndex: 'id_analit2',
        width: 140,
        sortable: false,
        renderer: function (grid, column, record) {

            var sdrDtAnalit = CommonVals.getDRAnalit(1),
                pv = record.data.id_analit2 * 1,
                rec = sdrDtAnalit.findRecord('id', pv),
                ret = '';

            if (rec != _dummy)
                ret = rec.data.name;
            if (record.get('read_onl') != 2)
                return ret;
            else
                return '';
        },
    }, {
        xtype: 'actioncolumn',
        width: 50,
        sortable: false,
        items: [{
            handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
            },
            getClass: function(v, meta, rec) {
                if (rec.get('read_onl') == 2) {
                    return 'x-hide-display';
                }
            }
        }]
    }],

    tbar: {
        xtype: 'toolbar',
        name: 'tbarTop',
        dock: 'top',
        items: [
            {
                xtype: 'greenbutton',
                action: 'addvdr'
            },
            {
                xtype: 'three_select',
                nm: 'vdr',
                b1: 'Патент',
                b2: 'Доход',
                b3: 'Расход',
            },
            {
                xtype: 'combo_analit',
                width: 140
            },
            '->',
            {
                xtype: 'fld_find',
                width: 180,
            }

        ]
    },


    menu: Ext.create('Ext.menu.Menu', {
        cls: 'style2018 menu-gray',
        rec: null,
        grd: null,
        /*
                style: {
                    zindex: '20000 !important'
                },
        */
        items: [
            {
                text: 'Изменить',
                icon: _icons.edit,
                handler: function () {
                    this.up('menu').grd.fireEvent('editRecord', this.up('menu').rec);
                }
            }, {
                text: 'Удалить',
                icon: _icons.del,
                handler: function () {
                    this.up('menu').grd.fireEvent('deleteRecord', this.up('menu').rec);
                }
            }]
    })

});
