Ext.define('Buh.classes.sprav.common.TreePanel', {
alternateClassName: ['spravTree'],

/*******************************************************************************/
/*******************************************************************************/
/*                                                                             */
/*               tree                                                          */
/*                                                                             */
/*******************************************************************************/
/*******************************************************************************/


makeTreePanel : function(id_sprav, title, afields, have_tree, aFields, sm, loadProc){

    var me = this,
        _id_sprav = id_sprav;

    /******************
     *     tree
     ***************/

    var treePanel = Ext.create('Ext.tree.Panel', {
        hideHeaders: true,
        cls: 'tree-panel_hide-icon',
        plugins: [
            Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 2
            })
        ],
        width: 200,
        draggable: false,
        height: 500,

        /**********
         *    store
         *************/
        store: me.getStore(id_sprav, title),

        rootVisible: false,

        /**********
         *    columns
         **********/
        columns: [
            {
                xtype: 'treecolumn', dataIndex: 'text', flex: 1, editor: {
                xtype: 'textfield',
                selectOnFocus: true,
                listeners: {
                    blur: function (fld, e, o) {
                        var tr1 = this.up('panel'),
                            node = tr1.getSelectionModel().getSelection()[0];
                        tr1.store.getNodeById(node.data.id).set('text', fld.getValue());
                        tr1.store.sync();
                    }
                }
            }
            }, {
                width: 45,
                menuDisabled: true,
                xtype: 'actioncolumn',
                tooltip: 'Настройка групп',
                align: 'left',
                icon: _icons.maint,
                isDisabled: function (view, rowIndex, colIndex, item, record) {
                    return (record.internalId == -10 || record.internalId == -11 ? true : false);
                },
                handler: function (view, rowIndex, colIndex, actionItem, event, record, row) {
                    var grid = view.up('panel');
                    if (!Number.isNaN(record.data.parentId)) {
                        grid.cMenu.rec = record;
                        grid.cMenu.showAt(event.getXY());
                        grid.cMenu.tree = grid;
                    }
                    else {
                        var winTree = editTreeSpravOld(record.data.sprav, record.internalId, record.data.text, '', '');
                        winTree.store = grid.store;
                        winTree.show();
                    }
                }

            }
        ],


        /**********
         *    menus
         **************/

        cMenu: Ext.create('Ext.menu.Menu', {
            cls: 'style2018 menu-gray',
            tree: null,
            rec: null,
            items: [
                {
                    text: 'Переименовать',
                    icon: _icons.edit,
                    handler: function () {
                        var node = this.up('menu').rec,
                            tree = this.up('menu').tree;
                        if (node.data.id > 0)
                            tree.plugins[0].startEdit(node, 0);
                    }
                },
                {
                    text: 'Удалить группу',
                    icon: _icons.del,
                    handler: function () {
                        var node = this.up('menu').rec,
                            store = node.store;
                        if (!node.hasChildNodes()) {
                            _confirm(
                                'Удалить группу?',
                                'Удалится только группа, наименования останутся в справочнке',
                                function () {
                                    node.remove();
                                    store.sync();
                                }
                            );
                        } else {
                            _alert_win('Нельзя удалять!', 'Эта группа имеет вложенные группы, поэтому ее нельзя удалять!');
                        }
                    }
                }],
        }),

        treeContextMenuSprav: Ext.create('Ext.menu.Menu', {
            cls: 'style2018 menu-gray',
            items: [{
                icon: _icons.plus,
                text: 'Добавить группу',
                handler: function () {
                    this.up('menu').tree.fireEvent('addNewItemTree');
                }
            }, {
                text: 'Изменить',
                hidden: true,
                icon: _icons.edit,
                handler: function () {
                    this.up('menu').tree.fireEvent('editItemTree');
                }
            }, '-', {
                text: 'Обновить',
                icon: _icons.refresh,
                handler: function () {
                    this.up('menu').tree.fireEvent('refreshTree');
                }
            }, {
                text: 'Удалить',
                hidden: true,
                icon: _icons.del,
                handler: function () {
                    this.up('menu').tree.fireEvent('deleteItemTree');
                }
            }]
        })

    });

    this.setEvents(treePanel, id_sprav, title, afields, have_tree, aFields, sm, loadProc);

return treePanel;
},


