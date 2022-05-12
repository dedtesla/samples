/**
 * Окно фильтра Книга доходов и расходов.
 *
 * GBS-6829, GBS-8558, GBS-9690
 * @since 08/20
 */
Ext.define('Buh.view.kudir.filter.FilterWindow', {
    extend: 'Gbs.windowModal',
    modal: true,
    requires: ['Buh.view.kudir.filter.FilterForm', 'Buh.view.kudir.filter.FilterBBar'],
    alias: 'widget.kudirfilterwindow',
    cls: 'style2018 init_window toolbar-highlight',
    title: 'Фильтр',
    width: 620,
    tabId: null,
    _taxMode: null,
    data: null,
    oper_type: 1,
    scope: this,
    closable: true,
    items: [
        {
            xtype: 'component',
            html: '<div class="x-modal-close"></div>',
        },
        {
            xtype: 'kudirfilterform'
        }
    ],
    bbar: {
        xtype: 'kudirfilterbbar',
    },
    listeners: {
        afterrender: function () {
            let me = this, _store = me.down('[name=kf_doc_name]').store;

            me.down('[name=kf_op_type]').store.filterBy(function (record, id) {
                return (Ext.Array.indexOf([me._taxMode], record.get('tax_mode')) !== -1);
            }, me);

            me.down('[name=kf_op_type]').setValue(iif(me._taxMode == 0, 0, 1));
            me.down('[name=kf_op_type]').setDisabled(iif(me._taxMode == 0, false, true));

            if (me._taxMode == 1 && me.tabId == 1) {
                me.oper_type = 2;
            } else if (me._taxMode == 1 && me.tabId != 1) {
                me.oper_type = 1;
            } else {
                me.oper_type = 0;
            }

            if (me.oper_type == 2) {
                _store.filterBy(function (record, id) {
                    return (Ext.Array.indexOf([0, 2], record.get('typ_oper')) !== -1 &&
                        Ext.Array.indexOf([-1, me._taxMode], record.get('tax_mode')) !== -1 &&
                        Ext.Array.contains(record.get('tab'), me.tabId));
                }, me);
            } else if (me.oper_type == 1) {
                _store.filterBy(function (record, id) {
                    return (Ext.Array.indexOf([0, 1], record.get('typ_oper')) !== -1 &&
                        Ext.Array.indexOf([-1, me._taxMode], record.get('tax_mode')) !== -1 &&
                        Ext.Array.contains(record.get('tab'), me.tabId));
                }, me);
            } else {
                _store.filterBy(function(record, id){
                    return Ext.Array.indexOf([-1, me._taxMode], record.get('tax_mode')) !== -1 &&
                        Ext.Array.contains(record.get('tab'), me.tabId);
                }, me);
            }

            this.mon(Ext.getBody(), 'click', function(el, e){
                this.close(this.closeAction);
            }, this, { delegate: '.x-modal-close' });
        }
    }

});
