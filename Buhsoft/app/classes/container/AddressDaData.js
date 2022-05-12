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
Ext.define('Buh.classes.container.AddressDaData',
    {
        requires: ['Buh.classes.container.Vertical', 'Buh.classes.help.ButtonAsk'],
        extend: 'Ext.container.Container',
        xtype: 'address_dadata_inline',
        alias: 'widget.addressdadatainline',
        record: null,
        suggests: null,
        noExpand: false,
        edit: false,
        typeadr: 1,
        keydown: false,
        arrAddress: [],
        arrSuggest: [],
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
                    xtype: 'label',
                    name: 'lcmbName',
                    text: me.labelText.trim(),
                },
                {
                    xtype: 'buttonask',
                    text: askText
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

/*
                                        if(newValue == 999999) {
                                            me.editAdrExt(el);
                                        }
*/
                                    }

                                    if (value == '') {
                                        index.setVisible(false);
                                        me.suggests.removeAll();
                                    }

                                    if(me.keydown && !Ext.isEmpty(value)) {
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
                                                            } else {
                                                                // не нашлось совпадений вернулся пустой массив
                                                                me.suggests.add([{'id': 9999, 'name': 'Не найдено совпадений'}]);
                                                                index.setVisible(false);
                                                                me.clearData();
                                                            }
                                                            // me.suggests.add([{'id': 999999, 'name': 'Ввести адрес отдельными полями'}]);
                                                        }

                                                        if (!me.noExpand) {
                                                            el.expand();
                                                        }
                                                        me.noExpand = false;
                                                    },
                                                    failure: function (res) {
                                                        obrFailure(res);
                                                    }
                                                });
                                            }, 600
                                        );
                                    }
                                    me.cmbChange(el);
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

                trim(addressval.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
                // addressval.split(',').join(', ');
                addressToForm.setValue(addressval);
                me.writeToRecord();
            }
        }, // Анализ выбранного значения в комбобоксе.
        editAdrExt: function (el) {
            var me = this,
                index = me.down('[name=' + me.boundName + '_index]');

            editAdrFias({
                fn: function (success, record, arr, tadr) {
                    if (success) {
                        me.typeadr = tadr;
                        me.edit = true;
                        me.keydown = false;
                        me.record = record;

                        trim(arr['value'].replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
                        // arr['value'].split(',').join(', ');
                        me.down('[name=' + me.boundName + ']').setValue(arr['value']);
                        el.setValue(arr['value']);

                        if (arr['postal_code']) {
                            index.setVisible(true);
                            index.setValue('Индекс: ' + arr['postal_code']);
                        }
                    } else {
                        me.edit = false;
                    }
                }
            });
        }, // Вызов формы ввода структурированного адреса.
        splitAddress: function(address, tp) {
            var me = this,
                tmp,
                adr_arr = address.split(',');
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
        writeToRecord: function() {
            var me = this,
                cmbVal = me.down('[name=' + me.boundName + '_inputfield]').getValue(),
                cmbRawValue = me.down('[name=' + me.boundName + '_inputfield]').getRawValue(),
                addrData,
                addrVal,
                index,
                struct = true;

            if (!me.edit) { // Не было сохраненного структурированного ввода адреса.
                if (!Ext.isEmpty(cmbVal) && typeof cmbVal == 'number' && typeof me.arrAddress.suggestions !== 'undefined') { // Выбор подсказки.
                    addrVal = me.arrAddress.suggestions[cmbVal].value;
                    addrData = me.arrAddress.suggestions[cmbVal].data;
                } else { // После ручного ввода
                    struct = false;
                    if (typeof me.arrAddress.suggestions !== 'undefined') {
                        me.arrAddress.suggestions.forEach(function (item, i, arr) {
                            if (item.value == cmbRawValue) {
                                addrVal = item.value;
                                addrData = item.data;
                                struct = true;
                                return;
                            }
                        });
                    }
                }

                if (struct) { // Структура адреса содержит данные.
                    index = addrData.postal_code;
                    me.record.set('index', index);
                    me.record.set('region', addrData.region);
                    me.record.set('region_f', addrData.region + (addrData.region_type !== '' ? ' ' + addrData.region_type : '')); // addrData.region_type_full;
                    me.record.set('region_s', addrData.region_type);
                    me.record.set('region_c', addrData.region_kladr_id);
                    me.record.set('rayon', addrData.area);
                    me.record.set('rayon_f', addrData.area + (addrData.area_type !== '' ? ' ' + addrData.area_type : '')); // addrData.area_type_full;
                    me.record.set('rayon_s', addrData.area_type);
                    me.record.set('rayon_c', addrData.area_kladr_id);

                    if (addrData.region_kladr_id !== addrData.city_kladr_id) {
                        me.record.set('city', addrData.city);
                        me.record.set('city_f', addrData.city + (addrData.city_type !== '' ? ' ' + addrData.city_type : ''));
                        me.record.set('city_s', addrData.city_type);
                        me.record.set('city_c', addrData.city_kladr_id);
                    } else {
                        me.record.set('city', '');
                        me.record.set('city_f', '');
                        me.record.set('city_s', '');
                        me.record.set('city_c', '');
                    }

                    me.record.set('punkt', addrData.settlement);
                    me.record.set('punkt_f', addrData.settlement + (addrData.settlement_type !== '' ? ' ' + addrData.settlement_type : ''));
                    me.record.set('punkt_s', addrData.settlement_type);
                    me.record.set('punkt_c', addrData.settlement_kladr_id);
                    me.record.set('street', addrData.street);
                    me.record.set('street_f', addrData.street + (addrData.street_type !== '' ? ' ' + addrData.street_type : ''));
                    me.record.set('street_s', addrData.street_type);
                    me.record.set('street_c', addrData.street_kladr_id);
                    me.record.set('house', addrData.house);
                    me.record.set('house_f', addrData.house + (addrData.house_type !== '' ? ' ' + addrData.house_type : ''));
                    me.record.set('house_s', addrData.house_type);
                    me.record.set('korpus', addrData.block);
                    me.record.set('korpus_f', addrData.block + (addrData.block_type !== '' ? ' ' + addrData.block_type : ''));
                    me.record.set('korpus_s', addrData.block_type);
                    me.record.set('flat', addrData.flat);
                    me.record.set('flat_f', addrData.flat + (addrData.flat_type !== '' ? ' ' + addrData.flat_type : ''));
                    me.record.set('flat_s', addrData.flat_type);
                }
            }

            if (struct) { // Структурированный адрес.
                addrVal = ',' + me.record.get('index') + ',' + me.record.get('region_f') + ',' + me.record.get('rayon_f') + ',' + me.record.get('city_f') + ',' + me.record.get('punkt_f') + ',' + me.record.get('street_f') + ',' + me.record.get('house') + ',' + me.record.get('korpus') + ',' + me.record.get('flat');
            } else {  // Неструктурированный адрес.
                me.typeadr = 3;
                addrVal = cmbRawValue;

                if(me.index !== '' && addrVal.indexOf(me.index.trim()) == -1){
                    addrVal = me.index + ', ' + addrVal.trim();
                }
            }
            me.record.set('address', addrVal);
            me.value = addrVal;
        }, // Парсинг ответа API DaData/данных, введенных пользователем.
        cmbBlur: function (cmb) {
            var me = this,
                addressToForm = me.down('[name=' + me.boundName + ']');

            me.writeToRecord();

            trim(me.value.replace(/,,,,/g, ',').replace(/,,,/g, ',').replace(/,,/g, ',').replace(/^,/g, '').replace(/,$/g, ''));
            // me.value.split(',').join(', ');
            addressToForm.setValue(me.value);
        },
        cmbChange: function (cmb) { // Метод вызывается после изменений в комбобоксе.
            var me = this;
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
            address.setValue(0);
        }
    });
