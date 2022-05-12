Ext.define('Buh.view.mediator.report.Form', {
    requires: ['Buh.classes.container.ThreeSelect', 'Buh.classes.container.Vertical', 'Buh.classes.sprav.Tool' , 'Buh.classes.container.Period', 'Buh.view.mediator.report.Grid'],
    extend: 'Ext.form.Panel',
    xtype: 'mediatorform',
    bodyCls: 'panel-pad',
    layout: 'form',
    title : 'Отчет комиссионера', 
    items: [
        {
            xtype: 'hidden',
            name: 'id',
            value: 0
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align hr-line',
            name: 'cnt-go-to',
            hidden: true,
            itm: {
               xtype: 'button',
               text: 'Перейти к записи в учете продаж',
               icon : _icons.forward,
               border: 0,
               action: 'gotodeal'
            }
        },
/*
        {
            'xtype': 'container',
            'cls': 'hr-line'
        },
*/
        {
            xtype: 'three_select',
            cls: 'block-btn-unite container-align',
            nm: 'type_report',
            b1: 'Комиссионер',
            b2: 'Агент',
        },
        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-n-doc',
            title: 'Номер и дата отчета',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'textfield',
                        cls: 'input-number',
                        name: 'n_doc',
                        width: 140
                    },
                    {
                        xtype: 'gbs_date',
                        name: 'date_doc',
                        submitFormat: 'Y-m-d',
                        width: 140
                    }],
            }
        },



        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit1',
            title: 'Комитент',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit1',
                'emptyText': 'Выберите или добавьте',
                'id_sprav': 6,
                'fid': 'org_id',
                'fnm': 'org_nam',
                'width': 460,
                listWidth : 460 ,
            }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            name: 'cnt-analit2',
            title: 'Договор',
            itm: {
                xtype: 'sprav_tool',
                'name': 'analit2',
                'emptyText': 'Выберите или добавьте',
                'filterMask': 'Не выбран контрагент',
                'btnTitle': 'Добавить',
                'id_sprav': 15,
                'haveFilter': true,
                'fid': 'dog_id',
                'fnm': 'dog_nam',
                'width': 460,
                'allowBlank': true,
            }
        },


        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Способ создания отчета',
            itm:{
                    xtype: 'gbs_combo',
                    editable: false,
                    displayField: 'name',
                    valueField: 'id',
                        store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: [{
                                'id': '1',
                                'name': 'Сводный - вознаграждение рассчитано в продажах',
                                },{
                                'id': '2',
                                'name': 'Ручной - вознаграждение рассчитать в отчете',
                                }
                            ]}),
                    value: '1',
                    width: 520,
                    name: 'way_create',
                }
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'За период',
            itm:{
                xtype: 'c_period',
                name : 'docs_period',
                nm1 : 'dat_b',
                nm2 : 'dat_e',
                }
        },

        {
            'xtype': 'container',
            'cls': 'hr-line'
        },
        {
            'xtype': 'label',
            'cls': 'sub-title-doc',
            'text': 'Расчет суммы вознаграждения'
        },

        {
          xtype : 'grd_mediator_rep'
        },

        {
            xtype: 'cont_vert',
            cls: 'container-align',
            title: 'Способ расчета комиссионного вознаграждения',
            itm:{
                    xtype: 'gbs_combo',
                    editable: false,
                    displayField: 'name',
                    queryMode:'local',
                    valueField: 'id',
                    store: Ext.create('Ext.data.Store', {
                            fields: ['id', 'name'],
                            data: [
                                {
                                'id': '0',
                                'name': 'Выбрано несколько способов расчета',
                                },{
                                'id': '1',
                                'name': 'Разница суммы продажи и поступления',
                                },{
                                'id': '2',
                                'name': 'Процент от суммы продажи',
                                },{
                                'id': '3',
                                'name': 'Фиксированная сумма',
                                }
                            ]}),
                    value: '1',
                    width: 520,
                    name: 'way_calc',
                }
        },
        {
            xtype: 'container', 
            cls: 'container-align input-margin-block',
            itemId : 'cont-reward',
            layout : 'hbox',
            items:[
              {
                 xtype: 'cont_vert',
                 cls: 'container-align-small',
                 name: 'c-prc',
                 title: 'Процент',
                 itm: {
                    xtype : 'textfield',
                    name : 'percent',
                    width : 60
                 }
              },
              {
                 xtype: 'cont_vert',
                 cls: 'container-align-small',
                 title: 'Вознаграждение',
                 itm: {
                    xtype : 'textfield',
                    name : 'summa',
                    width : 120
                 }
              },
              {
                 xtype: 'cont_vert',
                 cls: 'container-align-small',
                 title: 'НДС',
                 name: 'c-nds',
                 itm: 
                 {
                 xtype: 'container',
                 layout : 'hbox',
                 items : 
                 [{
                    xtype: 'gbs_combo',
                    name: 'nds_id',
                    value: '5',
                    editable: false,
                    forceSelection: true,
                    store: [
                       ['5', '20 %'],
                       ['2', '10 %'],
                       ['4', 'Не обл.']
                    ],
                 
                    width : 120
                 }, {
                    xtype : 'box',
                    cls: 'txt-button_right',
                    name : 'note',
                    html: '',
                    width : 220
                  }
                ]
                }
              },
            ]
        },

        {
            xtype: 'container',
            cls: 'container-align',
        }

    ],


});
