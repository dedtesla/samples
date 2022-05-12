Ext.define('Buh.view.bookbuy.edit.TBar', {
	extend: 'Ext.toolbar.Toolbar',
	xtype: 'bookbuyedittbar',
	dock: 'bottom',
	items: [{
		xtype: 'container',
		layout: 'vbox',
		items: [{
			xtype: 'container',
			itemId: 'errordata',
			cls: 'bottom-block_alert-info',
			layout: 'hbox',
			hidden: true,
			defaultType: 'button',
			defaults: {
				componentCls: 'x-toolbar-item'
			},
		}, {
			xtype: 'container',
			layout: 'hbox',
			defaultType: 'button',
			defaults: {
				componentCls: 'x-toolbar-item'
			},
			items: [{
				text: 'Сохранить',
				action: 'save',
				cls: 'green-btn'
			},{
				text: 'Отмена',
				action: 'close'
			}]
		}]
	}]
});
