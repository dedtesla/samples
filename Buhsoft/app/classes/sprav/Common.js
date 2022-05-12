Ext.define('Buh.classes.sprav.Common', {
requires : [
'Buh.classes.sprav.common.TreePanel',
'Buh.classes.sprav.common.Grid',
'Buh.classes.sprav.common.GridMenu',
],

/****************
*               tree
*
***************************/


makeTreePanel : function(id_sprav, title, afields, have_tree, aFields, sm, loadProc){
  var obj = new spravTree(),
      treePanel = obj.makeTreePanel(id_sprav, title, afields, have_tree, aFields, sm, loadProc);

return treePanel;
},

/****************
*               grid
*
***************************/

makeGrid : function(id_sprav, title, afields, have_tree, aFields, sm, loadProc){

var obj = new spravGrid(),
      grd = obj.makeGrid(id_sprav, title, afields, have_tree, aFields, sm, loadProc);

return grd;

},


/****************
*       grid menu
*
***************************/


makeGridMenu : function(_id_sprav, win){
  var obj = new spravGridMenu(),
      menu = obj.makeGridMenu(_id_sprav, win);

return menu;

},


/****************
*  main window
*
***************************/


makeWindow: function(id_sprav, title, afields, have_tree, aFields, sm, loadProc){
    var _id_sprav = id_sprav;

    var treePanel = this.makeTreePanel(id_sprav, title, afields, have_tree, aFields, sm, loadProc);
    var grd = this.makeGrid(id_sprav, title, afields, have_tree, aFields, sm, loadProc);


    Ext.define('mainWin', {
        header: false,
        extend: 'Gbs.window',
        cls: 'style2018 sprav_window',
        id: 'mainWin' + _id_sprav,
        selTreeStart: null,
        treeOff: 0,
        toSel: false,
        mntEdo : null,
        haveEdo : false,
        cntEdo : 0,
        modal: false,
        fldId: '',
        fldVal: '',
        itemId: 0,
        actionAfter: 0,
        haveTree: true,
        closeAction: 'hide',
        width: 1500,
        height: 612,
        y: 60,

        gridMenu: null,

        editor: '',
        getSprav: function (id_sprav, title) {
            var grid = this.down('grid');
            if (this.haveTree) {
                proxy_params = grid.store.proxy.extraParams;
            }
        },

        checkForEdo : function() {
            let winSprav = this;

            winSprav.mntEdo.access(aktionid.config.appid, aktionid.token);

            winSprav.mntEdo.checkEdoStatus( function(_stateEdo){
                winSprav.haveEDO = _stateEdo;
                if (_stateEdo)
                    winSprav.down('#maintEDO').setText("Пригласить к ЭДО");
                else
                    winSprav.down('#maintEDO').setText("Подключить ЭДО");
            });

        },

        setEditor: function (editor) {
            this.editor = editor;
        },
        title: function (ptl) {
            this.setTitle(ptl);
        },
        width: function (l) {
            this.setWidth(l);
        },
        height: function (l) {
            this.setHeight(l);
        },
        sizeGrid: function () {
            var grid = this.down('grid');

            grid.setHeight(this.height - 60);
            grid.setWidth(this.width - (this.haveTree, 211, 11));
            tr1 = this.down('treepanel');
            tr1.setHeight(this.height - 60);
        },
        modelGrid: function (m) {
            var grid = this.down('grid');
            grid.setHeight(this.height - 160);
            grid.setWidth(this.width - (this.haveTree, 211, 11));
            tr1 = this.down('treepanel');
            tr1.setHeight(this.height - 60);
        },
        fillGrid: function () {
            var grid = this.down('grid');
            grid.getStore().load();
        },

        giveMe: function (_sprav, _id, _group) {

            var me = this,
                grid = me.down('grid'),
                _params = Ext.clone(grid.store.proxy.extraParams);
            _params.sprav = _sprav;
            _params.id = _id;
            _params.group= _group;


            _ajax(dir_start_buh_ + 'sprav/gridposition/', _params, function (_inp) {
                var ans = Ext.decode(_inp);
                  grid.store.removeAll();
                  grid.store.load({
                    callback: function (opt, success, response) {
                       let _fn = function(){
                          if (me.openAfterSelect!=undefined && me.openAfterSelect) {
                               me.openAfterSelect = false;
                               grid.fireEvent('celldblclick');
                          }
                       }
                       grid.verticalScroller.scrollTo(ans.pos, true, _fn);
                  }});
            });

        },



        treePanelOff: function () {
            this.treeOff = 1;
            this.down('treepanel').view.hide();
        },
        treePanelOn: function () {
            this.treeOff = 0;
            this.down('treepanel').view.show();

        },
        fnTreeOff: function () {
        },
        fnTreeOn: function () {
        },
        showAddNewItem: function () {
            this.showWin(0, false);
            this.down('greenbutton').handler();
        },
        showWin: function (itemId, toSel, fld_id, fld_val, afteract, filt, troff, newItem) {
            var tree = this.down('treepanel'),
                fnd = this.down('field_find'),
                grid = this.down('grid');
            this.toSel = toSel;
            this.fldId = fld_id;
            this.fldVal = fld_val;
            this.afterAction = afteract;
            this.newItem = newItem;
            this.treeOff = 0;

            if (troff == 'off') {
                this.treeOff = 1;
            }

/*
            if (_id_sprav == 6 && this.selTreeStart == null) {
                var tree = tree,
                    node = tree.getStore().getNodeById('0');
                tree.getSelectionModel().select(node);
            }
*/
            if (_id_sprav == 6)
            {
                this.mntEdo = Ext.create('Buh.classes.edo.Maintain');
                this.checkForEdo();
            }

            if (filt == undefined) filt = '';
            this.getSprav(_id_sprav, title);
            grid.filt = filt;
            this.itemId = itemId;
            if (fnd) {
                fnd.setValue('');
            }

            tree.setVisible(this.haveTree);
            this.down('[region=west]').setVisible(this.haveTree);

            this.down('[text=Выбрать]').setVisible(toSel);
            this.down('[text=Отмена]').setVisible(toSel);
            this.down('[name=panelCenter]').down('toolbar[name=bbar]').setVisible(this.toSel);
            this.show();
            if (_id_sprav == 6 && this.selTreeStart == null) {
                var tree = this.down('treepanel'),
                    node = tree.getStore().getNodeById('0');
                tree.getSelectionModel().select(node);

            }
            else
              this.selTreeAfterShow();

            if (itemId!=0) {
                let selected = tree.getSelectionModel().getSelection()[0];
                if(selected) {
                    this.giveMe(_id_sprav, itemId, selected.data.id);
                }
            }


        },
        getStore: function () {
            return this.store;
        },
        selTreeAfterShow: function (_id) {
            if (this.selTreeStart != null) {
                var tree = this.down('treepanel'),
                    node = tree.getStore().getNodeById(this.selTreeStart);
                tree.getSelectionModel().select(node);
                this.selTreeStart = null;
            }
        },
        layout: {
            type: 'border'
        },
        items: [{
            region: 'west',
            layout: 'fit',
            xtype: 'panel',
            width: 230,
            items: treePanel
        }, {
            xtype: 'gbs_panel',
            name: 'panelCenter',
            region: 'center',
            title: title,
            layout: 'fit',
            bbar: {xtype: 'toolbar', name: 'bbar', items: [
                {
                    text: 'Выбрать',
                    xtype: 'greenbuttonsimple',
                    handler: function () {
                        this.up('window').down('grid').fireEvent('selectItemGrid');
                    }
                }, {
                    text: 'Отмена',
                    handler: function () {
                        this.up('window').close(this.up('window').closeAction);
                    }
                },
            ]},
            items: Ext.create('Ext.form.Panel', {
                bodyCls: 'panel-pad',
                layout: 'fit',
                items: grd
            })
        }]
    });

    var win = Ext.create('mainWin');
    if(_id_sprav != 9) {
        win.gridMenu = this.makeGridMenu(_id_sprav, win);
    }

    this.windowEvents(win, _id_sprav);

    win.title(title);
    win.height(612);
    if (have_tree)
        win.width(1100);
    else
        win.width(700);
    win.haveTree = have_tree;
    win.getSprav(_id_sprav, title);
    win.sizeGrid();

    return win;

},

/**************************
*  window events
*
***************************/


windowEvents : function(win, _id_sprav){

    win.on({
        beforeshow: function() {
            win.startEventTime = new Date;
        },
        'show': function () {
            winBuhManager.maskTop(this);
            var grid = this.down('grid'),
                tr1 = this.down('treepanel');

            grid.store.on({
                load: function() {
                    if(win.startEventTime) {
                        if (_id_sprav == 6) {
                            crmEvent('buh', '5b1cb965-d414-4a18-81ca-bd63101721de', 0, 0, ((new Date).getTime() - win.startEventTime.getTime()) / 1000);
                        }
                        delete win.startEventTime;
                    }
                },
                single: true
            });

            if (this.haveTree & this.treeOff == 0) {
                gr1 = 0;
                if (tr1.getSelectionModel().hasSelection()) {
                    node = tr1.getSelectionModel().getSelection()[0];
                    gr1 = node.data.id;
                }
                grid.store.proxy.extraParams = {
                    sprav: _id_sprav,
                    group: gr1,
                    nm: '',
                    filt: grid.filt
                };
                this.treePanelOn();
            } else {
                grid.store.proxy.extraParams = {
                    sprav: _id_sprav,
                    group: -1,
                    nm: '',
                    filt: grid.filt
                };
                this.treePanelOff();
            }
            proxy_params = grid.store.proxy.extraParams;
            grid.store.viewSize = 100;
            if (_id_sprav != 6)
                grid.store.load();
        },
        'hide': function () {
            winBuhManager.unmaskTop(this);
        }
    });
},
});
