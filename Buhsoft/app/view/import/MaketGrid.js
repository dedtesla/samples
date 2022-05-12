Ext.define('Buh.view.import.MaketGrid', {
    extend: 'Ext.grid.Panel',
    xtype: 'grd_imp',
    height: 200,
    alias: 'widget.impmaketgrid',
    viewConfig: {
        markDirty: false,
    },
    emptyText: "<center>Нет шаблонов</center>",
    store: null,
    columns: [{
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {
        text: 'Шаблон',
        dataIndex: 'maketName',
        flex: 1
    }, {
        xtype: 'actioncolumn',
        width: 50,
        items: [{
            handler: function (tab, rowIndex, colIndex, _item, e, rec) {
                this.up('grid').menu.grd = this.up('grid');
                this.up('grid').menu.rec = rec;
                this.up('grid').menu.showAt(e.getXY());
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
                text: 'Добавить шаблон импорта',
            }, {
                xtype: 'filefield',
                width: 365,
                emptyText: 'Выберите файл XLS',
                labelAlign: 'right',
                name: 'file-path',
                buttonText: 'Выбрать файл',
                buttonConfig: {
                    cls: 'grey-btn'
                }
            }

        ]
    },


    menu: Ext.create('Ext.menu.Menu', {
        cls: 'style2018 menu-gray',
        rec: null,
        grd: null,
        items: [
            {
                text: 'Удалить макет',
                icon: _icons.del,
                handler: function () {
                    var grd = this.up('menu').grd,
                        rec = this.up('menu').rec;
                    _confirmDel(
                        function () {
                            grd.store.remove(rec);
                            grd.store.sync();
                        });
                }
            }
        ]
    })

});
