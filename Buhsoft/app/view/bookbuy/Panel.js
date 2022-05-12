Ext.define('Buh.view.bookbuy.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.bookbuyPanel',
    id: 'mainBookbuyPanel',
    requires: ['Buh.view.bookbuy.Grid', 'Buh.view.bookbuy.ItemMenu',
        'Buh.view.bookbuy.TBar', 'Buh.view.bookbuy.BBarFloat',
        'Buh.view.bookbuy.edit.Window', 'Buh.view.bookbuy.card.Window',
        'Buh.classes.bookbuy.DocTypes', 'Buh.classes.store.NdsTypes',
        'Buh.classes.bookbuy.DocTypesEdit',
        'Buh.view.bookbuy.filter.Window'],
    layout: 'card',
    items: [{
        xtype : 'bookbuygrid',
        type: 'buy',
        itemId: 'buy'
    },{
        xtype : 'bookbuygrid',
        type: 'sale',
        itemId: 'sale'
    }],
    initComponent: function(){
        Ext.create('Buh.view.bookbuy.BBarFloat', {
            renderTo: this._owner,
            width: Ext.getBody().getViewSize().width
        });
        this.callParent(arguments)
    },
    fireResize: function () {
        var h = Ext.getBody().getViewSize().height,
            w = Ext.getBody().getViewSize().width;
        this.setHeight(h - 145);
        this.setWidth(w - 10);
        this.doLayout()
    },

    refresh: function () {
    }
});
