Ext.define('Buh.classes.closesc.TopContainerAutoClose', {
    extend: 'Ext.container.Container',
    xtype: 'closepaneltop',
    name: 'cb3',
    cls: 'block_info-txt container-align',
    state: 0,
    height: 96,
    items: [
        {
            xtype: 'box',
            name: "title-pad",
            cls: 'header-text',
            //flex: 1,
            html: 'Не закрыты предыдущие периоды'
        }, {
            xtype: 'box',
            name: "text-pad",
            cls: 'body-text',
            //flex: 1,
            html: 'Сначала закройте прошлын периоды или отметте галочкой закрытие всех периодов вместе.'
        }, {
            xtype: 'checkbox',
            name: "autoclose",
            boxLabel: 'Закрыть все периоды',
            //flex: 1,
            listeners : {
                change:function () {
                    this.up('window').fireEvent("switchAutoCloseSc");
                }

            }
        }]
});
