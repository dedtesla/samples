Ext.define('Buh.model.global.Address', {
    extend: 'Ext.data.Model',
    fields: [
        //����� ������
        {type: 'string', name: 'value', defaultValue: ''}, // �������� ����� ����� �������
        {type: 'string', name: 'unrestricted_value', defaultValue: ''}, // ������� ����� ����� �������
        // data
        {type: 'string', name: 'postal_code', defaultValue: ''}, // ������
        {type: 'string', name: 'index', defaultValue: ''},
        {type: 'string', name: 'country', defaultValue: ''}, // ������

        {type: 'string', name: 'region_fias_id', defaultValue: ''}, // ��� ���� �������
        {type: 'string', name: 'region_kladr_id', defaultValue: ''}, // ��� ����� �������
        {type: 'string', name: 'region_with_type', defaultValue: ''}, // ������ � �����
        {type: 'string', name: 'region_type', defaultValue: ''}, // ��� ������� (�����������)
        {type: 'string', name: 'region_type_full', defaultValue: ''}, // ��� �������
        {type: 'string', name: 'region', defaultValue: ''}, // ������

        {type: 'string', name: 'area_fias_id', defaultValue: ''}, // ��� ���� ������ � �������
        {type: 'string', name: 'area_kladr_id', defaultValue: ''}, // ��� ����� ������ � �������
        {type: 'string', name: 'area_with_type', defaultValue: ''}, // ����� � ������� � �����
        {type: 'string', name: 'area_type', defaultValue: ''}, // ��� ������ � ������� (�����������)
        {type: 'string', name: 'area_type_full', defaultValue: ''}, // ��� ������ � �������
        {type: 'string', name: 'area', defaultValue: ''}, // ����� � �������

        {type: 'string', name: 'city_fias_id', defaultValue: ''}, // ��� ���� ������
        {type: 'string', name: 'city_kladr_id', defaultValue: ''}, // ��� ����� ������
        {type: 'string', name: 'city_with_type', defaultValue: ''}, // ����� � �����
        {type: 'string', name: 'city_type', defaultValue: ''}, // ��� ������ (�����������)
        {type: 'string', name: 'city_type_full', defaultValue: ''}, // ��� ������
        {type: 'string', name: 'city', defaultValue: ''}, // �����

        {type: 'string', name: 'city_district_fias_id', defaultValue: ''}, // ��� ���� ������ ������
        {type: 'string', name: 'city_district_kladr_id', defaultValue: ''}, // ��� ����� ������ ������
        {type: 'string', name: 'city_district_with_type', defaultValue: ''}, // ����� ������ � �����
        {type: 'string', name: 'city_district_type', defaultValue: ''}, // ��� ������ ������ (�����������)
        {type: 'string', name: 'city_district_type_full', defaultValue: ''}, // ��� ������ ������
        {type: 'string', name: 'city_district', defaultValue: ''}, // ����� ������

        {type: 'string', name: 'settlement_fias_id', defaultValue: ''}, // ��� ���� ���. ������
        {type: 'string', name: 'settlement_kladr_id', defaultValue: ''}, // ��� ����� ���. ������
        {type: 'string', name: 'settlement_with_type', defaultValue: ''}, // ���������� ����� � �����
        {type: 'string', name: 'settlement_type', defaultValue: ''}, // ��� ����������� ������ (�����������)
        {type: 'string', name: 'settlement_type_full', defaultValue: ''}, // ��� ����������� ������
        {type: 'string', name: 'settlement', defaultValue: ''}, // ���������� �����

        {type: 'string', name: 'street_fias_id', defaultValue: ''}, // ��� ���� �����
        {type: 'string', name: 'street_kladr_id', defaultValue: ''}, // ��� ����� �����
        {type: 'string', name: 'street_with_type', defaultValue: ''}, // ����� � �����
        {type: 'string', name: 'street_type', defaultValue: ''}, // ��� ����� (�����������)
        {type: 'string', name: 'street_type_full', defaultValue: ''}, // ��� �����
        {type: 'string', name: 'street', defaultValue: ''}, // �����

        {type: 'string', name: 'house_fias_id', defaultValue: ''}, // ��� ���� ����
        {type: 'string', name: 'house_kladr_id', defaultValue: ''}, // ��� ����� ����
        {type: 'string', name: 'house_type', defaultValue: ''}, // ��� ���� (�����������)
        {type: 'string', name: 'house_type_full', defaultValue: ''}, // ��� ����
        {type: 'string', name: 'house', defaultValue: ''}, // ���

        {type: 'string', name: 'block_type', defaultValue: ''}, // ��� �������/�������� (�����������)
        {type: 'string', name: 'block_type_full', defaultValue: ''}, // ��� �������/��������

        {type: 'string', name: 'flat_fias_id', defaultValue: ''}, // ��� ���� ��������
        {type: 'string', name: 'flat_type', defaultValue: ''}, // ��� �������� (�����������)
        {type: 'string', name: 'flat_type_full', defaultValue: ''}, // ��� ��������
        {type: 'string', name: 'flat', defaultValue: ''}, // ��������

        {type: 'string', name: 'fias_id', defaultValue: ''}, // ��� ����: ROOM.ROOMGUID, ���� �������� ������� � ���� �� ������� ����������
                                                             // HOUSE.HOUSEGUID, ���� ������ ������ ��� � ���� �� ������� ����������;
                                                             // ADDROBJ.AOGUID � ��������� ������.

        {type: 'string', name: 'fias_level', defaultValue: ''}, //������� �����������, �� �������� ����� ������ � ����:
                                                                //         0 � ������
                                                                // 1 � ������
                                                                // 3 � �����
                                                                // 4 � �����
                                                                // 5 � ����� ������
                                                                // 6 � ���������� �����
                                                                // 7 � �����
                                                                // 8 � ���
                                                                // 9 � �������� (������� � ������ 21.4)
                                                                // 65 � ������������� ���������
                                                                // -1 � ����������� ��� ������.

        {type: 'string', name: 'kladr_id', defaultValue: ''}, // ��� �����
        {type: 'string', name: 'city_area', defaultValue: ''}, // ���������������� ����� (������ ��� ������)



        //��� ���� ������
        {type: 'string', name: 'code', defaultValue: '00000000000000000'},


        //������. data.region
        //{type: 'string', name: 'region', defaultValue: ''},
        //��� �������. data.region_type_full
        {type: 'string', name: 'region_f', defaultValue: ''},
        //��� �������(�����������) .data.region_type
        {type: 'string', name: 'region_s', defaultValue: ''},
        //��� ���� �������. data.region_kladr_id
        {type: 'string', name: 'region_c', defaultValue: '00'},
        //����� � �������. data.area
        {type: 'string', name: 'rayon', defaultValue: ''},
        //��� ������ � �������.  data.area_type_full
        {type: 'string', name: 'rayon_f', defaultValue: ''},
        //��� ������ � ������� (�����������) data.area_type
        {type: 'string', name: 'rayon_s', defaultValue: ''},
        //��� ���� ������ � �������. data.area_kladr_id
        {type: 'string', name: 'rayon_c', defaultValue: '00000'},
        //�����. data.city
        //{type: 'string', name: 'city', defaultValue: ''},
        //��� ������. data.city_type_full
        {type: 'string', name: 'city_f', defaultValue: ''},
        //��� ������ (�����������). data.city_type
        {type: 'string', name: 'city_s', defaultValue: ''},
        //��� ����� ������. data.city_kladr_id
        {type: 'string', name: 'city_c', defaultValue: '00000000'},
        //���������� �����. data.settlement
        {type: 'string', name: 'punkt', defaultValue: ''},
        //��� ����������� ������. data.settlement_type_full
        {type: 'string', name: 'punkt_f', defaultValue: ''},
        //��� ����������� ������ (�����������). data.settlement_type
        {type: 'string', name: 'punkt_s', defaultValue: ''},
        //��� ����� ���. ������. data.settlement_kladr_id
        {type: 'string', name: 'punkt_c', defaultValue: '00000000000'},
        //�����. data.street
        //{type: 'string', name: 'street', defaultValue: ''},
        //��� �����. data.street_type_full
        {type: 'string', name: 'street_f', defaultValue: ''},
        //��� ����� (�����������). data.street_type
        {type: 'string', name: 'street_s', defaultValue: ''},
        //��� ����� �����.  data.street_kladr_id
        {type: 'string', name: 'street_c', defaultValue: '00000000000000000'},
        //��� data.house
        //{type: 'string', name: 'house', defaultValue: ''},
        //��� ���� data.house_type_full
        {type: 'string', name: 'house_f', defaultValue: ''},
        //��� ���� (�����������) data.house_type
        {type: 'string', name: 'house_s', defaultValue: ''},
        //������/��������  data.block
        {type: 'string', name: 'korpus', defaultValue: ''},
        //��� �������/�������� data.block_type_full
        {type: 'string', name: 'korpus_f', defaultValue: ''},
        //��� �������/�������� (�����������) data.block_type
        {type: 'string', name: 'korpus_s', defaultValue: ''},
        //��������
        //{type: 'string', name: 'flat', defaultValue: ''},
        //��� �������� data.flat_type_full
        {type: 'string', name: 'flat_f', defaultValue: ''},
        //��� �������� (�����������) data.flat
        {type: 'string', name: 'flat_s', defaultValue: ''}
    ]
});