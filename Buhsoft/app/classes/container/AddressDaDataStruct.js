/**
 * Класс AddressDaData - компонент для работы с адресной информацией организаций и контрагентов.
 * Интегрируется с API подсказок по адресам DaData (https://dadata.ru/api/suggest/address/).
 * Предназначен для работы в режимах произвольного и структурированного ввода.
 * В произвольном режиме пользователь вводит данные адреса в одиночное текстовое поле ввода в теле
 * документа.
 * В структурированном - данные вводятся в отдельной форме с набором текстовых полей, каждое из которых
 * соответствует элементу адреса (индекс, регион и т.д.).
 *
 * В сценарии запросов к API DaData реализована принудительная задержка 600мс.
 * После ввода символа в поле включается таймер и если в интервале таймера больше не было ввода
 * выполняется запрос к API. Иначе, таймер сбрасывается и цикл повторяется.
 *
 * После ввода значения в произвольном режиме выполняется заполнение свойств record и value, по
 * аналогии с record.get('address').
 *
 * @todo Разобрать на объекты.
 * @todo Проверить и по результату убрать параметр noExpand.
 * @todo Поискать альтернативу флагу keydown.
 *
 * @param mixed record (@default null)          Модель-приемник ответа API DaData.
 * @param mixed suggests (@default null)        Хранилище подсказок, запрашиваемых через API DaData.
 * @deprecated bool noExpand (@default true)    Обработка события keydown исключает необходимость параметра.
 * @param bool edit (@default false)            Флаг, фиксирующий нажатие пользователем кнопки "Сохранить"
 *                                              в отдельной форме ввода адреса (структурированный режим):
 *                                              1. true - пользователь нажал кнопку,
 *                                              2. false - пользователь не вызывал форму/вышел из нее без сохранения.
 * @param int typeadr (@default 1)              Тип адреса:
 *                                              1. российский,
 *                                              2. иностранный,
 *                                              3. неструктурированный.
 * @param bool keydown (@default false)         Флаг-костыль для перехвата действий пользователя в событии change.
 *                                              Для обработки только нажатий клавиш, игнорируя выбор в выпадающем
 *                                              списке.
 * @param array arrAddress (@default [])        Массив подсказок комбобокса.
 * @param string labelText (@default '')        Текст лейбла над полем ввода.
 * @param string index (@default '')            Почтовый индекс.
 * @param int timerID (@default 0)              Идентификатор таймера задержки запроса к API DaData.
 *
 * Использована разработка А.Миронычева.
 * 07.2020
 */
