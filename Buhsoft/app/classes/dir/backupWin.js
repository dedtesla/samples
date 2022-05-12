Ext.define('Buh.classes.dir.backupWin', {
    extend: 'Gbs.window',
    cls: 'style2018 easy-window',
    modal: false,
    id: 'windowRestoreDiRSelector',
//    resizable: false,
    x: 248,
    y: 100,


    header: false,
    layout: 'fit',
    items:
        {
            xtype: 'form',
            itemId: 'frm',
            title: 'Выберите версию для восстановления',
            items: [
                {
                    xtype: 'box',
                    itemId: 'ttl2',
                    html: "Данные для книги автоматически сохраняются перед<br>каждым заполнением. Для восстановления" +
                        " всегда<br>доступны три последних сохранения."
                },
                {

                    xtype: 'radiogroup',
                    itemId: 'rb',
                    vertical: true,
                    columns: 1
                }],
            bbar: [{
                text: 'Восстановить',
                xtype: 'greenbuttonsimple',
                handler: function () {
                    let win = this.up('window'),
                        rb = win.down('radiogroup').getValue(),
                        idFile = rb.id_file;

                    Ext.Ajax.request({
                        url: dir_start_buh_ + 'backup_kndr.php',
                        params: {
                            act: 'restore',
                            id: idFile
                        },
                        success: function (response) {

                            var result = eval("(" + response.responseText + ")");
                            if (result.success == "false") {
                                _alert_win("Ошибка", "Попытка восстановить копию неудачна. Попробуйте восстановление с другой точки.");
                            } else {
                                win.afterAction();
                                let winAnswer = Ext.create('Buh.classes.window.Green', {
                                    aCls: null,
                                    setText: "Восстановлена сохраненная версия"
                                });
                                winAnswer.show();
                            }
                        }
                    });


                }
            }, {
                text: 'Отмена',
                handler: function () {
                    this.up('window').close();
                }
            }
            ]
        },

    afterAction: function () {
    },

    fillWindow: function (_val) {
        let win = this,
            t1 = win.down('#ttl1'),
            t2 = win.down('#ttl2'),
            rb = win.down('radiogroup');

        _ajax(dir_start_buh_ + 'backup_kndr.php',
            {'act': 'list'},
            function (_inp) {
                let ans = Ext.decode(_inp, true),
                    kol = 0;
                Ext.Array.each(
                    ans.data, function (rec) {
                        rb.add({
                            boxLabel: 'книга на ' + rec.df,
                            name: 'id_file',
                            inputValue: rec.id,
                            checked: kol == 0
                        });
                        kol++;
                    }
                );
                if (kol == 0) {
                    win.down('#frm').setTitle("У вас нет сохраненных версий");
                    win.down('toolbar').hide();
                }

            }
        );
    }

});
