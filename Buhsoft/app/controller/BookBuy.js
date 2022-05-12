Ext.define('Buh.controller.BookBuy', {
    extend: 'Ext.app.Controller',
    itemMenu: null,
    filterTimeout: null,
    refs: [{
            ref: 'mainPanel',
            selector: 'bookbuyPanel'
        },{
            ref: 'tBar',
            selector: 'bookbuyPanel bookbuytbar'
        },{
            ref: 'bBarFloat',
            selector: 'bookbuybbarfloat'
        },{
            ref: 'tabButtons',
            selector: 'bookbuyPanel bookbuytbar container[action=grid]'
        },{
            ref: 'gridBuy',
            selector: 'bookbuyPanel bookbuygridbuy'
        },{
        ref: 'cardWin',
        selector: 'bookbuyCardWindow'
        },{
            ref: 'filterWin',
            selector: 'bookbuyFilterWindow'
        }
    ],
    init: function () {
        let me = this;
        me.control({
            'bookbuyPanel': {
                afterrender: function() {
                    //me.onGridChange()
                }
            },
            'bookbuyPanel > grid': {
                activate: me.onGridChange,
                itemcontextmenu: function (grid, record, item, index, e) {
                    e.stopEvent();
                    me.showMenu(record, e)
                },
            },
            'bookbuyPanel > grid gridview': {
                celldblclick: (g, td, cellIndex, record) => me.editItem(record)
            },
            'bookbuyPanel gridview': {
                cellclick: function(view, cell, colindex, record, tr, rowIndex, e, eOpts) {
                    let me = this,
                        index = view.panel.headerCt.getHeaderAtIndex(colindex).dataIndex;
                    switch(index) {
                        case 'id':
                            me.showMenu(record, e);
                            break;
                        //case 'id':
                        case 'have_rnpt':
                            if(record.get('have_rnpt')) {
                                me.showCardWin(record)
                            }
                            break;
                    }
                }
            },
            'bookbuyPanel grid bookbuytbar container[action=grid] button': {
                click: btn => me.setLayout(btn.rel)
            },
            'bookbuyPanel grid bookbuytbar [name=fldPeriod]': {
                select: me.onPeriodChange
            },
            'bookbuyPanel grid bookbuytbar fld_find': {
                change: (fld) => {
                    if(me.filterTimeout) {
                        clearTimeout(me.filterTimeout);
                        me.filterTimeout = null;
                    }
                    me.filterTimeout = setTimeout(() => me.loadGrid.call(me), fld.typeAheadDelay || 0)
                }
            },
            'bookbuyPanel grid bookbuytbar [itemId=btnFill]': {
                click: () => me.fillBook()
            },
            'bookbuyPanel grid bookbuytbar [itemId=btnAdd]': {
                click: () => me.editItem()
            },
            'bookbuyPanel grid bookbuytbar [itemId=btnFilter]': {
                click: () => me.showFilterWin()
            },
            'bookbuyCardWindow': {
                afterrender: me.loadCard
            },
            'bookbuyItemMenu': {
                beforeshow: function(menu) {
                    let record = menu.record,
                        showCard = menu.getComponent('showCard'),
                        deleteItem = menu.getComponent('delete'),
                        editItem = menu.getComponent('edit'),
                        origin = record.get('origin');

                    if(origin && !record.get('have_rnpt')) {
                        return false;
                    }

                    showCard.setVisible(record.get('have_rnpt'));
                    deleteItem.setVisible(!origin);
                    editItem.setVisible(!origin);
                },
                click: function(menu, item) {
                    let me = this,
                        record = menu.record;
                    switch(item.action){
                        case 'edit':
                            me.editItem.call(me, record)
                            break;
                        case 'showCard':
                            me.showCardWin.call(me, record)
                            break;
                        case 'delete':
                            me.delete.call(me, record)
                            break;
                    }
                }
            },
            'bookbuyFilterWindow': {
                close: me.onFilterWindowClose
            },
            'bookbuyFilterWindow bookbuyfilterline': {
                controlchange: () => me.onFilterFormChange()
            },
            'bookbuyFilterWindow toolbar [itemId=applybtn]': {
                click: me.applyFilterForm
            },
            'bookbuyFilterWindow toolbar [itemId=resetbtn]': {
                click: () => {
                    me.getFilterWin().canceled = true;
                    me.resetFilterForm.call(this)
                }
            },
            'bookbuyFilterWindow toolbar [itemId=cancelbtn]': {
                click: () => {
                    me.getFilterWin().close()
                }
            }
        })
    },
    /**
     * Возвращает активный грид
     *
     * @returns Ext.grid.Panel
     */
    getActive: function() {
        let me = this,
            layout = me.getMainPanel().getLayout();
        return layout.getActiveItem()
    },
    /**
     * Активирует лейаут по itemId или id
     *
     * @param id
     */
    setLayout: function(id) {
        let me = this,
            mainPanel = me.getMainPanel(),
            layout = me.getMainPanel().getLayout();

        layout.setActiveItem(mainPanel.getComponent(id))
    },
    /**
     * Ивент, смена активного компонента
     */
    onGridChange: function() {
        let me = this,
            grid = me.getActive(),
            cardWin = me.getCardWin(),
            bBarFloat = me.getBBarFloat();

        bBarFloat.getLayout().setActiveItem(grid.type);

        if(cardWin && cardWin.isVisible()) {
            cardWin.close();
        }

        if(!grid.inited) {
            grid.inited = true;
            me.loadGrid()
        }
    },
    loadGrid: function(params = {}, callback = Ext.emptyFn) {
        let me = this,
            grid = me.getActive(),
            tBarValues = me.getTBarValues(),
            filterValues = grid.getFilterValues(),
            store = grid.getStore();

        store.proxy.extraParams = Ext.merge({
            type: grid.type,
            yearDatabase: currYear
        }, tBarValues, filterValues, params);

        store.load(function () {
            callback.call(me)
        });
        me.fillTotal()
    },
    onPeriodChange: function() {
        let me = this,
            grid = me.getActive(),
            dateFields = grid.query('bookbuytbar [name=fldPeriod] textfield');

        dateFields.map((el) => grid.setFilterValue(el.name, el.getValue()));
        me.loadGrid.call(this)
    },
    getTBarValues: function() {
        let me = this,
            grid = me.getActive(),
            tBar = grid.down('bookbuytbar'),
            fields = Ext.ComponentQuery.query('textfield', tBar),
            values = {};

        Ext.Array.each(fields, function(el) {
            values[el.getName()] = el.getSubmitValue()
        });

        return values;
    },
    fillTotal: function() {
        let me = this,
            grid = me.getActive(),
            store = grid.store,
            bBarFloat = me.getBBarFloat().getLayout().getActiveItem();

        _ajax(dir_start_buh_ +'bookbuy/gridTotal', Ext.apply({ total: 1 }, store.proxy.extraParams), function(responseText) {
            let response = Ext.decode(responseText);
            if(response.success) {
                Ext.Object.each(response['data'], (key, val) => {
                    let field = bBarFloat.getComponent(key);
                    if(field) {
                        field.setValue(val)
                    }
                })
            }
        })
    },
    showMenu: function(record, e) {
        let me = this;
        if(!me.itemMenu) {
            me.itemMenu = new Buh.view.bookbuy.ItemMenu()
        }
        me.itemMenu.record = record;
        me.itemMenu.showAt(e.getXY())
    },
    editItem: function(record = null) {
        if(record && record.get('origin')) {
            return false;
        }
        let me = this,
            grid = me.getActive(),
            win = Ext.create('Buh.view.bookbuy.edit.Window', {
                type: grid.type,
                source_id: record ? record.get('id') : 0
            });
        win.open({
            type: grid.type,
            callback: function(result, formValues) {
                if(result.success) {
                    let params = {};

                    if('Item[dat_doc]' in formValues) {
                        let date = formValues['Item[dat_doc]'],
                            year = date.getFullYear(),
                            month = date.getMonth();
                        params.dat_doc1 = new Date(year, month, 1);
                        params.dat_doc2 = new Date(year, month + 1, 0);
                    }
                    me.resetSearchField();
                    me.resetFilter(params, function() {
                        grid.scrollTo(result.id)
                    })
                }
            }
        })
    },
    showCardWin: function(record) {
        let me = this,
            grid = me.getActive(),
            win = Ext.create('Buh.view.bookbuy.card.Window', {
                renderTo: me.getMainPanel()._owner,
                record: record,
                type: grid.type
            });
        win.show()
    },
    loadCard: function() {
        let me = this,
            card = me.getCardWin(),
            grid = card.down('grid'),
            store = grid.store;

        store.proxy.extraParams = {
            id: card.record.get('id'),
            type: card.type,
            yearDatabase: currYear
        };

        card.setLoading(true);
        store.load(function() {
            card.setLoading(false)
        })
    },
    resetSearchField: function() {
        let me = this,
            grid = me.getActive(),
            searchField = grid.down('bookbuytbar fld_find');

        searchField.suspendCheckChange++;
        searchField.setValue('');
        searchField.suspendCheckChange--;
    },
    resetFilter: function(params = {}, callback = Ext.emptyFn) {
        let me = this,
            grid = me.getActive(),
            _params = {};

        Ext.Object.each(grid.getFilterValues(), function(key, value) {
            if(key == 'dat_doc1' || key == 'dat_doc2') {
                _params[key] = value;
            }
        }); //сбрасываем все кроме дат

        params = Ext.apply(_params, params);
        grid.clearFilter(params);

        this.loadGrid(grid.setFilterValue(params), () => {
            me.onFilterApply.call(me);
            callback.call(me)
        })
    },
    onFilterApply: function() {
        let me = this,
            grid = me.getActive(),
            filter = grid.filter,
            dateFields = grid.query('bookbuytbar [name=fldPeriod] textfield'),
            btnFilter = grid.down('bookbuytbar [itemId=btnFilter]');

        btnFilter.filterChange.call(btnFilter, !!grid.getFilterCount());
        dateFields.map((el) => {
            if(el.name in filter) {
                el.suspendCheckChange++;
                el.setValue(filter[el.name]);
                el.suspendCheckChange--;
            }
        });
    },
    showFilterWin: function() {
        let me = this,
            grid = me.getActive(),
            filterWin = Ext.create('Buh.view.bookbuy.filter.Window', {
                type: grid.type
            }),
            filterForm = filterWin.down('bookbuyfilterform').getForm(),
            filterValues = grid.getFilterValues();

        filterWin.show();

        if(grid.filterDefaults === null) {
            grid.setDefaults(filterForm.getValues(false, false, false, true));
        }

        filterWin.onOpenFilterCount = grid.getFilterCount();
        filterForm.setValues(filterValues);

        me.onFilterFormChange(0)
    },
    onFilterFormChange: function(timeout = 500) {
        let me = this,
            grid = me.getActive(),
            filterWin = me.getFilterWin(),
            filterForm = filterWin.down('bookbuyfilterform'),
            tBarValues,
            filterValues,
            bbar,
            btnSubmit,
            btnReset;

        if(me.filterTimeout) {
            clearTimeout(me.filterTimeout);
            me.filterTimeout = null;
        }

        if(filterWin && filterWin.isVisible()) {
            me.filterTimeout = setTimeout(function() {
                bbar = filterWin.getDockedComponent('bbar');
                btnSubmit = bbar.getComponent('applybtn');
                btnSubmit.setLoading(true);

                btnReset = bbar.getComponent('resetbtn');

                tBarValues = me.getTBarValues();
                filterValues = filterForm.getForm().getValues(false, false, false, true);

                grid.getCountAll(Ext.merge({}, tBarValues, filterValues),
                    function (response, totalCount) {
                        if (totalCount !== undefined) {
                            btnSubmit.setText(numberDecl(["Показать {n} операцию", "Показать {n} операции", "Показать {n} операций"], response.totalCount));
                        }
                        btnReset.setDisabled(!grid.getFilterCount(filterValues));
                        btnSubmit.setLoading(false);
                    })
            }, timeout)
        }
    },
    applyFilterForm: function() {
        let me = this,
            grid = me.getActive(),
            filterWin = me.getFilterWin(),
            filterForm = filterWin.down('bookbuyfilterform'),
            filterValues = filterForm.getForm().getValues(false, false, false, true);

        me.applied = true;
        if(filterWin && filterWin.isVisible()) {
            filterWin.close()
        }
        this.loadGrid(grid.filter = Ext.apply({}, filterValues), () => me.onFilterApply.call(me))
    },
    resetFilterForm: function(params = {}) {
        let me = this,
            grid = me.getActive(),
            filterWin = me.getFilterWin(),
            filterForm = filterWin.down('bookbuyfilterform');

        filterForm.getForm().setValues(grid.filterDefaults);
    },
    onFilterWindowClose: function(filterWin) {
        let me = this;

        if(!filterWin.applied && filterWin.canceled && filterWin.onOpenFilterCount > 0) {//если фильтр не был применен, если была нажата кнопка сброса и если был фильтр при открытии
            me.resetFilter()
        }
    },
    fillBook: function() {
        let me = this,
            grid = me.getActive(),
            dateFields = grid.query('bookbuytbar [name=fldPeriod] textfield'),
            params = {
                type: grid.type,
                yearDatabase: currYear
            };

        dateFields.map(f => params[f.name] = f.getValue());

        _ajax(dir_start_buh_ +'bookbuy/fillBook', params, function(responseText) {
            let response = Ext.decode(responseText);
            if(response.success) {
                me.resetFilter();
                _alert_win('Заполнение Книги покупок и продаж', 'Книга покупок и продаж заполнена.');
            }
        })
    },
    delete: function(record) {
        let me = this,
            grid = me.getActive(),
            id = record.get('id'),
            params = {
                id: id,
                type: grid.type,
                yearDatabase: currYear
            };

        _confirmDel(function () {
            _ajax(dir_start_buh_ +'bookbuy/delete', params, function(responseText) {
                let response = Ext.decode(responseText),
                    store = grid.store, index, recNext, idNext;
                if(response.success) {
                    index = store.indexOf(record);
                    store.remove(record);

                    recNext = store.getAt(index);
                    if(!recNext) {
                        recNext = store.getAt(index - 1);
                    }
                    idNext = recNext ? recNext.get('id') : null;

                    if (store.data.items.length == 0) {
                        me.resetFilter()
                    } else {
                        me.loadGrid({}, function() {
                            if(idNext) {
                                grid.scrollTo(idNext);
                            }
                        })
                    }
                } else {
                    _alert_win('Ошибка!', 'Данные не удалось удалить. Попробуйте обновить браузер и попробовать снова.');
                }
            })
        })
    }
})