Ext.define('Buh.view.buy.Deal', {
    extend: 'winEditDoc',
    requires: ['Buh.classes.sprav.Tool'],

    alias: 'widget.dealwindow',

    width: 1100,
    cls: 'style2018',
    // items begin

    items: {
        xtype: 'form',
        items: [
            {
                xtype: 'sprav_tool',
                'name': 'buyOrg',
                'cls': 'container-align-middle',
                'emptyText': 'Выберите или добавьте контрагента',
                'id_sprav': 6,
                'fid': 'org_id',
                'fnm': 'org_nam',
                'width': 310,
                'allowBlank': false,
                'callBack': function (_inp, _name) {
                    var me = this, win = this.up('window');
                    me.up('container').down('[name=buyOrgDog]').setFilter('org_id=' + _inp);
                    me.up('container').down('[name=buyOrgDog]').org_id = _inp;
                    me.up('container').down('[name=buyOrgDog]').org_nam = _name;
                    if (_inp != 0) {
//                        win.down('[name=org_warning]').hide();
//                        win.fireResize();
//                     me.up('window').updateRec(11);
                    }
//                 else
//                     me.up('window').updateRec(1);

                }
            },
            {
                xtype: 'sprav_tool',
                'name': 'buyOrgDog',
                'cls': 'container-align-middle',
                'id_sprav': 15,
                'fid': 'dog_id',
                'fnm': 'dog_nam',
                'width': 310,
                'emptyText': 'Выберите или добавьте договор',
                'filterMask': 'Не выбран контрагент',
                'btnTitle': 'Добавить договор',
                'haveFilter': true,
                'callBack': function (_inp) {
                    var me = this;
//                 me.up('window').updateRec(1);
                }
            }

        ]
    },

    // items end


});
