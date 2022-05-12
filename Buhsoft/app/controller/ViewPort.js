Ext.define('Buh.controller.ViewPort', {
    extend: 'Ext.app.Controller',
    /*
        refs: [
            {
                ref: 'winBankEdit',
                selector: 'editbank'
            },
        ],
    */
    init: function () {
        this.control({

            'viewport': {
                resize: this.fnResize,
                scroll: this.fnScroll
            },


        });
    },
    fnResize: function () {

        var arWin = Ext.ComponentQuery.query('editbank');
        Ext.each(arWin, function (win, index) {
            win.fireEvent('onScroll');
//         //console.log(win);
        });
    },

    fnScroll: function () {

    }


    /*
        analit1Select : function(rec)
         {
           // Смена первой аналитики
           var win = this.getWinBankEdit();
           win.down('[name=analit2]').setFilter('org_id=' + rec.data.id);
           win.down('[name=analit2]').org_id = rec.data.id;
           win.down('[name=analit2]').org_nam = rec.data.naim;

         }
    */
});