/********************
*   tree events
*
*************************/
setEvents : function(treePanel, id_sprav, title, afields, have_tree, aFields, sm, loadProc){

    var _id_sprav = id_sprav;

    treePanel.getSelectionModel().on('selectionchange', function (t, rec, e) {
        var tree = this.view.up('treepanel'),
            win = tree.up('window'),
            fnd = win.down('field_find'),
            grd = win.down('grid');
        if (tree.getSelectionModel().hasSelection()) {
            var newnode = tree.getSelectionModel().getSelection() [0];
            grd.store.proxy.extraParams = {
                sprav: _id_sprav,
                group: newnode.data.id,
                nm: fnd.getValue(),
                filt: grd.filt
            };
            grd.store.load();
            if (_id_sprav == 6) {
                switch (newnode.internalId) {
                    case "0" :
                        grd.columns[2].hide();
                        grd.columns[3].hide();
                        grd.columns[5].show();
                        grd.columns[6].show();
                        grd.columns[7].hide();
                        grd.columns[8].show(); // открыть когда будет ЭДО
                        win.down('#btnForImport').show();
                        win.down('#btnForAkt').show();
                        win.down('#btnForPrint').show();
                        //win.down('#maintEDO').show();
                        win.down('field_find').show();
                        win.down('[name=panelCenter]').setTitle('Контрагенты');
                        break;
                    case "-10" :
                        grd.columns[2].hide();
                        grd.columns[3].show();
                        grd.columns[5].hide();
                        grd.columns[6].hide();
                        grd.columns[7].show();
                        grd.columns[8].hide();
                        win.down('#btnForImport').hide();
                        win.down('#btnForAkt').hide();
                        win.down('#btnForPrint').hide();
                        win.down('#maintEDO').hide();
                        win.down('field_find').hide();
                        win.down('[name=panelCenter]').setTitle('Налоговые');
                        break;
                    case "-11" :
                        grd.columns[2].show();
                        grd.columns[3].hide();
                        grd.columns[5].hide();
                        grd.columns[6].hide();
                        grd.columns[7].hide();
                        grd.columns[8].hide();
                        win.down('#btnForImport').hide();
                        win.down('#btnForAkt').hide();
                        win.down('#btnForPrint').hide();
                        win.down('#maintEDO').hide();
                        win.down('field_find').hide();
                        win.down('[name=panelCenter]').setTitle('Фонды');

                        break;
                }
            }
        }
    });

    treePanel.on({
        beforeedit: function (editor, e, o) {
            if (e.record.internalId == "-10" || e.record.internalId == "-11" || e.record.internalId == "0")
                return false;
        },

        itemcontextmenu: function (grid, record, item, index, e, eOpts) {
            e.stopEvent();
            var node = this.getSelectionModel().getSelection()[0];
            this.treeContextMenuSprav.tree = this;
            if (node.internalId == 0) {
                editButt = this.treeContextMenuSprav.items.get(1);
                if (isNaN(node.data.parentId)) {
                    editButt.disable();
                } else {
                    editButt.enable();
                }
                delButt = this.treeContextMenuSprav.items.get(3);
                if (isNaN(node.data.parentId) | node.hasChildNodes()) {
                    delButt.disable();
                } else {
                    delButt.enable();
                }
                this.treeContextMenuSprav.showAt(e.getXY());
            }
        },

        //GBS-10256
        /*boxready: function () {
            if (_id_sprav === 6) {
                let node = this.getView().getNode(this.store.getNodeById(-10));
                let spravNalogTooltipShown = Ext.util.Cookies.get('spravNalogTooltipShown');
                if (!spravNalogTooltipShown && node) {
                    let tip = Ext.create('Ext.tip.ToolTip', {
                        renderTo: this.up('window').getEl(),
                        target: node,
                        id: 'nl_tooltip',
                        cls: 'tooltip_violet',
                        showDelay: 0,
                        autoHide: false,
                        closable: true,
                        maxWidth: 450,
                        anchor: 'top',
                        buttonAlign: 'left',
                        mouseOffset: [26, 0],
                        closeAction: 'destroy',
                        closeEventFn: function (obj, el) {
                            let me = this;
                            if (me.isVisible() &&
                                (_el = Ext.get(el)) &&
                                !_el.parent('#' + me.id) &&
                                !(this.closeQueryException && _el.is(this.closeQueryException))) {
                                me.hide();
                            }
                        },
                        closeQueryException: ':any([class*=x-grid-view]|[class*=x-component]|[class*=x-panel]|[class*=x-toolbar]|[class*=x-box]|[class*=x-window])',
                        items: [{
                            xtype: 'container',
                            margin: '0 40 0 0',
                            html: 'Ваши налоговые и их платежные<br/>реквизиты теперь хранятся здесь.'
                        }, {
                            xtype: 'button',
                            text: 'Ясно, спасибо',
                            margin: '10 0 0 0',
                            listeners: {
                                click: function () {
                                    this.up("tooltip").hide();
                                }
                            }
                        }],
                        listeners: {
                            hide: function () {
                                let me = this;
                                if (this.tooltipCloseFn) {
                                    me.getEl().parent().un('click', this.closeEventFn, this);
                                }
                                if (me.closeAction === 'destroy') {
                                    Ext.destroy(me);
                                }
                            },
                            show: function () {
                                let me = this;
                                me.getEl().parent().on('click', this.closeEventFn, this);
                            }
                        }
                    });
                    setTimeout(function () {
                        tip.show();
                    }, 100);
                }
                Ext.util.Cookies.set('spravNalogTooltipShown', true, new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365));
            }
        },*/

        addNewItemTree: function () {
            nodeprev = 0;
            var tr1 = this;
            var _fn = function (_frm) {
                _text_node = _frm.down('[name=txt]').getValue();
                if (tr1.getSelectionModel().hasSelection()) {
                    node = tr1.getSelectionModel().getSelection()[0];
                    nodeprev = node.data.id;
                    if (tr1.store.getNodeById(nodeprev)) {
                        tr1.store.getNodeById(nodeprev).set('leaf', false);
                        tr1.store.sync();
                    }
                } else {
                    nodeprev = 0;
                    node = tr1.store.getNodeById(0);
                }
                newid = 0;
                _ajax(
                    dir_start_buh_ + 'tree_addnode.php',
                    {
                        text: _text_node,
                        parentid: nodeprev,
                        sprav: _id_sprav
                    },
                    function (response) {

                        if (tr1.store.getNodeById(nodeprev)) {
                            tr1.store.getNodeById(nodeprev).expand();
                        }
                        newid = response.responseText;
                        var newNode = {
                            text: _text_node,
                            leaf: true,
                            sprav: _id_sprav,
                            id: newid,
                            icon: '/img/folder.gif',
                            allowDrag: false
                        };
                        node.appendChild(newNode);
                        tr1.store.sync();

                    }
                );
            };
            _prompt('Создать группу', 'Название группы:', _fn);
        },

        editItemTree: function (pid) {
            var tr1 = this;
            if (tr1.getSelectionModel().hasSelection()) {
                var _fn = function (_frm) {
                    _text_node = _frm.down('[name=txt]').getValue();
                    if (_text_node != "") {
                        tr1.store.getNodeById(node.data.id).set('text', _text_node);
                        tr1.store.sync();
                    }
                }
                node = tr1.getSelectionModel().getSelection()[0];
                _prompt('Изменить', 'Название группы:', _fn);
            }
        },

        refreshTree: function () {
            var tr1 = this;
            tr1.store.load();
        },

        deleteItemTree: function () {
            var tr1 = this;

            if (tr1.getSelectionModel().hasSelection()) {
                var node = tr1.getSelectionModel().getSelection()[0];
                if (!node.hasChildNodes()) {
                    _confirm(
                        'Подтвердите удаление',
                        'Вы хотите удалить эту группу?',
                        function () {
                            tr1.store.getNodeById(node.data.id).remove();
                            tr1.store.sync();
                        }
                    );
                } else {
                    _alert_win('Нельзя удалять!', 'Эта группа имеет вложенные группы, поэтому ее нельзя удалять!');
                }
            }
        },
    });




},


/********************
*    tree store
*
***********************/

getStore : function(_id_sprav, title) {
    if (_id_sprav == 3 || _id_sprav == 4 || _id_sprav == 5 || _id_sprav == 6) {
        return Ext.create('Ext.data.TreeStore', {
            proxy: {
                type: 'ajax',
                url: dir_start_buh_ + 'tree_data.php',
                extraParams: {
                    spravid: _id_sprav,
                    title: title
                },
                api: {
                    update: dir_start_buh_ + 'tree_update.php',
                    destroy: dir_start_buh_ + 'tree_delete.php'
                }
            },
            fields: [
                {name: 'text', type: 'string'},
                {name: 'id', type: 'integer'},
                {name: 'sprav', type: 'integer'}
            ],
            sorters: [{
                property: 'text',
                direction: 'ASC'
            }],
            autoLoad: false
        });
    }
    else {
        return null;
    }

}
});
