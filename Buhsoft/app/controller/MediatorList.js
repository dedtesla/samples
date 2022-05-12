Ext.define('Buh.controller.MediatorList', {
    extend: 'Ext.app.Controller',

    refs: [

        {
            ref: 'panel',
            selector: 'mediatorPanel'
        },

        {
            ref: 'grid',
            selector: 'mediatorgrid'
        },

    ],

    init: function () {
        this.control({
            'mediatorPanel': {
                panelFill: this.panelFill, // заполнить панель данными по умолчанию
            },

            'mediatorPanel grid': {
                itemcontextmenu: this.contextMenu, // Контекстное меню для грида
                editRecord: this.editRecord, // открыть отчет комиссионера
                deleteRecord: this.deleteRecord, // Удалить запись
                loadXLS: this.loadXLS, // загрузка в XLS формате
                loadPDF: this.loadPDF, // загрузка в PDD формате
                printRecord: this.printRecord, // Печать
                goToDeal: this.goToDeal // Перейти к сделке
            },

            'mediatorPanel [name=rep_period]': {
                select: this.fillGrid, // заполнить грид по параметрам тулбара
            },

            'mediatorPanel field_find': {
                change: this.fillGrid, // заполнить грид по параметрам тулбара
            },

            'mediatorPanel mediatorgrid': {
                celldblclick: this.openReport, // открыть отчет комиссионера
            },

            'mediatorPanel mediatorgrid greenbutton': {
                click: this.addReport, // добавить отчет комиссионера
            },

        });
    },

   panelFill: function(){
    // заполнить панель данными по умолчанию
       var me = this,
           dt1 = oDefaults.d1,
           dt2 = oDefaults.d2,
           store = Ext.create('Buh.store.Mediators'),
           grid = me.getGrid();

       grid.reconfigure(store);
       this.fillStoreGrid(dt1, dt2, '');
   },

   fillGrid : function(){
      // заполнить грид по параметрам тулбара
       var me = this,
           grid = me.getGrid(),
           dt1 = grid.down('[name=rep_period]').getDat1(),
           dt2 = grid.down('[name=rep_period]').getDat2(),
           org = grid.down('field_find').getValue();

       this.fillStoreGrid(dt1, dt2, org);


   },

   fillStoreGrid : function(dt1, dt2, org){
       var me = this,
           grid = me.getGrid();

       grid.store.proxy.extraParams = {action : 'list', d1: Ext.Date.format(dt1, 'Y-m-d') , d2: Ext.Date.format(dt2, 'Y-m-d'), org: org};
       grid.store.load();

   },

  addReport: function(){
   // добавить отчет комиссионера
    var winEdit = Ext.create('Buh.view.mediator.report.Edit');
    winEdit.open({'id' : 0});
  },

  openReport: function(ts, td, cellIndex, record){
   // добавить отчет комиссионера
/*
    var winEdit = Ext.create('Buh.view.mediator.report.Edit');
    winEdit.open({'id' : record.data.id});
*/
    this.editRecord(record);
  },


    contextMenu: function (v, rec, it, ind, e, eo) {
        // Контекстное меню для грида
        e.stopEvent();
        var me = this,
            grid = me.getGrid();
        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.menu.showAt(e.getXY());

    },

    editRecord: function(rec){
      // Удалить запись
       var me = this;
       var winEdit = Ext.create('Buh.view.mediator.report.Edit');
       winEdit.open({'id' : rec.data.id});

    },


    deleteRecord: function(rec){
      // Удалить запись
       var me = this,
           dt = rec.data.date_doc,
           txt = Ext.Date.format(dt, 'd') * 1 + ' ' + Date.monthNamesRP[dt.getMonth()] + ' ' + Ext.Date.format(dt, 'Y'),
           grid = me.getGrid();

       _fn = function(){
         var _par = {'action': 'delete' , 'id' : rec.data.id};
         _ajax(dir_start_buh_ + 'mediator_proc.php', _par,
             function (ret) {
                 var ans = Ext.decode(ret);
                 grid.store.remove(rec);
             }
         );

       }

       _confirm('Удалить отчет?', 'Удалится отчет, а также созданная запись в учете продаж от '+txt, _fn);

    },

    loadXLS : function(_rec){
        // загрузка в Эксель формате
        _ajax(dir_start_buh_ + 'frm_mediator_report.php', {'id': _rec.data.id},
            function () {
                window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + _rec.data.id + "&type=91";
            }
        );


    },


    loadPDF : function(_rec){
        // загрузка в Эксель формате
        window.location.href = dir_start_buh_ + "frm_mediator_report.php?type_doc_convert=pdf&id=" + _rec.data.id;

    },

    printRecord:  function(_rec){
       // Печать

        if (Ext.get('iFramePrintDirect') != _dummy) {
            Ext.get('iFramePrintDirect').remove();
        }
        let printFrame = Ext.create('Buh.classes.container.IFramePrintDirect', {
            src: dir_start_buh_ + "frm_mediator_report.php?type_doc_convert=pdf&directprint=true&id=" + _rec.data.id
        });
        let iFrame = printFrame.el.dom.firstChild.contentWindow;

        iFrame.focus();
        iFrame.print();
    },

    goToDeal: function( _rec){
      // Перейти к сделке
      var rec = {'data': ''};
      win.close();
      rec.data = {'source' : 24, 'source_id' : _rec.data.id};
      joManager.openSource(rec);



    },


});
