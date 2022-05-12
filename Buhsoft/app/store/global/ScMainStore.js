Ext.define('Buh.store.global.ScMainStore', {
    extend: 'Ext.data.Store',
    model: 'Buh.model.global.Ssc',
    proxy: {
        type: 'ajax',
        url: dir_start_buh_ + 'getcbsprav.php/2006',
        extraParams: {
            yearRequest: currYear
        },
        reader: {
            type: 'json',
            root: 'data'
        }
    },
    autoLoad: true,
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
