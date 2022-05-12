Ext.define('Buh.classes.buy.menu.DocMenu', {
    'extend': 'Ext.menu.Menu',
    'xtype': 'buy_doc_menu',
    'cls': 'style2018',
    'items': [
        {
            text: 'Сначала укажите контрагента',
            tdoc: 0,
//                    hidden : true
        }, {
            text: 'Счет',
            tdoc: 3,
//                    tooltip: {text:'This is a an example QuickTip for a toolbar item', title:'Tip Title'},
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(3)) {
                    [startSchetBuyTime, startSchetSaleTime] = setupCRMVariables(id_tab);

                    docSchetEdit(this.up('window'), 0, rc.id, grdSD);
                }
            }
        }, {
            text: 'Счет-фактура',
            tdoc: 4,
            handler: function () {
                var rc = _recGrid.data;

                if (docUniq(4)) {
                    [startSchetFBuyTime, startSchetFSaleTime] = setupCRMVariables(id_tab);
                    crmEvent('1pgb_buh', 'schfprod', false, false);

                    docSchetFEdit(this.up('window'), 0, rc.id, grdSD);
                }
            }
        }, {
            text: 'Торг-12',
            tdoc: 5,
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(5)) {
                    [startT12BuyTime, startT12SaleTime] = setupCRMVariables(id_tab);
                    crmEvent('1pgb_buh', 'torg12prod', false, false);
                    docTorg12Edit(this.up('window'), 0, rc.id, grdSD, 0);
                }
            }
        }, {
            text: 'Акты',
            tdoc: 1,
            handler: function () {
                var rc = _recGrid.data;

                if (docUniq(1)) {
                    [startAktBuyTime, startAktSaleTime] = setupCRMVariables(id_tab);
                    crmEvent('1pgb_buh', 'aktprod', false, false);


                    docActEdit(this.up('window'), 0, rc.id, grdSD);

                    Ext.getCmp('_akt_dat_doc').setValue(rc.FACTURADAT);
                    let _year = Ext.getCmp('_akt_dat_doc').getValue().getFullYear();
                    /*!*/
                    _fn = function (text) {
                        ret = eval("(" + text + ")");
                        Ext.getCmp('_akt_num_doc').setValue(ret.number);
                    }
                    _ajax(dir_start_buh_ + 'getnextnumber.php', {kas_id: 0, p_r: 1, year: _year}, _fn);
                }
            }
        }, {
            text: 'Квитанция',
            tdoc: 9,
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(9)) {

                    [startKvitBuyTime, startKvitSaleTime] = setupCRMVariables(id_tab);
                    crmEvent('1pgb_buh', 'kvitancprod', false, false);

                    dockvitEdit(this.up('window'), 0, rc.id, grdSD);
                }
            }
        }, {
            text: 'Доверенность',
            tdoc: 10,
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(10)) {

                    [startDoverBuyTime, startDoverSaleTime] = setupCRMVariables(id_tab);

                    docDovEdit(this.up('window'), 0, rc.id, grdSD);
                }
            }
        }, {
            text: 'Акты КС-2 и КС-3',
            tdoc: 16,
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(16)) {

                    [startAktKSBuyTime, startAktKSSaleTime] = setupCRMVariables(id_tab);

                    docKS2Edit(this.up('window'), 0, rc.id, grdSD);
                }

            }
        }, {
            text: 'УПД',
            tdoc: 18,
            handler: function () {
                var rc = _recGrid;
                if (docUniq(18)) {
                    [startYPDBuyTime, startYPDSaleTime] = setupCRMVariables(id_tab);
                    crmEvent('1pgb_buh', 'updprod', false, false);
                    openUPD(this.up('window'), 0, rc, grdSD);
                }
            }
        }, {
            text: 'Накладная на отпуск материалов на сторону',
            tdoc: 7,
            handler: function () {
                var rc = _recGrid.data;
                if (docUniq(7)) {
                    docNaklStorEdit(this.up('window'), 0, rc.id, grdSD);
                }

            }
        }, /*{
            text: 'Накладная на отпуск товаров',
            tdoc: 7,
            hidden: true,
            handler: function () {
                if (docUniq(7)) {
                    var rc = _recGrid.data;
                    docNaklTovEdit(this.up('window'), 0, rc.id, grdSD);
                }
            }
        },*/
        {
            text: 'ТТН',
            tdoc: 15,
            handler: function () {

                var rc = _recGrid.data;

                [startTTNBuyTime, startTTNSaleTime] = setupCRMVariables(id_tab);

                var numRow = grdSD.store.find('typ_doc', 15);

                if (numRow == -1) {
                    if (docUniq(15))
                        openTTN(this.up('window'), 0, rc.id, _recGrid);
                }
                else {
                    _alert_win('В этой сделке ТТН уже есть!');
                }

            }
        }
        ,
        {
            text: 'Товарный чек',
            tdoc: 21,
            handler: function () {


                [startTovChBuyTime, startTovChSaleTime] = setupCRMVariables(id_tab);

                var rc = _recGrid.data,
                    grdItems = winSbEdit.down('#grd_sostav');
                if (grdItems.store.data && grdItems.store.data.length == 1) {
                    _alert_win('Ошибка', 'Список ( из пункта Состав ) для генерации товарного чека отсутствует.');
                    return false;
                }

                /// Учет продажи (tab 110) number
                if (grdDoc.store && id_tab == 110) {
                    var items = grdDoc.store.data.items;
                    for (var i = 0; i < items.length; i++) {
                        if (!items[i].data) continue;
                        item = items[i].data;
                        numb = parseInt(item.number);
                        if (item.typ_doc == 21 && numb > rc.number)
                            rc.number = numb;
                    }
                    ++rc.number;
                }

                openTOVcheck(this.up('window'), 0, rc, _recGrid);
            }
        },

        {
            text: 'Договор на оказание услуг',
            tdoc: 22,
            handler: function () {

                var rc = _recGrid.data;

                [startTTNBuyTime, startTTNSaleTime] = setupCRMVariables(id_tab);
                var numRow = grdSD.store.find('typ_doc', 22);
                if (numRow == -1) {
                    if (docUniq(22))
                        open_agreement(this.up('window'), id_tab, 'services', 0, _recGrid);
                }
                else {
                    _alert_win('В этой сделке Договор уже есть!');
                }
            }
        },
        {
            text: 'Договор купли-продажи',
            tdoc: 23,
            handler: function () {

                var rc = _recGrid.data;

                [startTTNBuyTime, startTTNSaleTime] = setupCRMVariables(id_tab);
                var numRow = grdSD.store.find('typ_doc', 23);
                if (numRow == -1) {
                    if (docUniq(23))
                        open_agreement(this.up('window'), id_tab, 'buy_sale', 0, _recGrid);
                }
                else {
                    _alert_win('В этой сделке Договор уже есть!');
                }
            }
        }

    ]


})

