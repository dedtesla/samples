Ext.define('Buh.classes.buy.edit.SelType', {
    extend: 'Ext.form.field.ComboBox',
    xtype: 'buy_sel_type',
//width: 200,
//sprav_block : 0,
    editable: false,
    queryMode: 'local',
    valueField: 'name',
    displayField: 'name',

    listConfig: {
        cls: 'style2018',
        width: 93,
        tpl: [
            '<ul><tpl for=".">',
            '<tpl if="disabled==1"> ',
            '<li role="option" class="x-boundlist-item no-active" data-qtip="Добавление разных типов номенклатуры пока недоступно в программе. Чтобы ввести другой тип, оформите новую покупку">{name}</li>',
            '<tpl else>',
            '<li role="option" class="x-boundlist-item">{name}</li>',
            '</tpl>',
            '</tpl>'
        ],

    },

    hideTrigger: true,
    store: {
        xtype: 'store',
        fields: ['id', 'id_sprav', 'name', 'disabled'],
        data: [
            {"id": 5, "id_sprav": 5, "name": 'Товары', 'disabled': 0},
            {"id": 3, "id_sprav": 3, "name": 'Материалы', 'disabled': 0},
            {"id": 31, "id_sprav": 3, "name": 'Услуги', 'disabled': 0},
            {"id": 32, "id_sprav": 3, "name": 'РБП', 'disabled': 0},
            {"id": 4, "id_sprav": 4, "name": 'Продукция', 'disabled': 0},
            {"id": 41, "id_sprav": 4, "name": 'Услуги', 'disabled': 0},
            {"id": 1, "id_sprav": 1, "name": 'ОС', 'disabled': 0},
            {"id": 2, "id_sprav": 2, "name": 'НМА', 'disabled': 0}
        ]
    },

    listeners: {
        focus: function () {
            this.expand();
        },

        beforeselect: function (c, rec) {
            if (rec.data.disabled == 1)
                return false;
        },

        select: function (c, rec) {
            this.up('grid').fireEvent('selecttype', rec[0]);
        },


    },

    setAllowAn: function (_an) {
        this.store.each(
            function (rec) {
                if ((_an > 0 && rec.data.id == _an) || _an == 0)
                    rec.set('disabled', 0);
                else
                    rec.set('disabled', 1);
            });
    },

    setStoreTyp: function (_tab) {
        if (_tab == 100) {
            this.store.filterBy(function (r) {
                return r.get('id') != 41 && r.get('id') != 4;
            });
        }
        else {
            this.store.filterBy(function (r) {
                return r.get('id') != 31 && r.get('id') != 32 && r.get('id') != 2;
            });
        }
    }

});


