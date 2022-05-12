let items = [
    {
        xtype: 'hidden',
        name: 'id',
        value: 0
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        name: 'cnt-title',
        title: 'Введите код ИФНС для поиска налоговой',
        itm: {
            'xtype': 'gbs_combo_clr',
            'name': 'kod',
            'itemId': 'kod',
            'displayField': 'kod',
            'valueField': 'kod',
            'editable': true,
            width: 130,
            'store': null,
            'queryMode': 'remote',
            typeAheadDelay: 400,
            minChars: 12,
            enforceMaxLength: true,
            'listConfig': {
                cls: 'style2018',
                minWidth: 520,
                maxHeight: 150,
                loadingText: 'Загрузка данных',
                maxWidth: 520
            },
            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                '<div class="x-boundlist-item">{value}</div>',
                '</tpl>'
            ),

        }
    },

    {
        xtype: 'container',
        cls: 'container-align color-orange',
        hidden: true,
        name: 'cnt-warning',
        html: 'Не найдена налоговая - попробуйте ввести код заново или введите реквизиты вручную',
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: true,
        name: 'cnt-open-btn',
        itm: {
            xtype: 'button',
            action: 'show_all_panel',
            cls: 'btn-sel-blue',
            textAlign: 'left',
            text: 'Ввести реквизиты вручную',
        }
    },

    {
        'xtype': 'container',
        hidden: true,
        name: 'hr',
        'cls': 'hr-line'
    },

    {
        xtype: 'container',
        cls: 'container-align block_info-txt_close',
        hidden: true,
        name: 'cnt-check',
        layout: 'hbox',
        items: [{
            xtype: 'box',
            width: 250,
            html: 'Налоговая изменила реквизиты.&nbsp;&nbsp;&nbsp;&nbsp;'
        }, {
            xtype: 'button',
            action: 'compare',
            cls: 'btn-sel-blue',
            textAlign: 'left',
            text: 'Проверить и обновить',
        }]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: true,
        name: 'cnt-name',
        title: 'Наименование',
        itm: [{
            'xtype': 'textfield',
            'width': 520,
            'itemId': 'nameTax',
            'name': '',
        }, {
            xtype: 'box',
            cls: 'txt-grey',
            hidden: true,
            name: '_name',
            html: 'name'
        }]
    },


    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: true,
        name: 'cnt-main',
        layout: 'hbox',
