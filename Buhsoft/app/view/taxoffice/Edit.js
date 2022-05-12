Ext.define('Buh.view.taxoffice.Edit', {
    extend: 'winEditDoc',
    width: 800,

    requires: (currYear >= 2021) ? ['Buh.view.taxoffice.FormHist', 'Buh.view.taxoffice.TBar'] : ['Buh.view.taxoffice.Form', 'Buh.view.taxoffice.TBar'],

    alias: (currYear >= 2021) ? 'widget.edittaxofficeHist' : 'widget.edittaxoffice',
    cls: 'style2018 init_window toolbar-highlight',

    items: {xtype: (currYear >= 2021) ? 'taxformHist' : 'taxform'},

    dockedItems: {xtype: 'taxbar'},

    open: function () {
        var arg = arguments[0];
        this.fireEvent('loadData', arg);
    }
});
