Ext.define('Buh.view.mediator.report.Grid', {
/*
    requires: ['Buh.classes.field.Find',
        'Buh.classes.combo.ComboAnalit',
        'Buh.classes.container.ThreeSelect',
        'Buh.classes.common.Values'
    ],
*/
    extend: 'Ext.grid.Panel',
    xtype: 'grd_mediator_rep',
    cls: ' grid-multi-line',
    height: 200,
    alias: 'widget.mediatorrepgrid',
    viewConfig: {
        markDirty: false,
    },
    emptyText: "<center>Для загрузки продаж выберите принципала</center>",
    store: null,
    columns: [{
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {

        text: 'Дата',
        dataIndex: 'dat',
        xtype: 'datecolumn',
        cls : 'txt-grey',
        format: 'd.m.Y',
        width: 100,
        sortable: false,
        renderer: function (org, column, record) {
          return  "<div class=txt-grey>"+Ext.Date.format(record.get('dat'), 'd.m.y')+"</div>";
        }
    }, {
        text: 'Документ',
        dataIndex: 'md',
        sortable: false,
        flex: 1,
        renderer: function (org, column, record) {
            if (record.get('include_sb') == 1) {
                ret = record.get('md');
            }
            else {
                ret = "<div class=txt-grey>"+record.get('md')+"</div>";
            }
            return ret;

        }
    }, {
        text: 'Сумма комитента',
        dataIndex: 's_buy',
        align : 'right',
        width: 120,
        sortable: false,
        renderer: function (org, column, record) {
            if (record.get('include_sb') == 1) {
                ret = record.get('s_buy');
            }
            else {
                ret = "<div class=txt-grey>&#8212;</div>";
            }
            return ret;

        }
    }, {
        text: 'Сумма реализации',
        dataIndex: 'sd_summa',
        align : 'right',
        width: 120,
        sortable: false,
        renderer: function (org, column, record) {
            if (record.get('include_sb') == 1) {
                ret = record.get('sd_summa');
            }
            else {
                ret = "<div class=txt-grey>&#8212;</div>";
            }
            return ret;

        }
    }, {
        xtype: 'actioncolumn',
        width: 50,
        sortable: false,
        items: [{
            handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                this.up('grid').fireEvent('itemcontextmenu', tab, rec, _item, rowIndex, e);
            }
        }]

    }],

    menu: Ext.create('Ext.menu.Menu', {
        cls: 'style2018 menu-gray',
        rec: null,
        grd: null,
        items: [
            {
                text: 'Перейти к продаже',
                icon: _icons.forward_w,
                handler: function () {
                    this.up('menu').grd.fireEvent('goDeal', this.up('menu').rec);
                }
            }, {
                text: 'Исключить',
                icon: _icons.blind,
                hidden : true,
                name : 'e',
                handler: function () {
                    this.up('menu').grd.fireEvent('exceptRecord', this.up('menu').rec);
                }
            }, {
                text: 'Вернуть запись',
                icon: _icons.reset_w,
                hidden : true,
                name : 'i',
                handler: function () {
                    this.up('menu').grd.fireEvent('includeRecord', this.up('menu').rec);
                }
            }]
    })

});
