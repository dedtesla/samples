Ext.define('Buh.classes.managers.joManager', {
    open: false,
    d1: '',
    d2: '',
    provId : 0,
    source: 0,
    docId: 0,
    origin : 0,
    mn : '1',
    yr : '0',
    id_os: 0,
    openSource: function (_rec) {
        var me = this;
        me.open = true;
        me.source = _rec.data.source;
        me.docId = _rec.data.source_id;
        me.origin = _rec.data.origin;
        me.provId = _rec.data.id;
        if (_rec.data.source == 1) {  // покупки

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 1, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-01').click();
                    if (Ext.getCmp('buyPanel_100'))
                        Ext.getCmp('buyPanel_100').refreshGrid();
                }
            );
        }

        if (_rec.data.source == 2) {  // продажи

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 2, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-02').click();
                    if (Ext.getCmp('buyPanel_110'))
                        Ext.getCmp('buyPanel_110').refreshGrid();
                }
            );
        }

        if (_rec.data.source == 3 || _rec.data.source == 4) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 3, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-03').click();

                    if (Ext.getCmp('bankMainSceern'))
                        Ext.getCmp('bankMainSceern').refreshGrid();

                }
            );
        }

        if (_rec.data.source == 5 || _rec.data.source == 6) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 5, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-04').click();

                    if (Ext.getCmp('kassaMainScreen'))
                        Ext.getCmp('kassaMainScreen').refreshGrid();

                }
            );
        }

        if (_rec.data.source == 7) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 7, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.mn = "" + ans.data.mn;
                    me.id_os = ans.data.id_os;

                    if (Ext.getCmp('mainPanelAmort'))
                     {
                       if (Ext.get(Ext.getCmp('mainPanelAmort').renderTo)){
                           if (Ext.getCmp('mainPanelAmort').down('#tpAmort').getActiveTab().title!="Бухгалтерский учет")
                             Ext.getCmp('mainPanelAmort').down('#tpAmort').setActiveTab(0);
                           else
                             Ext.getCmp('mainPanelAmort').refresh();
                        }

                     }
                    document.getElementById('mn1-1-07').click();


                }
            );
        }

        if (_rec.data.source == 12) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 12, 'origin' : _rec.data.origin, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;

                    if (Ext.getCmp('NKOMainScreen'))
                     {
                        Ext.getCmp('NKOMainScreen').refresh(true);
                     }
                    document.getElementById('mn1-1-12').click();
                }
            );
        }

        if (_rec.data.source == 17) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 17, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.mn = "" + ans.data.mn;
                    me.yr = "" + ans.data.yr;
                    me.docId = ans.data.id;


                    if (Ext.getCmp('mainPanelrbp'))
                     {
                        Ext.getCmp('mainPanelrbp').refresh();
                     }

                    document.getElementById('mn1-1-20').click();
                }
            );
        }

        if (_rec.data.source == 20) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 20, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;

                    if (Ext.getCmp('skladMainPanel'))
                     {
                        Ext.getCmp('skladMainPanel').refreshGrid();
                     }
                    document.getElementById('mn1-1-17').click();
                }
            );
        }


        if (_rec.data.source == 22 || _rec.data.source == 23) { 

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': _rec.data.source, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-06').click();

                    if (Ext.getCmp('PRMainScreen'))
                     {
                       if (_rec.data.source == 22)
                         Ext.getCmp('PRMainScreen').down('[name=bottomTabs]').setActiveTab(1);
                       if (_rec.data.source == 23)
                         Ext.getCmp('PRMainScreen').down('[name=bottomTabs]').setActiveTab(2);

                     }
                }
            );
        }

        if (_rec.data.source == 24) {  // покупки

            _ajax(
                dir_start_buh_ + 'jo_manager.php',

                {'source': 24, 'source_id': _rec.data.source_id},

                function (_ans) {
                    var ans = Ext.decode(_ans);
                    me.d1 = ans.data.d1;
                    me.d2 = ans.data.d2;
                    document.getElementById('mn1-1-01').click();
                    if (Ext.getCmp('buyPanel_100'))
                        Ext.getCmp('buyPanel_100').refreshGrid();
                }
            );
        }


    }

});
