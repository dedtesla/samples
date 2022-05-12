Ext.define('Buh.classes.combo.ComboAnalit', {
    extend: 'Gbs.ComboBox',
    xtype: 'combo_analit',
    hideEmptyLabel: true,
    listConfig: {cls: 'style2018', minWidth: 440},
    forceSelection: false,
    displayField: 'name',
    valueField: 'id',
    editable: false,
    queryMode: 'local',
    store: null
})

