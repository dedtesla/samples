Ext.define('Buh.classes.edo.Maintain', {
    ACTION_APP_ID: 0,
    EDO_API_TOKEN: 0,
    haveEDO : false,
    contraEdoId : 0,
    forMailCnt : 0,

access: function (aai, eat) {
    this.ACTION_APP_ID = aai;
    this.EDO_API_TOKEN = eat;
},

setContrEdoId: function (ceid) {
    this.contraEdoId = ceid;
},

checkEdoStatus: function (_callback) {
    let me = this;
    Ext.Ajax.request({
        url: dir_start_buh_ + "edo/checkstatus",
        timeout: 180000,
        async: false,
        params: {
            aai: me.ACTION_APP_ID,
            eat: me.EDO_API_TOKEN
        },
        success: function (response) {
            let answer = Ext.decode(response.responseText, true);

            if (answer.haveEDO !=undefined) {
                me.haveEDO = answer.haveEDO;
                if (_callback != undefined)
                    _callback(me.haveEDO);
            }
        }
    });
},

getContraStatus: function (userid, cid, _callback) { // sbcard.js
    let me = this;
    Ext.Ajax.request({
        url: dir_start_buh_ + "edo/contrasinglestatus",
        timeout: 180000,
        async: false,
        params: {
            aai: me.ACTION_APP_ID,
            eat: me.EDO_API_TOKEN,
            userid: userid,
            cid: cid
        },
        success: function (response) {
            let answ = Ext.decode(response.responseText, true);
            if (answ.status !=undefined) {
                if (_callback != undefined)
                    _callback(answ.status, answ.contra_edo_id);
            }
        }
    });
},

checkContraStatus: function (userid, grid, win = null, wrapper = null, _async = true) {
    let me = this,
        items = grid.store.data.items,
        win_show = false,
        cnt = items.length;
    me.forMailCnt = 0;

    if (items.length == 0 && wrapper != null)
        wrapper.set(true);

    items.forEach(function (item, index) {
        if (item.data.inn != '') { //  && item.data.kpp != ''
            Ext.Ajax.request({
                url: dir_start_buh_ + "edo/contrastatus",
                timeout: 180000,
                async: _async,
                params: {
                    aai: me.ACTION_APP_ID,
                    eat: me.EDO_API_TOKEN,
                    userid: userid,
                    cid: item.data.id,
                    inn: item.data.inn,
                    kpp: item.data.kpp,
                },
                success: function (response) {
                    let answer = Ext.decode(response.responseText, true);

                    grid.store.data.items[index].data.edo_invite = answer.status;
                    grid.store.data.items[index].data.contra_edo_id = answer.contra_edo_id;
                    grid.getView().refreshNode(index);
                    if (item.data.edo_invite == '0' && item.data.contra_edo_id != '0' && item.data.our_org != '1') {
                        me.forMailCnt++;
                    }
                    if ( win != null && (me.forMailCnt != 0 || !me.haveEDO) && !win_show) {
                        win_show = true;
                        win.down('#maintEDO').show();
                    }
                    if (index == cnt-1 && wrapper != null) {
                        wrapper.set(true);
                    }
                }
            });
        } else {
            grid.store.data.items[index].data.edo_invite = null;
            grid.getView().refreshNode(index);
            if (index == cnt-1 && wrapper != null) {
                wrapper.set(true);
            }
        }
    });
},

forMailCount: function () {
    let me = this;
    return me.forMailCnt;
},

inviteToEdo : function(_rec){
    let me = this,
        dt = _rec.data;

    if (dt.contra_edo_id != '0' && dt.edo_invite == 0) {
        Ext.Ajax.request({
            url: dir_start_buh_ + "edo/invitetoedo",
            timeout: 180000,
            async: false,
            params: {
                aai: me.ACTION_APP_ID,
                eat: me.EDO_API_TOKEN,
                userid: userid,
                cid: dt.id,
                ceid: dt.contra_edo_id
            },
            success: function (response) {
                let answ = Ext.decode(response.responseText, true);

                if (answ.answer != true) {
                    me.showInfoWin(answ.message, 'red');
                }
                else {
                    me.showInfoWin("Приглашение отправлено - подключение может занять несколько дней");
                    _rec.store.data.items[_rec.index].data.edo_invite = '2';
                    _rec.data.edo_invite = '2';
                    _rec.store.grid.getView().refreshNode(_rec.index);
                }
            }
        });
//        me.showInfoWin("Пригласите одной кнопкой всех контрагентов, которые подключены к системам ЭДО, и кому вы еще неотправили приглашения");
    }

},

inviteToEdoAll : function(_btn){
    let me = this;

    let    win = Ext.create('Buh.classes.window.Interface', {
            width: 398,
            btnOk: 'Отправить ' + me.forMailCnt + ' приглашени' + me.ending(me.forMailCnt),
            formTitle: 'Пригласите контрагентов начать ЭДО',
            modal: false,
            confirmWindow: true,
            setText: "Пригласите одной кнопкой всех контрагентов, которые подключены к системам ЭДО, и кому вы еще не отправили приглашения",
            _fn: function (_win) {

                Ext.Ajax.request({
                    url: dir_start_buh_ + "edo/invitetoedoall",
                    timeout: 180000,
                    async: false,
                    params: {
                        aai: me.ACTION_APP_ID,
                        eat: me.EDO_API_TOKEN,
                        userid: userid
                    },
                    success: function (response) {
                        let answ = Ext.decode(response.responseText, true);
                        win.close();
                        if (answ.answer == true) {
                            _btn.sended(true, answ.count, answ.aceid, answ.err_msg );
                            if (answ.count != 0)
                                _btn.hide();
                        }
                        else {
                            _btn.sended(false, answ.message);
                        }
                    }
                });
            }
        });
    win.show();
    if (_btn != undefined)
        win.alignTo(_btn, "tr-br");
},

inviteToEdoContra : function(_btn, cid, ceid, cstatus, pos) { // sbcard.js
    let me = this,
        wnd = _btn.up('window');

    if(ceid != 0 && cstatus == 0 ) {
        let win = Ext.create('Buh.classes.window.Interface', {
            width: 398,
            btnOk: 'Отправить приглашение',
            formTitle: 'Пригласите контрагента начать ЭДО',
            modal: false,
            confirmWindow: true,
            setText: "Контрагент подключен к системам ЭДО, вы можете отправить ему приглашение начать ЭДО.",
            itemId: 'edoInviteWindow',
            _fn: function (_win) {


                    Ext.Ajax.request({
                        url: dir_start_buh_ + "edo/invitetoedo",
                        timeout: 180000,
                        async: false,
                        params: {
                            aai: me.ACTION_APP_ID,
                            eat: me.EDO_API_TOKEN,
                            userid: userid,
                            cid: cid,
                            ceid: ceid
                        },
                        success: function (response) {
                            let answ = Ext.decode(response.responseText, true);
                            win.close();
                            if (answ.answer != true) {
                                me.showInfoWin(answ.message, 'red');
                            }
                            else {
                                wnd.contraStatus = 2;
                                _btn.setText("Отправлено приглашение начать ЭДО");
                                me.showInfoWin("Контрагент подключен к ЭДО. Отправлено приглашение начать ЭДО. Подключение может занять несколько дней.");
                            }
                        }
                    });

            }
        });
        win.show();
        if (_btn != undefined) win.alignTo(_btn, iif(pos != undefined, pos, 'tr-br'));
    }

},

    /**
     * @param _btn
     * @param pos Для Акта сверки - вывод выше кнопки
     * @param _auxWin Для Акта сверки - закрытие окна Акта по клику на кнопке "Купить"
     * @param _unmask Для Акта сверки - закрытие окна Акта по клику на кнопке "Купить".
     *                В ПиП - скрывается маска, в справочнике контрагентов - нет.
     */
    connectToEdo  : function(_btn, pos, _auxWin, _unmask = false) {
   let win = Ext.create('Buh.classes.window.Interface',{
          width : 398,
          formTitle : 'Ваши контрагенты пользуются<br>электронным документооборотом',
          btnOk : 'Купить электронную отправку',
          modal : false,
          confirmWindow : true,
          auxWin: _auxWin,
          auxWinUnMask: _unmask,
          setText : 'Для подключения ЭДО купите "Электронную отправку отчетности"',
          itemId: 'edoBuyWindow',
          _fn : function(_win) {
              if (this.auxWin != undefined) {
                  this.auxWin.close();
                  if (this.auxWinUnMask) Ext.get(document.body).unmask();
              }
              window.open('https://service.buhsoft.ru/prices/otchetnost/');
          }
       });

   win.show();
   if (_btn != undefined) win.alignTo(_btn, iif(pos != undefined, pos, 'tr-br'));
},

connectToEdoShort : function(_btn){
   let me = this,
       win = Ext.create('Buh.classes.window.Interface',{
          width : 398,
          modal : false,
          toolBarOff : true,
          formItems : [{
               xtype : 'box',
               html: 'Для подключения ЭДО купите "Электронную отправку отчетности"'
              },{
               xtype : 'button',
               cls: 'btn-sel-blue',
               text: 'Купить электронную отправку',
               handler : function(){
                   window.open('https://service.buhsoft.ru/prices/otchetnost/', '_blank');
                  // me.moveForEdoConnection();
                  this.up('window').close();
              }
              }],
       });
  
   win.show();
   if (_btn!=undefined)
     win.alignTo(_btn, "tr-br");

},


/**
* Зеленое\красное информациенное окно справа-вверху
*/
showInfoWin : function( msg, color, _btn, pos) {
    let win = Ext.create('Buh.classes.window.Green',{
            aCls : color == 'red' ? 'there_error' : null,
            setText : msg,
            itemId: 'edoInfoWindow'
    });
    win.show();
    if (_btn!=undefined) win.alignTo(_btn, iif(pos != undefined, pos, 'tr-br'))
},

/**
* Спецоператоры
*/
saveSo  : function (th,userid, contraItem) {
    let me = this,
        win = th.up('window');

    Ext.Ajax.request({
        url: dir_start_buh_ + "edo/saveso",
        timeout: 180000,
        async: false,
        params: {
            aai: me.ACTION_APP_ID,
            eat: me.EDO_API_TOKEN,
            userid: userid,
            cid: contraItem.id,
            ceid: me.contraEdoId,
            oid: contraItem.oper_id,
            sos: contraItem.sos,
            guid: contraItem.guid
        },
        success: function (response) {
            let answ = Ext.decode(response.responseText, true);

            if (answ.answer == true) {
            } else {
                let err = Ext.getCmp('error_so_msg');

                if (answ.dop == 'false') {
                    err.down('[name=error_so_msg_txt]').setText('Контрагент не подключен к ЭДО');
                }
                err.show();
            }
        }
    });
},

getSoList  : function (userid, contraItem) {

    if (contraItem.contra_edo_id != undefined ) {
        this.contraEdoId = contraItem.contra_edo_id;
    }

    let me = this,
        ret = {
            xtype: 'container',
            layout: {'type': 'vbox', 'align': 'stretch'},
            name: 'mainsocont',
            items: []
        };
    Ext.Ajax.request({
        url: dir_start_buh_ + "edo/solist",
        timeout: 180000,
        async: false,
        params: {
            aai: me.ACTION_APP_ID,
            eat: me.EDO_API_TOKEN,
            userid: userid,
            cid: contraItem.id,
            ceid: this.contraEdoId,
            inn: contraItem.inn
        },
        success: function (response) {
            let answ = Ext.decode(response.responseText, true);

            if ( answ != null) {  // нашли спецоператора
                let is_oper = false;
                for (step = 0; step < answ.length; step++) {
                    if (answ[step].id != 0) {
                        answ[step].contra_edo_id = me.contraEdoId;
                        answ[step].cid = contraItem.id;
                        ret.items.push(me.getSingleSo(answ[step], true));
                        is_oper = true;
                    }
                }
                if (!is_oper)
                    ret.items.push(me.getSingleSo({'contra_edo_id':0}, true));
            }
            else {
                ret.items.push(me.getSingleSo({'contra_edo_id':0}, true));
            }
        }
    });
    return ret;
},

getSingleSo : function( arr, found=false) {

    if (arr.contra_edo_id == 0 || arr.contra_edo_id == undefined) {
        let tmpl = {
            xtype: 'container',
            cls: 'grey_info-block',
            name: 'grey_info-block',
            items: [
                {
                    cls: 'gb_title',
                    html: '<b>Не найдена информация о подключении контрагента к ЭДО</b>'
                },
                {
                    cls: 'container-align-middle',
                    html: 'Она необходима для формирования электронных документов'
                }]
        };
        return tmpl;
    }

    if (found) { // имеет место быть
        titlePrefix = 'Спецоператор ';
        idPrefix = 'Идентификатор участника ЭДО ';
    } else { // новый
        titlePrefix = '';
        idPrefix = '';
    }

    if (arr.status == 0) { // not connected
        tmplConnect = '<span class="txt-info_dot">Не подключено</span>';
    } else if (arr.status == 1) { // connected
        tmplConnect = '<span class="txt-info_dot txt-dot_green">Подключено</span>';
    } else if (arr.status == 2) { // sended invite
        tmplConnect = '<span class="txt-info_dot txt-info_dot">Отправлено приглашение</span>';
    } else if (arr.status == 3) { // received invite
        tmplConnect = '<span class="txt-info_dot txt-info_dot">Получено приглашение</span>';
    }

    // формируем нижний блок кнопок
    bottomItems = [];

    if (arr.main == 1) {
        tmplMain = {
            xtype: 'label',
            dataIndex: 'ismain',
            // cls: 'g_status-grey  container-align-middle-top',
            html: 'Основной'
        }
        clsMain = 'g_status-grey';
    } else {
        tmplMain = {
            xtype: 'button',
            dataIndex: 'ismain',
            cls: 'btn-sel-blue color-grey',
            border: false,
            html: 'Выбрать основным',
            handler: function () {
                let win = this.up('window'),
                    box = this.up('[name=top_container]'),
                    oper_id = box.down('[name=oper_id]').value;

                Ext.Ajax.request({
                    url: dir_start_buh_ + "edo/setmain",
                    params: {
                        aai: aktionid.config.appid,
                        eat: aktionid.token,
                        'userid': userid,
                        'cid': arr.cid,
                        'ceid': arr.contra_edo_id,
                        'oid': oper_id
                    },
                    success: function (res) {
                        let answ = Ext.decode(res.responseText, true),
                            so_list = win.down('[name=edo_panel]');
                        so_list.refresh();
                    }
                });
            }
        }
        clsMain = '';
    }
    bottomItems.push(tmplMain);

    if (arr.canChange == 1) {
        canChange =
            {
            xtype: 'button',
            dataIndex: 'change_sc',
            cls: 'btn-sel-blue color-grey',
            border: false,
            html: 'Изменить',
            handler: function () {
                let box = this.up('[name=grey_info-block]');
                let sos = box.down('[name=sos]').value;
                let name = box.down('[name=sc_name]').value;
                let scID = box.down('[name=sc_id]').value;
                let operID = box.down('[name=oper_id]').value;
                contraPanel.soChange(box, sos, name, scID, operID);
            }
        }
        bottomItems.push({ html: '&nbsp; \u2219 &nbsp;' });
        bottomItems.push(canChange);
    }

    if (arr.canDelete == 1) {
        canDelete =
            {
                xtype: 'button',
                    dataIndex: 'del_sc',
                cls: 'btn-sel-blue color-grey',
                border: false,
                html: 'Удалить',
                handler: function (rec) {

                    let box = this.up('[name=grey_info-block]'),
                        contra_edo_id = box.down('[name=cid]').value,
                        oper_id = box.down('[name=oper_id]').value,
                        win = this.up('window');

                    _confirm("Удаление спецоператора", "Вы действительно хотите удалить этого спецоператора?", function () {
                        Ext.Ajax.request({
                            url: dir_start_buh_ + "edo/delso",
                            params: {
                                aai: aktionid.config.appid,
                                eat: aktionid.token,
                                'userid': userid,
                                'cid': contra_edo_id,
                                'oid': oper_id,
                            },
                            success: function (res) {
                                let answ = Ext.decode(res.responseText, true);
                                let so_list = win.down('[name=edo_panel]');
                                so_list.refresh();
                            }
                        });
                    });
                }
            }
        bottomItems.push({ html: '&nbsp; \u2219 &nbsp;' });
        bottomItems.push(canDelete);
    }

    bottomBlock = {
        xtype: 'container',
        layout: 'hbox',
        dataIndex: 'ismain',
        cls: 'link_block-grey_separator ' + clsMain + '  container-align-middle-top',
        items: bottomItems
    };

    let items =
        {
            xtype: 'container',
            name: 'top_container',
            //layout: 'hbox',
            items: [
                {
                    name: 'cid',
                    value: arr.contra_edo_id,
                    hidden: true
                },
                {
                    name: 'oper_id', // sc_name_id
                    value: arr.id,
                    hidden: true
                },
                {
                    name: 'sos',
                    value: arr.sos,
                    hidden: true
                },
                {
                    name: 'sc_name',
                    cls: 'gb_title',
                    value: arr.operName, //scName
                    html: '<b>' + titlePrefix + arr.operName + '</b>'
                },
                {
                    name: 'sc_id',
                    cls: 'container-align-middle',
                    value: arr.globalIdentifier, // scID
                    html: idPrefix + arr.globalIdentifier
                },
                bottomBlock,
                {
                    dataIndex: 'podkl',
                    name: 'podkl_nm',
                    style: 'position:absolute; right:10px; top:16px;',
                    html: tmplConnect,
                }
            ]
    };

    let tmpl = {
        xtype: 'container',
        cls: 'grey_info-block',
        name: 'grey_info-block',
        items: items,
        listeners: {
            afterrender: function() {
                let me = this;
            }
        }
    };

    if (arr.items_only == true)
        return items;
    else
        return tmpl;
},


// helpers
ending: function (_kol) {
    while (_kol > 20) {
        _kol -= 20;
    };
    if (_kol == 1)
        return 'е';
    else if (_kol == 0 | (_kol > 4 && _kol < 21))
        return 'й';
    else
        return 'я';
}

});