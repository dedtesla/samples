Ext.define('Buh.classes.sprav.common.GridMenu', {
alternateClassName: ['spravGridMenu'],

/*******************************************************************************/
/*******************************************************************************/
/*                                                                             */
/*               grid  menu                                                    */
/*                                                                             */
/*******************************************************************************/
/*******************************************************************************/


makeGridMenu : function(_id_sprav, win){

var menu =  Ext.create('Ext.menu.Menu', {
        owner: win,
        grid: win.down('grid'),
        cls: 'style2018 menu-gray',
        id: 'grdSpravCM' + _id_sprav,
        rec: null,
        items: [
            {
                text: 'Сделать основной',
                icon: _icons.edit,
                handler: function () {
                    var grid = this.up('menu').grid,
                        rec = this.up('menu').rec,
                        _fn = function (ans) {
                            grid.store.reload();
                        };
                    _ajax(dir_start_buh_ + 'tax_of_proceed.php', {'action': 'makemaintax', 'id': rec.data.id}, _fn);
                }

            }, {
                text: 'Изменить',
                icon: _icons.edit,
                action: 'edit',
                handler: function (_rec = null) {
                    var menu = this.up('menu'),
                        grid = menu.grid,
                        rec = menu.rec,
                        win = menu.owner,
                        editor = win.editor,
                        tree = win.down('treepanel'),
                        id_ed = _id_sprav == 1 ? rec.data.id_os : rec.data.id;

                    if (rec.data.sprav == undefined)
                        rec.data.sprav = _rec.data.sprav;

                    if (rec.data.sprav == 12 || rec.data.sprav == 13 || rec.data.sprav == 131 || rec.data.sprav == 132 || rec.data.sprav == 133) {
                        var winTax = Ext.create('Buh.view.taxoffice.Edit');
                        winTax.open({id: rec.data.id, mode: rec.data.sprav == 12 ? 'tax' : 'fond'});
                        return;
                    }

                    var id_grp = (win.haveTree, 0, -1);
                    if (tree.getSelectionModel().hasSelection())
                        id_grp = tree.getSelectionModel().getSelection()[0].data.id;


                    if (rec.data.sprav != 6 | (rec.data.sprav == 6 & rec.data.our_org != 1)) {
                        Ext.getCmp(editor).openEdit(id_ed, id_grp, _id_sprav, 'spravGrid' + _id_sprav, rec, win.mntEdo);
                    }
                    else
                       {
                         document.getElementById('mn5-3-11').click();
                         win.close();
                       }
                        //_alert_win("Отказано", "Редактировать данные по своей организации можно только в Личном кабинете.");
                }


            }, {
                text: 'Копировать',
                icon: _icons.copy,
                hidden: true,
                handler: function () {
                    var menu = this.up('menu'),
                        grid = menu.grid,
                        rec = menu.rec,
                        win = menu.owner,
                        editor = win.editor,
                        tree = win.down('treepanel'),
                        id_ed = _id_sprav == 1 ? rec.data.id_os : rec.data.id;

                    var id_grp = (win.haveTree, 0, -1);
                    if (tree.getSelectionModel().hasSelection())
                        id_grp = tree.getSelectionModel().getSelection()[0].data.id;

                    Ext.getCmp(editor).openEdit(0, id_grp, _id_sprav, 'spravGrid' + _id_sprav, rec);

                }


            }, {
                text: 'Удалить',
                icon: _icons.del,
                handler: function () {
                    var menu = this.up('menu'),
                        grid = menu.grid,
                        rec = menu.rec,
                        win = menu.owner,
                        editor = win.editor,
                        tree = win.down('treepanel'),
                        id_ed = _id_sprav == 1 ? rec.data.id_os : rec.data.id;


                    _fn_del = function () {
                        if (rec.data.sprav == 12) {
                            ttl_d = 'Нельзя удалить налоговую';
                            cont_d = 'Сначала удалите все операции и платежные документы с этой налоговой';
                        }
                        else {
                            ttl_d = 'Удаление невозможно.';
                            cont_d = 'Сначала удалите все операции с этим наименованием';
                        }

                        var ind = grid.store.indexOf(rec);
                        _fn = function (ans) {
                            a = Ext.JSON.decode(ans);

                            if (a.errorText == '') {

                                _ajax(dir_start_buh_ + 'edo/delcontra',
                                    {
                                        aai: aktionid.config.appid,
                                        eat: aktionid.token,
                                        userid: userid,
                                        cid: rec.data.id,
                                        inn: rec.data.inn,
                                        ceid: rec.data.contra_edo_id
                                    },
                                    function (resp) {
                                        let answ = Ext.decode(resp, true);
                                });

                                grid.store.remove(rec);

                            } else {
                                if (_id_sprav == 15) {
                                    //GBS-6463
                                    let containers = [];
                                    var button1 = Ext.create('Ext.Button', {
                                        text: 'Закрыть',
                                        xtype: 'button',
                                        score: this,
                                        handler: function (res) {
                                            this.up('window').close();
                                        }
                                    });
                                    containers.push(button1);

                                    let show_win = win_warn_const('Удалить нельзя', '<span>' + a.errorText + '</span>', containers, 440);
                                    show_win.show();
                                } else {
                                    _alert_win('Удаление невозможно.', a.errorText);
                                }
                            }
                        };
                        if (_id_sprav == 1)
                            id_grp = rec.data.id_os;
                        else
                            id_grp = rec.data.id;

                        // _ajax(dir_start_buh_ + 'edo/candelcontra',
                        //     {
                        //         aai: aktionid.config.appid,
                        //         eat: aktionid.token,
                        //         userid: userid,
                        //         cid: rec.data.id,
                        //         ceid: rec.data.contra_edo_id
                        //     },
                        //     function (resp) {
                        //         let answ = Ext.decode(resp, true);
                        //         if (!answ.answer) {
                        //             _alert_win('Удаление невозможно.', 'Контрагент участвует в ЭДО');
                        //         } else {
                                    _ajax(dir_start_buh_ + 'sp_del.php', {'sprav': rec.data.sprav, 'id': id_grp}, _fn);
                        //         }
                        // });

                    };

                    if (rec.data.sprav != 6 | (rec.data.sprav == 6 & rec.data.our_org != 1)) {
                        var ttl = 'Подтвердите удаление',
                            cont = 'Вы хотите удалить ' + rec.data.nms + '?';

                        if (rec.data.sprav == 6) {
                            ttl = 'Удалить контрагента?';
                            cont = 'Удалится ' + rec.data.nms;
                        }
                        if (rec.data.sprav == 12) {
                            ttl = 'Удалить налоговую?';
                            cont = 'Удалится: ' + rec.data.kod + ' &#8212; ' + rec.data.nms + '?';
                        }
                        if (rec.data.sprav == 13) {
                            ttl = 'Удалить фонд?';
                            cont = 'Удалится: ' + rec.data.inn + ' &#8212; ' + rec.data.nms + '?';
                        }
                        _confirm(ttl, cont, _fn_del, null, 'Удалить');
                    }
                    else
                        _alert_win('Отказано', 'Эту запись удалять нельзя.');


                }
            }],


    });

return menu;

}


});
