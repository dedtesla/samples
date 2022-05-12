/**
 * Панель окна мастера Акта сверки с контрагентом.
 *
 * @since 04.21
 */
Ext.define('Buh.view.reconciliationreport.Panel', {
    extend: 'winEditDoc',
    width: 700,
    layout: 'fit',
    cls: 'style2018 init_window toolbar-highlight pad_small',
    alias: 'widget.rrMasterWindow',
    shadow: false,
    contragent: null,
    contragentName: null,
    callFrom: null,
    lastContragents: {},
    initComponent: function () {
        Ext.apply(this, {
            items: Ext.create('Buh.view.reconciliationreport.Form'),
        });
        this.callParent();
    },
    listeners: {
        resize: function () {
            this.fireResize;
        }
    },
    fireResize: function () {
        let me = this,
            size = Ext.getBody().getViewSize(),
            needheight = size.height,
            needwidth = size.width;

        me.setWidth(needwidth);
        me.setHeight(needheight);
        me.doLayout();
    }

});
