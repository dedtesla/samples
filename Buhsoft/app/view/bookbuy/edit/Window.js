Ext.define('Buh.view.bookbuy.edit.Window', {
	extend: 'winFloatTbar',
	width: 620,
	xtype: 'bookbuyeditwindow',
	source_id: 0,
	requires: [
		'Buh.view.bookbuy.edit.Form', 'Buh.view.bookbuy.edit.TBar',
		'Buh.classes.container.Vertical', 'Buh.classes.sprav.Tool',
		'Buh.classes.help.ButtonAsk', 'Buh.classes.common.DocFieldNumber',
		'Buh.view.bookbuy.edit.AllPayItem', 'Buh.view.bookbuy.edit.ExplainItem',
		'Buh.view.bookbuy.edit.DateAccItem', 'Buh.classes.bookbuy.DocTypes',
		'Buh.view.bookbuy.edit.Contra'
	],
	alias: 'widget.bookbuyEditWindow',
	cls: 'style2018 init_window toolbar-highlight',
	modal : false,
	dockedItems: {
		xtype: 'bookbuyedittbar'
	},
	initComponent: function() {
		this.items = {
			xtype: 'bookbuyeditform',
			title: this.source_id ? 'Редактирование записи' : 'Добавление записи',
			type: this.type
		};
		this.callParent(arguments);
	},
	open: function() {
		var arg = arguments[0];
		this.fireEvent('fillData', arg);
	}
})