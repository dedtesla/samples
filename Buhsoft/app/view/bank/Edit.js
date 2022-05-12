Ext.define('Buh.view.bank.Edit', {
    extend: 'winEditDoc',
    width: 620,
    requires: ['Buh.view.bank.BankForm'],
    alias: 'widget.editbank',
    cls: 'style2018 init_window toolbar-highlight blue_block-window', // slide-bottom-toolbar',
    y: 0,
    items: {xtype: 'bankform'},
    modal : false,
    dockedItems: {xtype: 'bankbar'},

    open: function () {
        var arg = arguments[0];
        this.fireEvent('fillData', arg);
    }


});