//            title: 'Основная налоговая',
        itm: [{
            xtype: 'checkbox',
            name : 'main',
            readOnly : true,
            labelAlign: 'right',
            width : 160,
            boxLabel: 'Основная налоговая'
        },
            {
                xtype: 'buttonask',
                text: 'Основная налоговая подставляется по умолчанию в платежных документах и отчетности. <br>' +
                    'Если налоговая одна — она будет основной.'
            }]
    },

    {
        cls: 'container-align',
        xtype: 'cont_vert',
        name: 'cnt-name-f',
        hidden: true,
        itm: [
            {
                xtype: 'box',
                html: 'Наименование',
            },
            {
                xtype: 'container',
                layout: 'hbox',
                items: [
                    {
                        xtype: 'cont_vert',
                        itm: {
                            xtype: 'gbs_combo',
                            name: 'type',
                            editable: false,
                            forceSelection: true,
                            width: 130,
                            value: '3',
                            store: [
                                ['3', 'ФСС'],
                                ['1', 'ПФР'],
                                ['2', 'ФОМС']]
                        }
                    },
                    {xtype: 'tbfill'},
                    {
                        xtype: 'cont_vert',
                        title: '',
                        itm: {

                            xtype: 'textfield',
                            name: '',
                            itemId: 'nameFond',
                            width: 380
                        }
                    }],
            }]
    },


    {
        xtype: 'cont_vert',
        hidden: true,
        cls: 'container-align',
        name: 'cnt-adr',
        title: 'Адрес',
        itm: [{
            'xtype': 'textfield',
            'width': 520,
            'name': 'addr',
        }, {
            xtype: 'box',
            cls: 'txt-grey',
            hidden: true,
            name: '_addr',
            html: 'addr'

        }]
    },

    {
        xtype: 'cont_vert',
        hidden: true,
        cls: 'container-align',
        name: 'cnt-inn',
        title: 'ИНН',
        itm: [{
            'xtype': 'textfield',
            'width': 130,
            'itemId': 'inn',
            'name': 'inn',
        }, {
            xtype: 'box',
            hidden: true,
            cls: 'txt-grey',
            name: '_inn',
            html: 'inn'
        }]
    },

    {
        xtype: 'cont_vert',
        hidden: true,
        cls: 'container-align',
        name: 'cnt-kpp',
        title: 'КПП',
        itm: [{
            'xtype': 'textfield',
            'width': 130,
            'name': 'kpp',
        }, {
            xtype: 'box',
            cls: 'txt-grey',
            name: '_kpp',
            hidden: true,
            html: 'kpp'
        }]
    },

    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: true,
        name: 'cnt-recipient',
        title: 'Получатель',
        itm: [{
            'xtype': 'textfield',
            'width': 520,
            'name': 'recipient',
        }, {
            xtype: 'box',
            cls: 'txt-grey',
            hidden: true,
            name: '_recipient',
            html: 'recipient'
        }]
    },

    {
        xtype: 'cont_vert',
        name: 'cnt-bank',
        cls: 'container-align',
        hidden: true,
        itm: [{
            xtype: 'container',
            layout: 'hbox',
            items: [
                {
                    xtype: 'cont_vert',
                    title: 'БИК',
                    itm: {
                        'xtype': 'gbs_combo_clr',
                        'name': 'bik',
                        'displayField': 'BIK',
                        'valueField': 'BIK',
                        'width': 130,
                        'store': 'storeBanks',
                        'minChars': 1,
                        'queryMode': 'remote',
                        'typeAhead': true,
                        tpl: Ext.create('Ext.XTemplate',
                            '<tpl for=".">',
                            '<div class="x-boundlist-item">{BIK} : {NAME}</div>',
                            '</tpl>'
                        ),
                        'listConfig': {
                            cls: 'style2018',
                            minWidth: 520,
                            maxHeight: 150,
                            loadingText: 'Загрузка данных',
                            maxWidth: 520
                        },

                    }
                },
                {xtype: 'tbfill'},
                {
                    xtype: 'cont_vert',
                    title: 'Банк',
                    itm: {

                        xtype: 'textfield',
                        name: 'bank',
                        width: 380
                    }
                }],
        }, {
            xtype: 'box',
            hidden: true,
            cls: 'txt-grey',
            name: '_bik',
            html: 'bank'
        }]
    }
];

if (currYear > 2020) {
    items.push(
        {
            xtype: 'cont_vert',
            hidden: true,
            cls: 'container-align',
            name: 'cnt-ks',
            title: 'Счет банка получателя',
            itm: [{
                'xtype': 'textfield',
                'width': 520,
                'name': 'ks',
            }, {
                xtype: 'box',
                hidden: true,
                cls: 'txt-grey',
                name: '_ks',
                html: 'ks'
            }]
        });
    items.push(
        {
            xtype: 'cont_vert',
            hidden: true,
            cls: 'container-align',
            name: 'cnt-rs',
            title: 'Счет получателя',
            itm: [{
                'xtype': 'textfield',
                'width': 520,
                'name': 'rs',
            }, {
                xtype: 'box',
                hidden: true,
                cls: 'txt-grey',
                name: '_rs',
                html: 'rs'
            }]
        });
} else {
    items.push(
        {
        xtype: 'cont_vert',
        hidden: true,
        cls: 'container-align',
        name: 'cnt-rs',
        title: 'Расчетный счет',
        itm: [{
            'xtype': 'textfield',
            'width': 520,
            'name': 'rs',
        }, {
            xtype: 'box',
            hidden: true,
            cls: 'txt-grey',
            name: '_rs',
            html: 'rs'
        }]
    });
}

Ext.define('Buh.view.taxoffice.Form', {
    requires: ['Buh.classes.container.Vertical', 'Buh.classes.help.ButtonAsk'],
    extend: 'Ext.form.FormPanel',
    xtype: 'taxform',
    name: 'main_panel',
    bodyCls: 'panel-pad',
    layout: 'form',
    title: 'Добавить наголовую',
    items: items
});
