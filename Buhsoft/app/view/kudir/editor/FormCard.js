Ext.define('Buh.view.kudir.editor.FormCard', {
    extend: 'Ext.form.FormPanel',
    xtype: 'kudirrecordcardform',
    name: 'kudirCardEditorForm',
    width: 0,
    height: 0,
    items: [
        {
            xtype: 'hidden',
            name: 'id',
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'copy_id',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'tab_id',
            hidden: true,
            value: 2
        },
        {
            xtype: 'textfield',
            name: 'iskl',
            hidden: true,
        },
        {
            xtype: 'textfield',
            name: 'auto',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'is_dirty',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'base_cost',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'base_cost_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'tax_fees',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'tax_fees_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'quarter_fees',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'quarter_fees_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'previous_fees',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'previous_fees_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'future_fees',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'future_fees_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'rectype',
            hidden: true,
            value: 0
        },
        {
            xtype: 'textfield',
            name: 'name',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'name_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'kat',
            hidden: true,
            value: '5'
        },
        {
            xtype: 'textfield',
            name: 'kat_orig',
            hidden: true,
            value: '5'
        },
        {
            xtype: 'textfield',
            name: 'datepayed',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datepayed_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datgr',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datgr_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datvv',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datvv_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'yrexp',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'yrexp_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'ost',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'ost_orig',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'qtexp',
            hidden: true,
            value: 4
        },
        {
            xtype: 'textfield',
            name: 'qtexp_orig',
            hidden: true,
            value: 4
        },
        {
            xtype: 'textfield',
            name: 'datvyb',
            hidden: true
        },
        {
            xtype: 'textfield',
            name: 'datvyb_orig',
            hidden: true
        }
    ]
});
