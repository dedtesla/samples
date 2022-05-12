let items = [
    {
        xtype : 'hidden',
//          xtype : 'textfield',
        name : 'id_nalog',
        value : 0
    },
    {
        xtype : 'hidden',
//          xtype : 'textfield',
        name : 'typ_nalog',
        value : 0
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    cls: 'sub-title-doc',
                    width : 250,
                    html: 'Платежные реквизиты'
                },
                {xtype: 'tbfill'},
                {
                    xtype: 'button',
                    cls: 'btn-sel-blue color-grey',
                    border: false,
                    focusable: false,
                    text: 'Исправить',
                    action: 'open_req',
                    height: 20,
                    align: 'right'
                },
                {xtype: 'tbspacer'},
                {xtype: 'tbspacer'},
                {xtype: 'tbspacer'},
                {xtype: 'tbspacer'},
                {
                    xtype: 'button',
                    cls: 'btn-sel-blue color-grey',
                    border: false,
                    focusable: false,
                    text: 'Скрыть',
                    action: 'close_req_panel',
                    height: 20,
                    align: 'right'
                }
            ],
        }
    },


    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'Получатель'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p1',
                    html: ''
                },
            ],
        }
    },


    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'ИНН'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p2',
                    html: ''
                },
            ],
        }
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'КПП'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p3',
                    html: ''
                },
            ],
        }
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'Банк'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p4',
                    html: ''
                },
            ],
        }
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'БИК'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p5',
                    html: ''
                },
            ],
        }
    }
];
if (currYear > 2020) {
    items.push({
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'Счет банка'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p6',
                    html: ''
                },
            ],
        }
    });
    items.push({
        xtype: 'cont_vert',
        cls: 'container-align',
        itm: {
            xtype: 'container',
            layout: 'hbox',
            width: 520,
            items: [
                {
                    xtype: 'box',
                    width : 150,
                    html: 'Счет получателя'
                },
                {
                    xtype: 'box',
                    width : 350,
                    name : 'p7',
                    html: ''
                },
            ],
        }
    });
} else {
    items.push({
            xtype: 'cont_vert',
            cls: 'container-align',
            itm: {
                xtype: 'container',
                layout: 'hbox',
                width: 520,
                items: [
                    {
                        xtype: 'box',
                        width : 150,
                        html: 'Расчетный счет'
                    },
                    {
                        xtype: 'box',
                        width : 350,
                        name : 'p6',
                        html: ''
                    },
                ],
            }
        });
}

Ext.define('Buh.view.bank.FormRequsites', {
    extend: 'Ext.form.FormPanel',
    xtype: 'bankformrequsites',
    name: 'req_panel',
    cls: 'blue_block',
    hidden : true,
    layout: 'form',
    style: {
        marginBottom: '15px'
    },
    items: items
});
