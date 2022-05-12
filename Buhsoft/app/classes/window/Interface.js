Ext.define('Buh.classes.window.Interface', {
extend: 'Gbs.window',
header: false,
//modal: true,
width: 600,

config: {
   btnOk : 'Сохранить',
   btnCancel : 'Отмена',
   confirmWindow : false,
   toolBarOff : false,
   formTitle : '',
   formItems : [{
        xtype : 'box',
        itemId : 'winText'
       }],
   setText : null,
   _fn : Ext.emptyFn
},

constructor: function(cfg) {
    this.initConfig(cfg);
    this.callParent(arguments);

    var config = this.config;
    this.down('#btnOk').setText(config.btnOk);
    this.down('#btnCancel').setText(config.btnCancel);
    this.down('#winForm').setTitle(config.formTitle);
    this.down('#winForm').add(config.formItems);
    if (config.setText!=null && this.down('#winText'))
       this.down('#winText').update(config.setText);
    if (config.confirmWindow){
      this.down('#btnCancel').hide();
      this.down('#btnAbort').hide();

    }
    this.down('toolbar').setVisible(!config.toolBarOff);


},

items: {
xtype : 'form',
//layout: 'fit',
//cls: 'gbs-popup',
itemId: 'winForm',
dockedItems: [{
    xtype: 'toolbar',
    dock: 'bottom',
    ui: 'footer',
    items: [{
        text: 'Подтвердить',
        itemId: 'btnOk',
        xtype: 'greenbuttonsimple',
        handler: function(){
          this.up('window').onSave();
        }
    }, {
        text: 'Отмена', 
        itemId: 'btnCancel',
        handler: function(){
          this.up('window').onCancel();
        }
    }, {
        hidden: true,
        itemId : 'btnAbort',
        handler: function(){
          this.up('window').onAbort();
        }
    }]
}],
},

    onSave: function () {
        var win = this,
            _config = this.config,
            form = this.down('form').getForm();
        _config._fn(win);
        win.close();
    },
    onCancel: function () {
        var win = this,
            _config = this.config,
            form = this.down('form').getForm();
        if (_config._fnc != _dummy)
            _config._fnc(win);
        win.close();
    },
    onAbort: function () {
        var win = this,
            form = this.down('form').getForm();
        if (_config._fna != _dummy)
            _config._fna(frm);
        win.close();
    }

});



