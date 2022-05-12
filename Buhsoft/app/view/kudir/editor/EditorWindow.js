Ext.define('Buh.view.kudir.editor.EditorWindow', {
    constructor: function () {
        let args = arguments[0],
            _action = args._action || 'edit',
            _data = args._data || {},
            _tabId = args._tabId || false,
            _taxMode = args._taxMode;

        if (!_tabId) return false;
        else this.tabId = _tabId;

        this.callParent(arguments);

        this.mon(Ext.getBody(), 'click', function(el, e){
            this.close(this.closeAction);
        }, this, { delegate: '.x-modal-close' });

        this.action = _action;
        this.data = _data;
        this.taxMode = _taxMode;

        if (this.action === 'add' && this.tabId !== 1) {
            this.oper_type = 2;
        } else if (this.action === 'add' && this.tabId === 1) {
            this.oper_type = 1;
        } else {
            this.oper_type = 1;
        }

        if (this.data.d_r_ != _dummy) {
            this.oper_type = parseInt(this.data.d_r_);
        }

        if (this.action == "add") {
            this.setTitle('Добавление записи');
        } else {
            this.setTitle('Редактирование записи');
        }
    },
    extend: 'Gbs.windowModal',
    modal: true,
    width: 620,
    requires: ['Buh.view.kudir.editor.Form', 'Buh.view.kudir.editor.TBar'],
    alias: 'widget.editkudirpopup',
    cls: 'style2018 init_window toolbar-highlight',
    itemId: 'kudirEditor',
    title: '',
    action: null,
    data: null,
    oper_type: 1,
    taxMode: null,
    closable: true,
    header: true,
    items: [
        {
            xtype: 'component',
            html: '<div class="x-modal-close"></div>',
        },
        {
            xtype: 'kudirrecordform'
        }
    ],
    dockedItems: {
        xtype: 'kudireditrecordbar'
    },
    listeners: {
        afterrender: function () {
            let me = this, _title, rec = me.down('form').getValues(),
                _store = me.down('form').down('[name=short_name]').store;

            me.down('form').down('[name=tab_id]').setValue(me.tabId);

            if (me.tabId == 1 && me.action == 'add') {
                me.down('[name=kudirEditorPanel]').down('[nm=id_oper]').setValue(me.oper_type);
                _title = 'Содержание операции (вид ' + iif(me.oper_type == 1, 'дохода', 'расхода') + ')';
                me.down('[name=kudirEditorPanel]').down('[name=cnt-dir]').setTitle(_title);

                if (me.taxMode == 1) me.down('[nm=id_oper]').hide();
            }

            if (me.oper_type == 2) {
                _store.filterBy(function(record, id){
                    return (Ext.Array.indexOf([0,2], record.get('typ_oper')) !== -1 &&
                        Ext.Array.indexOf([-1, me._taxMode], record.get('tax_mode')) !== -1 &&
                        Ext.Array.contains(record.get('tab'), me.tabId));
                }, me);
            } else if (me.oper_type == 1) {
                _store.filterBy(function(record, id){
                    return (Ext.Array.indexOf([0,1], record.get('typ_oper')) !== -1 &&
                        Ext.Array.indexOf([-1, me._taxMode], record.get('tax_mode')) !== -1 &&
                        Ext.Array.contains(record.get('tab'), me.tabId));
                }, me);
            }

            if (me.action == 'edit') {
                if (rec.is_dirty == 1) {
                    if (parseFloat(rec.summa) != parseFloat(rec.summa_orig)) {
                        me.down('form').down('[name=summa]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                    }
                    if (rec.short_name != null && rec.short_name != rec.short_name_orig) {
                        me.down('form').down('[name=short_name]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                    }
                    if (rec.n_doc != rec.n_doc_orig) {
                        me.down('form').down('[name=n_doc]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                    }
                    if (rec.doc_date != rec.date_orig) {
                        me.down('form').down('[name=doc_date]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                    }

/*GBS-13693. Ext некорректно обрабатывает стиль кастомного комбобокса.
                    if (me.tabId == 1 && rec.auto == 0) {
                        if (rec.id_sod != rec.id_sod_orig) {
                            me.down('form').down('[name=id_sod]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                        }
                    } else if (me.tabId == 4) {
                        if (rec.id_op != rec.id_op_orig) {
                            me.down('form').down('[name=id_op]').setFieldStyle('font-weight:600;background-color:d1d7e9;background-image:none;');
                        }
                    }
*/
                }

                me.down('[name=editorTBar]').down('[name=checkIskl]').setValue(me.down('form').down('[name=iskl]').getValue());

                if (_store.findRecord('short_name', rec.short_name) === null) {
                    me.down('form').down('[name=short_name]').setValue(rec.short_name);
                    me.down('form').down('[name=short_name]').setDisabled(true);
                }
            }
        }
    }
});
