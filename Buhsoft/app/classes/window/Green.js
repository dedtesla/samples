Ext.define('Buh.classes.window.Green', {
    extend: 'Gbs.window',//winEditDoc
    cls: 'style2018 block-info_green',
    modal: false,
    width: 350,
    customclosable: false,
    config: {
        aCls : null,
        setText : null,
        _fn : Ext.emptyFn
    },
    constructor: function(cfg) {
        this.initConfig(cfg);
        this.callParent(arguments);
        var me = this;
        var config = this.config;

        if (config.aCls!=null)
            me.addCls(config.aCls);
        if (config.setText!=null)
            this.down('#winForm').setTitle(config.setText);

        this.on({
            beforeshow  : function(){
                var me = this,
                    w = Ext.getBody().getViewSize().width;
                me.setPosition( w - me.width - 20, 10);
        }});
    },
    header : false,
    items: {
        xtype : 'form',
        closable : true,
        itemId: 'winForm',
        listeners : {
            close : function(){
                var me = this;
                this.up('window').close();
            }
        }
    },

});



