Ext.define('Buh.view.mediator.Panel', {
    extend: 'mainGbsWin',
    alias: 'widget.mediatorPanel',
    requires: ['Buh.view.mediator.Grid'],
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items: {
          xtype : 'mediatorgrid'
        },

    fireResize: function () {
        var h = Ext.getBody().getViewSize().height,
            w = Ext.getBody().getViewSize().width;
        this.setHeight(h - 110);
        this.setWidth(w - 90);
        this.down('[name=bottomTabs]').setHeight(h - 110);
        this.down('[name=bottomTabs]').setWidth(w - 90);
        this.doLayout();
    },

    refresh: function () {
//        this.fireEvent('reloadAmortBuh');
    }

});
