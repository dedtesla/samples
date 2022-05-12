Ext.define('Buh.view.mediator.report.Edit', {
    requires: ['Buh.view.mediator.report.Form', 'Buh.view.mediator.report.TBar'],
    extend: 'winEditDoc',
    width: 700,
    alias: 'widget.editmediator',
    cls: 'style2018 init_window toolbar-highlight blue_block-window',
    y: 0,
    items: {xtype: 'mediatorform'},
//    modal : false,
    dockedItems: {xtype: 'mediatorbar'},


    open: function () {
        var arg = arguments[0];
        this.fireEvent('fillData', arg);
    },
/*
    confirmClose: function (_fn) {
        var me = this;

        _confirm("Закрыть окно?", "Введенная информация не сохранится", function () {
            me.modified = false;
            me.close();
            if (_fn!=undefined)
             _fn();
        });

    }
*/
});
