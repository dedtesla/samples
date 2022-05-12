Ext.define('Buh.view.import.EmptyPanel', {
    extend: 'Ext.form.Panel',

    xtype: 'impmaketempty',
//    alias: 'widget.impmaketdetail',
    itemId: 'winImpEmpty',
    width: 1100,
    height: 272,
    layout: 'fit',
    items: {
        xtype: 'box',
        cls: 'text-big-center',
        html: "Для импорта сначала выберите шаблон"

    }

});
