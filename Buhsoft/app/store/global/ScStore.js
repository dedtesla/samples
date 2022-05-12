Ext.define('Buh.store.global.ScStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.global.Ssc',
    proxy: {
        type: 'ajax',
        url: dir_start_buh_ + 'getcbsprav.php/2000',
        extraParams: {
            yearRequest: currYear
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    autoLoad: true,
    getScFiltered: function (_oper, _sprav) {
        var _flt = [],
            _flti = [];
        if (_oper == 1) {
            _flt[5] = ['41.', '004'];
            _flt[3] = ['10.', '11.9', '20.', '25.', '26.', '44.', '91.2', '002.2', '003.1'];
            _flti[3] = ['21.1', '25.2', '25.3', '26.1'];
            _flt[31] = ['20.', '25.1', '25.4', '26.', '44.', '91.2'];
            _flti[31] = ['26.1', '26.4'];
            _flt[32] = ['97.'];
            _flti[32] = ['97.6', '97.7'];
            _flt[1] = ['08.'];
            _flt[2] = ['08.5'];
        }
        else {
            _flt[5] = ['41.', '004'];
            _flt[3] = ['10.', '11.9', '20.', '25.', '26.', '44.', '91.2', '002.2', '003.1'];
            _flti[3] = ['21.1', '25.2', '25.3', '26.1'];
            _flt[4] = ['11.1', '43.', '21.2', '21.3', '003.2'];
            _flt[41] = ['76.6', '90.1', '91.1'];
            _flt[1] = ['01.'];
            _flt[2] = ['04.1'];
        }

        var st = this,
            store = Ext.clone(this);

        store.filterBy(function (rec) {
            var sc = rec.data.sc_ssc;
            for (var z = 0; z < _flt[_sprav].length; z++) {
                if (sc.indexOf(_flt[_sprav][z]) == 0) {
                    var allowAdd = true;
                    if (_flti[_sprav] != _dummy) {
                        for (var z1 = 0; z1 < _flti[_sprav].length; z1++) {
                            if (sc === _flti[_sprav][z1]) {
                                allowAdd = false;
                            }
                        }
                    }
                    return allowAdd;

                }
            }
        });

        return store;
    },
    getMainScArray: function () {
        var st = this,
            ret = [];

        st.each(function (rec) {
            Ext.Array.include(ret, rec.data.sc);
        });
        return ret;
    },
    getCurrentPlan: function (year) {
        if (year != this.proxy.extraParams.yearRequest) {
            this.proxy.extraParams.yearRequest = year;
            this.load();
    }

    }



});