Ext.define('Buh.classes.container.AddressDaDataStruct',
    {
        requires: ['Buh.classes.container.Vertical', 'Buh.classes.help.ButtonAsk'],
        extend: 'Ext.container.Container',
        xtype: 'address_dadata_inline_struct',
        alias: 'widget.addressdadatainlinestruct',
        record: null,
        suggests: null,
        noExpand: false,
        edit: false,
        typeadr: 1,
        keydown: false,
        arrAddress: [],
        arrSuggest: [],

        // 'postal_code': '',
        a_fias: { 'region': '', 'area': '', 'city': '', 'settlement': '', 'street': '', 'house': '', 'block': '', 'flat': ''},
        boundFieldChahged: false,

        value: '',
        rec: null,
        labelText: '',
        index: '',
        timerID: 0,
        cls: '',
        boundName: '',
        isOurOrg: true,
        items: [
            {
                xtype: 'label',
                itemId: 'title'
            },
            {
                xtype: 'textfield',
                itemId: 'title'
            }
        ],
        initComponent: function() {
            var me = this;

            me.arrSuggest = [];

            me.record = Ext.create('Buh.model.global.Address');

            me.suggests = new Ext.data.ArrayStore({
                fields: [
                    'id',
                    'name'
                ]
            });

            me.buildField();
            me.callParent(arguments);
        },
        onRender: function(){
            var me = this;
            me.callParent(arguments);
        },
        buildField: function(){
            var me = this;
            var askText = iif(me.isOurOrg === null,
                'Введите адрес в свободной форме, используйте подсказки в списке.',
                iif(me.isOurOrg === true,
                'По умолчанию подставляется адрес из личного кабинета. ' +
                'Изменения адреса хранятся только в этом документе.',
                'По умолчанию подставляется адрес из справочника контрагентов. ' +
                'Изменения адреса хранятся только в этом документе.'));


            me.items = [
                {
                    'xtype': 'container',
                    layout: 'hbox',
                    items: [
                        {
                            xtype: 'label',
                            name: 'lcmbName',
                            text: me.labelText.trim(),
                            hidden: me.labelText.trim() == ''
                        },
                        {
                            xtype: 'buttonask',
                            text: askText,
                            hidden: me.showAskText === false
                        },
                        {
                            xtype:'tbspacer',
                            flex:1
                        },
                        {
                            name: 'radioHandAddr',
                            xtype: 'green-cbox',
                            width: 170,
                            boxLabelAlign: 'after',
                            checked: false,
                            boxLabel: 'Ввод адреса вручную',
                            htmlTip: '',
                            handler: function () {
                                let me = this,
                                    check = this.getValue();

                                if (check) {
                                    //me.up('address_dadata_inline_struct').down('[name=cnt-title]').hide()
                                    me.up('address_dadata_inline_struct').down('[name=cnt_hand]').show()
                                } else {
                                    me.up('address_dadata_inline_struct').down('[name=cnt-title]').show()
                                    me.up('address_dadata_inline_struct').down('[name=cnt_hand]').hide()
                                }
                            }
                        }
                    ]
                },

                {
                    xtype: 'cont_vert',
                    layout: 'fit',
                    align: 'stretch',
                    cls: 'container-align',
                    name: 'cnt-title',
                    itm: [
                        {
                            'xtype': 'textfield',
                            'name': me.boundName,
                            'value': '',
                            'hidden': true
                        },
                        {
                            xtype: 'gbs_combo',
                            name: me.boundName + '_inputfield',
                            displayField: 'name',
                            valueField: 'id',
                            fieldCls: 'gbs-combo-nov',
                            //width: '100%',
                            style: 'margin:0',
                            flex: 1,
                            store: me.suggests,
                            emptyText: 'Введите адрес в свободной форме',
                            queryMode: 'local',
                            triggerAction: 'all',
                            editable: true,
                            enableKeyEvents: true,
                            oldVal: '',
                            // typeAheadDelay: 600,
                            tpl: Ext.create('Ext.XTemplate',
                                '<tpl for=".">',
                                '<tpl if="values.id == 9999">',
                                '<div class="x-boundlist-item"><span class="txt-gray">{name}</span></div>',
                                '<tpl else>',
                                '<tpl if="values.id == 999999">',
                                '<hr class="txt-grey">',
                                '<div class="x-boundlist-item"><a class="btn-sel-blue">{name}</a></div>',
                                '<tpl else>',
                                '<div class="x-boundlist-item">{name}</div>',
                                '</tpl>',
                                '</tpl>',
                                '</tpl>'
                            ),
                            listeners:{
                                afterrender: function(el) {
                                    var name = el.name || 'field';
                                    el.inputEl.set({autocomplete: 'new-' + name});
                                },
                                keydown: function (el, e) {
                                    if (e.keyCode == 13) {
                                        me.keydown = false;
                                    } else {
                                        me.keydown = true;
                                    }
                                },
                                change: function (el, newValue, oldValue) {
                                    clearTimeout(me.timerID);

                                    var index = me.down('[name=' + me.boundName + '_index]'),
                                        address = me.down('[name=' + me.boundName + '_inputfield]'),
                                        value = el.getRawValue().trim().replace(/"/g, '');

                                    if (newValue == 9999 || newValue == 999999) {
                                        el.setValue(oldValue);
                                    }

                                    if (value == '') {
                                        index.setVisible(false);
                                        me.suggests.removeAll();
                                    }

                                    if (oldValue == undefined || me.boundFieldChahged) {
                                        me.suspendChange(true);
                                    }

                                    if(!Ext.isEmpty(value)) {
                                        addressToForm = me.down('[name=' + me.boundName + ']')
                                        addressToForm.setValue(value)

                                        address.collapse();
                                        me.suggests.removeAll();

                                        me.timerID = setTimeout(function () {
                                                var unknownerr = 'Неизвестная ошибка';
                                                me.keydown = false;
                                                Ext.Ajax.request({
                                                    url: dir_start_buh_ + 'dadata_api.php',
                                                    method: 'POST',
                                                    params: {
                                                        'method': 'suggest',
                                                        'type': 'address',
                                                        'data': '{"value":"' + value + '"}',
                                                        'count': 10
                                                    },
                                                    success: function (res) {
                                                        var rst;
                                                        try {
                                                            rst = Ext.decode(res.responseText);
                                                        } catch (g) {
                                                            rst = {
                                                                success: !1,
                                                                error: unknownerr
                                                            }

                                                        }

                                                        if (rst.success) {
                                                            var arrAddress = rst.data;
                                                            me.arrSuggest = [];
                                                            if (arrAddress.suggestions != _dummy && arrAddress.suggestions.length > 0) {
                                                                me.arrAddress = arrAddress;
                                                                arrAddress.suggestions.forEach(function (item, i, arr) {
                                                                    me.suggests.add([{'id': i, 'name': item.value}]);
                                                                });
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                                if (me.boundFieldChahged) {
                                                                    //me.a_fias.postal_code = '';
                                                                }
                                                                else if (!me.boundFieldChahged) {
                                                                    var now = me.arrAddress.suggestions[0].data

                                                                    //me.a_fias.postal_code = now['postal_code'];

                                                                    var _item;
                                                                    me.down('[name=region]').store.data.items.every(function (item, i, arr) {
                                                                        if (now['region'].indexOf(item.data.val) != -1 ) {
                                                                             _item = item;
                                                                             return false;
                                                                        } else
                                                                             return true;
                                                                    })
                                                                    //if (_item) {
                                                                        me.down('[name=region]').setValue(_item.data.name);
                                                                        me.a_fias.region = now['region_with_type'];
                                                                    //}

                                                                    me.down('[name=city_with_type]').setValue(now['city_with_type']);
                                                                    me.a_fias.city = now['city_with_type'];

                                                                    var a_fias = ['area', 'settlement', 'street', 'house', 'block', 'flat']
                                                                    a_fias.forEach(function (item, i, arr) {
                                                                        var _item = null;
                                                                        me.down('[name=' + item + '_type]').store.data.items.every(function (itm, i, arr) {
                                                                            if (itm.data.val.replace(/\./g, "") == now[item + '_type']) {
                                                                                _item = itm;
                                                                                return false;
                                                                            } else
                                                                                return true;
                                                                        })
                                                                        if (_item != null) {
                                                                            me.down('[name=' + item + ']').setValue(now[item]);
                                                                            me.down('[name=' + item + '_type]').setValue(_item.data.name);
                                                                            if (item == 'house' || item == 'flat')
                                                                                me.a_fias[item] = now[item];
                                                                            else
                                                                                me.a_fias[item] = now[item + '_with_type'];
                                                                        } else {
                                                                            me.down('[name=' + item + ']').setValue('');
                                                                            me.down('[name=' + item + '_type]').setValue('');
                                                                            me.a_fias[item] = '';
                                                                        }

                                                                        if (item == 'settlement' && _item == null) {
                                                                            me.down('[name=settlement_type_2]').store.data.items.every(function (itm, i, arr) {
                                                                                if (itm.data.val.replace(/\./g, "") == now[item + '_type']) {
                                                                                    _item = itm;
                                                                                    return false;
                                                                                } else
                                                                                    return true;
                                                                            })
                                                                            if (_item) {
                                                                                me.down('[name=settlement_type_2]').setValue(_item.data.name);
                                                                                me.down('[name=settlement_2]').setValue(now[item]);
                                                                                me.a_fias.settlement = now['settlement_with_type'];
                                                                            }
                                                                        }

                                                                        if (item == 'area' && _item == null) {
                                                                            me.down('[name=area_type_2]').store.data.items.every(function (itm, i, arr) {
                                                                                if (itm.data.val.replace(/\./g, "") == now[item + '_type']) {
                                                                                    _item = itm;
                                                                                    return false;
                                                                                } else
                                                                                    return true;
                                                                            })
                                                                            if (_item) {
                                                                                me.down('[name=area_type_2]').setValue(_item.data.name);
                                                                                me.down('[name=area_2]').setValue(now[item]);
                                                                                me.a_fias.area = now['area_with_type'];
                                                                            }
                                                                        }
                                                                    });
                                                                }
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                                            } else {
                                                                // не нашлось совпадений вернулся пустой массив
                                                                me.suggests.add([{'id': 9999, 'name': 'Не найдено совпадений'}]);
                                                                index.setVisible(false);
                                                                me.clearData();
                                                            }

                                                            me.suspendChange(false);
                                                        }

                                                        if (!me.noExpand ) {
                                                            el.expand();
                                                        }
                                                        me.noExpand = false;

                                                        me.boundFieldChahged = false;
                                                    },
                                                    failure: function (res) {
                                                        obrFailure(res);
                                                    }
                                                });
                                            }, 600
                                        );
                                    }
                                },
                                select: function(el, records, eOpts ){
                                    me.selectVal(el);
                                },
                                blur: function (el) {
                                    me.cmbBlur(el);
                                }
                            }
                        }, // адрес без индекса
                        {
                            xtype: 'displayfield',
                            name: me.boundName + '_index',
                            cls: 'margin-top_small',
                            fieldCls: 'txt-grey',
                            hidden: true
                        }
                    ]
                }, // поле ввода адреса

                { // ручной ввод адреса
                    'xtype': 'container',
                    name: 'cnt_hand',
                    hidden: true,
                    items: [
                        createContAlignSmall('Субъект Российской Федерации',
                            {
                            name: 'region',
                            cls: 'addr_fld',
                            displayField: 'name',
                            valueField: 'id',
                            xtype: 'gbs_combo',
                            width: 440,
                            emptyText: 'Введите код или наименование для поиска',
                            allowBlank: true,
                            editable: false,
                            store: Ext.create('Buh.classes.store.KladrRegionIds'),
                            listeners: {
                                select: function (th, rec, eOpts ) {
                                    me.fillAdrField('region', rec, 0);
                                }
                            }
                        }),

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Муниципальное образование', //Муниципальный район, городской округ и др.'
                                },
                                {
                                'xtype': 'container',
                                layout: 'hbox',
                                items: [
                                    {
                                        name: 'area_type',
                                        cls: 'addr_fld',
                                        xtype: 'gbs_combo',
                                        displayField: 'name',
                                        valueField: 'id',
                                        width: 180,
                                        emptyText: 'Вид',
                                        allowBlank: true,
                                        editable: false,
                                        store: Ext.create('Ext.data.Store', {
                                            fields: [
                                                'id',
                                                'name',
                                                'val'
                                            ],
                                            data : [
                                                {"id":'1', "name":'Муниципальный район', 'val':'м.р-н'}, // м.р-н
                                                {"id":'2', "name":'Городской округ', 'val':'г.о.'},
                                                {"id":'3', "name":'Городское поселение', 'val':'г.п.'},
                                                {"id":'4', "name":'Сельское поселение', 'val':'с.п.'},
                                                {"id":'5', "name":'Внутригородской район', 'val':'вн.р-н'},
                                                {"id":'6', "name":'Внутригородская территория (внутригородское муниципальное образование) города федерального значения', 'val':'вн.тер.г.'},
                                            ]
                                        }),
                                        listeners: {
                                            select: function (th, rec, eOpts) {
                                                me.fillAdrField('area', rec, 1);
                                            },
                                        }
                                    },
                                    {
                                        name: 'area',
                                        cls: 'addr_fld',
                                        xtype: 'textfield',
                                        width: 250,
                                        emptyText: 'Наименование',
                                        enableKeyEvents: true,
                                        listeners: {
                                            keyup: function (th) {
                                                me.fillAdrField('area', th, 2);
                                                th.focus(false, 1000);
                                            }
                                        }
                                    }

                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Административно-территориальная единица',//Городское поселение, сельское поселение и др.'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'area_type_2',
                                            cls: 'addr_fld',
                                            xtype: 'gbs_combo',
                                            displayField: 'name',
                                            valueField: 'id',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id',
                                                    'name',
                                                    'val'
                                                ],
                                                data : [
                                                    {"id":'1', "name":'Поселение', 'val':'пос.'},
                                                    {"id":'2', "name":'Район', 'val':'р-н'},
                                                    {"id":'3', "name":'Сельсовет', 'val':'с/с'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec, eOpts) {
                                                    me.fillAdrField('area', rec, 1);
                                                },
                                            }
                                        },
                                        {
                                            name: 'area_2',
                                            cls: 'addr_fld',
                                            xtype: 'textfield',
                                            width: 250,
                                            emptyText: 'Наименование',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('area', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        }

                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Город'
                                },
                                {
                                    name: 'city_with_type',
                                    cls: 'addr_fld',
                                    xtype: 'textfield',
                                    width: 440,
                                    emptyText: 'Город',
                                    enableKeyEvents: true,
                                    listeners: {
                                        keyup: function (th) {
                                            me.fillAdrField('city', th, 3);
                                            th.focus(false, 1000);
                                        }
                                    }
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Населенный пункт (кроме города)'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'settlement_type',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id',
                                                    'name',
                                                    'val'
                                                ],
                                                data : [
                                                    {"id":'1', "name":'Поселок городского типа', 'val':'пгт.'},
                                                    {"id":'2', "name":'Рабочий поселок', 'val':'рп.'},
                                                    {"id":'3', "name":'Курортный поселок', 'val':'кп.'},
                                                    {"id":'4', "name":'Городской поселок', 'val':'гп.'},
                                                    {"id":'5', "name":'Поселок', 'val':'п.'},
                                                    {"id":'6', "name":'Аал', 'val':'аал'},
                                                    {"id":'7', "name":'Арбан', 'val':'арбан'},
                                                    {"id":'8', "name":'Аул', 'val':'аул'},
                                                    {"id":'9', "name":'Выселки', 'val':'в-ки'},
                                                    {"id":'10', "name":'Городок', 'val':'г-к'},
                                                    {"id":'11', "name":'Заимка', 'val':'з-ка'},
                                                    {"id":'12', "name":'Починок', 'val':'п-к'},
                                                    {"id":'13', "name":'Кишлак', 'val':'киш.'},
                                                    {"id":'14', "name":'Поселок при станции (поселок станции)', 'val':'п. ст.'},
                                                    {"id":'15', "name":'Поселок при железнодорожной станции', 'val':'п. ж/д ст.'},
                                                    {"id":'16', "name":'Железнодорожный блокпост', 'val':'ж/д бл-ст'},
                                                    {"id":'17', "name":'Железнодорожная будка', 'val':'ж/д б-ка'},
                                                    {"id":'18', "name":'Железнодорожная ветка', 'val':'ж/д в-ка'},
                                                    {"id":'19', "name":'Железнодорожная казарма', 'val':'ж/д к-ма'},
                                                    {"id":'20', "name":'Железнодорожный комбинат', 'val':'ж/д к-т'},
                                                    {"id":'21', "name":'Железнодорожная платформа', 'val':'ж/д пл-ма'},
                                                    {"id":'22', "name":'Железнодорожная площадка', 'val':'ж/д пл-ка'},
                                                    {"id":'23', "name":'Железнодорожный путевой пост', 'val':'ж/д п.п.'},
                                                    {"id":'24', "name":'Железнодорожный остановочный пункт', 'val':'ж/д о.п.'},
                                                    {"id":'25', "name":'Железнодорожный разъезд', 'val':'ж/д рзд.'},
                                                    {"id":'26', "name":'Железнодорожная станция', 'val':'ж/д ст.'},
                                                    {"id":'27', "name":'Местечко', 'val':'м-ко'},
                                                    {"id":'28', "name":'Деревня', 'val':'д.'},
                                                    {"id":'29', "name":'Село', 'val':'с.'},
                                                    {"id":'30', "name":'Слобода', 'val':'сл.'},
                                                    {"id":'31', "name":'Станция', 'val':'ст.'},
                                                    {"id":'32', "name":'Станица', 'val':'ст-ца'},
                                                    {"id":'33', "name":'Улус', 'val':'у.'},
                                                    {"id":'34', "name":'Хутор', 'val':'х.'},
                                                    {"id":'35', "name":'Разъезд', 'val':'рзд.'},
                                                    {"id":'36', "name":'Зимовье', 'val':'зим.'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec, ov, e) {
                                                    me.fillAdrField('settlement', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            name: 'settlement',
                                            cls: 'addr_fld',
                                            xtype: 'textfield',
                                            width: 250,
                                            emptyText: 'Наименование',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('settlement', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        },

                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Элемент планировочной структуры'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'settlement_type_2',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id',
                                                    'name',
                                                    'val'
                                                ],
                                                data : [
                                                    {'id': '1', 'name': 'Берег', 'val': 'б-г'},
                                                    {'id': '2', 'name': 'Вал', 'val': 'вал'},
                                                    {'id': '3', 'name': 'Жилой район', 'val': 'ж/р'},
                                                    {'id': '4', 'name': 'Зона (массив)', 'val': 'зона'},
                                                    {'id': '5', 'name': 'Квартал', 'val': 'кв-л'},
                                                    {'id': '6', 'name': 'Микрорайон', 'val': 'мкр.'},
                                                    {'id': '7', 'name': 'Остров', 'val': 'ост-в'},
                                                    {'id': '8', 'name': 'Парк', 'val': 'парк'},
                                                    {'id': '9', 'name': 'Платформа', 'val': 'платф.'},
                                                    //{'id': '9', 'name': 'Порт', 'val': ''},
                                                    {'id': '10', 'name': 'Промышленный район', 'val': 'п/р'},
                                                    {'id': '11', 'name': 'Район', 'val': 'р-н'},
                                                    {'id': '12', 'name': 'Сад', 'val': 'сад'},
                                                    {'id': '13', 'name': 'Сквер', 'val': 'сквер'},
                                                    {'id': '14', 'name': 'Территория', 'val': 'тер.'},
                                                    {'id': '15', 'name': 'Территория садоводческих некоммерческих объединений граждан', 'val': 'тер. СНО'},
                                                    {'id': '16', 'name': 'Территория огороднических некоммерческих объединений граждан', 'val': 'тер. ОНО'},
                                                    {'id': '17', 'name': 'Территория дачных некоммерческих объединений граждан', 'val': 'тер. ДНО'},
                                                    {'id': '18', 'name': 'Территория садоводческих некоммерческих товариществ', 'val': 'тер. СНТ'},
                                                    {'id': '19', 'name': 'Территория огороднических некоммерческих товариществ', 'val': 'тер. ОНТ'},
                                                    {'id': '20', 'name': 'Территория дачных некоммерческих товариществ', 'val': 'тер. ДНТ'},
                                                    {'id': '21', 'name': 'Территория садоводческих потребительских кооперативов', 'val': 'тер. СПК'},
                                                    {'id': '22', 'name': 'Территория огороднических потребительских кооперативов', 'val': 'тер. ОПК'},
                                                    {'id': '23', 'name': 'Территория дачных потребительских кооперативов', 'val': 'тер. ДПК'},
                                                    {'id': '24', 'name': 'Территория садоводческих некоммерческих партнерств', 'val': 'тер. СНП'},
                                                    {'id': '25', 'name': 'Территория огороднических некоммерческих партнерств', 'val': 'тер. ОНП'},
                                                    {'id': '26', 'name': 'Территория дачных некоммерческих партнерств', 'val': 'тер. ДНП'},
                                                    {'id': '27', 'name': 'Территория товарищества собственников недвижимости', 'val': 'тер. ТСН'},
                                                    {'id': '28', 'name': 'Территория гаражно-строительного кооператива', 'val': 'тер. ГСК'},
                                                    {'id': '29', 'name': 'Усадьба', 'val': 'ус.'},
                                                    {'id': '30', 'name': 'Территория фермерского хозяйства', 'val': 'тер.ф.х.'},
                                                    {'id': '31', 'name': 'Юрты', 'val': 'ю.'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec, ov, e) {
                                                    me.fillAdrField('settlement', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            name: 'settlement_2',
                                            cls: 'addr_fld',
                                            xtype: 'textfield',
                                            width: 250,
                                            emptyText: 'Наименование',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('settlement', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Элемент улично-дорожной сети'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'street_type',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id',
                                                    'name',
                                                    'val'
                                                ],
                                                data: [
                                                    {'id': '1', 'name': 'Аллея', 'val': 'ал.'},
                                                    {'id': '2', 'name': 'Бульвар', 'val': 'б-р'},
                                                    {'id': '3', 'name': 'Взвоз', 'val': 'взв.'},
                                                    {'id': '4', 'name': 'Въезд', 'val': 'взд.'},
                                                    {'id': '5', 'name': 'Дорога', 'val': 'дор.'},
                                                    {'id': '6', 'name': 'Заезд', 'val': 'ззд.'},
                                                    {'id': '7', 'name': 'Километр', 'val': 'км'},
                                                    {'id': '8', 'name': 'Километр', 'val': 'км'},
                                                    {'id': '9', 'name': 'Кольцо', 'val': 'к-цо'},
                                                    {'id': '10', 'name': 'Коса', 'val': 'коса'},
                                                    {'id': '11', 'name': 'Линия', 'val': 'лн.'},
                                                    {'id': '12', 'name': 'Магистраль', 'val': 'мгстр.'},
                                                    {'id': '13', 'name': 'Набережная', 'val': 'наб.'},
                                                    {'id': '14', 'name': 'Переезд', 'val': 'пер-д'},
                                                    {'id': '15', 'name': 'Переулок', 'val': 'пер.'},
                                                    {'id': '16', 'name': 'Площадка', 'val': 'пл-ка'},
                                                    {'id': '17', 'name': 'Площадь', 'val': 'пл.'},
                                                    {'id': '18', 'name': 'Проезд', 'val': 'пр-д'},
                                                    {'id': '19', 'name': 'Просек', 'val': 'пр-к'},
                                                    {'id': '20', 'name': 'Просека', 'val': 'пр-ка'},
                                                    {'id': '21', 'name': 'Проселок', 'val': 'пр-лок'},
                                                    {'id': '22', 'name': 'Проспект', 'val': 'пр-кт'},
                                                    {'id': '23', 'name': 'Проулок', 'val': 'проул.'},
                                                    {'id': '24', 'name': 'Разъезд', 'val': 'рзд.'},
                                                    {'id': '25', 'name': 'Ряд(ы)', 'val': 'ряд'},
                                                    {'id': '26', 'name': 'Сквер', 'val': 'с-р'},
                                                    {'id': '27', 'name': 'Спуск', 'val': 'с-к'},
                                                    {'id': '28', 'name': 'Съезд', 'val': 'сзд.'},
                                                    {'id': '29', 'name': 'Тракт', 'val': 'тракт'},
                                                    {'id': '30', 'name': 'Тупик', 'val': 'туп.'},
                                                    {'id': '31', 'name': 'Улица', 'val': 'ул.'},
                                                    {'id': '32', 'name': 'Шоссе', 'val': 'ш.'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec) {
                                                    me.fillAdrField('street', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'textfield',
                                            cls: 'addr_fld',
                                            name: 'street',
                                            width: 250,
                                            emptyText: 'Наименование',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('street', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        }

                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Здание, сооружение или объект незавершенного строительства'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'house_type',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id', 'name', 'val'
                                                ],
                                                data: [
                                                    {'id': '1', 'name': 'Владение', 'val': 'влд.'},
                                                    {'id': '2', 'name': 'Гараж', 'val': 'г-ж'},
                                                    {'id': '3', 'name': 'Дом', 'val': 'д.'},
                                                    {'id': '4', 'name': 'Домовладение', 'val': 'двлд.'},
                                                    {'id': '5', 'name': 'Здание', 'val': 'зд.'},
                                                    {'id': '6', 'name': 'Земельный участок', 'val': 'з/у'},
                                                    {'id': '7', 'name': 'Объект незавершенного строительства', 'val': 'ОНС'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec) {
                                                    me.fillAdrField('house', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'textfield',
                                            cls: 'addr_fld',
                                            name: 'house',
                                            width: 250,
                                            emptyText: 'Тип',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('house', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        },


                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Корпус, сооружение, строение'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'block_type',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id', 'name', 'val'
                                                ],
                                                data: [
                                                    {'id': '1', 'name': 'Корпус', 'val': 'к.'},
                                                    {'id': '2', 'name': 'Сооружение', 'val': 'соор.'},
                                                    {'id': '3', 'name': 'Строение', 'val': 'стр.'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec) {
                                                    me.fillAdrField('block', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'textfield',
                                            name: 'block',
                                            cls: 'addr_fld',
                                            width: 250,
                                            emptyText: 'Тип',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('block', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        },


                                    ]
                                }
                            ]
                        },

                        {
                            'xtype': 'container',
                            'cls': 'container-align-small',
                            items: [
                                {
                                    'xtype': 'label',
                                    'html': 'Помещение в пределах здания'
                                },
                                {
                                    'xtype': 'container',
                                    layout: 'hbox',
                                    items: [
                                        {
                                            name: 'flat_type',
                                            cls: 'addr_fld',
                                            displayField: 'name',
                                            valueField: 'id',
                                            xtype: 'gbs_combo',
                                            width: 180,
                                            emptyText: 'Вид',
                                            allowBlank: true,
                                            editable: false,
                                            store: Ext.create('Ext.data.Store', {
                                                fields: [
                                                    'id', 'name', 'val'
                                                ],
                                                data: [
                                                    {'id': '1', 'name': 'Квартира', 'val': 'кв.'},
                                                    {'id': '2', 'name': 'Комната', 'val': 'ком.'},
                                                    {'id': '3', 'name': 'Офис', 'val': 'офис'},
                                                    {'id': '4', 'name': 'Павильон', 'val': 'пав.'},
                                                    {'id': '5', 'name': 'Помещение', 'val': 'помещ.'},
                                                    {'id': '6', 'name': 'Рабочий участок', 'val': 'раб.уч.'},
                                                    {'id': '7', 'name': 'Склад', 'val': 'скл.'},
                                                    {'id': '8', 'name': 'Торговый зал', 'val': 'торг.зал'},
                                                    {'id': '9', 'name': 'Цех', 'val': 'цех'},
                                                    // {'id': '1', 'name': 'Подвал', 'val': 'подв.'},
                                                    // {'id': '1', 'name': 'Котельная', 'val': 'кот.'},
                                                    // {'id': '1', 'name': 'Погреб', 'val': 'п-б'},
                                                ]
                                            }),
                                            listeners: {
                                                select: function (th, rec) {
                                                    me.fillAdrField('flat', rec, 1);
                                                }
                                            }
                                        },
                                        {
                                            xtype: 'textfield',
                                            cls: 'addr_fld',
                                            name: 'flat',
                                            width: 250,
                                            emptyText: 'Номер',
                                            enableKeyEvents: true,
                                            listeners: {
                                                keyup: function (th) {
                                                    me.fillAdrField('flat', th, 2);
                                                    th.focus(false, 1000);
                                                }
                                            }
                                        }

                                    ]
                                }
                            ]
                        },
                    ]
                }

            ]
        },
        listeners:{
            afterrender: function() {
                var me = this;
                if (!Ext.isEmpty(me.value)) {
                    me.fillData();
                }
            }
        },
        clearData: function() {
            var me = this,
                _fld = me.record.fields.items;

            for (var i = 0; i < _fld.length; i++) {
                me.record.set(_fld[i].name, _fld[i].defaultValue);
            }
        }, // Очистка record, если пустая строка в поле ввода.
        selectVal: function (el) {
            var me = this,
                index = me.down('[name=' + me.boundName + '_index]'),
                addressToForm = me.down('[name=' + me.boundName + ']'),
                val = el.getValue();

            me.noExpand = true;

            if (!Ext.isEmpty(me.arrAddress) && typeof val == 'number') {
                me.index = '';
                var indexval = me.arrAddress.suggestions[val].data['postal_code'],
                    addressval = me.arrAddress.suggestions[val].value;

                if (indexval !== '') {
                    me.index = indexval;
                    index.setVisible(true);
                    index.setValue('Индекс: ' + me.arrAddress.suggestions[val].data['postal_code']);
                } else {
                    index.setVisible(false);
                }

                if(me.index !== '' && addressval.indexOf(me.index.trim()) == -1){
                    addressval = me.index + ', ' + addressval.trim();
                }

                addressval = trim(addressval.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
                addressToForm.setValue(addressval);
            }
        }, // Анализ выбранного значения в комбобоксе.
        splitAddress: function(address, tp) {
            var me = this,
                tmp,
                adr_arr = address.split(','),
                tp = 1;

            me.record.set('address', address);

            for (var i = 0; i < 10; i++) {
                if (adr_arr[i] == undefined) {
                    adr_arr[i] = '';
                } else {
                    adr_arr[i] = trim(adr_arr[i]);
                }
            }

            // me.record.set('index', adr_arr[1]);
            me.record.set('index', adr_arr[0]);
            // tmp = me.splitVal(adr_arr[2]);
            tmp = me.splitVal(adr_arr[1]);
            // me.record.set('region_f', adr_arr[2]);
            me.record.set('region_f', adr_arr[1]);
            me.record.set('region', tmp[0]);
            me.record.set('region_s', tmp[1]);
            tmp = me.splitVal(adr_arr[3]);
            me.record.set('rayon_f', adr_arr[3]);
            me.record.set('rayon', tmp[0]);
            me.record.set('rayon_s', tmp[1]);
            tmp = me.splitVal(adr_arr[4]);
            me.record.set('city_f', adr_arr[4]);
            me.record.set('city', tmp[0]);
            me.record.set('city_s', tmp[1]);
            tmp = me.splitVal(adr_arr[5]);
            me.record.set('punkt_f', adr_arr[5]);
            me.record.set('punkt', tmp[0]);
            me.record.set('punkt_s', tmp[1]);
            tmp = me.splitVal(adr_arr[6]);
            me.record.set('street_f', adr_arr[6]);
            me.record.set('street', tmp[0]);
            me.record.set('street_s', tmp[1]);
            tmp = me.splitVal(adr_arr[7]);
            me.record.set('house_f', adr_arr[7]);
            me.record.set('house', adr_arr[7]);
            tmp = me.splitVal(adr_arr[8]);
            me.record.set('korpus_f', adr_arr[8]);
            me.record.set('korpus', adr_arr[8]);
            tmp = me.splitVal(adr_arr[9]);
            me.record.set('flat_f', adr_arr[9]);
            me.record.set('flat', adr_arr[9]);

        }, // Парсинг строки с адресом и заполнение модели.
        splitVal: function(v) {
            var rst = ['', ''],
                a;
            if (v && (v != '')) {
                a = v.split(' ');
                if (a.length > 2) {
                    rst[0] = '';
                    rst[1] = a[a.length - 1];
                    for (var i = 0; i < a.length - 1; i++) {
                        rst[0] = rst[0] + a[i] + ' ';
                    }
                    rst[0] = trim(rst[0]);
                } else if (a.length == 2) {
                    rst[0] = trim(a[0]);
                    rst[1] = trim(a[1]);
                }
                rst[0] = trim(rst[0]);
                rst[1] = trim(rst[1]);
            }
            return rst;
        },
        cmbBlur: function (cmb) {
            // var me = this,
            //     addressToForm = me.down('[name=' + me.boundName + ']');
            //me.value = trim(me.value.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
            //addressToForm.setValue(me.value);

        },
        setFromRec: function(address, r, tp) {
            var me = this,
                keys = ['index', 'region', 'region_s', 'region_c', 'rayon', 'rayon_s', 'city', 'city_s', 'punkt', 'punkt_s', 'street', 'street_s', 'house', 'korpus', 'flat'],
                _short;

            tp = 1;
            me.record.set('address', address);
            me.record.set('index', r.get('index'));

            for (var i = 1; i < keys.length; i++) {
                if (keys[i].indexOf('_') == -1) {
                    _short = r.get(keys[i] + '_s') || '';
                    me.record.set(keys[i] + '_s', _short);
                    me.record.set(keys[i] + '_f', trim(r.get(keys[i]) + ' ' + _short));
                }
                me.record.set(keys[i], r.get(keys[i]));
            }
        },
        fillData: function (v) {
            var me = this,
                index = me.down('[name=' + me.boundName + '_index]'),
                address = me.down('[name=' + me.boundName + '_inputfield]'),
                addressToForm = me.down('[name=' + me.boundName + ']'),
                val = v || me.value;

            val = trim(val.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
            addressToForm.setValue(val);
            address.setValue(val);
            address.selectText(0,0);

            if (Ext.isEmpty(me.rec)) { // Передается строка с адресом.
                me.splitAddress(val);
            } else { // Передается строка с адресом и модель для хранения по отдельным полям (используется в ЛК).
                me.setFromRec(val, me.rec);
            }

            if (!Ext.isEmpty(val)) {
                var indexval = me.record.get('index').trim();
                // val = trim(val.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
                if (indexval !== '' &&  !isNaN(Number(indexval))) {
                    index.setVisible(true);
                    index.setValue('Индекс: ' + indexval);
                    me.index = indexval;
                    val = val.replace(indexval + ',', '');
                }
                val = val.replace(/,/g, ', ');
            }

            me.suggests.removeAll();
            me.suggests.add([{'id': 0, 'name': val}]);
            // me.suggests.add([{'id': 999999, 'name': 'Ввести адрес отдельными полями'}]);
            // address.setValue(0);
        },

        getDadata: function (data, container, callback, restrict = null, count = 10) {
            var me = this;

            Ext.Ajax.request({
                url: dir_start_buh_ + 'dadata_api.php',
                method: 'POST',
                params: {
                    'method': 'suggest',
                    'type': 'address_restrict',
                    'data': Ext.encode(data),
                    'count': count
                },
                success: function (res) {
                    var rst;
                    try {
                        rst = Ext.decode(res.responseText);
                    } catch (g) {
                        rst = {
                            success: !1,
                            error: unknownerr
                        }
                    }

                    if (rst.success) {
                        if (restrict) {
                            if (restrict == 'area') {
                                me.area(rst.data.suggestions)
                            }
                        }

                        container.store.removeAll();

                        var arrAddress = rst.data;

                        if (arrAddress.suggestions != _dummy && arrAddress.suggestions.length > 0) {
                            arrAddress.suggestions.forEach(function (item, i, arr) {
                                container.store.add([{'id': i, 'name': item.value}]);
                            });
                        } else {
                            // не нашлось совпадений вернулся пустой массив
                            container.store.add([{'id': 9999, 'name': 'Не найдено совпадений'}]);
                            //index.setVisible(false);
                            //me.clearData();
                        }

                        if (callback != _dummy)
                            callback()
                    }
                },
                failure: function (res) {
                    obrFailure(res);
                }
            });
        },
        fillAdrress: function () {
            var me = this;
            var region = [];
            me.arrSuggest.forEach(function (item, i, arr) {
                region.push({'id': i}, {'name': item.region_type_full}, {'region_with_type': item.region_with_type})
            });
            me.down('[name=region_combo]').store.add(region)
        },
        suspendChange: function(suspend) {
            var fields = Ext.ComponentQuery.query('[cls=addr_fld]'),
                i = 0;
            for (; i < fields.length; i++) {
                if (suspend) {
                    fields[i].suspendCheckChange = 1;
                } else {
                    fields[i].suspendCheckChange = 0;
                }
            }
        },
        fillAdrField: function(field, rec, order) {
            var me = this;
            // name: "Республика Адыгея"
            // type: "респ."
            // val: "Адыгея"
            me.a_fias[field] = '';
            if (order == 0)
                me.a_fias[field] = rec[0].data.val;
            else if (order == 1)
                me.a_fias[field] = rec[0].data.val + ' ' + me.a_fias[field];
            else if (order == 2) {
                me.a_fias[field] = me.a_fias[field] + ' ' + rec.value;
            }
            else if (order == 3) {
                me.a_fias[field] = rec.value;
            }

            me.boundFieldChahged = true;
            me.down('[name=' + me.boundName + '_inputfield' + ']').setValue(me.a_fiasToString(field))
        },
        a_fiasToString: function (field) {
            var me = this, arr = [], p, i = 0;

            var last_empty = false;
            for (p in me.a_fias) {
                if (me.a_fias[p] != '' && !last_empty)
                    arr[i++] = me.a_fias[p];
                if (p == field)
                    last_empty = true;
            }
            return arr.join(',');
        }

});
