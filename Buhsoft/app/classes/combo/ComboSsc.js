Ext.define('Buh.classes.combo.ComboSsc', {
    'extend': 'Gbs.ComboBox',
    'xtype': 'combo_ssc',
    'selectOnFocus': true,
    'hideEmptyLabel': true,
    'listConfig': {cls: 'style2018', minWidth: 440/*, maxHeight: 190,  maxWidth: 500*/},
    'forceSelection': false,
    'displayField': 'sc_ssc',
    'valueField': 'sc_ssc',
    'allowBlank': true,
    'minChars': 1,
    tpl: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
        '<div class="x-boundlist-item">{sc_ssc} - {name}</div>',
        '</tpl>'
    ),
    'queryMode': 'local',
    'typeAhead': true,
    store:
        Ext.create('Ext.data.Store', {
            extend: 'Ext.data.Model',
            fields: [
                {type: 'string', name: 'sc_ssc'},
                {type: 'string', name: 'name'},
                {type: 'string', name: 'sc_ssc_name'},
                {type: 'string', name: 'analit1'},
                {type: 'string', name: 'analit2'},
                {type: 'string', name: 'analit3'},
                {type: 'int', name: 'child'}
            ]
        }),
})

