Ext.define('Buh.model.global.Address', {
    extend: 'Ext.data.Model',
    fields: [
        //Адрес полный
        {type: 'string', name: 'value', defaultValue: ''}, // Короткий адрес одной строкой
        {type: 'string', name: 'unrestricted_value', defaultValue: ''}, // Длинный адрес одной строкой
        // data
        {type: 'string', name: 'postal_code', defaultValue: ''}, // Индекс
        {type: 'string', name: 'index', defaultValue: ''},
        {type: 'string', name: 'country', defaultValue: ''}, // Страна

        {type: 'string', name: 'region_fias_id', defaultValue: ''}, // Код ФИАС региона
        {type: 'string', name: 'region_kladr_id', defaultValue: ''}, // Код КЛАДР региона
        {type: 'string', name: 'region_with_type', defaultValue: ''}, // Регион с типом
        {type: 'string', name: 'region_type', defaultValue: ''}, // Тип региона (сокращенный)
        {type: 'string', name: 'region_type_full', defaultValue: ''}, // Тип региона
        {type: 'string', name: 'region', defaultValue: ''}, // Регион

        {type: 'string', name: 'area_fias_id', defaultValue: ''}, // Код ФИАС района в регионе
        {type: 'string', name: 'area_kladr_id', defaultValue: ''}, // Код КЛАДР района в регионе
        {type: 'string', name: 'area_with_type', defaultValue: ''}, // Район в регионе с типом
        {type: 'string', name: 'area_type', defaultValue: ''}, // Тип района в регионе (сокращенный)
        {type: 'string', name: 'area_type_full', defaultValue: ''}, // Тип района в регионе
        {type: 'string', name: 'area', defaultValue: ''}, // Район в регионе

        {type: 'string', name: 'city_fias_id', defaultValue: ''}, // Код ФИАС города
        {type: 'string', name: 'city_kladr_id', defaultValue: ''}, // Код КЛАДР города
        {type: 'string', name: 'city_with_type', defaultValue: ''}, // Город с типом
        {type: 'string', name: 'city_type', defaultValue: ''}, // Тип города (сокращенный)
        {type: 'string', name: 'city_type_full', defaultValue: ''}, // Тип города
        {type: 'string', name: 'city', defaultValue: ''}, // Город

        {type: 'string', name: 'city_district_fias_id', defaultValue: ''}, // Код ФИАС района города
        {type: 'string', name: 'city_district_kladr_id', defaultValue: ''}, // Код КЛАДР района города
        {type: 'string', name: 'city_district_with_type', defaultValue: ''}, // Район города с типом
        {type: 'string', name: 'city_district_type', defaultValue: ''}, // Тип района города (сокращенный)
        {type: 'string', name: 'city_district_type_full', defaultValue: ''}, // Тип района города
        {type: 'string', name: 'city_district', defaultValue: ''}, // Район города

        {type: 'string', name: 'settlement_fias_id', defaultValue: ''}, // Код ФИАС нас. пункта
        {type: 'string', name: 'settlement_kladr_id', defaultValue: ''}, // Код КЛАДР нас. пункта
        {type: 'string', name: 'settlement_with_type', defaultValue: ''}, // Населенный пункт с типом
        {type: 'string', name: 'settlement_type', defaultValue: ''}, // Тип населенного пункта (сокращенный)
        {type: 'string', name: 'settlement_type_full', defaultValue: ''}, // Тип населенного пункта
        {type: 'string', name: 'settlement', defaultValue: ''}, // Населенный пункт

        {type: 'string', name: 'street_fias_id', defaultValue: ''}, // Код ФИАС улицы
        {type: 'string', name: 'street_kladr_id', defaultValue: ''}, // Код КЛАДР улицы
        {type: 'string', name: 'street_with_type', defaultValue: ''}, // Улица с типом
        {type: 'string', name: 'street_type', defaultValue: ''}, // Тип улицы (сокращенный)
        {type: 'string', name: 'street_type_full', defaultValue: ''}, // Тип улицы
        {type: 'string', name: 'street', defaultValue: ''}, // Улица

        {type: 'string', name: 'house_fias_id', defaultValue: ''}, // Код ФИАС дома
        {type: 'string', name: 'house_kladr_id', defaultValue: ''}, // Код КЛАДР дома
        {type: 'string', name: 'house_type', defaultValue: ''}, // Тип дома (сокращенный)
        {type: 'string', name: 'house_type_full', defaultValue: ''}, // Тип дома
        {type: 'string', name: 'house', defaultValue: ''}, // Дом

        {type: 'string', name: 'block_type', defaultValue: ''}, // Тип корпуса/строения (сокращенный)
        {type: 'string', name: 'block_type_full', defaultValue: ''}, // Тип корпуса/строения

        {type: 'string', name: 'flat_fias_id', defaultValue: ''}, // Код ФИАС квартиры
        {type: 'string', name: 'flat_type', defaultValue: ''}, // Тип квартиры (сокращенный)
        {type: 'string', name: 'flat_type_full', defaultValue: ''}, // Тип квартиры
        {type: 'string', name: 'flat', defaultValue: ''}, // Квартира

        {type: 'string', name: 'fias_id', defaultValue: ''}, // Код ФИАС: ROOM.ROOMGUID, если квартира найдена в ФИАС по точному совпадению
                                                             // HOUSE.HOUSEGUID, если найден только дом в ФИАС по точному совпадению;
                                                             // ADDROBJ.AOGUID в противном случае.

        {type: 'string', name: 'fias_level', defaultValue: ''}, //Уровень детализации, до которого адрес найден в ФИАС:
                                                                //         0 — страна
                                                                // 1 — регион
                                                                // 3 — район
                                                                // 4 — город
                                                                // 5 — район города
                                                                // 6 — населенный пункт
                                                                // 7 — улица
                                                                // 8 — дом
                                                                // 9 — квартира (начиная с версии 21.4)
                                                                // 65 — планировочная структура
                                                                // -1 — иностранный или пустой.

        {type: 'string', name: 'kladr_id', defaultValue: ''}, // Код КЛАДР
        {type: 'string', name: 'city_area', defaultValue: ''}, // Административный округ (только для Москвы)



        //Код ФИАС адреса
        {type: 'string', name: 'code', defaultValue: '00000000000000000'},


        //Регион. data.region
        //{type: 'string', name: 'region', defaultValue: ''},
        //Тип региона. data.region_type_full
        {type: 'string', name: 'region_f', defaultValue: ''},
        //Тип региона(сокращенный) .data.region_type
        {type: 'string', name: 'region_s', defaultValue: ''},
        //Код ФИАС региона. data.region_kladr_id
        {type: 'string', name: 'region_c', defaultValue: '00'},
        //Район в регионе. data.area
        {type: 'string', name: 'rayon', defaultValue: ''},
        //Тип района в регионе.  data.area_type_full
        {type: 'string', name: 'rayon_f', defaultValue: ''},
        //Тип района в регионе (сокращенный) data.area_type
        {type: 'string', name: 'rayon_s', defaultValue: ''},
        //Код ФИАС района в регионе. data.area_kladr_id
        {type: 'string', name: 'rayon_c', defaultValue: '00000'},
        //Город. data.city
        //{type: 'string', name: 'city', defaultValue: ''},
        //Тип города. data.city_type_full
        {type: 'string', name: 'city_f', defaultValue: ''},
        //Тип города (сокращенный). data.city_type
        {type: 'string', name: 'city_s', defaultValue: ''},
        //Код КЛАДР города. data.city_kladr_id
        {type: 'string', name: 'city_c', defaultValue: '00000000'},
        //Населенный пункт. data.settlement
        {type: 'string', name: 'punkt', defaultValue: ''},
        //Тип населенного пункта. data.settlement_type_full
        {type: 'string', name: 'punkt_f', defaultValue: ''},
        //Тип населенного пункта (сокращенный). data.settlement_type
        {type: 'string', name: 'punkt_s', defaultValue: ''},
        //Код КЛАДР нас. пункта. data.settlement_kladr_id
        {type: 'string', name: 'punkt_c', defaultValue: '00000000000'},
        //Улица. data.street
        //{type: 'string', name: 'street', defaultValue: ''},
        //Тип улицы. data.street_type_full
        {type: 'string', name: 'street_f', defaultValue: ''},
        //Тип улицы (сокращенный). data.street_type
        {type: 'string', name: 'street_s', defaultValue: ''},
        //Код КЛАДР улицы.  data.street_kladr_id
        {type: 'string', name: 'street_c', defaultValue: '00000000000000000'},
        //Дом data.house
        //{type: 'string', name: 'house', defaultValue: ''},
        //Тип дома data.house_type_full
        {type: 'string', name: 'house_f', defaultValue: ''},
        //Тип дома (сокращенный) data.house_type
        {type: 'string', name: 'house_s', defaultValue: ''},
        //Корпус/строение  data.block
        {type: 'string', name: 'korpus', defaultValue: ''},
        //Тип корпуса/строения data.block_type_full
        {type: 'string', name: 'korpus_f', defaultValue: ''},
        //Тип корпуса/строения (сокращенный) data.block_type
        {type: 'string', name: 'korpus_s', defaultValue: ''},
        //Квартира
        //{type: 'string', name: 'flat', defaultValue: ''},
        //Тип квартиры data.flat_type_full
        {type: 'string', name: 'flat_f', defaultValue: ''},
        //Тип квартиры (сокращенный) data.flat
        {type: 'string', name: 'flat_s', defaultValue: ''}
    ]
});