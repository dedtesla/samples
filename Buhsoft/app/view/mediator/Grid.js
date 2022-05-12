Ext.define('Buh.view.mediator.Grid', {
    extend: 'Ext.grid.Panel',
    requires: ['Buh.classes.container.Period'],
    alias: 'widget.mediatorgrid',
    emptyText: "<center>Нет данных для отображения</center>",
    store: null, //Ext.create('Buh.store.Mediators'),
    columns: [{
        text: 'Дата',
        dataIndex: 'date_doc',
        xtype: 'datecolumn',
        format: 'd.m.Y',
        width: 120,
        sortable: false,
        renderer : function (org, column, record) {
            return '<span class="txt-grey">' + Ext.Date.format(record.get('date_doc'), 'd M Y') +'</span>';
        }
    }, {
        text: 'id',
        dataIndex: 'id',
        hidden: true
    }, {
        text: '№',
        dataIndex: 'n_doc',
        width: 120,
        renderer : function (org, column, record) {
            return '<span class="txt-grey">' + record.get('n_doc') +'</span>';
        }
    }, {
        text: 'Комитент или принципал',
        dataIndex: 'mediator',
        flex: 1,
    }, {
        text: 'Период',
        dataIndex: 'period',
        width: 220,
        renderer : function (org, column, record) {
            let t= '',
                dt1 = record.get('dat_b'),
                dt2 = record.get('dat_e');

            if (dt1!=null) {
              d1 = dt1.getDate();
              m1 = dt1.getMonth();
            }
            else
              return;
            if (dt2!=null) {
                d2 = dt2.getDate();
                m2 = dt2.getMonth();
            }
            else
              return;
            if (m1!=m2)
             {
               t = d1 + " " + Date.monthNamesShort[m1] + ' &mdash; ' + d2 + " " + Date.monthNamesShort[m2];
             }
            else
             {
               t = d1 + ' &mdash; ' + d2 + " " + Date.monthNamesShort[m2];
             }

            return t;
        }
    }, {
        text: 'Договор',
        dataIndex: 'contract',
        width: 220,
        renderer : function (org, column, record) {
            return '<span class="txt-grey">' + record.get('contract') +'</span>';
        }
    }, {
        text: 'Вознаграждение',
        dataIndex: 'reward',
        align: 'right',
        width: 120,
        renderer : function (org, column, record) {
            if ((record.get('reward') * 1) != 0)
                return columnBlue((record.get('reward')*1).toFixed(2));
            else
                return columnBlue('&mdash;');
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
        listeners: {
          show: function(){
              var me = this,
                  rec = this.rec;
              if (rec.data.way_create=="2")
                 me.down('#itemGoRec').show();
              else
                 me.down('#itemGoRec').hide();
          }
        },
        items: [
            {
                text: 'Открыть запись в продажах',
                itemId: 'itemGoRec',
                icon: _icons.forward_w,
                handler: function () {
                    this.up('menu').grd.fireEvent('goToDeal', this.up('menu').rec);
                }
            }, {
                text: 'Скачать',
                icon: _icons.dwnl,
                menu:
                Ext.create('Ext.menu.Menu', {
                   cls: 'style2018 menu-gray',
                   items: [
                   {
                     text: 'Скачать PDF',
                     icon: _icons.dwnl,
                     handler: function () {
                         this.up('menu').up('menu').grd.fireEvent('loadPDF', this.up('menu').up('menu').rec);
                     }

                   },{
                     text: 'Скачать XLS',
                     icon: _icons.dwnl,
                     handler: function () {
                         this.up('menu').up('menu').grd.fireEvent('loadXLS', this.up('menu').up('menu').rec);
                     }

                   }
               ]})
            }, {
                text: 'Распечатать',
                icon: _icons.wprint,
                handler: function () {
                    this.up('menu').grd.fireEvent('printRecord', this.up('menu').rec);
                }
            }, {
                text: 'Редактировать',
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
    }),

    tbar: {
        xtype: 'toolbar',
        name: 'tbarTop',
        dock: 'top',
        items: [
        {
            xtype: 'greenbutton',
            text: 'Создать отчет',
        },/*Ext.create('Buh.classes.container.Period', {name : 'rep_period' })*/

        {
            xtype: 'c_period',
            name : 'rep_period'
        },
        , {

            xtype: 'field_find',
            width: 190,
        }
        ]
    }
});
