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
                panelFill: this.panelFill, // ��������� ������ ������� �� ���������
            },

            'mediatorPanel grid': {
                itemcontextmenu: this.contextMenu, // ����������� ���� ��� �����
                editRecord: this.editRecord, // ������� ����� ������������
                deleteRecord: this.deleteRecord, // ������� ������
                loadXLS: this.loadXLS, // �������� � XLS �������
                loadPDF: this.loadPDF, // �������� � PDD �������
                printRecord: this.printRecord, // ������
                goToDeal: this.goToDeal // ������� � ������
            },

            'mediatorPanel [name=rep_period]': {
                select: this.fillGrid, // ��������� ���� �� ���������� �������
            },

            'mediatorPanel field_find': {
                change: this.fillGrid, // ��������� ���� �� ���������� �������
            },

            'mediatorPanel mediatorgrid': {
                celldblclick: this.openReport, // ������� ����� ������������
            },

            'mediatorPanel mediatorgrid greenbutton': {
                click: this.addReport, // �������� ����� ������������
            },

        });
    },

   panelFill: function(){
    // ��������� ������ ������� �� ���������
       var me = this,
           dt1 = oDefaults.d1,
           dt2 = oDefaults.d2,
           store = Ext.create('Buh.store.Mediators'),
           grid = me.getGrid();

       grid.reconfigure(store);
       this.fillStoreGrid(dt1, dt2, '');
   },

   fillGrid : function(){
      // ��������� ���� �� ���������� �������
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
   // �������� ����� ������������
    var winEdit = Ext.create('Buh.view.mediator.report.Edit');
    winEdit.open({'id' : 0});
  },

  openReport: function(ts, td, cellIndex, record){
   // �������� ����� ������������
/*
    var winEdit = Ext.create('Buh.view.mediator.report.Edit');
    winEdit.open({'id' : record.data.id});
*/
    this.editRecord(record);
  },


    contextMenu: function (v, rec, it, ind, e, eo) {
        // ����������� ���� ��� �����
        e.stopEvent();
        var me = this,
            grid = me.getGrid();
        grid.menu.grd = grid;
        grid.menu.rec = rec;
        grid.menu.showAt(e.getXY());

    },

    editRecord: function(rec){
      // ������� ������
       var me = this;
       var winEdit = Ext.create('Buh.view.mediator.report.Edit');
       winEdit.open({'id' : rec.data.id});

    },


    deleteRecord: function(rec){
      // ������� ������
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

       _confirm('������� �����?', '�������� �����, � ����� ��������� ������ � ����� ������ �� '+txt, _fn);

    },

    loadXLS : function(_rec){
        // �������� � ������ �������
        _ajax(dir_start_buh_ + 'frm_mediator_report.php', {'id': _rec.data.id},
            function () {
                window.location.href = dir_start_buh_ + "./sendfile.php?edit=" + _rec.data.id + "&type=91";
            }
        );


    },


    loadPDF : function(_rec){
        // �������� � ������ �������
        window.location.href = dir_start_buh_ + "frm_mediator_report.php?type_doc_convert=pdf&id=" + _rec.data.id;

    },

    printRecord:  function(_rec){
       // ������

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
      // ������� � ������
      var rec = {'data': ''};
      win.close();
      rec.data = {'source' : 24, 'source_id' : _rec.data.id};
      joManager.openSource(rec);



    },


});
