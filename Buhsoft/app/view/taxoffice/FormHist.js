let items = [
    {
        xtype: 'hidden',
        name: 'id',
        value: 0
    },
    {
        xtype: 'hidden',
        name: 'rs_id',
        value: 0
    },
    {
        xtype: 'hidden',
        name: 'tr_budget_id',
        value: 0
    },
    {
        xtype: 'hidden',
        name: 'name',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'inn',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'kpp',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'addr',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'kod',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'recipient',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'bik',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'bank',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'ks',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'rs',
        value: ''
    },
    {
        xtype: 'hidden',
        name: 'start_from',
        value: ''
    },

    {
        'xtype': 'container',
        name: 'cnt-title-kod',
        cls: 'container-align',
        layout: 'vbox',
        items: [
            {
                'xtype': 'label',
                name: 'kod-title',
                'html': 'Введите код ИФНС для поиска налоговой'
            },
            {
                'xtype': 'gbs_combo_clr',
                'name': 'kod-hand',
                'itemId': 'kod-hand',
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
                    //maxHeight: 100,
                    loadingText: 'Загрузка данных',
                    maxWidth: 520
                },
                tpl: Ext.create('Ext.XTemplate',
                    '<tpl for=".">',
                    '<div class="x-boundlist-item">{value}</div>',
                    '</tpl>'
                )
            }
        ]
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
            action: 'show_first_panel',
            cls: 'btn-sel-blue',
            textAlign: 'left',
            text: 'Ввести реквизиты вручную',
        }
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        name: 'cnt-type-f',
        hidden: true,
        itm: [
            {
                xtype: 'box',
                html: 'Вид',
            },
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
        ]
    },
    {
        xtype: 'cont_vert',
        cls: 'container-align',
        hidden: true,
        name: 'cnt-name-hand',
        itm: [{
            xtype: 'box',
            width: 250,
            html: 'Наименование'
        },{
            'xtype': 'textareafield',
            name: 'name-hand',
            border: 0,
            height: 50,
            width: 480,
            autoScroll: true,
            grow: true,
            value: '',
        },{
            xtype: 'button',
            name: 'save_btn',
            action: 'save_first_panel',
            cls: 'green-btn',
            style: 'margin: 20px 0 0 0;',
            disabled: true,
            text: 'Сохранить и продолжить',
        }]
    },


    {
        'xtype': 'panel',
        bodyStyle: 'padding: 0;',
        'items': [
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
                    }
                ]
            },
            {
                xtype: 'container',
                cls: 'container-align block_info-txt_close',
                name: 'cnt-warning-2',
                hidden: true,
                items: [
                    {
                        xtype: 'container',
                        name: 'update-btn-w2',
                        cls: 'container-align-small',
                        style: 'font-weight: 700;',
                        html: 'Обновить реквизиты налоговой',
                    },
                    {
                        'xtype': 'label',
                        'html': 'Дата начала действия'
                    },
                    {
                        'xtype': 'gbs_date_all',
                        'name': 'dat-begin',
                        minValue: '2021-01-01',
                        value: '',
                        'width': 140,
                        style: 'margin-bottom: 10px;',
                        action: 'checkdates'
                    },
                    {
                        xtype: 'container',
                        items: [
                            {
                                xtype: 'greenbuttonsimple',
                                name: 'saveupdate',
                                action: 'saveupdate',
                                text: 'Сохранить',
                                disabled: true
                            },
                            {
                                xtype: 'button',
                                text: 'Отмена',
                                style: 'margin-left: 10px;',
                                action: 'cancelupdate',
                            }
                        ]
                    },
                ]
            },

            {
                'xtype': 'container',
                cls: 'container-align-small',
                name: 'cnt-name',
                'items': [
                    {
                        xtype: 'label',
                        name: 'ifns',
                        cls: 'color-gray',
                        style: 'vertical-align: top;',
                        text: 'ИФНС',
                        width: 200
                    },
                    {
                        xtype: 'button',
                        name: 'name_btn',
                        cls: 'btn-sel-blue color-black',
                        textAlign: 'left',
                        text: 'Добавить',
                        action: 'showformifns'
                    },
                    {
                        xtype: 'button',
                        name: '_name_btn',
                        cls: 'btn-sel-blue color-black',
                        textAlign: 'left',
                        text: '',
                        hidden: true
                    }

                ]
            },

            {
                'xtype': 'container',
                name: 'cnt-main',
                cls: 'container-align',
                'layout': 'hbox',
                'items': [
                    {
                        xtype:'tbspacer',
                        width: 200
                    },
                    {
                        name: 'main',
                        xtype: 'green-cbox',
                        boxLabelAlign: 'after',
                        checked: false,
                        boxLabel: 'Основная',
                        width: 100,
                        action: 'savemain',
                        _status: 'first'
                    },
                    {
                        xtype: 'buttonask',
                        style: 'top: 3px;',
                        text: 'Основная налоговая подставляется по умолчанию<br>в платежных документах и отчетности. <br>' +
                            'Если налоговая одна — она будет основной.'
                    }

                ]
            },

            {
                'xtype': 'container',
                cls: 'container-align-small',
                name: 'cnt-inn-fond',
                hidden: true,
                'items': [
                    {
                        xtype: 'label',
                        name: 'inn-f',
                        cls: 'color-gray',
                        style: 'vertical-align: top;',
                        text: 'ИНН',
                        width: 200
                    },
                    {
                        xtype: 'button',
                        name: 'inn-f_btn',
                        cls: 'btn-sel-blue color-black',
                        textAlign: 'left',
                        text: 'Добавить',
                        action: 'showformifns'
                    },
                    {
                        xtype: 'button',
                        name: '_inn-f_btn',
                        cls: 'btn-sel-blue color-black',
                        textAlign: 'left',
                        text: '',
                        hidden: true
                    }

                ]
            },

            {
                'xtype': 'container',
                name: 'cnt-rekv',
                cls: 'container-align-small',
                layout: 'hbox',
                'items': [
                    {
                        xtype: 'label',
                        cls: 'color-gray',
                        style: 'vertical-align: top;',
                        text: 'Реквизиты',
                        width: 200
                    },
                    {
                        'xtype': 'container',
                        cls: 'container-align',
                        layout: 'vbox',
                        'items': [
                            {
                                xtype: 'button',
                                name: 'rekv',
                                cls: 'btn-sel-blue color-black',
                                textAlign: 'left',
                                text: 'Добавить',
                                action: 'showform'
                            },
                            {
                                xtype: 'button',
                                name: '_rekv',
                                cls: 'btn-sel-blue color-black',
                                textAlign: 'left',
                                text: 'Было',
                                hidden: true
                            }
                        ]
                    }
                ]
            },

            {
                'xtype': 'container',
                name: 'top-cnt-plrekv',
                cls: 'container-align-small',
                layout: 'hbox',
                'items': [
                    {
                        xtype: 'label',
                        cls: 'color-gray',
                        style: 'vertical-align: top;',
                        text: 'Платежные реквизиты',
                        action: 'showform',
                        width: 200
                    },
                    {
                        'xtype': 'container',
                        cls: 'container-align-small',
                        name: 'cnt-plrekv',
                        layout: 'vbox',
                        'items': [
                            {
                                xtype: 'button',
                                name: 'pl_rekv',
                                width: 500,
                                cls: 'btn-sel-blue color-black',
                                textAlign: 'left',
                                text: 'Добавить',
                                action: 'showformpl'
                            },
                            {
                                xtype: 'button',
                                name: '_pl_rekv',
                                width: 500,
                                cls: 'container-align-small btn-sel-blue color-black',
                                textAlign: 'left',
                                text: 'Было',
                                hidden: true
                            },

                            {
                                'xtype': 'container',
                                //cls: 'container-align',
                                layout: 'hbox',
                                'items': [
                                    {
                                        xtype: 'button',
                                        name: 'btn_add',
                                        cls: 'btn-sel-blue color-gray',
                                        textAlign: 'left',
                                        text: 'Добавить новое',
                                        action: 'addnewhistory'
                                    },
                                    {
                                        xtype: 'button',
                                        name: 'show_hist',
                                        cls: 'btn-sel-blue color-gray',
                                        textAlign: 'left',
                                        text: '&nbsp;&nbsp;&nbsp; &middot; &nbsp;&nbsp;&nbsp; Показать другие значения',
                                        hidden: true,
                                        action: 'showhistory'
                                    },
                                    {
                                        xtype: 'button',
                                        name: 'hide_hist',
                                        //width: 100,
                                        cls: 'btn-sel-blue color-gray',
                                        textAlign: 'left',
                                        //text: '&nbsp;&nbsp;&nbsp; &middot; &nbsp;&nbsp;&nbsp; Скрыть',
                                        text: 'Скрыть',
                                        hidden: true,
                                        action: 'hidehistory'
                                    }

                                ]
                            },

                        ]
                    },
                ]
            }
        ]
    },
];

Ext.define('Buh.view.taxoffice.FormHist', {
    requires: ['Buh.classes.container.Vertical', 'Buh.classes.help.ButtonAsk'],
    extend: 'Ext.form.FormPanel',
    xtype: 'taxformHist',
    name: 'main_panel',
    bodyCls: 'panel-pad',
    layout: 'form',
    title: 'Добавить наголовую',
    items: items
});
