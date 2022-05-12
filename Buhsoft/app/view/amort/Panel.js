Ext.define('Buh.view.amort.Panel', {
    extend: 'mainGbsWin',
    alias: 'widget.amortPanel',
    id: "mainPanelAmort",
    name: 'placeAmort',
    layout: 'form',
    items: {
        'xtype': 'tabpanel',
        'itemId': 'tpAmort',
        'name': 'bottomTabs',
        'items': [
            {
                title: 'Бухгалтерский учет',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1,
                items: Ext.create('Buh.view.amort.GridBuh')
            },
            {
                title: 'Налоговый учет',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                flex: 1,
                items: Ext.create('Buh.view.amort.GridNal')
            }
        ]
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
        this.fireEvent('reloadAmortBuh');
    }

});
