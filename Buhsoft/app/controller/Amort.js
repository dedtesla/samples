Ext.define('Buh.controller.Amort', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'grdAmortBuh',
            selector: 'amortgridbuh'
        },
        {
            ref: 'grdAmortNal',
            selector: 'amortgridnal'
        },
    ],

    init: function () {
        this.control({
            'amortPanel': {
                reloadAmortBuh: this.loadAmortBuh,
                render: this.renderAmort,
            },


            'amortPanel tabpanel': {
                tabchange: this.tabChange
            },


            'amortPanel amortgridbuh [name=mon]': {
                select: this.loadAmortBuh,
            },

            'amortPanel amortgridbuh gbs_combo_year': {
                select: this.loadAmortBuh,
            },

            'amortPanel amortgridbuh button[action=print]': {
                click: this.printAmortBuh,
            },

            'amortPanel amortgridbuh field_find': {
                change: this.filterAmortBuh,
            },

            'amortPanel amortgridnal [name=mon]': {
                select: this.loadAmortNal,
            },

            'amortPanel amortgridnal gbs_combo_year': {
                select: this.loadAmortNal,
            },

            'amortPanel amortgridnal field_find': {
                change: this.filterAmortNal,
            },

            'amortPanel amortgridnal button[action=print]': {
                click: this.printAmortNal,
            },


        });
    },

    renderAmort: function () {

        this.loadAmortBuh();
    },

    loadAmortBuh: function () {
        let me = this,
            grdAmort1 = me.getGrdAmortBuh(),
            _mn = grdAmort1.down('toolbar').down('combo[name=mon]').getValue(),
            _y = grdAmort1.down('toolbar').down('#cmbYear').getValue();

        if (typeof(joManager) == 'object' && joManager.open) {
            grdAmort1.down('toolbar').down('combo[name=mon]').suspendEvents();
            grdAmort1.down('toolbar').down('combo[name=mon]').setValue(joManager.mn);
            grdAmort1.down('toolbar').down('combo[name=mon]').resumeEvents();
        }

        grdAmort1.store.proxy.extraParams = {mn: _mn, yr: _y};
        grdAmort1.store.load({
            callback: function (records, operation, success) {
                if (typeof(joManager) == 'object' && joManager.open) {
                    var r = grdAmort1.store.findRecord('id_os', joManager.id_os);
                    grdAmort1.getView().select(r);
                    joManager.open = false;
                }

            }
        });


    },

    loadAmortNal: function (button) {
        let me = this,
            grdAmort2 = me.getGrdAmortNal(),
            _mn = grdAmort2.down('toolbar').down('combo[name=mon]').getValue(),
            _y = grdAmort2.down('toolbar').down('#cmbYear').getValue();

        grdAmort2.store.proxy.extraParams = {mn: _mn, yr: _y};
        grdAmort2.store.load();


    },

    tabChange: function (tp, nc, oc) {
        var me = this;
        if (nc.title == 'Бухгалтерский учет') me.loadAmortBuh();
        if (nc.title == 'Налоговый учет') me.loadAmortNal();

    },

    filterAmortBuh: function (t, nv, ov, e) {
        var me = this,
            grdAmort1 = me.getGrdAmortBuh();

        grdAmort1.store.filterBy((function (r) {
            if ((r.get('name').toUpperCase()).indexOf(nv.toUpperCase()) >= 0)
                return true;
            else
                return false;
        }));
    },

    filterAmortNal: function (t, nv, ov, e) {
        var me = this,
            grdAmort2 = me.getGrdAmortNal();

        grdAmort2.store.filterBy((function (r) {
            if ((r.get('name').toUpperCase()).indexOf(nv.toUpperCase()) >= 0)
                return true;
            else
                return false;
        }));
    },

    printAmortBuh: function () {
        if (isPayed()) {
            _mn = this.getGrdAmortBuh().down('[name=mon]').getValue();
            _yr = this.getGrdAmortBuh().down('#cmbYear').getValue();
            window.location.href = dir_start_buh_ + "./frm_os_amort.php?mn=" + _mn + "&yr=" + _yr;
        }

    },

    printAmortNal: function () {
        /*
          if (isPayed()) {
              _mn = this.getGrdAmortNal().down('combo').getValue();
              window.location.href = dir_start_buh_ + "./frm_os_amort_nalog.php?mn=" + _mn + "&yr=" + currYear;
          }
        */
    }

});
