Ext.define('Buh.classes.managers.details.Deal', {
    owner : null,
    constructor: function(args) {
       this.owner = args.owner;
    },
    openDocInDeal : function(_rec){
/*
    $_args = ['source'=>3, 'source_id'=>$id, 'owner'=>$_row_data['owner'], 'typ_oper'=>$_row_data['typ_oper'], 'deal_dat'=>$_row_data['deal_dat'],
      'typ_doc'=>'15'];

*/
       let tabName = (_rec.typ_oper==1) ? 'mn1-1-01' : 'mn1-1-02',
           gridName = (_rec.typ_oper==1) ? 'buyPanel_100' : 'buyPanel_110',
           dat = _rec.deal_dat;

           this.owner.d1 = dat;
           this.owner.d2 = dat;
           this.owner.dealId = _rec.owner;
           this.owner.typDoc = _rec.typ_doc;

           document.getElementById(tabName).click();
           if (Ext.getCmp(gridName))
               Ext.getCmp(gridName).refreshGrid();
    }

});
