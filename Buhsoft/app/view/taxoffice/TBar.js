Ext.define('Buh.view.taxoffice.TBar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'taxbar',
    layout: 'fit',
    dock: 'bottom',
    name: 't_bar',
    items: [{
        xtype: 'container',
        name: 'errordata',
        cls: 'bottom-block_alert-info',
        layout: 'hbox',
        defaultType: 'button',
        defaults: {
            componentCls: 'x-toolbar-item'
        },
    },
        {
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    defaultType: 'button',
                    defaults: {
                        componentCls: 'x-toolbar-item'
                    },
                    items: [{
                        text: 'Сохранить',
                        hidden: currYear >= 2021,
                        action: 'save',
                        cls: 'green-btn',
                    }, {
                        text: 'Отмена',
                        hidden: currYear >= 2021,
                        action: 'close',
                    },{
                        text: 'Обновить реквизиты по ИФНС',
                        name: 'tbar-upgate',
                        hidden: currYear < 2021,
                        action: 'comparedata',
                    }, {
                        xtype: 'tbfill'
                    }, {
                        text: 'Удалить',
                        name: 'btn-del',
                        hidden: true,
                        icon: _icons.x_red,
                        action: 'delete',
                    }]
                }]
        }],

    // Метод для рисования желтых кнопок с ошибочными полями
    fillErrorBar: function (layout, showTB) {
        var win = this.up('window'),
            toolbar = this,
            showButtons = showTB != undefined ? showTB : true,
            kolError = 0;
        toolbar.down('[name=errordata]').removeAll();

        Ext.each(layout, function (fld, index) {
            if (win.down('[name=' + fld.name + ']')==undefined) return;
            var val = win.down('[name=' + fld.name + ']').getValue(),
                fnCheck = function () {
                };

            if (fld.fn != undefined)
                fnCheck = fld.fn;
            else
                fnCheck = function (val) {
                    return Ext.Array.contains(['', 0, null], val);
                };
            if (fnCheck(val)) {
                kolError++;
                if (showButtons) {
                    if (kolError == 1) {
                        toolbar.down('[name=errordata]').add({
                            xtype: 'label',
                            cls: 'btn-sel-blue color-orange',
                            text: 'Не введено:'
                        });
                    }

                    if (kolError > 1) {
                        var b = {xtype: 'box', html: ',', cls: 'color-orange',};
                        toolbar.down('[name=errordata]').add(b);

                        var b = {
                            xtype: 'tbspacer',
                        };
                        toolbar.down('[name=errordata]').add(b);
                    }

                    var b = {
                        xtype: 'button',
                        action: 'focusfield',
                        componentCls: 'x-toolbar-item',
                        text: fld.text,
                        fname: fld.name,
                        cls: 'btn-sel-blue color-orange',
                        handler: function () {
                            var win = this.up('window'),
                                fname = this.fname;
                            win.down('[name=' + fname + ']').focus();
                        }
                    };
                    toolbar.down('[name=errordata]').add(b);
                }
            }
        });
        toolbar.down('[action=save]').setDisabled(kolError > 0);

    }

});
